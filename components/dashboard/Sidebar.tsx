"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Layers, Users, Calendar, CreditCard, 
  LogOut, Shield, Zap, Megaphone, Handshake, BarChart3, Settings, X, Briefcase,
  Sun, Moon // Added missing imports
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes"; 

interface SidebarProps {
  user: any;
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
  isMobile?: boolean;
}

export default function Sidebar({ user, isOpen, setIsOpen, isMobile }: SidebarProps) {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  const links = [
    { href: `/${locale}/dashboard`, label: t('dashboard'), icon: BarChart3 },
    { href: `/${locale}/dashboard/funnels`, label: t('funnels'), icon: Layers },
    { href: `/${locale}/dashboard/contacts`, label: t('contacts'), icon: Users },
    { href: `/${locale}/dashboard/events`, label: t('events'), icon: Megaphone },
    { href: `/${locale}/dashboard/calendars`, label: t('calendars'), icon: Calendar },
	{ href: `/${locale}/dashboard/affiliates`, label: t('affiliates'), icon: Handshake },
	{ href: `/${locale}/dashboard/partner`, label: t('partner'), icon: Briefcase },
    { href: `/${locale}/dashboard/billing`, label: t('billing'), icon: CreditCard },
  ];

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  // Mobile Drawer Classes
  const mobileClasses = isMobile 
    ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}` 
    : "hidden md:flex w-64 h-screen fixed left-0 top-0";

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}

      <aside className={`${mobileClasses} bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-white/5 flex flex-col justify-between z-50`}>
        
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          
          {/* HEADER / LOGO */}
          <div className="p-6 flex justify-between items-center shrink-0 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#A802FA] rounded-lg flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <Zap size={20} fill="currentColor" className="text-white" />
              </div>
              <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white uppercase">SYNCRA</span>
            </div>
            {isMobile && (
              <button onClick={() => setIsOpen && setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            )}
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="px-4 space-y-2 pb-4">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => isMobile && setIsOpen && setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                  isActive(link.href) 
                    ? 'text-[#5B5D6B] bg-slate-50 dark:bg-white/10 dark:text-white' 
                    : 'text-[#878A99] hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <link.icon 
                  size={20} 
                  className={`transition-colors ${isActive(link.href) ? "text-[#5B5D6B] dark:text-white" : "text-[#878A99] group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} 
                  strokeWidth={2}
                />
                {link.label}
              </Link>
            ))}

            {/* SUPER ADMIN LINK */}
            {(user?.role === 'superadmin' || user?.role === 'admin') && (
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <p className="px-4 text-[10px] font-extrabold text-[#878A99] uppercase tracking-wider mb-2">{t('super_admin')}</p>
            <Link 
              href={`/${locale}/dashboard/admin/platform`}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive(`/${locale}/dashboard/admin/platform`) 
                  ? 'bg-slate-50 text-slate-900 dark:bg-white/10 dark:text-white' 
                  : 'text-[#878A99] hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <Settings size={20} /> 
              {t('platform_settings')}
            </Link>
          </div>
            )}
          </nav>
        </div>

        {/* FOOTER (THEME + LOGOUT) */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 shrink-0 bg-white dark:bg-[#0f172a]">
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-[#878A99] hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Logout Button */}
            <button 
              onClick={() => signOut()} 
              className="flex-1 flex items-center gap-3 text-sm font-bold text-[#FF5D5D] hover:opacity-80 transition-all"
            >
              <LogOut size={20} /> 
              {t('sign_out')}
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}