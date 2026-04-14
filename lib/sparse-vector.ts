/**
 * Sparse Vector Generator — BM25-like Bag-of-Words hashing
 *
 * Converts text into a sparse vector representation using deterministic
 * token hashing. This enables hybrid search in Pinecone where:
 *   - Dense vectors  → semantic similarity  ("AI Engineer" ≈ "ML Developer")
 *   - Sparse vectors → keyword matching     ("Feras" = "Feras")
 *
 * The approach:
 *   1. Tokenise & normalise the text (lowercase, remove punctuation)
 *   2. Hash each token to a fixed-range integer index (the "dimension")
 *   3. Count term frequency (TF) for each hashed index
 *   4. Return { indices, values } suitable for Pinecone sparseValues
 */

// ── Constants ────────────────────────────────────────────────────────────────

/** Max dimension space for sparse indices — keeps the vector compact */
const SPARSE_DIM = 50_000;

/** Simple stop-words to skip (keeps the sparse signal focused on content) */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
  'should', 'may', 'might', 'must', 'can', 'could', 'of', 'in', 'to',
  'for', 'with', 'on', 'at', 'from', 'by', 'about', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
  'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than', 'too',
  'very', 'just', 'because', 'if', 'when', 'where', 'how', 'what',
  'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'i', 'me',
  'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her',
  'it', 'its', 'they', 'them', 'their',
]);

// ── Hash function ────────────────────────────────────────────────────────────

/**
 * FNV-1a 32-bit hash — fast, well-distributed, deterministic.
 * Maps any string token to a positive integer in [0, SPARSE_DIM).
 */
function fnv1aHash(str: string): number {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }
  return Math.abs(hash) % SPARSE_DIM;
}

// ── Main export ──────────────────────────────────────────────────────────────

export interface SparseVector {
  indices: number[];
  values: number[];
}

/**
 * Generate a sparse vector from arbitrary text.
 *
 * @param text  Raw text to convert
 * @returns     Sparse vector with { indices, values } for Pinecone hybrid search
 */
export function generateSparseVector(text: string): SparseVector {
  // 1. Normalise: lowercase, strip non-alphanumeric (keep spaces)
  const normalised = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');

  // 2. Tokenise & filter stop-words / very short tokens
  const tokens = normalised
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  if (tokens.length === 0) {
    return { indices: [], values: [] };
  }

  // 3. Build term-frequency map keyed by hashed index
  const tf = new Map<number, number>();
  for (const token of tokens) {
    const idx = fnv1aHash(token);
    tf.set(idx, (tf.get(idx) ?? 0) + 1);
  }

  // 4. Convert map to sorted parallel arrays
  const entries = Array.from(tf.entries()).sort((a, b) => a[0] - b[0]);
  const indices = entries.map(([idx]) => idx);
  const values = entries.map(([, count]) => count);

  return { indices, values };
}
