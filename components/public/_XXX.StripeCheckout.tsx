"use client";

import { useState } from "react";
import { Loader2, ShoppingBag, CreditCard, AlertCircle, Landmark, MapPin, ShieldCheck } from "lucide-react";
import { createCheckoutSession, createManualOrder } from "@/app/actions/payment-actions"; 

interface CheckoutProps {
  amount: number;
  funnelId: string;
  currency?: string;
  locale?: string;
  config?: {
    enableCard?: boolean;
    enableBank?: boolean;
    bankName?: string;
    branchName?: string;
    accountNumber?: string;
    accountHolder?: string;
    fields?: { 
      showAddress?: boolean; 
      enableZipAutoFill?: boolean; 
    };
  };
}

export default function StripeCheckout({ amount, funnelId, currency = "jpy", locale = 'ja', config }: CheckoutProps) {
  const [method, setMethod] = useState<'card' | 'bank'>(config?.enableCard !== false ? 'card' : 'bank');
  
  // STATE
  const [loading, setLoading] = useState(false);
  const [bankSuccess, setBankSuccess] = useState(false);

  // ADDRESS STATE (For Bank Form)
  const [zip, setZip] = useState("");
  const [pref, setPref] = useState("");
  const [city, setCity] = useState("");

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/-/g, '');
    setZip(val);
    
    if (config?.fields?.enableZipAutoFill && val.length === 7) {
      try {
        const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${val}`);
        const data = await res.json();
        if (data.results) {
          const { address1, address2, address3 } = data.results[0]; 
          setPref(address1);
          setCity(address2 + address3);
        }
      } catch(e) {}
    }
  };

  // --- 1. STRIPE HOSTED CHECKOUT ---
  const handleStripeCheckout = async () => {
    setLoading(true);
    const res = await createCheckoutSession({
      funnelId,
      items: [{ name: "Product", price: amount, quantity: 1 }],
      provider: 'stripe'
    });

    // FIX: Type-safe check using 'in' operator
    if (res && "url" in res && res.url) {
      window.location.href = res.url;
    } else {
      alert(locale === 'ja' ? "決済の初期化に失敗しました" : "Payment initialization failed.");
      setLoading(false);
    }
  };

  // --- 2. BANK SUBMIT ---
  const handleBankSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await createManualOrder(amount, funnelId, formData.get('email') as string, formData.get('name') as string);
    
    // createManualOrder returns { success: true } or { error: string }
    if (res && "success" in res && res.success) {
      setBankSuccess(true);
    } else {
      alert("Order failed.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-slate-50 dark:bg-white/5 p-6 text-center border-b border-slate-100 dark:border-white/5">
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">¥{amount?.toLocaleString()}</div>
        <p className="text-xs text-slate-500 uppercase font-bold mt-1">{locale==='ja'?'請求金額':'Total Amount'}</p>
      </div>

      {/* TABS */}
      {(config?.enableCard !== false && config?.enableBank) && (
        <div className="flex border-b border-slate-200 dark:border-white/5">
          <button onClick={() => setMethod('card')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${method==='card' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'text-slate-500 hover:bg-slate-50'}`}>
            <CreditCard size={16}/> {locale==='ja'?'クレジットカード':'Card'}
          </button>
          <button onClick={() => setMethod('bank')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${method==='bank' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Landmark size={16}/> {locale==='ja'?'銀行振込':'Transfer'}
          </button>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="p-6">
        
        {/* === CARD MODE (Redirect) === */}
        {method === 'card' && (
           <div className="space-y-6 text-center">
             <div className="text-sm text-slate-500">
               {locale === 'ja' ? "安全な決済ページへ移動します。" : "Proceed to secure checkout."}
             </div>
             <button 
               onClick={handleStripeCheckout} 
               disabled={loading}
               className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
             >
               {loading ? <Loader2 className="animate-spin" /> : <><CreditCard size={20}/> {locale==='ja'?'支払う':'Pay Now'}</>}
             </button>
             <div className="flex justify-center items-center gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
               <ShieldCheck size={12} /> Secure Payment by Stripe
             </div>
           </div>
        )}

        {/* === BANK MODE (Manual) === */}
        {method === 'bank' && (
           bankSuccess ? (
             <div className="text-center py-6">
               <h3 className="text-xl font-bold text-green-600 mb-2">Thank You!</h3>
               <p className="text-sm text-slate-500">{locale==='ja'?'以下の口座へお振込ください。':'Please transfer to the account below.'}</p>
               <div className="mt-4 p-4 bg-slate-50 dark:bg-white/5 rounded text-left text-sm space-y-1 font-mono border border-slate-100 dark:border-white/5">
                 <p className="font-bold">{config?.bankName}</p>
                 <p>{config?.branchName} {config?.accountNumber}</p>
                 <p>{config?.accountHolder}</p>
               </div>
             </div>
           ) : (
             <form onSubmit={handleBankSubmit} className="space-y-4">
               <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 text-sm text-left">
                 <p className="font-bold text-blue-800 dark:text-blue-300 mb-2">{locale==='ja'?'振込先':'Bank Info'}:</p>
                 <p>{config?.bankName} {config?.branchName}</p>
                 <p>{config?.accountNumber} ({config?.accountHolder})</p>
               </div>
               
               <input name="name" required placeholder={locale==='ja'?'お名前':'Name'} className="w-full p-3 border rounded-lg bg-white dark:bg-black/20 outline-none text-left" />
               <input name="email" type="email" required placeholder="Email" className="w-full p-3 border rounded-lg bg-white dark:bg-black/20 outline-none text-left" />

               {/* ADDRESS FIELDS (If Enabled) */}
               {config?.fields?.showAddress && (
                 <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 text-left"><MapPin size={12}/> Address</p>
                    <div className="grid grid-cols-3 gap-2">
                       <input 
                         name="zip" 
                         placeholder="Zip" 
                         value={zip} 
                         onChange={handleZipChange} 
                         maxLength={8} 
                         className="w-full p-2 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none text-sm font-mono text-left" 
                       />
                       <input 
                         name="prefecture" 
                         placeholder="Prefecture" 
                         value={pref} 
                         onChange={(e)=>setPref(e.target.value)} 
                         className="col-span-2 w-full p-2 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none text-sm text-left" 
                       />
                    </div>
                    <input 
                      name="city" 
                      placeholder="City/Street" 
                      value={city} 
                      onChange={(e)=>setCity(e.target.value)} 
                      className="w-full p-2 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none text-sm text-left" 
                    />
                 </div>
               )}

               <button disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                 {loading ? <Loader2 className="animate-spin mx-auto"/> : (locale==='ja'?'注文を確定する':'Confirm Order')}
               </button>
             </form>
           )
        )}
      </div>
    </div>
  );
}