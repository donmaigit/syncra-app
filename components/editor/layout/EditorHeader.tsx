"use client";

import { useState } from "react";
import { 
  ArrowLeft, Save, Eye, Monitor, Smartphone, LayoutIcon, CheckCircle2, AlertCircle, Map as MapIcon, Layout, Copy, Check, Undo2, Redo2, Globe, Loader2
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { togglePublishFunnel } from "@/app/actions/funnel-actions"; 

interface EditorHeaderProps {
  funnel: any;
  activeStep: any;
  userSubdomain: string;
  isDirty: boolean;
  saving: boolean;
  viewMode: 'desktop' | 'mobile';
  setViewMode: (mode: 'desktop' | 'mobile') => void;
  onSave: () => void;
  onToggleTemplates: () => void;
  locale: string;
  switchLocale: (lang: 'ja' | 'en') => void;
  mainTab: 'editor' | 'map';
  setMainTab: (mode: 'editor' | 'map') => void;
  onBack: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function EditorHeader({
  funnel, activeStep, userSubdomain, isDirty, saving, 
  viewMode, setViewMode, onSave, onToggleTemplates, locale, switchLocale,
  mainTab, setMainTab, onBack,
  onUndo, onRedo, canUndo, canRedo
}: EditorHeaderProps) {
  
  const [copied, setCopied] = useState(false);
  const [isPublished, setIsPublished] = useState(funnel.published); 
  const [publishing, setPublishing] = useState(false);

  const domain = funnel.customDomain || `${userSubdomain}.syncra.page`;
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  
  // Logic to handle empty slug (homepage) correctly without double slashes
  const stepSlug = activeStep?.slug === 'index' ? '' : (activeStep?.slug || '');
  const pathParts = [funnel.slug, stepSlug].filter(p => p && p !== '/');
  const path = pathParts.join('/');
  const previewUrl = `${protocol}://${domain}/${path}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishToggle = async () => {
    setPublishing(true);
    if (isDirty) {
      await onSave(); 
    }
    const newState = !isPublished;
    const res = await togglePublishFunnel(funnel.id, newState);
    if (res?.success) {
      setIsPublished(newState);
    } else {
      alert("Failed to update publish status.");
    }
    setPublishing(false);
  };

  return (
    <header className="h-16 bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 z-50 shrink-0 shadow-sm relative">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h1 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="text-purple-600 tracking-wide">SYNCRA Editor</span>
            <span className="text-slate-300">|</span>
            <span className="truncate max-w-[200px]">{funnel.name}</span>
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyUrl} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-purple-500 transition-colors cursor-pointer group" title="Click to Copy URL">
              <span className="truncate max-w-[250px]">{previewUrl}</span>
              {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="opacity-0 group-hover:opacity-100" />}
            </button>
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${isDirty ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              {isDirty ? <AlertCircle size={10}/> : <CheckCircle2 size={10}/>}
              {isDirty ? (locale === 'ja' ? '未保存' : 'Unsaved') : (locale === 'ja' ? '保存済' : 'Saved')}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3 hidden md:flex">
         <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-lg">
            <button onClick={onUndo} disabled={!canUndo} className="p-2 rounded-md hover:bg-white dark:hover:bg-white/10 disabled:opacity-30 text-slate-600 dark:text-slate-300 transition-all"><Undo2 size={16} /></button>
            <button onClick={onRedo} disabled={!canRedo} className="p-2 rounded-md hover:bg-white dark:hover:bg-white/10 disabled:opacity-30 text-slate-600 dark:text-slate-300 transition-all"><Redo2 size={16} /></button>
         </div>
         <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-lg">
            <button onClick={() => setMainTab('editor')} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${mainTab === 'editor' ? 'bg-white shadow text-purple-600' : 'text-slate-500'}`}><Layout size={14} /> Editor</button>
            <button onClick={() => setMainTab('map')} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${mainTab === 'map' ? 'bg-white shadow text-purple-600' : 'text-slate-500'}`}><MapIcon size={14} /> Map</button>
         </div>
         {mainTab === 'editor' && (
           <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-lg">
              <button onClick={() => setViewMode('desktop')} className={`p-2 rounded-md ${viewMode === 'desktop' ? 'bg-white shadow text-purple-600' : 'text-slate-400'}`}><Monitor size={16} /></button>
              <button onClick={() => setViewMode('mobile')} className={`p-2 rounded-md ${viewMode === 'mobile' ? 'bg-white shadow text-purple-600' : 'text-slate-400'}`}><Smartphone size={16} /></button>
           </div>
         )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-lg p-1 hidden lg:flex">
          <button onClick={() => switchLocale('ja')} className={`px-2 py-1 text-xs font-bold rounded transition-colors ${locale === 'ja' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>JP</button>
          <button onClick={() => switchLocale('en')} className={`px-2 py-1 text-xs font-bold rounded transition-colors ${locale === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>EN</button>
        </div>
        <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 hidden lg:block" />
        <ThemeToggle />
        <a href={previewUrl} target="_blank" className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-xs hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
          <Eye size={16} /> <span className="hidden lg:inline">{locale === 'ja' ? 'プレビュー' : 'Preview'}</span>
        </a>
        <button onClick={handlePublishToggle} disabled={publishing} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all border ${isPublished ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
          {publishing ? <Loader2 size={14} className="animate-spin"/> : <Globe size={14}/>}
          <span>{publishing ? '...' : isPublished ? (locale === 'ja' ? '公開中' : 'Published') : (locale === 'ja' ? '非公開' : 'Draft')}</span>
        </button>
        <button onClick={onSave} disabled={saving} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm shadow-lg transition-all ${isDirty ? 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
          {saving ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={16} />}
          <span>{locale === 'ja' ? "保存" : "Save"}</span>
        </button>
      </div>
    </header>
  );
}