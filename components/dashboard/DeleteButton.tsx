"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { useRouter } from "@/navigation";

export function DeleteButton({ itemName, onDelete }: { itemName: string, onDelete: () => Promise<any> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    await onDelete();
    setLoading(false);
    setIsOpen(false);
    router.refresh();
  };

  return (
    <>
      {/* TRIGGER BUTTON (Updated with Text) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 py-2 text-sm font-medium transition-colors"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Delete Funnel?</h2>
              <p className="text-slate-500 text-sm">
                Are you sure you want to delete <strong>"{itemName}"</strong>?<br/>
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-500/20"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Yes, Delete"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}