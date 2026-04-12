"use client";
import React, { useState, useRef, useEffect } from 'react';
import { UserCircle, Settings, LogOut, User } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export const UserProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const user = session?.user;

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={toggleOpen}
        className="relative p-1 rounded-full hover:bg-white/5 transition-colors focus:outline-none flex items-center justify-center"
      >
        <UserCircle size={24} className="text-gray-400 hover:text-cyan-400 transition-colors" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-[#0d0f12] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-4 border-b border-white/5 flex items-center gap-3 bg-black/40">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
              {user?.image ? (
                <img src={user.image} alt={user?.name || "User"} className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-cyan-400" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">{user?.name || "User"}</span>
              <span className="text-[10px] text-gray-500 font-mono truncate max-w-[140px]">{user?.email || "user@example.com"}</span>
            </div>
          </div>
          <div className="py-2">
            <a href="#" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              <User size={16} className="text-gray-400" /> My Profile
            </a>
            <a href="#" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              <Settings size={16} className="text-gray-400" /> Account Settings
            </a>
          </div>
          <div className="py-2 border-t border-white/5">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
