// components/auth/SignUp.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { authClient } from "@/lib/auth-client";
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function SignUp() {
  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="relative min-h-screen bg-background text-on-background font-sans flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 ai-grid pointer-events-none"></div>
      <div className="absolute inset-0 bg-ethereal-glow pointer-events-none"></div>

      <main className="z-10 w-full max-w-sm">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">System Ready</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter mb-4">
            Initialize Your <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">AI Agent</span>
          </h1>
          <p className="text-sm text-on-surface-variant opacity-70">
            Step into the Obsidian Lens. Secure your architect credentials.
          </p>
        </header>

        <div className="glass-card rounded-2xl p-8 relative overflow-hidden border border-white/5">
          <form className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Architect Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input className="w-full bg-black/40 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-tertiary/30 outline-none transition-all" placeholder="e.g. Julian Thorne" type="text" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Neural ID (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input className="w-full bg-black/40 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-tertiary/30 outline-none transition-all" placeholder="identity@aether.ai" type="email" />
              </div>
            </div>

            <button className="mt-4 w-full bg-gradient-to-br from-white/10 to-white/5 hover:from-primary hover:to-primary/80 hover:text-black py-4 rounded-xl font-bold tracking-tight transition-all active:scale-95 shadow-xl border border-white/10">
              Create Account
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Or initialize with</p>
            <button 
              onClick={handleGoogleLogin}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <img src="/google.svg" className="w-5 h-5 opacity-70 group-hover:opacity-100" alt="Google" />
            </button>
          </div>
        </div>

        <footer className="mt-8 text-center">
          <Link href="/login" className="text-xs text-on-surface-variant hover:text-tertiary transition-colors">
            Already an architect? <span className="text-tertiary font-bold">Access Terminal</span>
          </Link>
        </footer>
      </main>
    </div>
  );
}