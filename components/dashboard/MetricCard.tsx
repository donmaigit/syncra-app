"use client";

import { useState } from "react";
import { Info, ChevronDown } from "lucide-react";
import * as Tooltip from '@radix-ui/react-tooltip';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: React.ReactNode;
  icon?: React.ReactNode; 
  iconColor?: string; 
  tooltip?: string;
  isDual?: boolean;
  secondaryTitle?: string;
  secondaryValue?: string | number;
  secondaryTooltip?: string;
  // New prop to control active/inactive state visuals if needed
  statusColor?: string; 
}

export default function MetricCard({ 
  title, value, subtext, icon, iconColor, tooltip,
  isDual, secondaryTitle, secondaryValue, secondaryTooltip, statusColor
}: MetricCardProps) {
  const [showSecondary, setShowSecondary] = useState(false);

  const currentTitle = showSecondary ? secondaryTitle : title;
  const currentValue = showSecondary ? secondaryValue : value;
  const currentTooltip = showSecondary ? secondaryTooltip : tooltip;

  return (
    <div className={`p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm relative group h-full flex flex-col justify-between transition-all hover:shadow-md ${statusColor ? statusColor : ''}`}>
      
      {/* HEADER */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{currentTitle}</h3>
          
          {currentTooltip && (
            <Tooltip.Provider>
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger asChild>
                   <Info size={12} className="text-slate-300 hover:text-slate-500 cursor-help" />
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="z-50 max-w-xs bg-slate-900 text-white text-xs p-2 rounded shadow-xl animate-in fade-in zoom-in-95" sideOffset={5}>
                    {currentTooltip}
                    <Tooltip.Arrow className="fill-slate-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>

        <div className="flex gap-2">
          {isDual && (
             <button 
               onClick={() => setShowSecondary(!showSecondary)}
               className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 px-2 py-1 rounded text-slate-500 hover:bg-slate-200 transition-colors flex items-center gap-1"
             >
               {showSecondary ? title : secondaryTitle} <ChevronDown size={10} />
             </button>
          )}
          {icon && (
            <span className={`p-1.5 rounded-lg ${iconColor}`}>
              {icon}
            </span>
          )}
        </div>
      </div>

      {/* VALUE */}
      <div>
        <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{currentValue}</div>
        {subtext && <div className="text-xs font-medium text-slate-500 mt-1">{subtext}</div>}
      </div>
    </div>
  );
}