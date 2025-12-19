"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Check, Clock, Star, ShieldCheck, Calendar, 
  ChevronDown, Menu as MenuIcon, HelpCircle, 
  Facebook, Twitter, MessageCircle, X, ShoppingBag, Send, Percent, CheckSquare, Landmark, CreditCard, FileText, Settings,
  ChevronLeft, ChevronRight, Mail, Phone, Image as ImageIcon, MapPin, Smartphone
} from 'lucide-react';

import EventBookingWidget from "@/components/public/EventBookingWidget"; 
import OptinForm from "@/components/public/OptinForm";
import CheckoutForm from "@/components/public/CheckoutForm";
import Tokushoho from "@/components/public/Tokushoho";

// --- PLACEHOLDER SVGS ---
const IMAGE_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f1f5f9'/%3E%3Cpath d='M300 180c-22.091 0-40-17.909-40-40s17.909-40 40-40 40 17.909 40 40-17.909 40-40 40zm-80 80h160l-30-60-50 100-30-40-50 0z' fill='%23cbd5e1'/%3E%3Ctext x='50%25' y='80%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%2394a3b8'%3EImage%3C/text%3E%3C/svg%3E`;
const VIDEO_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='337' viewBox='0 0 600 337'%3E%3Crect width='600' height='337' fill='%230f172a'/%3E%3Ccircle cx='300' cy='168' r='40' fill='%23ffffff' opacity='0.2'/%3E%3Cpath d='M285 145v46l40-23z' fill='%23ffffff'/%3E%3Ctext x='50%25' y='85%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2364748b'%3EVideo Player%3C/text%3E%3C/svg%3E`;

// --- HELPER COMPONENTS ---

const InlineText = ({ text, tagName: Tag = 'div', className, style, onChange, placeholder }: any) => {
  const ref = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (ref.current && !isFocused && ref.current.innerText !== text) {
      ref.current.innerText = text || "";
    }
  }, [text, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    if (ref.current && onChange) onChange(ref.current.innerText);
  };

  if (!onChange) return <Tag className={className} style={style}>{text}</Tag>;

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      data-placeholder={placeholder}
      className={`outline-none min-w-[20px] empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 focus:bg-purple-50/50 focus:ring-2 focus:ring-purple-400/30 rounded px-1 transition-all cursor-text hover:outline-dashed hover:outline-2 hover:outline-purple-300/30 relative z-10 ${className}`}
      style={style}
    />
  );
};

const MobileCarousel = ({ children, className, isActive }: { children: React.ReactNode, className?: string, isActive: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -width : width, behavior: 'smooth' });
    }
  };

  if (!isActive) return <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>{children}</div>;

  return (
    <div className={`relative group/carousel block ${className}`}>
      <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 p-1 rounded-r-lg shadow-md text-slate-600 opacity-0 group-hover/carousel:opacity-100 transition-opacity"><ChevronLeft size={20}/></button>
      <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 p-1 rounded-l-lg shadow-md text-slate-600 opacity-0 group-hover/carousel:opacity-100 transition-opacity"><ChevronRight size={20}/></button>
      <div ref={scrollRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
        {React.Children.map(children, (child) => (
          <div className="min-w-[90%] snap-center flex-shrink-0">{child}</div>
        ))}
      </div>
    </div>
  );
};

const useCountdown = (endDate: string) => {
  const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00' });
  useEffect(() => {
    if(!endDate) return;
    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = new Date(endDate).getTime() - now;
      if (distance < 0) return { d: '00', h: '00', m: '00', s: '00' };
      return {
        d: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        h: String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
        m: String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        s: String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0')
      };
    };
    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [endDate]);
  return timeLeft;
};

const getVideoId = (urlOrId: string) => {
  if (!urlOrId) return "";
  if (!urlOrId.includes('/') && !urlOrId.includes('.')) return urlOrId;
  if (urlOrId.includes('youtu')) {
    try {
      const url = new URL(urlOrId.startsWith('http') ? urlOrId : `https://${urlOrId}`);
      return url.searchParams.get('v') || url.pathname.split('/').pop() || "";
    } catch(e) { return ""; }
  }
  if (urlOrId.includes('vimeo')) return urlOrId.split('/').pop() || "";
  return urlOrId;
};

