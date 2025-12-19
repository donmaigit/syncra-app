import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function CheckoutCancelPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Checkout' });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-10 text-center">
        <div className="mx-auto bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <XCircle className="text-red-500 h-10 w-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('cancel_title')}</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          {t('cancel_desc')}
        </p>

        <Link 
          href="/" 
          className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          <ArrowLeft size={18} /> {t('return_shop')}
        </Link>
      </div>
    </div>
  );
}