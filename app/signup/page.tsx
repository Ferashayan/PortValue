"use client";

import React from 'react';
import Link from 'next/link';
import { authClient } from "@/lib/auth-client";
import { User, Mail, Lock, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 ai-grid pointer-events-none"></div>
      <div className="absolute inset-0 ethereal-glow pointer-events-none"></div>

      <main className="z-10 w-full max-w-sm">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">System Ready</span>
          </div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter mb-4">
            Initialize Your <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">AI Agent</span>
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed font-light">
            Step into the Obsidian Lens. Secure your architect credentials.
          </p>
        </header>

        <div className="glass-card rounded-2xl p-8 relative border border-white/5">
          <form className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Architect Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input className="w-full bg-surface-container-lowest/50 border-none rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-1 focus:ring-tertiary/30 outline-none transition-all" placeholder="e.g. Feras Alnassan" type="text" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Neural ID (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input className="w-full bg-surface-container-lowest/50 border-none rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-1 focus:ring-tertiary/30 outline-none transition-all" placeholder="identity@portvalue.ai" type="email" />
              </div>
            </div>

            <button className="mt-4 w-full bg-gradient-to-br from-primary to-primary/70 text-background py-4 rounded-xl font-bold tracking-tight active:scale-95 transition-transform">
              Create Account
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Or initialize with</p>
            <button onClick={handleGoogleLogin} className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high border border-white/10 hover:bg-white/10 transition-colors">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 opacity-80" alt="Google" />
            </button>
          </div>
        </div>

        <footer className="mt-12 text-center">
          <Link href="/login" className="text-xs text-on-surface-variant hover:text-tertiary transition-colors flex items-center justify-center gap-2">
            Already an architect? <span className="text-tertiary font-bold">Access Terminal</span>
          </Link>
        </footer>
      </main>
    </div>
  );
}