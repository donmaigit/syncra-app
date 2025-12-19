"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/navigation";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: "ja" | "en") => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-lg p-1">
      <button
        disabled={isPending}
        onClick={() => switchLocale('ja')}
        className={`px-2 py-1 text-xs font-bold rounded-md transition-none ${
          locale === 'ja' 
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        JP
      </button>
      <button
        disabled={isPending}
        onClick={() => switchLocale('en')}
        className={`px-2 py-1 text-xs font-bold rounded-md transition-none ${
          locale === 'en' 
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
}