"use client";

import { useState } from "react";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/payment-actions";

export default function AquaCheckout({ amount, funnelId, currency = "jpy", locale = 'ja', config }: any) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    const res = await createCheckoutSession({
      funnelId,
      items: [{ name: "Product", price: amount, quantity: 1 }],
      provider: 'aquagates'
    });
    
    // FIX: Type-safe check using 'in' operator
    if (res && "url" in res && res.url) {
      window.location.href = res.url;
    } else {
      const errorMsg = (res && "error" in res) ? res.error : "Unknown error";
      alert("Payment Error: " + errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-50 dark:bg-blue-900/10 p-6 text-center border-b border-blue-100 dark:border-blue-900/20">
        <div className="text-3xl font-extrabold text-blue-900 dark:text-blue-500">¥{amount?.toLocaleString()}</div>
        <p className="text-xs text-blue-600/70 uppercase font-bold mt-1">{locale==='ja'?'請求金額 (AQUAGATES)':'Total Amount'}</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-500">
            {locale === 'ja' 
              ? "セキュリティ保護のため、外部決済ページで手続きを行います。" 
              : "You will be redirected to a secure payment gateway."}
          </p>
        </div>

        <button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><CreditCard size={20}/> {locale==='ja'?'支払いに進む':'Proceed to Pay'}</>}
        </button>

        <div className="flex justify-center items-center gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          <ShieldCheck size={12} /> Powered by AQUAGATES
        </div>
      </div>
    </div>
  );
}