"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';

export const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Example notifications
  const notifications = [
    { id: 1, title: 'New message received', time: '5m ago', isRead: false },
    { id: 2, title: 'System update completed', time: '1h ago', isRead: true },
    { id: 3, title: 'Security alert resolved', time: '1d ago', isRead: true },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={toggleOpen}
        className="relative p-2 rounded-full hover:bg-white/5 transition-colors focus:outline-none flex items-center justify-center"
      >
        <Bell size={20} className="text-gray-400 hover:text-cyan-400 transition-colors" />
        {/* Unread indicator */}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-black shadow-sm"></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[#0d0f12] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-black/40">
            <h3 className="text-sm font-semibold text-gray-100">Notifications</h3>
            <button className="text-[10px] text-cyan-400 hover:text-cyan-300 uppercase tracking-widest font-bold transition-colors">Mark all read</button>
          </div>
          <div className="max-h-[350px] overflow-y-auto scrollbar-hide flex flex-col">
            {notifications.map((notif) => (
              <div key={notif.id} className="px-4 py-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex flex-col gap-1.5">
                <div className="flex justify-between items-start">
                  <p className={`text-sm ${notif.isRead ? 'text-gray-400' : 'text-gray-100 font-medium'}`}>
                    {notif.title}
                  </p>
                  {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0 animate-pulse"></span>}
                </div>
                <span className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">{notif.time}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-black/40 text-center cursor-pointer hover:bg-white/5 transition-colors">
            <span className="text-xs font-semibold text-cyan-500 hover:text-cyan-400">View all notifications</span>
          </div>
        </div>
      )}
    </div>
  );
};
