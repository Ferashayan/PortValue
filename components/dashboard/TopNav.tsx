import React from 'react';
import { Search } from 'lucide-react';
import { NotificationsMenu } from './NotificationsMenu';
import { UserProfileMenu } from './UserProfileMenu';

export const TopNav = () => {
  return (
    <nav className="fixed top-0 w-full bg-black/40 backdrop-blur-2xl flex justify-between items-center px-8 h-16 z-50 border-b border-white/5 shadow-2xl">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-black tracking-tighter text-on-surface">PortValue</span>
        <div className="hidden md:flex gap-6">
          <a className="text-tertiary font-bold text-xs uppercase tracking-widest" href="#">Dashboard</a>
          
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationsMenu />
        <UserProfileMenu />
      </div>
    </nav>
  );
};