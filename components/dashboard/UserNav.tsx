"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { Link } from "@/navigation"; // FIX: Changed from 'next/link' to '@/navigation'

export function UserNav({ user }: { user: { name?: string | null, email?: string | null } }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.name
    ? user.name.slice(0, 2).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 p-1.5 rounded-lg transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-bold text-slate-700 dark:text-white leading-none">{user.name || "User"}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-1">{user.email}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-56 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-2 border-b border-slate-100 dark:border-white/5 mb-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          
          <Link 
            href="/dashboard/settings" 
            className="flex items-center gap-2 px-2 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
          
          <button 
            onClick={() => signOut()} 
            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors mt-1"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}