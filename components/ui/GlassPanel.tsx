import React from 'react';

export const GlassPanel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden ${className}`}>
      {/* تأثير الضجيج (Noise) الخفيف في الخلفية */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none ai-grid"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};