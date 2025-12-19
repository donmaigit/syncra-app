"use client";

import { useState } from "react";
import { updateFunnel } from "@/app/actions/funnel-actions";
import { Save, AlertTriangle, Loader2, Globe, Lock, Search, Code2, Smartphone, Monitor } from "lucide-react";
import { useRouter } from "next/navigation";

export function ClientSettingsForm({ funnel, subdomain }: { funnel: any, subdomain: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  // Core Fields
  const [slug, setSlug] = useState(funnel.slug);
  
  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(funnel.seoTitle || "");
  const [seoDesc, setSeoDesc] = useState(funnel.seoDescription || funnel.metaDesc || "");
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Logic: Detect Japanese characters to adjust limits
  const hasJapanese = (text: string) => /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
  
  const titleLimit = hasJapanese(seoTitle) ? 32 : 60;
  const descLimit = hasJapanese(seoDesc) ? 120 : 160;

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanVal = val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setSlug(cleanVal);
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);
    formData.set("slug", slug);
    
    const res = await updateFunnel(formData);
    
    if (res?.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: "Settings saved successfully!" });
      router.refresh();
    }
    setLoading(false);
  };

  const isSlugChanged = slug !== funnel.slug;
  const fullUrl = `https://${subdomain}.syncra.page/${slug || ""}`;

  return (
    <form action={handleSubmit} className="space-y-8">
      <input type="hidden" name="funnelId" value={funnel.id} />

      {/* --- CARD 1: INTERNAL MANAGEMENT --- */}
      <section className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
          <Lock className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-bold">Internal Management</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2">Funnel Name <span className="text-red-500">*</span></label>
            <input 
              name="name" 
              defaultValue={funnel.name}
              required
              className="w-full p-3 rounded-lg bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Internal Memo</label>
            <textarea 
              name="internalNotes" 
              defaultValue={funnel.internalNotes || ""}
              rows={1}
              placeholder="Private team notes..."
              className="w-full p-3 rounded-lg bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>
        </div>
      </section>

      {/* --- CARD 2: SEO & PUBLIC URL --- */}
      <section className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
          <Search className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-bold">SEO & Public URL</h2>
        </div>

        {/* 1. URL SLUG */}
        <div className="mb-8">
          <label className="block text-sm font-bold mb-2">URL Path (Slug) <span className="text-red-500">*</span></label>
          <div className="relative">
             <span className="absolute left-3 top-3 text-slate-400 font-bold">/</span>
             <input 
                  name="slug"
                  value={slug}
                  onChange={handleSlugChange}
                  required
                  className="w-full p-3 pl-6 rounded-lg bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:border-purple-500 transition-colors font-mono"
             />
          </div>
          {isSlugChanged && (
            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1 font-bold">
              <AlertTriangle className="h-3 w-3" /> Warning: Changing this breaks existing links.
            </div>
          )}
        </div>

        {/* 2. GOOGLE PREVIEW COMPONENT */}
        <div className="mb-8 bg-slate-50 dark:bg-black/20 p-6 rounded-xl border border-slate-200 dark:border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase text-slate-500">Search Result Preview</h3>
            <div className="flex bg-white dark:bg-white/10 rounded-lg p-1 border border-slate-200 dark:border-white/5">
              <button 
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-slate-100 dark:bg-white/20 text-blue-600 dark:text-white' : 'text-slate-400'}`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
              <button 
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-slate-100 dark:bg-white/20 text-blue-600 dark:text-white' : 'text-slate-400'}`}
              >
                <Monitor className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* THE PREVIEW CARD (Full Width on Desktop, Narrow on Mobile mode) */}
          <div className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 w-full ${previewMode === 'mobile' ? 'max-w-[320px] mx-auto' : ''}`}>
             <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  {funnel.name.substring(0,1).toUpperCase()}
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] text-slate-800 font-bold leading-tight">{funnel.name}</span>
                   <span className="text-[10px] text-slate-500 leading-tight">{fullUrl}</span>
                </div>
             </div>
             <div className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer leading-tight mb-1">
               {seoTitle || "Your Page Title Here"}
             </div>
             <div className="text-sm text-[#4d5156] leading-snug break-words">
               {seoDesc || "This is how your page description will look in search results. Add a compelling summary here to improve click-through rates."}
             </div>
          </div>
        </div>

        {/* 3. SEO INPUTS */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-bold">SEO Title</label>
              <span className={`text-xs font-bold ${seoTitle.length > titleLimit ? "text-red-500" : "text-slate-400"}`}>
                {seoTitle.length} / {titleLimit}
              </span>
            </div>
            <input 
              name="seoTitle" 
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-bold">SEO Description</label>
              <span className={`text-xs font-bold ${seoDesc.length > descLimit ? "text-red-500" : "text-slate-400"}`}>
                {seoDesc.length} / {descLimit}
              </span>
            </div>
            <textarea 
              name="seoDescription" 
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-lg bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:border-purple-500 transition-colors resize-y"
            />
          </div>
        </div>
      </section>

      {/* --- CARD 3: ADVANCED & TRACKING --- */}
      <section className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
          <Code2 className="h-5 w-5 text-purple-500" />
          <h2 className="text-lg font-bold">Advanced & Tracking</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
             <label className="block text-sm font-bold mb-2">Schema Type</label>
             <select 
               name="schemaType" 
               defaultValue={funnel.schemaType || "NONE"}
               className="w-full p-3 rounded-lg bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:border-purple-500 transition-colors appearance-none"
             >
               <option value="NONE">General (WebPage)</option>
               <option value="PRODUCT">Product / Offer</option>
               <option value="EVENT">Event / Seminar</option>
               <option value="FAQ">FAQ Page</option>
               <option value="ARTICLE">Article / Blog</option>
               <option value="ORG">Organization</option>
             </select>
          </div>

          {/* HEAD CODE */}
          <div>
            <label className="block text-sm font-bold mb-2">&lt;HEAD&gt; Code</label>
            <textarea 
              name="headCode" 
              defaultValue={funnel.headCode || ""}
              rows={5}
              placeholder="e.g. Facebook Pixel, Google Analytics..."
              className="w-full p-3 rounded-lg bg-slate-900 text-white font-mono text-xs border border-slate-200 dark:border-white/10 outline-none focus:border-purple-500 transition-colors resize-y"
            />
          </div>

          {/* FOOTER CODE */}
          <div>
            <label className="block text-sm font-bold mb-2">&lt;BODY&gt; Footer Code</label>
            <textarea 
              name="footerCode" 
              defaultValue={funnel.footerCode || ""}
              rows={5}
              placeholder="e.g. Chat widgets, Retargeting scripts..."
              className="w-full p-3 rounded-lg bg-slate-900 text-white font-mono text-xs border border-slate-200 dark:border-white/10 outline-none focus:border-purple-500 transition-colors resize-y"
            />
          </div>
        </div>
      </section>

      {/* Message & Save */}
      {message && (
        <div className={`p-4 rounded-lg text-sm font-bold flex items-center justify-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Save All Changes</>}
        </button>
      </div>
    </form>
  );
}