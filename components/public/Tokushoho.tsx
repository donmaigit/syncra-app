"use client";

import { useState } from "react";
import { Building2, User, MapPin, Phone, Mail, CreditCard, Truck, RefreshCw, ChevronDown, FileText } from "lucide-react";

interface TokushohoProps {
  data: {
    company?: string;
    rep?: string;
    address?: string;
    phone?: string;
    email?: string;
    price?: string;
    charges?: string;
    payment?: string;
    delivery?: string;
    returns?: string;
  };
  locale?: string;
}

export default function Tokushoho({ data, locale = 'ja' }: TokushohoProps) {
  const [isOpen, setIsOpen] = useState(false);

  const t = {
    title: locale === 'ja' ? '特定商取引法に基づく表記' : 'Legal Information',
    company: locale === 'ja' ? '販売業者' : 'Distributor',
    rep: locale === 'ja' ? '運営統括責任者' : 'Representative',
    address: locale === 'ja' ? '所在地' : 'Address',
    phone: locale === 'ja' ? '電話番号' : 'Phone',
    email: locale === 'ja' ? 'メールアドレス' : 'Email',
    price: locale === 'ja' ? '販売価格' : 'Selling Price',
    charges: locale === 'ja' ? '商品代金以外の必要料金' : 'Additional Charges',
    payment: locale === 'ja' ? 'お支払方法' : 'Payment Methods',
    delivery: locale === 'ja' ? '商品の引渡時期' : 'Delivery Time',
    returns: locale === 'ja' ? '返品・交換について' : 'Returns & Exchanges',
    clickToView: locale === 'ja' ? 'クリックして詳細を表示' : 'Click to view details',
  };

  const rows = [
    { icon: Building2, label: t.company, value: data.company },
    { icon: User, label: t.rep, value: data.rep },
    { icon: MapPin, label: t.address, value: data.address },
    { icon: Phone, label: t.phone, value: data.phone },
    { icon: Mail, label: t.email, value: data.email },
    { icon: CreditCard, label: t.price, value: data.price },
    { icon: CreditCard, label: t.charges, value: data.charges },
    { icon: CreditCard, label: t.payment, value: data.payment },
    { icon: Truck, label: t.delivery, value: data.delivery },
    { icon: RefreshCw, label: t.returns, value: data.returns },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* TOGGLE BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm group"
      >
        <div className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-200">
          <FileText size={20} className="text-slate-400 group-hover:text-purple-500 transition-colors" />
          <span>{t.title}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {!isOpen && <span className="hidden sm:inline">{t.clickToView}</span>}
          <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* EXPANDABLE CONTENT */}
      {isOpen && (
        <div className="mt-2 border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300 bg-white dark:bg-[#1E293B]">
          {rows.map((row, i) => (
            <div key={i} className="flex flex-col md:flex-row border-b border-slate-100 dark:border-white/5 last:border-0">
              <div className="w-full md:w-64 bg-slate-50 dark:bg-white/5 p-4 flex items-center gap-2 font-bold text-sm text-slate-600 dark:text-slate-300 border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5">
                <row.icon size={14} className="opacity-50" />
                {row.label}
              </div>
              <div className="flex-1 p-4 text-sm text-slate-600 dark:text-slate-400 break-words whitespace-pre-wrap leading-relaxed">
                {row.value || "-"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}