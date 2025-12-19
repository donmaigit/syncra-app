"use client";

import { useState } from "react";
import { Edit, Loader2, X, Lock, Code2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateEvent } from "@/app/actions/event-actions";

export function EditEventModal({ event }: { event: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await updateEvent(formData);
    setLoading(false);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="w-full py-2.5 border border-slate-200 dark:border-white/10 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2"
      >
        <Edit className="h-4 w-4" /> Manage Event
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="h-5 w-5"/></button>
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Edit Event</h2>

            <form action={handleSubmit} className="space-y-4">
              <input type="hidden" name="eventId" value={event.id} />
              
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">Event Title</label>
                <input name="title" defaultValue={event.title} required className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white outline-none" />
              </div>

              <div>
                 <label className="mb-1 block text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Internal Memo
                 </label>
                 <textarea name="internalNotes" defaultValue={event.internalNotes || ""} rows={2} className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 px-3 py-2 text-slate-900 dark:text-white outline-none resize-none" />
              </div>

              <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-4">
                 <h3 className="text-sm font-bold mb-2 flex items-center gap-2"><Code2 className="h-4 w-4" /> Tracking Scripts</h3>
                 
                 <div className="mb-3">
                   <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Head Code</label>
                   <textarea name="headCode" defaultValue={event.headCode || ""} rows={3} placeholder="Pixels, Analytics..." className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900 text-white px-3 py-2 font-mono text-xs outline-none resize-y" />
                 </div>
                 
                 <div>
                   <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Footer Code</label>
                   <textarea name="footerCode" defaultValue={event.footerCode || ""} rows={3} placeholder="Chat widgets..." className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900 text-white px-3 py-2 font-mono text-xs outline-none resize-y" />
                 </div>
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white hover:bg-purple-500 mt-2 flex justify-center items-center">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}