import { Metadata } from 'next';
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from 'next/link';
import { Brain, Sparkles, Terminal, Code2, Network, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'PortValue | Build Your Digital Twin',
  description: 'PortValue allows developers to build an intelligent digital twin to represent them to recruiters based on GitHub and LinkedIn data.',
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  // Redirect to dashboard if already logged in
  if (session) {
    return redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-[#F3F4F6] selection:bg-cyan-500/30 overflow-hidden relative font-sans">
      {/* Background Neural Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 md:px-16 py-6 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Brain className="text-cyan-400 animate-pulse" size={28} />
          <span className="text-xl font-black tracking-tighter text-white">PortValue</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-mono tracking-widest text-gray-400 hover:text-white transition-colors uppercase">
            Sign In
          </Link>
          <Link href="/login" className="px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/50 rounded-lg text-cyan-400 font-mono text-xs uppercase tracking-widest hover:bg-cyan-500/20 hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center gap-2">
            Get Started <ChevronRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-widest text-cyan-400 mb-8">
          <Sparkles size={14} />
          <span>V2.4 NEURAL LINK ACTIVE</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-white mb-6">
          Synthesize Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Digital Identity
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl text-center leading-relaxed mb-12">
          PortValue ingests your GitHub repositories, LinkedIn experience, and technical philosophy to train a custom autonomous AI agent that represents you in interviews.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/login" className="group relative px-8 py-4 bg-white text-black font-bold text-sm tracking-widest uppercase rounded-xl hover:scale-105 transition-all overflow-hidden flex items-center justify-center gap-2">
            <span className="relative z-10 flex items-center gap-2 group-hover:text-cyan-900 transition-colors">
              Initialize Sequence <ChevronRight size={18} />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>
          <a href="#features" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-white/10 transition-all flex items-center justify-center">
            View Protocol
          </a>
        </div>
      </main>

      {/* Features Showcase */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-4 py-24 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-[#121418] border border-white/5 p-8 rounded-3xl hover:border-cyan-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Network className="text-cyan-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Knowledge Sync</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Instantly ingest your PDF CVs, personal philosophy, and past experiences to build the foundational memory bank.
            </p>
          </div>

          <div className="bg-[#121418] border border-white/5 p-8 rounded-3xl hover:border-blue-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Code2 className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Codebase Ingestion</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connect via GitHub to let your agent natively understand your technical skills, patterns, and framework proficiencies.
            </p>
          </div>

          <div className="bg-[#121418] border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Terminal className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Agent Playground</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Interact with your fully trained digital twin in real-time, tuning its persona before recruiters interact with it.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/40 py-8 px-8 text-center text-sm font-mono text-gray-600">
        <p>System Online. PortValue 2026 © All Rights Reserved.</p>
      </footer>
    </div>
  );
}