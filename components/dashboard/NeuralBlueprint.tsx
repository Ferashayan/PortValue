import React from 'react';
import { GlassPanel } from '../ui/GlassPanel';
import { Cpu } from 'lucide-react';

export const NeuralBlueprint = () => {
  return (
    <GlassPanel className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-tertiary" />
            <h3 className="font-bold text-lg text-on-surface">Neural Blueprint</h3>
          </div>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Define core persona and behavioral constraints</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-white/5 border border-white/10 text-[9px] font-label tracking-widest px-2 py-1 rounded text-on-surface-variant uppercase">Markdown</span>
          <span className="bg-white/5 border border-white/10 text-[9px] font-label tracking-widest px-2 py-1 rounded text-on-surface-variant uppercase font-bold">v4.2</span>
        </div>
      </div>
      <div className="relative">
        <textarea 
          className="w-full h-32 bg-black/30 border border-white/5 rounded-xl p-6 font-mono text-xs text-tertiary/80 placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-tertiary/40 transition-all resize-none outline-none"
          placeholder="Enter system instructions... e.g. 'You are a high-level software architect specializing in distributed systems...'"
        ></textarea>
        <div className="absolute bottom-4 right-4 flex items-center gap-4">
          <span className="text-[9px] font-label text-on-surface-variant/50 uppercase tracking-widest font-bold">1,204 tokens</span>
          <button className="bg-white text-black px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-tertiary transition-colors shadow-lg">
            Apply Matrix
          </button>
        </div>
      </div>
    </GlassPanel>
  );
};