"use client";

import { useState } from "react";
import { updateFunnelDomain } from "@/app/actions/funnel-actions";
import { Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DomainSettingsForm({ funnelId, currentDomain }: { funnelId: string, currentDomain: string | null }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const rawDomain = formData.get("customDomain") as string;
    const cleanDomain = rawDomain?.trim();

    if (!cleanDomain && !currentDomain) {
      setMessage({ type: 'error', text: "Please enter a domain name." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const res = await updateFunnelDomain(formData);

    if (res?.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: "Domain updated successfully!" });
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="flex gap-4 items-start">
      <input type="hidden" name="funnelId" value={funnelId} />
      
      <div className="flex-1">
        <input 
          name="customDomain" 
          defaultValue={currentDomain || ""} 
          placeholder="mybrand.com or pages.mybrand.com" 
          className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500 transition-colors text-slate-900 dark:text-white"
        />
        {message && (
          <p className={`text-xs mt-2 font-bold ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Domain</>}
      </button>
    </form>
  );
}