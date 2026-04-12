"use client"; // الحارس الذي يحمي الكود من الانهيار في Next.js

import React from 'react';
import { LayoutDashboard, Database, FlaskConical, Settings, HelpCircle, LogOut, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard" },
    { icon: <Database size={20} />, label: "Knowledge", href: "/dashboard/knowledge" },
    { icon: <FlaskConical size={20} />, label: "Playground", href: "/dashboard/playground" },
    { icon: <Settings size={20} />, label: "Settings", href: "/dashboard/agent-setting" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col p-6 gap-8 bg-black/40 backdrop-blur-3xl border-r border-white/5 z-40 pt-24">
      <div className="flex flex-col gap-1 mb-4">
        <h2 className="text-xl font-bold text-on-surface">PortValue Pro</h2>
        <p className="font-label uppercase tracking-widest text-[10px] text-tertiary">AI Architect Console</p>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link key={idx} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/5 border border-white/10 text-on-surface' : 'text-on-surface-variant hover:text-tertiary hover:bg-white/5'}`}>
              <span className={isActive ? "text-tertiary" : ""}>{item.icon}</span>
              <span className="font-label uppercase tracking-widest text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button className="mt-4 bg-gradient-to-r from-tertiary to-primary text-background font-black py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(143,245,255,0.2)] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
        <Plus size={18} />
        <span className="text-xs uppercase tracking-tighter">New Agent</span>
      </button>

      <div className="mt-auto flex flex-col gap-2">
        <a href="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-tertiary transition-colors text-xs font-label uppercase tracking-widest">
          <HelpCircle size={16} /> Help
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-red-400 transition-colors text-xs font-label uppercase tracking-widest">
          <LogOut size={16} /> Logout
        </a>
      </div>
    </aside>
  );
};