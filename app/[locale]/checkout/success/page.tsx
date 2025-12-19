import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { CheckCircle2, Download, ArrowRight, Home, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

interface Props {
  params: { locale: string };
  searchParams: {
    session_id?: string; 
    orderId?: string;    
  };
}

export default async function CheckoutSuccessPage({ params: { locale }, searchParams }: Props) {
  const t = await getTranslations({ locale, namespace: 'Checkout' });
  let order = null;

  // 1. Resolve Order ID
  if (searchParams.session_id) {
    const session = await stripe.checkout.sessions.retrieve(searchParams.session_id);
    if (session.metadata?.orderId) {
      order = await prisma.order.findUnique({
        where: { id: session.metadata.orderId },
        // FIX: Added 'user: true' to the include
        include: { 
          funnel: { 
            include: { 
              user: true,
              steps: { orderBy: { order: 'asc' } } 
            } 
          } 
        }
      });
    }
  } else if (searchParams.orderId) {
    order = await prisma.order.findUnique({
      where: { id: searchParams.orderId },
      // FIX: Added 'user: true' here too
      include: { 
        funnel: { 
          include: { 
            user: true,
            steps: { orderBy: { order: 'asc' } } 
          } 
        } 
      }
    });
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="p-8 bg-white rounded-xl shadow text-center max-w-md w-full">
          <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="text-red-600 h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">{t('error_title')}</h1>
          <p className="text-slate-500 mb-6">{t('error_desc')}</p>
          <Link href="/" className="inline-block px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-black transition-colors">
            {t('return_home')}
          </Link>
        </div>
      </div>
    );
  }

  // 2. Determine "Next Step" URL
  let nextStepUrl = null;
  if (order.funnel?.steps) {
      const thankYouStep = order.funnel.steps.find(s => s.slug.includes('thank') || s.slug.includes('complete'));
      const domain = order.funnel.customDomain || `${order.funnel.user?.subdomain || 'app'}.syncra.page`;
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      
      if (thankYouStep) {
          nextStepUrl = `${protocol}://${domain}/${thankYouStep.slug}`;
      } else {
          nextStepUrl = `${protocol}://${domain}`;
      }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#059669] p-10 text-center">
          <div className="mx-auto bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner">
            <CheckCircle2 className="text-white h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('success_title')}</h1>
          <p className="text-green-50 font-medium">{t('success_subtitle')}</p>
        </div>

        {/* Order Details */}
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center py-4 border-b border-slate-100">
            <span className="text-slate-500 text-sm font-bold uppercase">{t('order_id')}</span>
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">{order.id.slice(-8).toUpperCase()}</span>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-slate-100">
            <span className="text-slate-500 text-sm font-bold uppercase">{t('amount')}</span>
            <span className="text-2xl font-black text-slate-900">¥{order.amount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-slate-100">
            <span className="text-slate-500 text-sm font-bold uppercase">{t('status')}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              {t('paid')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 space-y-3">
            {nextStepUrl && (
              <a 
                href={nextStepUrl} 
                className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200 hover:-translate-y-0.5"
              >
                {t('access_content')} <ArrowRight size={18} />
              </a>
            )}
            
            <Link 
              href="/"
              className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Home size={18} /> {t('return_dashboard')}
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 text-center text-xs text-slate-400 border-t border-slate-100 font-medium">
          {t('email_sent')}
        </div>
      </div>
    </div>
  );
}