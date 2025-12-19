"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl"; 
import { Search, Filter, Download, ChevronLeft, ChevronRight, Mail, Calendar, Columns } from "lucide-react";
import { getContacts } from "@/app/actions/crm-actions";

function useOutsideClick(ref: any, callback: () => void) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) callback(); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
}

interface ContactsClientProps {
  locale: string;
  startDate?: string;
  endDate?: string;
}

export default function ContactsClient({ locale, startDate, endDate }: ContactsClientProps) {
  const t = useTranslations('Contacts');
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ contacts: [], funnels: [], totalPages: 0 });
  const [search, setSearch] = useState("");
  const [selectedFunnel, setSelectedFunnel] = useState("all");
  const [page, setPage] = useState(1);

  const [showColMenu, setShowColMenu] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(colMenuRef, () => setShowColMenu(false));

  const [columns, setColumns] = useState({
    lastName: true,
    firstName: true,
    email: true,
    phone: false,
    zip: false,
    prefecture: false,
    city: false,
    funnel: true,
    date: true
  });

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 500);
    return () => clearTimeout(timer);
  }, [search, selectedFunnel, page, startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    const res = await getContacts({ query: search, funnelId: selectedFunnel, page, startDate, endDate });
    if (res && !res.error) setData(res);
    setLoading(false);
  };

  const handleExport = () => {
    if (!data.contacts.length) return;
    
    // FIX: Translate CSV Headers
    const headers = [
      "ID", 
      t('table.lastName'), 
      t('table.firstName'), 
      t('table.email'), 
      t('table.phone'), 
      t('table.zip'), 
      t('table.prefecture'), 
      t('table.city'), 
      t('table.street'), 
      t('table.building'), 
      t('table.funnel'), 
      t('table.date')
    ];

    const rows = data.contacts.map((c: any) => [
      c.id, 
      c.lastName || "", 
      c.firstName || "", 
      c.email, 
      c.phone || "",
      c.zip || "",
      c.prefecture || "",
      c.city || "",
      c.street || "",
      c.building || "",
      c.funnel?.name || "Unknown", 
      new Date(c.createdAt).toISOString()
    ]);

    // Add BOM for Excel compatibility (Important for Japanese characters)
    const bom = "\uFEFF";
    const csvContent = "data:text/csv;charset=utf-8," + bom + [headers.join(","), ...rows.map((r:any) => r.join(","))].join("\n");
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `contacts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input type="text" placeholder={t('search_placeholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"/>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select value={selectedFunnel} onChange={(e) => setSelectedFunnel(e.target.value)} className="w-full appearance-none pl-10 pr-8 py-2 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white">
              <option value="all">{t('filter_all')}</option>
              {data.funnels?.map((f:any) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <Filter className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>
          <div className="relative" ref={colMenuRef}>
            <button onClick={() => setShowColMenu(!showColMenu)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
              <Columns size={16}/> <span className="hidden md:inline">{t('columns_btn')}</span>
            </button>
            {showColMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 p-2 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">{t('visible_columns')}</p>
                {Object.keys(columns).map(col => (
                  <label key={col} className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded cursor-pointer">
                    <input type="checkbox" checked={columns[col as keyof typeof columns]} onChange={(e) => setColumns({...columns, [col]: e.target.checked})} className="rounded text-purple-600" />
                    <span className="text-xs font-bold capitalize text-slate-700 dark:text-slate-300">{t(`table.${col}`)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"><Download size={16} /> <span className="hidden md:inline">{t('export_csv')}</span></button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 font-medium">
              <tr>
                {columns.lastName && <th className="px-6 py-4">{t('table.lastName')}</th>}
                {columns.firstName && <th className="px-6 py-4">{t('table.firstName')}</th>}
                {columns.email && <th className="px-6 py-4">{t('table.email')}</th>}
                {columns.phone && <th className="px-6 py-4">{t('table.phone')}</th>}
                {columns.zip && <th className="px-6 py-4">{t('table.zip')}</th>}
                {columns.prefecture && <th className="px-6 py-4">{t('table.prefecture')}</th>}
                {columns.city && <th className="px-6 py-4">{t('table.city')}</th>}
                {columns.funnel && <th className="px-6 py-4">{t('table.funnel')}</th>}
                {columns.date && <th className="px-6 py-4">{t('table.date')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={10} className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-white/5 rounded"></div></td></tr>) : data.contacts.length === 0 ? <tr><td colSpan={10} className="px-6 py-12 text-center text-slate-400">{t('empty')}</td></tr> : data.contacts.map((contact: any) => (
                  <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    {columns.lastName && <td className="px-6 py-4 font-bold">{contact.lastName || "-"}</td>}
                    {columns.firstName && <td className="px-6 py-4 font-bold">{contact.firstName || "-"}</td>}
                    {columns.email && <td className="px-6 py-4 text-slate-600 dark:text-slate-300"><div className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {contact.email}</div></td>}
                    {columns.phone && <td className="px-6 py-4">{contact.phone || "-"}</td>}
                    {columns.zip && <td className="px-6 py-4">{contact.zip || "-"}</td>}
                    {columns.prefecture && <td className="px-6 py-4">{contact.prefecture || "-"}</td>}
                    {columns.city && <td className="px-6 py-4">{contact.city || "-"}</td>}
                    {columns.funnel && <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs border border-slate-200 dark:border-slate-700">{contact.funnel?.name}</span></td>}
                    {columns.date && <td className="px-6 py-4 text-slate-500"><div className="flex items-center gap-2"><Calendar size={14}/> {new Date(contact.createdAt).toLocaleDateString()}</div></td>}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
          <span className="text-xs text-slate-500">{t('page')} {page} / {data.totalPages || 1}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded hover:bg-white dark:hover:bg-white/10 disabled:opacity-50"><ChevronLeft size={16}/></button>
            <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages} className="p-2 border rounded hover:bg-white dark:hover:bg-white/10 disabled:opacity-50"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}