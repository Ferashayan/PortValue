import React from 'react';
import { Send, RotateCcw, History, Bot, User } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';

export const ChatPlayground = () => {
  return (
    <GlassPanel className="flex flex-col h-[500px] p-0 overflow-hidden">
      <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-tertiary rounded-full shadow-[0_0_12px_#8ff5ff]"></div>
          <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface">Live Playground</span>
        </div>
        <div className="flex gap-4">
          <RotateCcw size={16} className="text-on-surface-variant cursor-pointer hover:text-tertiary transition-colors" />
          <History size={16} className="text-on-surface-variant cursor-pointer hover:text-tertiary transition-colors" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-8 space-y-8">
        {/* Agent Message */}
        <div className="flex gap-4 max-w-2xl">
          <div className="w-8 h-8 rounded-full bg-tertiary/20 border border-tertiary/30 flex items-center justify-center flex-shrink-0">
            <Bot size={16} className="text-tertiary" />
          </div>
          <div className="space-y-2">
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none text-xs leading-relaxed text-on-surface-variant">
                System initialized. Awaiting architectural instructions. I have indexed your LinkedIn profile and three GitHub repositories.
            </div>
          </div>
        </div>

        {/* User Message */}
        <div className="flex gap-4 max-w-2xl ml-auto flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-primary" />
          </div>
          <div className="text-right">
            <p className="text-xs leading-relaxed bg-white/10 px-4 py-3 rounded-2xl rounded-tr-none border border-white/10 text-on-surface">
                Analyze my recent project and suggest improvements.
            </p>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 pt-0">
        <div className="relative bg-black/40 rounded-full border border-white/10 p-1.5 pl-6 flex items-center backdrop-blur-xl group focus-within:border-tertiary/40 transition-all">
          <input className="bg-transparent border-none focus:ring-0 w-full text-xs placeholder:text-on-surface-variant/40 outline-none" placeholder="Message your agent..." type="text" />
          <button className="bg-tertiary text-black w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,238,252,0.4)]">
            <Send size={16} />
          </button>
        </div>
      </div>
    </GlassPanel>
  );
};