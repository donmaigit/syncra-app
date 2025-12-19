"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Landmark, Check, AlertCircle, ShoppingBag, MapPin, ShieldCheck, Mail } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/payment-actions";
import { useTranslations } from "next-intl";

interface CheckoutFormProps {
  funnelId: string;
  contactId?: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  providers: {
    stripe?: boolean;
    univapay?: boolean;
    aquagates?: boolean;
    manual?: boolean;
  };
  bankInfo?: {
    bankName: string;
    branchName: string;
    accountNumber: string;
    accountHolder: string;
  };
  showAddress?: boolean;
}

export default function CheckoutForm({ 
  funnelId, contactId, productName, productPrice, productImage, 
  providers, bankInfo, showAddress 
}: CheckoutFormProps) {
  let t: any;
  try { t = useTranslations('Checkout'); } catch(e) { t = (key:string) => key; }

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const hasCard = providers.stripe || providers.univapay || providers.aquagates;
  const hasBank = providers.manual;
  
  const [method, setMethod] = useState<'card' | 'manual' | null>(null);
  const [form, setForm] = useState({ name: "", email: "", zip: "", prefecture: "", city: "" });

  useEffect(() => {
    if (hasCard) setMethod('card');
    else if (hasBank) setMethod('manual');
    else setMethod(null);
  }, [hasCard, hasBank]);

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/-/g, '');
    setForm(prev => ({ ...prev, zip: val }));
    if (val.length === 7) {
      try {
        const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${val}`);
        const data = await res.json();
        if (data.results) {
          const { address1, address2, address3 } = data.results[0]; 
          setForm(prev => ({ ...prev, prefecture: address1, city: address2 + address3 }));
        }
      } catch(e) {}
    }
  };

  const handleBuy = async () => {
    if (!method) return;
    setLoading(true);
    setError("");

    if (!form.name || !form.email) {
      setError(t('error_missing_info'));
      setLoading(false);
      return;
    }

    let provider = 'manual';
    if (method === 'card') {
      if (providers.stripe) provider = 'stripe';
      else if (providers.univapay) provider = 'univapay';
      else if (providers.aquagates) provider = 'aquagates';
    }

    const res = await createCheckoutSession({
      funnelId, contactId,
      items: [{ name: productName, price: productPrice, quantity: 1, image: productImage }],
      provider,
      email: form.email, name: form.name
    });

    if (res && 'url' in res && res.url) {
      window.location.href = res.url; 
    } else if (res && 'success' in res && res.success) {
       router.push(`/checkout/success?orderId=manual_pending`); 
    } else {
      const errorMsg = (res && 'error' in res) ? res.error : "Unknown error";
      setError(t('error_payment_failed') + `: ${errorMsg}`);
      setLoading(false);
    }
  };

  if (!hasCard && !hasBank) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-400">
        <AlertCircle className="mx-auto mb-2" />
        <p className="text-sm font-bold">{t('no_payment_method')}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
      
      {/* HEADER */}
      <div className="p-6 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          {productImage ? (
            <img src={productImage} alt={productName} className="w-16 h-16 rounded-lg object-cover bg-white" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <ShoppingBag size={24} />
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white">{productName}</h3>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">¥{productPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      {hasCard && hasBank && (
        <div className="flex border-b border-slate-200 dark:border-white/5">
          <button onClick={() => setMethod('card')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${method==='card' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'text-slate-500 hover:bg-slate-50'}`}>
            <CreditCard size={16}/> {t('pay_card')}
          </button>
          <button onClick={() => setMethod('manual')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${method==='manual' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Landmark size={16}/> {t('pay_bank')}
          </button>
        </div>
      )}

      <div className="p-6 space-y-6 text-left">
        
        {/* BANK INFO (UPDATED DESIGN WITH LABELS) */}
        {method === 'manual' && bankInfo && (
          <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 text-sm">
             <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-200 dark:border-blue-800/30">
               <p className="font-bold text-blue-800 dark:text-blue-300 text-xs uppercase">{t('pay_bank_title')}</p>
             </div>
             
             <div className="space-y-2 font-mono text-slate-700 dark:text-slate-300">
               <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                 <span className="text-xs text-slate-500">{t('bank_info_labels.bank')}</span>
                 <span className="font-bold">{bankInfo.bankName || "---"}</span>
               </div>
               <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                 <span className="text-xs text-slate-500">{t('bank_info_labels.branch')}</span>
                 <span className="font-bold">{bankInfo.branchName || "---"}</span>
               </div>
               <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                 <span className="text-xs text-slate-500">{t('bank_info_labels.number')}</span>
                 <span className="font-bold">{bankInfo.accountNumber || "---"}</span>
               </div>
               <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                 <span className="text-xs text-slate-500">{t('bank_info_labels.holder')}</span>
                 <span className="font-bold">{bankInfo.accountHolder || "---"}</span>
               </div>
             </div>
          </div>
        )}

        {/* CUSTOMER FORM */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t('customer_name')}</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder={t('name_placeholder')} className="w-full p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t('customer_email')}</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="you@example.com" className="w-full p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          {showAddress && (
             <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><MapPin size={12}/> {t('address_label')}</p>
                <div className="grid grid-cols-3 gap-2">
                   <input name="zip" placeholder={t('zip')} value={form.zip} onChange={handleZipChange} maxLength={8} className="w-full p-2 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none text-sm font-mono" />
                   <input name="prefecture" placeholder={t('prefecture')} value={form.prefecture} onChange={(e)=>setForm({...form, prefecture: e.target.value})} className="col-span-2 w-full p-2 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none text-sm" />
                </div>
                <input name="city" placeholder={t('city_street')} value={form.city} onChange={(e)=>setForm({...form, city: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none text-sm" />
             </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button 
          onClick={handleBuy} 
          disabled={loading}
          className={`w-full py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${method === 'card' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? <Loader2 className="animate-spin" /> : <>{method === 'card' ? <CreditCard size={20}/> : <Check size={20}/>} {method === 'card' ? t('pay_now') : t('confirm_order')}</>}
        </button>

        <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck size={12}/> {method === 'card' ? t('secure_checkout') : t('bank_secure_note')}
        </p>

      </div>
    </div>
  );
}