"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getRange, FALLBACK_PERIODS } from "@/lib/date-helper"; // Import from helper

interface DateRangeFilterProps {
  translations: Record<string, string>;
  mode?: "state" | "url";
  onFilterChange?: (start: string, end: string, label: string) => void;
  defaultLabel?: string;
}

function useOutsideClick(ref: any, callback: () => void) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
}

export default function DateRangeFilter({ translations, mode = "url", onFilterChange, defaultLabel }: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Initialize label from URL if present
  const initialPeriod = searchParams.get('period');
  const initialFrom = searchParams.get('from');
  const initialLabel = initialPeriod 
    ? (translations[initialPeriod] || FALLBACK_PERIODS[initialPeriod]) 
    : initialFrom 
      ? "Custom Range" 
      : (defaultLabel || translations['last_30d'] || "Last 30 Days");

  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState(initialLabel);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, () => setIsOpen(false));

  const selectPreset = (key: string) => {
    const { start, end } = getRange(key);
    const text = translations[key] || FALLBACK_PERIODS[key] || key;
    setLabel(text);
    setIsOpen(false);

    if (mode === 'state' && onFilterChange) {
      onFilterChange(start.toISOString(), end.toISOString(), text);
    } else {
      // CLEAN URL MODE: ?period=last_30d
      const params = new URLSearchParams(searchParams.toString());
      params.set('period', key);
      params.delete('from');
      params.delete('to');
      params.delete('page'); // Reset pagination
      router.push(`${pathname}?${params.toString()}`);
      router.refresh();
    }
  };

  const applyCustom = () => {
    if(!customStart || !customEnd) return;
    const text = `${customStart} - ${customEnd}`;
    setLabel(text);
    setIsOpen(false);

    // Create Date objects for State mode
    const sDate = new Date(customStart); 
    const eDate = new Date(customEnd);
    eDate.setHours(23, 59, 59, 999); // End of day

    if (mode === 'state' && onFilterChange) {
      onFilterChange(sDate.toISOString(), eDate.toISOString(), text);
    } else {
      // CLEAN URL MODE: ?from=YYYY-MM-DD&to=YYYY-MM-DD
      const params = new URLSearchParams(searchParams.toString());
      params.delete('period');
      params.set('from', customStart);
      params.set('to', customEnd);
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
      router.refresh();
    }
  };

  const presets = Object.keys(FALLBACK_PERIODS);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-700 dark:text-slate-200"
      >
        <Calendar size={16} className="text-slate-500" />
        <span>{label}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2">
          <div className="max-h-[400px] overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
            {presets.map((key) => (
              <button 
                key={key}
                onClick={() => selectPreset(key)} 
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-900 dark:text-white rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-colors"
              >
                {translations[key] || FALLBACK_PERIODS[key]}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100 dark:border-white/5 p-3 space-y-3 bg-slate-50 dark:bg-black/10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom</p>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={customStart} onChange={(e)=>setCustomStart(e.target.value)} className="w-full p-1.5 text-xs border rounded bg-white dark:bg-black/20 text-slate-900 dark:text-white" />
              <input type="date" value={customEnd} onChange={(e)=>setCustomEnd(e.target.value)} className="w-full p-1.5 text-xs border rounded bg-white dark:bg-black/20 text-slate-900 dark:text-white" />
            </div>
            <button onClick={applyCustom} className="w-full py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-xs font-bold hover:opacity-90">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}