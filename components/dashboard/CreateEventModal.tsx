"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import { Plus, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { createEvent } from "@/app/actions/event-actions"; 

export function CreateEventModal({ funnels }: { funnels: { id: string; name: string }[] }) {
  const t = useTranslations("Events");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await createEvent(formData);
    setLoading(false);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20"
      >
        <Plus className="h-4 w-4" /> {t('create_btn')}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{t('modal_title')}</h2>

            <form action={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Title <span className="text-red-500">*</span>
                </label>
                <input 
                  name="title" 
                  required 
                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 outline-none transition-colors" 
                  placeholder="e.g. Weekly Strategy Call" 
                />
              </div>

              {/* Funnel Selector (Forced Manual Selection) */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Attach to Funnel <span className="text-red-500">*</span>
                </label>
                <select 
                  name="funnelId" 
                  required 
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 outline-none appearance-none"
                >
                  <option value="" disabled>-- Select a funnel --</option>
                  {funnels.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                {funnels.length === 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    No funnels found. <a href="/dashboard/funnels" className="text-purple-500 hover:underline">Create one first.</a>
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="startAt" 
                    type="datetime-local" 
                    required 
                    className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="endAt" 
                    type="datetime-local" 
                    required 
                    className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 outline-none" 
                  />
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Capacity</label>
                <input 
                  name="capacity" 
                  type="number" 
                  defaultValue={100} 
                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 outline-none" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white hover:bg-purple-500 mt-4 flex justify-center items-center"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('create_submit')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}