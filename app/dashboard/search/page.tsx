import { PeopleSearch } from '@/components/dashboard/PeopleSearch';

export default function SearchPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <header className="relative space-y-2 mb-8 border-l-2 border-tertiary pl-6 flex-shrink-0">
        <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface">
          People{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-white">
            Search
          </span>
        </h1>
        {/* <p className="text-on-surface-variant font-label text-[10px] tracking-widest uppercase opacity-70">
          Semantic search · Powered by Pinecone &amp; llama-text-embed-v2
        </p> */}
      </header>

      <div className="flex-1 min-h-0">
        <PeopleSearch />
      </div>
    </div>
  );
}