const AccordionItem = ({ title, content }: { title: string, content: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0 bg-white first:rounded-t-lg last:rounded-b-lg">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left font-bold focus:outline-none text-slate-900 hover:bg-slate-50 transition-colors">
        <span>{title}</span>
        <ChevronDown className={`transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 text-left">{content}</div>}
    </div>
  );
};

// --- MAIN RENDERER ---
export default function BlockRenderer({ 
  block, isPreview = false, locale = 'ja', availableEvents = [], onUpdate, viewMode = 'desktop'
}: { 
  block: any; isPreview?: boolean; locale?: string; availableEvents?: any[]; onUpdate?: (id: string, content: any) => void, viewMode?: 'desktop' | 'mobile' 
}) {
  const { type, content, styles = {} } = block;
  const isMobile = viewMode === 'mobile';
  
  const isLayout = type.startsWith('columns') || ['hero', 'footer', 'navbar', 'pricing', 'features', 'cta'].includes(type);
  const borderColor = isLayout ? 'hover:ring-blue-500' : 'hover:ring-orange-500';
  const labelColor = isLayout ? 'bg-blue-500' : 'bg-orange-500';

  const sectionStyle: React.CSSProperties = {
    backgroundColor: styles.backgroundColor || 'transparent',
    color: styles.textColor || 'inherit', 
    textAlign: styles.textAlign || 'left',
    padding: styles.padding || '20px',
    marginTop: styles.marginTop || '0px',
    marginRight: styles.marginRight || '0px',
    marginBottom: styles.marginBottom || '0px',
    marginLeft: styles.marginLeft || '0px',
    margin: styles.margin,
    
    fontSize: styles.fontSize || 'inherit',
    fontFamily: styles.fontFamily || 'inherit',
    fontWeight: styles.fontWeight || 'normal',
    fontStyle: styles.fontStyle || 'normal',
    textDecoration: styles.textDecoration || 'none',
    lineHeight: styles.lineHeight || '1.5',
    letterSpacing: styles.letterSpacing || 'normal',
    textShadow: styles.textShadow || 'none',
  };

  const handleUpdate = (key: string, val: any) => { if (onUpdate) onUpdate(block.id, { ...content, [key]: val }); };
  const updateArrayItem = (arr: any[], index: number, key: string, val: any) => { const newArr = [...arr]; newArr[index] = { ...newArr[index], [key]: val }; return newArr; };

  const renderContent = () => {
    switch (type) {
      
      case 'navbar':
        return (
          <nav className="flex flex-col md:flex-row justify-between items-center py-4 px-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 relative z-50">
             <div className="mb-4 md:mb-0">
               {content.logoType === 'image' && content.logoImage ? (
                 <img src={content.logoImage} alt="Logo" className="h-10 w-auto object-contain" />
               ) : (
                 <InlineText tagName="span" text={content.logoText} onChange={(v:string)=>handleUpdate('logoText',v)} className="font-bold text-xl tracking-tight" />
               )}
             </div>
             <div className="flex gap-6 items-center flex-wrap justify-center">
               {content.links?.map((link:any, i:number) => (
                 <InlineText key={i} tagName="span" text={link.text} onChange={(v:string)=>handleUpdate('links', updateArrayItem(content.links || [], i, 'text', v))} className="text-sm font-medium hover:text-purple-600 transition-colors cursor-pointer" />
               ))}
               {!isPreview && (
                 <button className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 pointer-events-none"><Settings size={12}/> Sidebar</button>
               )}
             </div>
          </nav>
        );

      case 'footer':
        return (
          <div className="border-t border-slate-200 dark:border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between text-sm opacity-60 max-w-7xl mx-auto px-4">
             <InlineText tagName="p" text={content.copyright} onChange={(v:string)=>handleUpdate('copyright',v)} />
             <div className="flex gap-4 mt-4 md:mt-0">
               {content.links?.map((link:any, i:number) => (
                 <InlineText key={i} tagName="a" text={link.text} onChange={(v:string)=>handleUpdate('links', updateArrayItem(content.links || [], i, 'text', v))} className="hover:underline cursor-pointer" />
               ))}
             </div>
          </div>
        );

      case 'bulleted_list':
        return (
          <ul className="list-disc pl-5 space-y-2 text-left">
            {content.items?.map((item: string, i: number) => (
              <li key={i} className="text-slate-700 dark:text-slate-300" style={{ color: styles.textColor }}>{item}</li>
            ))}
          </ul>
        );

      case 'headline':
        return (
          <InlineText tagName={content.level || 'h2'} text={content.text} onChange={(val: string) => handleUpdate('text', val)} className="font-bold leading-tight mb-4 text-3xl md:text-5xl" style={{ fontSize: styles.fontSize, color: styles.textColor }} />
        );

      case 'text':
         return (
           <InlineText tagName="div" text={content.text} onChange={(val: string) => handleUpdate('text', val)} className="prose max-w-none dark:text-white" style={{ color: styles.textColor }} />
         );

      case 'button':
      case 'button_atom':
        return (
          <a href={content.url || "#"} onClick={(e) => isPreview && e.preventDefault()} className="inline-block px-6 py-3 rounded-lg font-bold transition-all shadow-md" style={{ backgroundColor: styles.buttonColor || '#9333ea', color: styles.buttonTextColor || '#ffffff' }}>
            <InlineText text={content.text || "Click Here"} onChange={(val: string) => handleUpdate('text', val)} tagName="span" />
          </a>
        );

      case 'hero':
        return (
          <div className="max-w-5xl mx-auto space-y-8 text-center py-10">
            <InlineText tagName="h1" text={content.title} onChange={(v:string)=>handleUpdate('title',v)} className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white" style={{ color: styles.textColor }} />
            <InlineText tagName="p" text={content.subtitle} onChange={(v:string)=>handleUpdate('subtitle',v)} className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto text-slate-700 dark:text-slate-300" style={{ color: styles.textColor }} />
            {content.buttonText && (
               <a href={content.buttonUrl} onClick={(e) => isPreview && e.preventDefault()} className="inline-block px-8 py-4 rounded-full font-bold text-lg shadow-xl" style={{ backgroundColor: styles.buttonColor || '#9333ea', color: styles.buttonTextColor || '#ffffff' }}>
                 <InlineText text={content.buttonText} onChange={(v:string)=>handleUpdate('buttonText',v)} tagName="span" />
               </a>
            )}
          </div>
        );

      case 'cta':
        return (
          <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl" style={{ backgroundColor: styles.backgroundColor === 'transparent' ? '' : styles.backgroundColor }}>
            <InlineText tagName="h2" text={content.title} onChange={(v:string)=>handleUpdate('title',v)} className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white" style={{ color: styles.textColor }} />
            <InlineText tagName="p" text={content.subtitle} onChange={(v:string)=>handleUpdate('subtitle',v)} className="text-lg opacity-80 max-w-2xl mx-auto text-slate-700 dark:text-slate-300" style={{ color: styles.textColor }} />
            <a href={content.buttonUrl} onClick={(e) => isPreview && e.preventDefault()} className="inline-block px-10 py-4 bg-purple-600 text-white rounded-full font-bold text-lg shadow-lg">
              <InlineText text={content.buttonText} onChange={(v:string)=>handleUpdate('buttonText',v)} tagName="span" />
            </a>
          </div>
        );

      case 'features':
         return (
          <div className="max-w-7xl mx-auto py-12 px-4">
            {content.title && <InlineText tagName="h2" text={content.title} onChange={(v:string)=>handleUpdate('title',v)} className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: styles.textColor }} />}
            <MobileCarousel isActive={isMobile}>
              {content.items?.map((item:any, i:number) => (
                <div key={i} className="group/card relative p-8 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-lg transition-all h-full">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center mb-4 font-bold text-xl">{i+1}</div>
                  <div className="text-xl font-bold mb-3">{item.title}</div>
                  <div className="opacity-80 text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </MobileCarousel>
          </div>
         );

      case 'faq':
        return (
          <div className="max-w-3xl mx-auto py-8">
            {content.title && <h2 className="text-3xl font-bold mb-10 text-center">{content.title}</h2>}
            <div className="space-y-4">
              {content.items?.map((item:any, i:number) => (
                <AccordionItem key={i} title={item.q} content={item.a} />
              ))}
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="max-w-7xl mx-auto">
            {content.title && <InlineText tagName="h2" text={content.title} onChange={(v:string)=>handleUpdate('title',v)} className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: styles.textColor }} />}
            <MobileCarousel isActive={isMobile}>
              {content.plans?.map((plan:any, i:number) => (
                <div key={i} className={`p-6 rounded-xl border ${plan.highlight ? 'border-purple-500 shadow-lg scale-105 z-10' : 'border-slate-200 dark:border-white/10'} bg-white dark:bg-[#1E293B] flex flex-col items-center text-center`}>
                  <div className="font-bold text-lg mb-2">{plan.name}</div>
                  <div className="text-4xl font-extrabold my-4 text-slate-900 dark:text-white">{plan.price}</div>
                  <button className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold mt-auto hover:bg-slate-800 transition-colors">{plan.button}</button>
                </div>
              ))}
            </MobileCarousel>
          </div>
        );

      case 'testimonials':
        return (
          <div className="max-w-7xl mx-auto py-8">
            {content.title && <InlineText tagName="h2" text={content.title} onChange={(v:string)=>handleUpdate('title',v)} className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: styles.textColor }} />}
            <MobileCarousel isActive={isMobile}>
              {content.reviews?.map((r:any, i:number) => (
                <div key={i} className="p-8 bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 h-full">
                  <div className="flex gap-1 text-yellow-400 mb-4">{[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" size={18}/>)}</div>
                  <p className="text-lg mb-6 italic opacity-90 leading-relaxed">"{r.text}"</p>
                  <div className="font-bold text-slate-900 dark:text-white">{r.name}</div>
                </div>
              ))}
            </MobileCarousel>
          </div>
        );
      
      case 'guarantee':
        return (
          <div className="max-w-3xl mx-auto text-center border-4 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-10 bg-slate-50 dark:bg-white/5">
            <ShieldCheck size={64} className="mx-auto mb-6 text-slate-400" />
            <InlineText tagName="h2" text={content.title} onChange={(v:string)=>handleUpdate('title',v)} className="text-2xl font-bold mb-4" />
            <InlineText tagName="p" text={content.text} onChange={(v:string)=>handleUpdate('text',v)} className="opacity-80 text-lg leading-relaxed max-w-xl mx-auto" />
          </div>
        );

      case 'countdown': 
        return (
          <div className="max-w-4xl mx-auto text-center py-6 bg-slate-900 rounded-2xl shadow-xl text-white my-4 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-center items-center gap-2 mb-4 text-red-400 font-bold uppercase tracking-widest animate-pulse">
                <Clock size={20} />
                <InlineText tagName="span" text={content.title} onChange={(v:string)=>handleUpdate('title',v)} />
              </div>
              <div className="flex justify-center gap-2 md:gap-6 text-center">
                {Object.entries(useCountdown(content.endDate)).map(([key, val]) => (
                  <div key={key} className="flex flex-col items-center">
                    <div className="w-12 md:w-20 h-12 md:h-20 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-xl md:text-4xl font-mono font-bold backdrop-blur-sm">{val}</div>
                    <span className="text-[10px] md:text-xs uppercase mt-2 opacity-50 tracking-wider">{key === 'd' ? 'Days' : key === 'h' ? 'Hours' : key === 'm' ? 'Mins' : 'Secs'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>
          </div>
        );

      case 'image': 
        return <div className="max-w-5xl mx-auto text-center"><img src={content.src || content.url || IMAGE_PLACEHOLDER} alt={content.alt} className="rounded-xl shadow-lg max-w-full h-auto mx-auto" /></div>;
      
      case 'video': 
        return <div className="max-w-5xl mx-auto py-6"><div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black relative group">{isPreview && <div className="absolute inset-0 z-10 bg-transparent" />} {content.videoId ? <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getVideoId(content.videoId)}`} frameBorder="0" allowFullScreen /> : <img src={VIDEO_PLACEHOLDER} className="w-full h-full object-cover" />}</div></div>;
      
      case 'spacer': return <div style={{ height: content.height || 50 }} />;
      
      case 'divider': return <hr style={{ borderTopWidth: content.thickness || 1, borderColor: content.color || '#e2e8f0', margin: '2rem 0' }} />;
      
      case 'social_share': return <div className="flex justify-center gap-4 py-2">{content.platforms?.facebook !== false && <div className="p-2 bg-[#1877F2] text-white rounded-full"><Facebook size={18}/></div>} {content.platforms?.twitter !== false && <div className="p-2 bg-black text-white rounded-full"><X size={18}/></div>} {content.platforms?.line !== false && <div className="p-2 bg-[#06C755] text-white rounded-full text-[10px] w-9 h-9 flex items-center justify-center font-bold">LINE</div>}</div>;

      case 'input_field':
        return (
          <div className="w-full text-left">
            <InlineText 
              tagName="label" 
              text={content.label} 
              onChange={(val: string) => handleUpdate('label', val)}
              className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300 text-left" 
              style={{ color: styles.textColor }}
            />
            <input 
              type={content.inputType || "text"} 
              placeholder={content.placeholder}
              className="w-full p-3 border border-slate-300 dark:border-white/10 rounded-lg bg-white dark:bg-black/20 focus:ring-2 focus:ring-purple-500 outline-none shadow-sm dark:text-white"
              readOnly={isPreview} 
            />
          </div>
        );

      case 'submit_button':
        return (
          <button 
            className={`py-4 px-8 bg-purple-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-purple-700 transition-all ${content.width === 'full' ? 'w-full' : 'w-auto'}`}
            style={{ backgroundColor: styles.buttonColor || '#9333ea', color: styles.buttonTextColor || '#ffffff' }}
          >
            <InlineText text={content.text || "Submit"} onChange={(val: string) => handleUpdate('text', val)} tagName="span" />
          </button>
        );

      case 'progress_bar':
        return (
          <div className="w-full max-w-2xl mx-auto p-2">
            <div className="flex justify-between text-xs font-bold mb-1 opacity-80" style={{ color: styles.textColor }}>
              <InlineText text={content.label || "Progress"} onChange={(val: string) => handleUpdate('label', val)} tagName="span" />
              <span>{content.percent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-3 overflow-hidden">
              <div className="h-full transition-all duration-1000 ease-out rounded-full" style={{ width: `${content.percent}%`, backgroundColor: content.color || '#9333ea' }} />
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 w-5 h-5 text-purple-600 rounded border-slate-300" readOnly={isPreview} />
            <InlineText 
              tagName="label" 
              text={content.text} 
              onChange={(val: string) => handleUpdate('text', val)}
              className="text-sm text-slate-700 dark:text-slate-300 leading-tight cursor-text"
              style={{ color: styles.textColor }}
            />
          </div>
        );

      case 'tokusho_ho':
        return <Tokushoho data={content} locale={locale} />;
      
      // --- LAYOUTS ---
      case 'columns_1': return <div className="p-4 border border-dashed border-slate-300 dark:border-white/10 rounded min-h-[100px]"><InlineText text={content.col1} onChange={(v:string)=>handleUpdate('col1',v)} tagName="div" /></div>;
      
      case 'columns_2': return <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="p-4 border border-dashed border-slate-300 dark:border-white/10 rounded"><InlineText text={content.col1} onChange={(v:string)=>handleUpdate('col1',v)} /></div><div className="p-4 border border-dashed border-slate-300 dark:border-white/10 rounded"><InlineText text={content.col2} onChange={(v:string)=>handleUpdate('col2',v)} /></div></div>;
      
      case 'columns_3': 
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="p-4 border border-dashed border-slate-300 dark:border-white/10 rounded"><InlineText text={content.col1 || "Col 1"} onChange={(v:string)=>handleUpdate('col1',v)} /></div>
             <div className="p-4 border border-dashed border-slate-300 dark:border-white/10 rounded"><InlineText text={content.col2 || "Col 2"} onChange={(v:string)=>handleUpdate('col2',v)} /></div>
             <div className="p-4 border border-dashed border-slate-300 dark:border-white/10 rounded"><InlineText text={content.col3 || "Col 3"} onChange={(v:string)=>handleUpdate('col3',v)} /></div>
          </div>
        );
      
      case 'columns_4':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="p-4 border border-dashed border-slate-300 dark:border-white/10 rounded"><InlineText text={content.col1 || "Col 1"} onChange={(v:string)=>handleUpdate('col1',v)} /></div>
             <div className="p-4 border border-dashed border-slate-300 dark:border-white/10 rounded"><InlineText text={content.col2 || "Col 2"} onChange={(v:string)=>handleUpdate('col2',v)} /></div>
             <div className="p-4 border border-dashed border-slate-300 dark:border-white/10 rounded"><InlineText text={content.col3 || "Col 3"} onChange={(v:string)=>handleUpdate('col3',v)} /></div>
             <div className="p-4 border border-dashed border-slate-300 dark:border-white/10 rounded"><InlineText text={content.col4 || "Col 4"} onChange={(v:string)=>handleUpdate('col4',v)} /></div>
          </div>
        );

      // --- CHECKOUT WIDGET ---
      case 'checkout': {
        const enableCard = content.enableCard !== false && content.enable_card !== false; 
        const enableBank = content.enableBank === true || content.enable_bank === true;
        const selectedProvider = content.provider || 'stripe';

        // STRICT LOGIC: Must be explicitly true to show. Undefined (new block) = false.
        // We DO NOT check 'fields.showAddress' anymore.
        const showAddress = content.collectAddress === true;

        const providers = {
          stripe: enableCard && selectedProvider === 'stripe',
          univapay: enableCard && selectedProvider === 'univapay',
          aquagates: enableCard && selectedProvider === 'aquagates',
          manual: enableBank
        };

        const bankInfo = {
          bankName: content.bankName || "Bank Name",
          branchName: content.branchName || "Branch",
          accountNumber: content.accountNumber || "1234567",
          accountHolder: content.accountHolder || "Holder Name"
        };

        return (
          <div className="max-w-md mx-auto py-8">
            <CheckoutForm 
              funnelId={block.funnelId || ""}
              productName={content.productName || "Product"}
              productPrice={Number(content.price) || 1000}
              productImage={content.image}
              providers={providers}
              bankInfo={bankInfo}
              showAddress={showAddress}
              styles={styles} // PASS STYLES
            />
          </div>
        );
      }

      // --- OPTIN FORM ---
      case 'optin_form':
        if (isPreview) {
          return (
            <div className="my-8">
               <OptinForm 
                 funnelId={block.funnelId || "preview"} 
                 title={content.title} 
                 buttonText={content.buttonText} 
                 fields={{
                   ...content.fields,
                   showAddress: content.collectAddress === true
                 }} 
                 successMessage={content.successMessage} 
                 redirectUrl={content.redirectUrl} 
                 styles={styles} // PASS STYLES
               />
            </div>
          );
        }
        // EDITOR VIEW FOR OPTIN
        return (
          <div className="max-w-lg mx-auto bg-white dark:bg-[#0f172a] rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 my-8 text-left">
             <div className="p-8 text-center bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <InlineText tagName="h3" text={content.title} onChange={(v:string)=>handleUpdate('title',v)} className="text-2xl font-bold text-slate-900 dark:text-white mb-2" />
                <InlineText tagName="p" text={content.subtext} onChange={(v:string)=>handleUpdate('subtext',v)} className="text-sm text-slate-500" placeholder="Add subtext..." />
             </div>
             <div className="p-8 space-y-4">
                {content.fields?.useLineLogin ? (
                  <div className="text-center py-4">
                    <button className="w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-3" style={{ backgroundColor: '#06C755' }}>
                      <Smartphone size={24} /> LINEで友だち追加して受け取る
                    </button>
                    <p className="text-xs text-slate-400 mt-2">※ LINE Login Mode Active</p>
                  </div>
                ) : (
                  <>
                    {content.fields?.showName !== false && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-10 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10" />
                        <div className="h-10 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10" />
                      </div>
                    )}
                    <div className="h-10 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10 flex items-center px-3 text-slate-400"><Mail size={16}/></div>
                    {content.fields?.showPhone !== false && <div className="h-10 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10 flex items-center px-3 text-slate-400"><Phone size={16}/></div>}
                    
                    {content.collectAddress === true && (
                      <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
                          <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 text-left"><MapPin size={12}/> Address</p>
                          <div className="grid grid-cols-3 gap-2">
                             <div className="h-10 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10 text-xs flex items-center justify-center text-slate-400">Zip</div>
                             <div className="col-span-2 h-10 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10 text-xs flex items-center justify-center text-slate-400">Prefecture</div>
                          </div>
                          <div className="h-10 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10 text-xs flex items-center justify-center text-slate-400">City / Street</div>
                      </div>
                    )}

                    <button className="w-full py-4 rounded-lg font-bold text-lg shadow-lg mt-4" style={{backgroundColor: styles.buttonColor||'#9333ea', color: styles.buttonTextColor||'#ffffff'}}>
                        <InlineText tagName="span" text={content.buttonText} onChange={(v:string)=>handleUpdate('buttonText',v)} />
                    </button>
                  </>
                )}
             </div>
          </div>
        );

      default: return <div className="p-4 border border-red-500 text-red-500 rounded bg-red-50 text-center font-mono text-sm">Unknown: {type}</div>;
    }
  };

  return (
    <section 
      style={sectionStyle} 
      className={`w-full transition-all duration-200 relative group ${isPreview ? '' : 'hover:ring-2'} ${borderColor} rounded-sm`}
    >
      {!isPreview && (
        <div className={`absolute top-0 left-0 text-[10px] text-white px-2 py-0.5 font-bold uppercase rounded-br opacity-0 group-hover:opacity-100 ${labelColor} z-20 pointer-events-none transition-opacity`}>
          {type.replace('_', ' ')}
        </div>
      )}
      {renderContent()}
    </section>
  );
}