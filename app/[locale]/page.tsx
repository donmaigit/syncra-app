"use client";
import { useState } from "react";
import { useTranslations } from 'next-intl';
import { AnimatePresence } from "framer-motion";
import { ArrowRight, LayoutTemplate, CreditCard, X, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Home({ params: {locale} }: { params: {locale: string} }) {
  const t = useTranslations('Landing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await fetch("/api/leads", { method: "POST", body: JSON.stringify({ email }) });
      setStatus("success");
    } catch { setStatus("error"); }
  };

  return (
    // FIX: Removed 'transition-colors'
    <main className="flex min-h-screen flex-col items-center overflow-hidden selection:bg-purple-500 selection:text-white bg-white dark:bg-[#0F172A]">
      
      {/* NAVBAR */}
      {/* FIX: Removed 'transition-colors' */}
      <nav className="fixed top-0 z-40 w-full border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
              <Zap className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            SYNCRA
          </div>
          <div className="flex gap-4 text-sm font-medium items-center">
             <LanguageSwitcher />
             <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-2"></div>
             <ThemeToggle />
             <Link href={`/login`} className="ml-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white">Login</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex w-full max-w-6xl flex-col items-center justify-center px-4 py-40 text-center">
        <div className="hidden dark:block absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        
        <div className="mb-8 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-300">
          {t('waitlist_badge')}
        </div>

        <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl text-slate-900 dark:text-white">
          {t('hero_title_1')}<br className="md:hidden" />
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> {t('hero_title_2')}</span>
        </h1>
        <p className="mb-10 max-w-2xl text-lg text-slate-600 dark:text-slate-400 sm:text-xl">{t('hero_desc')}</p>
        
        <button onClick={() => setIsModalOpen(true)} className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-slate-900 dark:bg-white px-8 text-base font-bold text-white dark:text-slate-900 transition-all hover:bg-slate-800 dark:hover:bg-slate-200 shadow-lg">
          <span className="mr-2">{t('cta')}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </section>

      {/* PROBLEM SECTION */}
      {/* FIX: Removed 'transition-colors' */}
      <section className="relative w-full border-y border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl text-slate-900 dark:text-white">{t('problem_title')}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{t('problem_desc')}</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-24 w-full">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-5xl text-slate-900 dark:text-white">{t('features.title')}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: LayoutTemplate, title: t('features.funnel_title'), desc: t('features.funnel_desc') },
            { icon: Zap, title: t('features.lstep_title'), desc: t('features.lstep_desc') },
            { icon: CreditCard, title: t('features.pay_title'), desc: t('features.pay_desc') }
          ].map((feature, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/30 p-8 hover:border-purple-500/50 transition-all shadow-sm dark:shadow-none">
               <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"><feature.icon/></div>
               <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
               <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      {/* FIX: Removed 'transition-colors' */}
      <section className="w-full border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-6 py-24 text-center">
        <h2 className="mb-8 text-4xl font-bold tracking-tight md:text-6xl text-slate-900 dark:text-white">{t('footer.title')}</h2>
        <button onClick={() => setIsModalOpen(true)} className="rounded-full bg-purple-600 px-10 py-5 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-purple-500 shadow-lg shadow-purple-500/25">
          {t('footer.cta')}
        </button>
        <p className="mt-8 text-sm text-slate-500">{t('footer.copyright')}</p>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
             <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] p-8 border border-slate-200 dark:border-white/10 relative shadow-2xl">
               <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X/></button>
               {status === "success" ? (
                 <div className="text-center text-green-500 dark:text-green-400 py-4"><CheckCircle2 className="mx-auto mb-2 h-10 w-10"/>Registered!</div>
               ) : (
                 <form onSubmit={handleSubmit} className="mt-4">
                   <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Waitlist</h3>
                   <input className="w-full rounded bg-slate-100 dark:bg-slate-800 p-3 mb-4 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:border-purple-500 outline-none" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required/>
                   <button type="submit" className="w-full bg-purple-600 p-3 rounded font-bold text-white hover:bg-purple-500">{status === "loading" ? "..." : "Submit"}</button>
                 </form>
               )}
             </div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}