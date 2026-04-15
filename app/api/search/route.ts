import { NextRequest, NextResponse } from 'next/server';
import { getPinecone } from '@/lib/pinecone';
import { db } from '@/db';
import { user } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateSparseVector } from '@/lib/sparse-vector';
import { bgeRerank } from '@/lib/rerank';



// ── Gemini client ─────────────────────────────────────────────────────────────
function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY environment variable is not set.');
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-2.0-flash' });
}

// ── Generate per-person match explanation ─────────────────────────────────────
async function generateReason(
  query: string,
  profile: { name: string; bio: string | null },
  chunks: { text: string; finalScorePct: number }[]
): Promise<string> {
  const model = getGemini();

  const chunkSummary = chunks
    .slice(0, 3)
    .map((c, i) => `[${i + 1}] (${c.finalScorePct}% match) ${c.text}`)
    .join('\n');

  const prompt = `You are a talent and people-search assistant.

A user searched for: "${query}"

You found this person in the knowledge base:
Name: ${profile.name}
Bio: ${profile.bio ?? 'Not provided'}

Relevant knowledge chunks about them:
${chunkSummary}

In 2-3 concise sentences, explain clearly WHY this person is a good match for the search query.
Focus on the specific skills, experience, or traits that align with what was searched.
Be direct and professional. Do not use bullet points. Write in English.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ══════════════════════════════════════════════════════════════════════════════
//  Triple-Hybrid Search Pipeline
//
//  Phase 1 — Parallel queries:
//    a) Hybrid query   (dense×0.4 + sparse×0.3) → combined candidates
//    b) Dense-only     (unweighted)             → per-doc semantic score
//    c) Sparse-only    (unweighted)             → per-doc keyword score
//  Phase 2 — BGE Rerank     → rerank score per doc
//  Phase 3 — Weighted Sum   → FinalScore ∈ [0, 1.0]
//  Phase 4 — Layer badges   → denseScorePct, sparseScorePct, rerankScorePct
// ══════════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json(
        { error: 'Query must be at least 3 characters.' },
        { status: 400 }
      );
    }

    const indexName = process.env.PINECONE_INDEX_NAME;
    if (!indexName) {
      return NextResponse.json(
        { error: 'PINECONE_INDEX_NAME environment variable is not set.' },
        { status: 500 }
      );
    }

    const pc = getPinecone();

    // ── Phase 1a: Generate embeddings ─────────────────────────────────────

    const embeddingResponse = await pc.inference.embed({
      model: 'llama-text-embed-v2',
      inputs: [query.trim()],
      parameters: { input_type: 'query', truncate: 'END' },
    });

    const embedding = embeddingResponse.data[0];
    if (!embedding || embedding.vectorType !== 'dense') {
      return NextResponse.json(
        { error: 'Failed to embed search query.' },
        { status: 500 }
      );
    }

    const sparseVector = await generateSparseVector(query.trim(), 'query');

    // ── Phase 1b: Run 3 parallel Pinecone queries ─────────────────────────
    //    This gives us individual per-layer scores without extra latency.

    const DENSE_WEIGHT = 0.4;
    const SPARSE_WEIGHT = 0.3;

    const weightedDenseVector = embedding.values.map((v: number) => v * DENSE_WEIGHT);
    const weightedSparseVector = {
      indices: sparseVector.indices,
      values: sparseVector.values.map((v) => v * SPARSE_WEIGHT),
    };

    const index = pc.index(indexName);
    const ns = index.namespace('public');

    // Zero vector for sparse-only query (same dimension as dense)
    const zeroDenseVector = new Array(embedding.values.length).fill(0);

    const [hybridResponse, denseResponse, sparseResponse] = await Promise.all([
      // 1. Hybrid query — weighted dense + sparse (the main search)
      ns.query({
        vector: weightedDenseVector,
        sparseVector: weightedSparseVector,
        topK: 15,
        includeMetadata: true,
      }),
      // 2. Dense-only query — unweighted, pure semantic similarity
      ns.query({
        vector: embedding.values as number[],
        topK: 15,
        includeMetadata: false,
      }),
      // 3. Sparse-only query — pure keyword match score
      ns.query({
        vector: zeroDenseVector,
        sparseVector: {
          indices: sparseVector.indices,
          values: sparseVector.values,
        },
        topK: 15,
        includeMetadata: false,
      }),
    ]);

    const rawMatches = hybridResponse.matches ?? [];
    if (rawMatches.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // ── Build per-layer score lookup maps ──────────────────────────────────
    //    Dot-product scores can be slightly negative for weak-but-valid matches.
    //    Instead of hard-clamping to 0 (which erases those signals), we min-max
    //    normalise each layer's scores so the full observed range maps to [0, 1].

    const denseMatches = denseResponse.matches ?? [];
    const sparseMatches = sparseResponse.matches ?? [];

    function minMaxNormalise(matches: { id: string; score?: number }[]): Map<string, number> {
      const map = new Map<string, number>();
      if (matches.length === 0) return map;

      const scores = matches.map((m) => m.score ?? 0);
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      const range = max - min;

      for (const m of matches) {
        const raw = m.score ?? 0;
        // If all scores identical → 1.0; otherwise scale [min, max] → [0, 1]
        const normalised = range > 0 ? (raw - min) / range : 1.0;
        map.set(m.id, normalised);
      }
      return map;
    }

    const denseScoreMap = minMaxNormalise(denseMatches);
    const sparseScoreMap = minMaxNormalise(sparseMatches);

    // ── Phase 2 + 3: BGE Rerank → Weighted Sum → Final Sort ──────────────

    const reranked = await bgeRerank(
      query.trim(),
      rawMatches
        .filter((m) => m.metadata?.text)
        .map((m) => ({
          id: m.id,
          text: m.metadata!.text as string,
          hybridScore: Math.min(Math.max(m.score ?? 0, 0), 0.7),
          metadata: m.metadata as Record<string, unknown>,
        })),
      10
    );

    if (reranked.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // ── Collect unique userIds ────────────────────────────────────────────

    const userIdSet = new Set<string>();
    for (const r of reranked) {
      const uid = r.metadata?.userId as string | undefined;
      if (uid) userIdSet.add(uid);
    }
    const userIds = Array.from(userIdSet);

    // ── Fetch profiles from Neon DB ──────────────────────────────────────

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(inArray(user.id, userIds));

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    // ── Group chunks by user with per-layer scores ───────────────────────

    const grouped: Record<string, {
      profile: typeof users[number];
      finalScore: number;
      finalScorePct: number;
      chunks: {
        text: string;
        // Per-layer percentages
        denseScorePct: number;
        sparseScorePct: number;
        rerankScorePct: number;
        // Combined
        finalScore: number;
        finalScorePct: number;
        label?: string;
      }[];
    }> = {};

    for (const r of reranked) {
      const uid = r.metadata?.userId as string | undefined;
      if (!uid || !userMap[uid]) continue;
      if (!grouped[uid]) {
        grouped[uid] = {
          profile: userMap[uid],
          finalScore: r.finalScore,
          finalScorePct: r.finalScorePct,
          chunks: [],
        };
      }

      // Look up individual layer scores for this chunk
      const denseScore = denseScoreMap.get(r.id) ?? 0;
      const sparseScore = sparseScoreMap.get(r.id) ?? 0;

      grouped[uid].chunks.push({
        text: r.text,
        denseScorePct: Math.round(denseScore * 100),
        sparseScorePct: Math.round(sparseScore * 100),
        rerankScorePct: Math.round(r.rerankScore * 100),
        finalScore: r.finalScore,
        finalScorePct: r.finalScorePct,
        label: r.metadata?.label as string | undefined,
      });
      // Update group-level score to best chunk
      if (r.finalScore > grouped[uid].finalScore) {
        grouped[uid].finalScore = r.finalScore;
        grouped[uid].finalScorePct = r.finalScorePct;
      }
    }

    // Sort groups by best finalScore descending
    const sorted = Object.values(grouped).sort(
      (a, b) => b.finalScore - a.finalScore
    );

    // ── Generate Gemini explanations in parallel ─────────────────────────

    const results = await Promise.all(
      sorted.map(async (entry) => {
        let reason = '';
        try {
          reason = await generateReason(query, entry.profile, entry.chunks);
        } catch (e) {
          console.warn('[Gemini] Failed to generate reason:', e);
          reason = 'This person has relevant knowledge that matches your search query.';
        }
        return { ...entry, reason };
      })
    );

    return NextResponse.json({ results });
  } catch (err: unknown) {
    console.error('[/api/search] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
