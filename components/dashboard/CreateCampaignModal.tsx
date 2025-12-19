"use client";

import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createCampaign } from "@/app/actions/affiliate-actions";

export function CreateCampaignModal({ funnels }: { funnels: { id: string, name: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await createCampaign(formData);
    setLoading(false);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-purple-500 transition-colors">
        <Plus className="h-4 w-4" /> New Campaign
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="h-5 w-5"/></button>
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Create Campaign</h2>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input name="name" required className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 outline-none" placeholder="e.g. Summer Sale Affiliate" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                  Target Funnel <span className="text-red-500">*</span>
                </label>
                <select name="funnelId" required defaultValue="" className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 outline-none appearance-none">
                  <option value="" disabled>-- Select Funnel --</option>
                  {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select name="type" className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 outline-none appearance-none">
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (¥)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                    Value <span className="text-red-500">*</span>
                  </label>
                  <input name="value" type="number" required className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 outline-none" placeholder="30" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white hover:bg-purple-500 mt-4 flex justify-center items-center">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Launch Campaign"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}