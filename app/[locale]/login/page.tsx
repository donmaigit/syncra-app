"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { Zap, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage({ params: {locale} }: { params: {locale: string} }) {
  const t = useTranslations('Auth'); // Loads the "Auth" section
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", { 
      redirect: false, 
      email, 
      password 
    });

    if (res?.error) {
      setError(t('error'));
      setLoading(false);
    } else {
      router.push(`/${locale}/dashboard`);
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1E293B] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
            <Zap className="h-6 w-6 text-white" />
          </div>
          {/* Matches JSON key "title" */}
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            {/* Matches JSON key "email" */}
            <input 
              type="email" 
              placeholder={t('email')} 
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              required
            />
          </div>
          <div>
            {/* Matches JSON key "password" */}
            <input 
              type="password" 
              placeholder={t('password')} 
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white hover:bg-purple-500 transition-colors disabled:opacity-50 flex justify-center"
          >
            {/* Matches JSON key "submit" */}
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
}