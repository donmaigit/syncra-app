"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Plus, X, Search, Globe, Filter, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createFunnel } from "@/app/actions/funnel-actions";
import { FUNNEL_TEMPLATES as TEMPLATES, FunnelTemplate } from "@/lib/templates";
//import { TEMPLATES, FunnelTemplate } from "@/lib/templates";

export function CreateFunnelModal({ subdomain }: { subdomain: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // FILTERS
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeLang, setActiveLang] = useState<'en' | 'ja'>('ja');
  const [search, setSearch] = useState("");

  const handleCreate = async (template: FunnelTemplate) => {
    setLoading(true);
    
    // Auto-generate name (e.g. "High Ticket Funnel (Copy)")
    const name = template.name + (activeLang === 'ja' ? ' (コピー)' : ' (Copy)');
    
    // Create new funnel using template data
    // We pass the 'initialSteps' from the template directly to the backend
    const res = await createFunnel(new FormData(), {
      name: name,
      description: template.description,
      initialSteps: template.initialSteps,
      // Optional: Pass a slug prefix if you want specific URL structures
      slug: template.category + "-funnel"
    });

    if (res?.id) {
      setIsOpen(false);
      // Redirect to Editor
      router.push(`/editor/${res.id}`); 
    } else {
      alert("Error creating funnel.");
    }
    setLoading(false);
  };

  // FILTER LOGIC
  const filteredTemplates = TEMPLATES.filter(t => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    const matchLang = t.language === activeLang;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchLang && matchSearch;
  });

  const categories = [
    { id: 'all', label: activeLang === 'ja' ? 'すべて' : 'All' },
    { id: 'high-ticket', label: activeLang === 'ja' ? 'ハイチケット' : 'High Ticket' },
    { id: 'webinar', label: activeLang === 'ja' ? 'ウェビナー' : 'Webinar' },
    { id: 'lead-gen', label: activeLang === 'ja' ? 'リード獲得' : 'Lead Gen' },
    { id: 'sales', label: activeLang === 'ja' ? 'セールス' : 'Sales' },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-purple-500/30"
      >
        <Plus size={18} /> 
        <span className="hidden md:inline">{activeLang === 'ja' ? '新規作成' : 'Create New'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex overflow-hidden border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200">
            
            {/* SIDEBAR (Categories) */}
            <div className="w-64 bg-slate-50 dark:bg-black/20 border-r border-slate-200 dark:border-white/10 p-6 flex flex-col hidden md:flex">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Filter size={18}/> {activeLang === 'ja' ? 'カテゴリー' : 'Categories'}
              </h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeCategory === cat.id 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0">
              
              {/* HEADER TOOLBAR */}
              <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-[#0F172A]">
                
                {/* Search */}
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder={activeLang === 'ja' ? "テンプレートを検索..." : "Search templates..."}
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-white/5 border border-transparent focus:border-purple-500 rounded-lg outline-none transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Language Toggle */}
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveLang('en')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeLang === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => setActiveLang('ja')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeLang === 'ja' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                  >
                    日本語
                  </button>
                </div>

                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full">
                  <X size={24} />
                </button>
              </div>

              {/* GRID */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-black/10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Blank Option */}
                  <button 
                    onClick={() => handleCreate({ 
                      id: "blank", name: "Blank Funnel", description: "", language: activeLang, category: "other", thumbnail: "", 
                      initialSteps: [] 
                    })}
                    className="group flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-slate-400 hover:text-purple-600"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 group-hover:bg-purple-100 dark:group-hover:bg-purple-600 flex items-center justify-center mb-4 transition-colors">
                      <Plus size={24} />
                    </div>
                    <span className="font-bold">{activeLang === 'ja' ? '空白から作成' : 'Start from Scratch'}</span>
                  </button>

                  {/* Template Cards */}
                  {filteredTemplates.map((t) => (
                    <div key={t.id} className="group bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col h-full">
                      {/* Thumbnail Area */}
                      <div className="h-40 bg-slate-200 dark:bg-black/40 relative overflow-hidden">
                         {t.thumbnail ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs uppercase font-bold tracking-widest">
                             {activeLang === 'ja' ? '画像なし' : 'No Preview'}
                           </div>
                         )}
                         
                         {/* Hover Overlay */}
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                           <button 
                              onClick={() => handleCreate(t)}
                              className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                            >
                              {activeLang === 'ja' ? '選択' : 'Select'}
                            </button>
                         </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">
                             {t.category}
                           </span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{t.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{t.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}