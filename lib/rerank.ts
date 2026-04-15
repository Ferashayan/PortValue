/**
 * BGE Rerank — Pinecone Inference API
 *
 * Uses the hosted `bge-reranker-v2-m3` model via Pinecone's Inference API
 * to re-score hybrid search results based on semantic relevance to the
 * original query. (Available on Pinecone Starter plan.)
 *
 * This is Phase 2 of the Triple-Hybrid Scoring pipeline:
 *
 *   Phase 1 — Hybrid Search (dense 0.4 + sparse 0.3)  →  clamped to [0, 0.7]
 *   Phase 2 — BGE Rerank (normalised to [0, 1])        →  ×0.3 = [0, 0.3]
 *   Phase 3 — Weighted Sum: FinalScore = SafeHybrid + SafeRerank×0.3  ∈ [0, 1.0]
 *
 * Score safety:
 *   - Hybrid scores are clamped to [0, 0.7] to handle dot-product overflows.
 *   - BGE raw scores are sigmoid-normalised then clamped to [0, 1].
 *   - FinalScore is hard-capped at 1.0 before percentage conversion.
 */

import { getPinecone } from '@/lib/pinecone';

// ── Types ────────────────────────────────────────────────────────────────────

export interface RerankDocument {
  id: string;
  text: string;
  /** Raw Pinecone hybrid score — will be clamped to [0, 0.7] internally */
  hybridScore: number;
  /** Any extra metadata to carry through */
  metadata?: Record<string, unknown>;
}

export interface RerankResult {
  id: string;
  text: string;
  /** Clamped Pinecone hybrid score ∈ [0, 0.7] */
  hybridScore: number;
  /** Normalised BGE rerank score ∈ [0, 1] */
  rerankScore: number;
  /** Final triple-hybrid score ∈ [0, 1.0] */
  finalScore: number;
  /** Final score as integer percentage (0 – 100) */
  finalScorePct: number;
  metadata?: Record<string, unknown>;
}

// ── Configuration ────────────────────────────────────────────────────────────

const RERANK_MODEL = 'bge-reranker-v2-m3';
const RERANK_WEIGHT = 0.3;
const HYBRID_MAX = 0.7;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Clamp a number to [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Sigmoid function — maps any real number to (0, 1). */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Rerank documents using BGE-reranker-v2-m3 via Pinecone Inference,
 * then compute the Triple-Hybrid final score with strict normalisation.
 *
 * FinalScore = clamp(HybridScore, 0, 0.7) + clamp(RerankScore, 0, 1) × 0.3
 *            → guaranteed ∈ [0, 1.0]
 *
 * @param query       Original user search query
 * @param documents   Candidate documents with their hybrid scores
 * @param topN        Number of top results to return (before final sort)
 * @returns           Documents scored, sorted by FinalScore descending
 */
export async function bgeRerank(
  query: string,
  documents: RerankDocument[],
  topN: number = 10
): Promise<RerankResult[]> {
  if (documents.length === 0) return [];

  // If only 1 document, skip API call — assign perfect rerank score
  if (documents.length === 1) {
    const d = documents[0];
    const safeHybrid = clamp(d.hybridScore, 0, HYBRID_MAX);
    const finalScore = clamp(safeHybrid + RERANK_WEIGHT, 0, 1); // 1.0 rerank
    return [
      {
        id: d.id,
        text: d.text,
        hybridScore: safeHybrid,
        rerankScore: 1.0,
        finalScore,
        finalScorePct: Math.round(finalScore * 100),
        metadata: d.metadata,
      },
    ];
  }

  const pc = getPinecone();

  // Call Pinecone's hosted BGE Rerank model
  const rerankResponse = await pc.inference.rerank({
    model: RERANK_MODEL,
    query,
    documents: documents.map((d) => ({ text: d.text })),
    topN: Math.min(topN, documents.length),
    returnDocuments: false,
  });

  // ── Normalise rerank scores ────────────────────────────────────────────
  //    BGE can return raw logits outside [0,1]. We first apply sigmoid to
  //    map any real number into (0,1), then min-max normalise across the
  //    batch so the best result gets 1.0 and worst gets 0.0.
  const sigmoidScores = rerankResponse.data.map((item) => sigmoid(item.score));
  const minSig = Math.min(...sigmoidScores);
  const maxSig = Math.max(...sigmoidScores);
  const sigRange = maxSig - minSig;

  // ── Build results with Triple-Hybrid final score ───────────────────────
  const results: RerankResult[] = [];

  for (let i = 0; i < rerankResponse.data.length; i++) {
    const item = rerankResponse.data[i];
    const originalDoc = documents[item.index];
    if (!originalDoc) continue;

    // 1. Clamp hybrid score to strict [0, 0.7]
    const safeHybrid = clamp(originalDoc.hybridScore, 0, HYBRID_MAX);

    // 2. Normalise rerank: sigmoid → min-max → clamp [0, 1]
    const normalisedRerank = sigRange > 0
      ? clamp((sigmoidScores[i] - minSig) / sigRange, 0, 1)
      : 1.0; // all identical → treat as perfect match

    // 3. Triple-Hybrid formula (guaranteed ∈ [0, 1.0]):
    //    FinalScore = SafeHybrid (max 0.7) + SafeRerank (max 1.0) × 0.3 (max 0.3)
    const finalScore = clamp(safeHybrid + (normalisedRerank * RERANK_WEIGHT), 0, 1);

    results.push({
      id: originalDoc.id,
      text: originalDoc.text,
      hybridScore: safeHybrid,
      rerankScore: normalisedRerank,
      finalScore,
      finalScorePct: Math.round(finalScore * 100),
      metadata: originalDoc.metadata,
    });
  }

  // Sort by finalScore descending
  results.sort((a, b) => b.finalScore - a.finalScore);

  return results;
}
