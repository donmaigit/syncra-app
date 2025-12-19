"use client";

import { FUNNEL_TEMPLATES, FunnelTemplate } from "@/lib/templates";
import { LayoutIcon, MapIcon, Trash2, X } from "lucide-react";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  locale: string;
}

export default function TemplateModal({ isOpen, onClose, onSelect, locale }: TemplateModalProps) {
  if (!isOpen) return null;

  // Filter templates by the current locale (en/ja)
  const filteredTemplates = FUNNEL_TEMPLATES.filter(t => t.language === locale);

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center p-4 md:p-10 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl p-0 w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <LayoutIcon className="text-purple-600" />
              {locale === 'ja' ? 'テンプレート選択' : 'Select Template'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {locale === 'ja' 
                ? '適用すると現在の内容はすべて上書きされます。' 
                : 'Warning: Applying a template will overwrite your current funnel steps.'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* GRID */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-slate-100 dark:bg-black/40">
          {filteredTemplates.map((t) => (
            <button 
              key={t.id} 
              onClick={() => onSelect(t.id)} 
              className="group border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden hover:border-purple-500 hover:shadow-2xl transition-all text-left bg-white dark:bg-[#1E293B] flex flex-col h-full hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-purple-500 transition-colors relative overflow-hidden">
                {t.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <LayoutIcon size={40} />
                )}
                
                {/* Overlay Button */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    {locale === 'ja' ? 'このテンプレートを使う' : 'Use Template'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">
                    {t.category}
                  </span>
                </div>
                <div className="font-bold mb-1 text-lg text-slate-900 dark:text-white">{t.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                  {t.description}
                </div>
                
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5 text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                  <MapIcon size={12} /> {t.initialSteps.length} Steps
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}