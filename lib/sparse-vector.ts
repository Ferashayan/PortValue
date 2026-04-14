/**
 * Sparse Vector Generator — Pinecone pinecone-sparse-english-v0
 *
 * Uses Pinecone's official sparse embedding model (built on the DeepImpact
 * architecture) via the Inference API. This replaces the custom BM25 hashing
 * approach with a production-grade learned sparse model that understands
 * English semantics at the token level.
 *
 * The model returns sparse vectors with { sparseIndices, sparseValues } which
 * are mapped to Pinecone's { indices, values } format for hybrid search.
 *
 * Input types:
 *   - 'passage' → use when indexing documents  (embed route)
 *   - 'query'   → use when searching           (search route)
 */

import { getPinecone } from '@/lib/pinecone';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SparseVector {
  indices: number[];
  values: number[];
}

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Generate a sparse vector using Pinecone's `pinecone-sparse-english-v0` model.
 *
 * @param text       Raw text to convert
 * @param inputType  'passage' for indexing, 'query' for searching
 * @returns          Sparse vector with { indices, values } for Pinecone hybrid search
 */
export async function generateSparseVector(
  text: string,
  inputType: 'passage' | 'query' = 'passage'
): Promise<SparseVector> {
  const pc = getPinecone();

  const response = await pc.inference.embed({
    model: 'pinecone-sparse-english-v0',
    inputs: [text],
    parameters: { input_type: inputType, truncate: 'END' },
  });

  const embedding = response.data[0];

  if (!embedding || embedding.vectorType !== 'sparse') {
    console.warn('[sparse-vector] Unexpected response from pinecone-sparse-english-v0:', embedding);
    return { indices: [], values: [] };
  }

  // The SDK returns SparseEmbedding with sparseIndices & sparseValues
  const sparse = embedding as unknown as {
    sparseIndices: number[];
    sparseValues: number[];
    vectorType: string;
  };

  return {
    indices: sparse.sparseIndices,
    values: sparse.sparseValues,
  };
}
