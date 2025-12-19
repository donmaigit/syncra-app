"use client";

import { useState } from "react";
import { Loader2, Landmark, CheckCircle2, Copy } from "lucide-react";
import { createManualOrder } from "@/app/actions/payment-actions";

interface BankTransferProps {
  amount: number;
  funnelId: string;
  bankInfo: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  locale?: string;
}

export default function BankTransfer({ amount, funnelId, bankInfo, locale = 'ja' }: BankTransferProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = {
    title: locale === 'ja' ? '銀行振込' : 'Bank Transfer',
    instruction: locale === 'ja' ? '以下の口座へお振込みください。' : 'Please transfer to the account below.',
    amountLabel: locale === 'ja' ? '振込金額' : 'Amount',
    formTitle: locale === 'ja' ? '振込通知を送る' : 'Notify Payment',
    nameLabel: locale === 'ja' ? 'お名前 (振込名義)' : 'Your Name',
    emailLabel: locale === 'ja' ? 'メールアドレス' : 'Email Address',
    btnLabel: locale === 'ja' ? '注文を確定する' : 'Confirm Order',
    successTitle: locale === 'ja' ? '注文を受け付けました' : 'Order Received',
    successMsg: locale === 'ja' ? 'ご入金確認後、サービス提供を開始します。' : 'We will proceed once payment is confirmed.',
    copy: locale === 'ja' ? 'コピー' : 'Copy'
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await createManualOrder(
      amount, 
      funnelId, 
      formData.get('email') as string, 
      formData.get('name') as string
    );

    if (res?.success) setSuccess(true);
    else alert("Error submitting order.");
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="p-8 text-center bg-green-50 rounded-xl border border-green-200">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-xl font-bold text-green-800 mb-2">{t.successTitle}</h3>
        <p className="text-green-700">{t.successMsg}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden">
      {/* HEADER */}
      <div className="bg-slate-50 dark:bg-white/5 p-6 border-b border-slate-100 dark:border-white/5 text-center">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Landmark size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.title}</h3>
        <p className="text-sm text-slate-500">{t.instruction}</p>
        <div className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
          ¥{amount.toLocaleString()}
        </div>
      </div>

      {/* BANK INFO */}
      <div className="p-6 space-y-4 text-sm">
        <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-lg border border-slate-200 dark:border-white/5 relative group">
          <button 
            onClick={() => handleCopy(`${bankInfo.bankName} ${bankInfo.branchName} ${bankInfo.accountNumber}`)}
            className="absolute top-2 right-2 text-slate-400 hover:text-blue-500"
            title={t.copy}
          >
            {copied ? <CheckCircle2 size={16} className="text-green-500"/> : <Copy size={16}/>}
          </button>
          
          <dl className="space-y-1">
            <div className="flex justify-between"><dt className="text-slate-500">銀行名</dt><dd className="font-bold">{bankInfo.bankName}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">支店名</dt><dd className="font-bold">{bankInfo.branchName}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">口座種別</dt><dd className="font-bold">{bankInfo.accountType}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">口座番号</dt><dd className="font-bold font-mono">{bankInfo.accountNumber}</dd></div>
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-white/5 mt-2"><dt className="text-slate-500">名義人</dt><dd className="font-bold">{bankInfo.accountHolder}</dd></div>
          </dl>
        </div>

        {/* NOTIFICATION FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
          <p className="text-xs font-bold text-center text-slate-400 uppercase">{t.formTitle}</p>
          
          <div>
            <input name="name" required placeholder={t.nameLabel} className="w-full p-3 border rounded-lg bg-white dark:bg-black/20 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <input name="email" type="email" required placeholder={t.emailLabel} className="w-full p-3 border rounded-lg bg-white dark:bg-black/20 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : t.btnLabel}
          </button>
        </form>
      </div>
    </div>
  );
}