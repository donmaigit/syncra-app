import Link from "next/link";
import { AlertTriangle } from "lucide-react";

// This 404 page sits INSIDE the [locale] layout.
// It inherits the header, footer, and styling from your main app.

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-900 dark:text-white px-4">
      <div className="bg-white dark:bg-[#1E293B] p-10 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 text-center max-w-md w-full">
        
        {/* Icon */}
        <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>
        
        {/* Bilingual Titles */}
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-6 mt-1">ページが見つかりません</p>

        {/* Bilingual Description */}
        <div className="space-y-2 mb-8 text-left bg-slate-50 dark:bg-black/20 p-4 rounded-lg border border-slate-100 dark:border-white/5">
          <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
        </div>

        {/* Action Button */}
        <Link 
          href="/" 
          className="block w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:opacity-90 transition-opacity"
        >
          Back to Home / ホームへ戻る
        </Link>
      </div>
    </div>
  );
}