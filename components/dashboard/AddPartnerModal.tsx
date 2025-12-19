"use client";

import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { addPartner } from "@/app/actions/affiliate-actions";

export function AddPartnerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const res = await addPartner(formData);
    if (res?.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
        <Plus className="h-4 w-4" /> Add Partner
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="h-5 w-5"/></button>
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Add New Partner</h2>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">{error}</div>}

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                  Name <span className="text-red-500">*</span>
                </label>
                <input name="name" required className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 outline-none" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                  Email <span className="text-red-500">*</span>
                </label>
                <input name="email" type="email" required className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 outline-none" placeholder="partner@example.com" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                  Password <span className="text-red-500">*</span>
                </label>
                <input name="password" type="password" required className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 outline-none" />
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white hover:bg-purple-500 mt-4 flex justify-center items-center">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Partner Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}