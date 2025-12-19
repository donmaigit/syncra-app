"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useLocale } from 'next-intl';

export default function LogoutButton({ label }: { label: string }) {
  const locale = useLocale(); // Get current language (ja or en)

  return (
    <button
      onClick={() => signOut({ callbackUrl: `/${locale}` })} // Redirect to /ja or /en
      className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors w-full"
    >
      <LogOut className="h-5 w-5" />
      {label}
    </button>
  );
}