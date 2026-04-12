import React from 'react';
import {  Link2 } from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'; 
import { GlassPanel } from '../ui/GlassPanel';

export const IdentitySync = () => {
  const platforms = [
    { name: "GitHub", icon: <FaGithub size={18} />, desc: "Repositories & Gists", status: "Connect", active: false },
    { name: "LinkedIn", icon: <FaLinkedin size={18} />, desc: "Professional Graph", status: "Active", active: true },
    { name: "Twitter", icon: <FaTwitter size={18} />, desc: "Social Sentiment", status: "Connect", active: false },
  ];

  return (
    <GlassPanel>
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-label text-[10px] tracking-[0.2em] uppercase text-on-surface-variant">Identity Sync</h3>
        <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_12px_#8ff5ff]"></div>
      </div>
      <div className="space-y-4">
        {platforms.map((p, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-tertiary/40 transition-all hover:bg-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-black/40 rounded-full border border-white/10">
                <span className="text-tertiary">{p.icon}</span>
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface">{p.name}</p>
                <p className="text-[10px] text-on-surface-variant/50">{p.desc}</p>
              </div>
            </div>
            <button className={`text-[10px] font-label uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${p.active ? 'bg-white/10 text-white border-white/20' : 'text-tertiary border-tertiary/20 group-hover:bg-tertiary group-hover:text-black'}`}>
              {p.status}
            </button>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};