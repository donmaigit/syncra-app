"use client";

import { useState } from "react";
import { Edit, Loader2, X, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { updatePartner } from "@/app/actions/affiliate-actions";

export function EditPartnerModal({ partner }: { partner: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await updatePartner(formData);
    setLoading(false);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="p-1 hover:text-purple-500 transition-colors">
        <Edit className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="h-5 w-5"/></button>
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Edit Partner</h2>

            <form action={handleSubmit} className="space-y-4">
              <input type="hidden" name="partnerId" value={partner.id} />
              
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">Slug / Tracking Code</label>
                <input name="code" defaultValue={partner.code} required className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white outline-none" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                   <Lock className="h-3 w-3" /> Internal Memo
                </label>
                <textarea name="internalNotes" defaultValue={partner.internalNotes || ""} rows={3} className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white outline-none resize-none" />
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white hover:bg-purple-500 mt-2">
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}