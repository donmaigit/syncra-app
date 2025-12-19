import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="p-10 text-slate-900 dark:text-white animate-pulse">
      {/* Title Skeleton */}
      <div className="h-10 w-48 bg-slate-200 dark:bg-white/10 rounded-lg mb-8"></div>
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] p-6 h-32">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-white/5"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-slate-200 dark:bg-white/5 rounded"></div>
                <div className="h-8 w-16 bg-slate-200 dark:bg-white/5 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] h-64">
            <div className="border-b border-slate-200 dark:border-white/10 px-6 py-4">
              <div className="h-6 w-32 bg-slate-200 dark:bg-white/5 rounded"></div>
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-8 w-full bg-slate-100 dark:bg-white/5 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-center mt-10 text-slate-400 gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading Dashboard data...
      </div>
    </div>
  );
}