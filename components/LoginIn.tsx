// components/auth/Login.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { authClient } from "@/lib/auth-client";
import { Mail, Lock, Shield } from 'lucide-react';

export default function Login() {
  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="relative min-h-screen bg-background text-on-background flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 ai-grid pointer-events-none"></div>
      <div className="absolute inset-0 bg-ethereal-glow pointer-events-none"></div>

      <main className="z-10 w-full max-w-sm">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <Shield className="text-tertiary" size={14} />
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Secure Access</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter mb-4 text-on-surface">
            Resume <br/> <span className="text-tertiary">Session</span>
          </h1>
        </header>

        <div className="glass-card rounded-2xl p-8 border border-white/5">
          <form className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Neural ID</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input className="w-full bg-black/40 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-tertiary/30 outline-none" placeholder="identity@aether.ai" type="email" />
              </div>
            </div>
            {/* ... حقل الباسورد بنفس النمط ... */}
            
            <button className="mt-4 w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-tertiary transition-all">
              Login to Console
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Social Protocol</p>
            <button onClick={handleGoogleLogin} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-tertiary/50 transition-all">
               <img src="/google.svg" className="w-5 h-5" alt="Google" />
            </button>
          </div>
        </div>

        <footer className="mt-8 text-center">
          <Link href="/signup" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
            New Architect? <span className="text-primary font-bold">Initialize Identity</span>
          </Link>
        </footer>
      </main>
    </div>
  );
}