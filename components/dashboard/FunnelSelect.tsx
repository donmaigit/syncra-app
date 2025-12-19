"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

export default function FunnelSelect({ funnels }: { funnels: { id: string, name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('funnel') || 'all';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('funnel', e.target.value);
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="relative">
      <Filter className="absolute left-3 top-2.5 text-slate-400" size={16} />
      <select 
        value={current} 
        onChange={handleChange}
        className="pl-10 pr-8 py-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none min-w-[150px]"
      >
        <option value="all">All Funnels</option>
        {funnels.map(f => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>
    </div>
  );
}