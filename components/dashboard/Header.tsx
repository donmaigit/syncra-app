"use client";

import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UserNav } from "@/components/dashboard/UserNav";
import Sidebar from "@/components/dashboard/Sidebar";

export default function Header({ user }: { user: any }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] px-6 flex items-center justify-between z-40 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="md:hidden flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600">
            <Zap className="h-4 w-4 text-white" fill="currentColor" />
          </div>
          SYNCRA
        </div>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 mx-1 hidden md:block"></div>
        <ThemeToggle />
        <UserNav user={user} />
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-white dark:bg-[#0F172A] h-full shadow-2xl animate-in slide-in-from-left duration-200 border-r border-slate-200 dark:border-white/10 flex flex-col">
            <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-white/5">
              <span className="font-bold text-slate-900 dark:text-white pl-2">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto [&_aside]:flex [&_aside]:w-full [&_aside]:border-none [&_aside]:h-auto">
               <Sidebar user={user} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}