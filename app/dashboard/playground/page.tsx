import { ChatPlayground } from "@/components/dashboard/ChatPlayground";

export default function PlaygroundPage() {
  return (
    <div className="space-y-8 pb-10">
      <header className="relative space-y-2 mb-12 border-l-2 border-tertiary pl-6">
        <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface">
          Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-white">Playground</span>
        </h1>
        <p className="text-on-surface-variant font-label text-[10px] tracking-widest uppercase opacity-70">Test & Interact with your Agent</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <div className="col-span-1 border border-white/10 rounded-2xl p-6 bg-[#0a0c10]/80 backdrop-blur-md">
          <ChatPlayground />
        </div>
      </div>
    </div>
  );
}
