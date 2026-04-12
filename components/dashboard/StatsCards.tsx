import React from 'react';
import { Bolt, Layout, BarChart3, Database } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';

export const StatsCards = () => {
  const stats = [
    { label: "Sync Reliability", value: "99.8%", icon: <Bolt size={16} className="text-tertiary" /> },
    { label: "Context Window", value: "128k", icon: <Database size={16} className="text-primary" /> },
  ];

  return (
    <div className="grid grid-cols-12 gap-6">
      {stats.map((s, idx) => (
        <div key={idx} className="col-span-12 md:col-span-6 lg:col-span-3 glass-panel p-6 rounded-2xl border border-white/5 bg-white/5">
          <p className="text-[10px] font-label uppercase text-on-surface-variant tracking-widest mb-4">{s.label}</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-on-surface tracking-tighter">{s.value}</span>
            <div className="mb-1">{s.icon}</div>
          </div>
        </div>
      ))}
      <div className="col-span-12 lg:col-span-6 glass-panel rounded-2xl relative overflow-hidden h-32 flex items-center px-8 border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-tertiary/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex justify-between items-center w-full">
            <div>
              <h4 className="font-bold text-sm text-on-surface">Knowledge Stream</h4>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Real-time indexing active across 14 sources</p>
            </div>
            <button className="bg-white/5 text-[9px] font-bold uppercase tracking-widest px-6 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-all">Manage Sources</button>
          </div>
      </div>
    </div>
  );
};