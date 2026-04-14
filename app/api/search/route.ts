import { NextRequest, NextResponse } from 'next/server';
import { getPinecone } from '@/lib/pinecone';
import { db } from '@/db';
import { user } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateSparseVector } from '@/lib/sparse-vector';

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
  chunks: { text: string; score: number }[]
): Promise<string> {
  const model = getGemini();

  const chunkSummary = chunks
    .slice(0, 3)
    .map((c, i) => `[${i + 1}] (${Math.min(100, Math.round(c.score * 100))}% match) ${c.text}`)
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

// ── Route handler ─────────────────────────────────────────────────────────────
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

    // 1. Embed the search query — DENSE vector for semantic matching
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

    // 2. Generate SPARSE vector for the query — keyword matching
    //    When searching for "Feras", the sparse vector ensures that documents
    //    containing "Feras" are boosted via keyword overlap, regardless of how
    //    the dense (semantic) model ranks them.
    const sparseVector = generateSparseVector(query.trim());

    // 3. Apply hybrid weighting: 80% sparse (keyword) + 20% dense (semantic)
    //    This prioritises exact keyword/name matches over general semantic similarity.
    const DENSE_WEIGHT = 0.6;
    const SPARSE_WEIGHT = 0.4;

    const weightedDenseVector = embedding.values.map((v: number) => v * DENSE_WEIGHT);
    const weightedSparseVector = {
      indices: sparseVector.indices,
      values: sparseVector.values.map((v) => v * SPARSE_WEIGHT),
    };

    // 4. Query Pinecone public namespace — HYBRID search (dense + sparse)
    //    Both weighted vectors are sent to Pinecone. The dot-product scoring
    //    combines them, giving keyword matches ~4× more influence than semantic.
    const index = pc.index(indexName);
    const queryResponse = await index.namespace('public').query({
      vector: weightedDenseVector,          // Dense vector  → 20% weight (semantic)
      sparseVector: weightedSparseVector,   // Sparse vector → 80% weight (keywords)
      topK: 5,
      includeMetadata: true,
    });

    const matches = queryResponse.matches ?? [];
    if (matches.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // 4. Collect unique userIds from matched vectors
    const userIdSet = new Set<string>();
    for (const m of matches) {
      const uid = m.metadata?.userId as string | undefined;
      if (uid) userIdSet.add(uid);
    }
    const userIds = Array.from(userIdSet);

    // 5. Fetch matching user profiles from Neon DB
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

    // 6. Group chunks by user
    const grouped: Record<string, {
      profile: typeof users[number];
      chunks: { text: string; score: number; label?: string }[];
    }> = {};

    for (const match of matches) {
      const uid = match.metadata?.userId as string | undefined;
      if (!uid || !userMap[uid]) continue;
      if (!grouped[uid]) {
        grouped[uid] = { profile: userMap[uid], chunks: [] };
      }
      grouped[uid].chunks.push({
        text: match.metadata?.text as string,
        score: match.score ?? 0,
        label: match.metadata?.label as string | undefined,
      });
    }

    const sorted = Object.values(grouped).sort(
      (a, b) => (b.chunks[0]?.score ?? 0) - (a.chunks[0]?.score ?? 0)
    );

    // 7. Ask Gemini to explain each match — run in parallel
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
