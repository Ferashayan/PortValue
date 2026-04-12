import { IdentitySync } from "@/components/dashboard/IdentitySync";
import { KnowledgeUpload } from "@/components/dashboard/KnowledgeUpload";

export default function KnowledgePage() {
  return (
    <div className="space-y-8 pb-10">
      <header className="relative space-y-2 mb-12 border-l-2 border-tertiary pl-6">
        <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface">
          Knowledge <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-white">Base</span>
        </h1>
        <p className="text-on-surface-variant font-label text-[10px] tracking-widest uppercase opacity-70">Identity & Knowledge Sync</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <IdentitySync />
        </div>
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <KnowledgeUpload />
        </div>
      </div>
    </div>
  );
}
