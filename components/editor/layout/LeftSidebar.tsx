"use client";

import { useState } from "react";
import { PlusCircle, ChevronLeft, Check, Copy, Plus } from "lucide-react";
import { BlockType } from "@/lib/editor-config";

interface LeftSidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  steps: any[];
  activeStepId: string;
  setActiveStepId: (id: string) => void;
  onAddStep: () => void;
  onAddBlock: (type: BlockType) => void;
  definitions: any[];
  locale: string;
  isDirty: boolean;
}

export default function LeftSidebar({
  isOpen, setIsOpen, steps, activeStepId, setActiveStepId, onAddStep, onAddBlock, definitions, locale, isDirty
}: LeftSidebarProps) {
  
  const [activeTab, setActiveTab] = useState<'elements' | 'blocks' | 'pages'>('elements');

  const tabDefinitions = definitions.filter(d => {
    const isBasic = ['hero', 'text', 'headline', 'image', 'video', 'button', 'cta', 'button_atom', 'divider', 'spacer', 'bulleted_list', 'input_field', 'checkbox', 'submit_button', 'progress_bar', 'social_share'].includes(d.type);
    if (activeTab === 'elements') return isBasic;
    if (activeTab === 'blocks') return !isBasic;
    return false;
  });

  const categories = Array.from(new Set(tabDefinitions.map((d: any) => d.category)));

  const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === id ? 'text-purple-600 border-purple-600 bg-purple-50 dark:bg-white/5' : 'text-slate-500 border-transparent hover:bg-slate-50 dark:hover:bg-white/5'}`}
    >
      {label}
    </button>
  );

  return (
    <div className={`bg-white dark:bg-[#1E293B] border-r border-slate-200 dark:border-white/10 flex flex-col z-30 transition-all duration-300 relative ${isOpen ? 'w-[280px]' : 'w-0'}`}>
      
      <button onClick={() => setIsOpen(!isOpen)} className="absolute -right-3 top-20 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full p-1 shadow-md z-50 hover:bg-purple-50 text-slate-500">
        <ChevronLeft size={12} className={`transition-transform ${!isOpen && 'rotate-180'}`}/>
      </button>

      <div className={`flex-1 flex flex-col overflow-hidden ${!isOpen && 'opacity-0 hidden'}`}>
        <div className="flex border-b border-slate-200 dark:border-white/10">
          <TabButton id="elements" label={locale === 'ja' ? '要素' : 'Elements'} />
          <TabButton id="blocks" label={locale === 'ja' ? 'ブロック' : 'Blocks'} />
          <TabButton id="pages" label={locale === 'ja' ? 'ページ' : 'Pages'} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
          
          {activeTab === 'pages' ? (
            <div className="space-y-3 pb-20">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{locale==='ja'?'ステップ一覧':'Funnel Steps'}</h3>
              </div>
              {steps.map((step, idx) => (
                <div 
                  key={step.id} 
                  onClick={() => { if(isDirty && !confirm("Unsaved changes. Discard?")) return; setActiveStepId(step.id); }} 
                  className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${step.id === activeStepId ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm ring-1 ring-purple-500' : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <div className={`flex flex-col items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${step.id === activeStepId ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate text-slate-700 dark:text-slate-200">{step.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">/{step.slug}</div>
                  </div>
                  {step.id === activeStepId && <Check size={14} className="text-purple-600" />}
                </div>
              ))}
              
              {/* BIG ADD BUTTON */}
              <button 
                onClick={onAddStep}
                className="w-full py-3 mt-4 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl flex items-center justify-center gap-2 text-slate-500 font-bold hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all"
              >
                <PlusCircle size={18} /> {locale === 'ja' ? '新しいページを追加' : 'Add New Step'}
              </button>
            </div>
          ) : (
            
            <div className="space-y-6">
              {categories.map((cat: any) => (
                <div key={cat}>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">{cat}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {tabDefinitions.filter((d: any) => d.category === cat).map((def: any) => (
                      <button 
                        key={def.type} 
                        onClick={() => onAddBlock(def.type as BlockType)} 
                        className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl hover:border-purple-500 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center gap-2 text-center group"
                      >
                        <div className="text-slate-400 group-hover:text-purple-600 transition-colors"><def.icon size={24} /></div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-tight">{def.labelKey}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}