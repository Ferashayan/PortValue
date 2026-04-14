import { NextRequest, NextResponse } from 'next/server';
import { getPinecone } from '@/lib/pinecone';
import { auth } from '@/lib/auth';
import { generateSparseVector } from '@/lib/sparse-vector';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify session & get the Neon DB userId
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to embed knowledge.' },
        { status: 401 }
      );
    }
    const userId = session.user.id; // Exact Neon DB user.id (text PK from Better Auth)

    const { text, namespace } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return NextResponse.json(
        { error: 'Text must be at least 20 characters.' },
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

    // 2. Generate DENSE embedding using Pinecone Inference API (llama-text-embed-v2)
    const embeddingResponse = await pc.inference.embed({
      model: 'llama-text-embed-v2',
      inputs: [text.trim()],
      parameters: { input_type: 'passage', truncate: 'END' },
    });

    const embedding = embeddingResponse.data[0];
    if (!embedding || embedding.vectorType !== 'dense') {
      return NextResponse.json(
        { error: 'Expected a dense embedding from llama-text-embed-v2 but received none or a sparse one.' },
        { status: 500 }
      );
    }
    const vector = embedding.values;
    if (!vector || vector.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate embedding from Pinecone Inference API.' },
        { status: 500 }
      );
    }

    // 3. Generate SPARSE vector for hybrid keyword matching
    //    This enables exact keyword searches (e.g. searching "Feras" matches
    //    documents containing the name "Feras" even when the dense vector
    //    might rank other "AI Engineers" higher due to semantic similarity).
    const sparseValues = generateSparseVector(text.trim());

    // 4. Upsert into the Pinecone index with BOTH dense + sparse vectors
    //    Namespace = 'public'  →  all users' knowledge is globally searchable
    //    userId is stored in metadata for Neon DB lookup after retrieval
    const index = pc.index(indexName);
    const id = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await index.namespace('public').upsert({
      records: [
        {
          id,
          values: vector,                     // Dense vector — semantic similarity
          sparseValues,                        // Sparse vector — keyword matching (hybrid)
          metadata: {
            userId,                            // Neon DB user.id — used to fetch full profile
            text: text.trim(),
            source: 'knowledge-upload',
            createdAt: new Date().toISOString(),
            ...(namespace?.trim() ? { label: namespace.trim() } : {}),
          },
        },
      ],
    });

    return NextResponse.json({ success: true, id, userId });
  } catch (err: unknown) {
    console.error('[/api/knowledge/embed] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
