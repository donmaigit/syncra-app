import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, Tag, TrendingUp, Lock, DollarSign } from "lucide-react";
import { AddPartnerModal } from "@/components/dashboard/AddPartnerModal";
import { CreateCampaignModal } from "@/components/dashboard/CreateCampaignModal";
import { EditPartnerModal } from "@/components/dashboard/EditPartnerModal";
import { EditCampaignModal } from "@/components/dashboard/EditCampaignModal";
import { getTranslations } from 'next-intl/server';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { getRange } from '@/lib/date-helper';

export default async function AffiliatesPage({ params, searchParams }: { params: { locale: string }, searchParams: { period?: string; from?: string; to?: string; } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { funnels: true }
  });

  if (!user) redirect('/');

  const t = await getTranslations({ locale: params.locale, namespace: 'Affiliates' });
  const tAdmin = await getTranslations({ locale: params.locale, namespace: 'Admin.periods' });

  const periodTranslations = {
    all_time: tAdmin('all_time'),
    today: tAdmin('today'),
    yesterday: tAdmin('yesterday'),
    this_week: tAdmin('this_week'),
    last_7d: tAdmin('last_7d'),
    last_week: tAdmin('last_week'),
    last_28d: tAdmin('last_28d'),
    last_30d: tAdmin('last_30d'),
    this_month: tAdmin('this_month'),
    last_month: tAdmin('last_month'),
    last_90d: tAdmin('last_90d'),
    quarter_to_date: tAdmin('quarter_to_date'),
    this_year: tAdmin('this_year'),
    last_year: tAdmin('last_year')
  };

  // --- DATE FILTER LOGIC ---
  let dateFilter: any = {};
  
  if (searchParams.period) {
    const { start, end } = getRange(searchParams.period);
    dateFilter = { createdAt: { gte: start, lte: end } };
  } else if (searchParams.from && searchParams.to) {
    const start = new Date(searchParams.from);
    const end = new Date(searchParams.to);
    end.setHours(23, 59, 59, 999);
    dateFilter = { createdAt: { gte: start, lte: end } };
  }

  // 1. Fetch Partners
  const affiliates = await prisma.affiliate.findMany({
    where: dateFilter,
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  // 2. Fetch Campaigns
  const campaigns = await prisma.affiliateCampaign.findMany({
    where: dateFilter,
    include: { funnel: true },
    orderBy: { createdAt: 'desc' }
  });

  // 3. Calculate Pending Payouts (Real Data)
  const pendingStats = await prisma.commission.aggregate({
    where: { 
      affiliate: { userId: { not: undefined } }, 
      status: 'pending',
      ...dateFilter
    },
    _sum: { amount: true }
  });

  // 4. Fetch Recent Commissions
  const recentCommissions = await prisma.commission.findMany({
    where: dateFilter,
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { 
      affiliate: { include: { user: true } },
      order: { include: { contact: true } }
    }
  });

  return (
    <div className="p-6 md:p-10 text-slate-900 dark:text-white pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-slate-500">{t('subtitle')}</p>
        </div>
        <DateRangeFilter translations={periodTranslations} mode="url" />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase mb-2">
            <Users className="h-4 w-4" /> {t('stats.partners')}
          </div>
          <div className="text-3xl font-bold">{affiliates.length}</div>
        </div>
        <div className="p-6 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase mb-2">
            <Tag className="h-4 w-4" /> {t('stats.campaigns')}
          </div>
          <div className="text-3xl font-bold">{campaigns.length}</div>
        </div>
        <div className="p-6 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase mb-2">
            <TrendingUp className="h-4 w-4" /> {t('stats.pending')}
          </div>
          <div className="text-3xl font-bold">¥{(pendingStats._sum.amount || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* PARTNERS SECTION */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t('partners.title')}</h2>
            <AddPartnerModal />
          </div>
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
            {affiliates.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic">{t('partners.empty')}</div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {affiliates.map(aff => (
                  <li key={aff.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold">{aff.user.name}</div>
                        <div className="text-xs text-slate-500">{aff.user.email}</div>
                        {aff.internalNotes && (
                           <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                             <Lock className="h-3 w-3 opacity-50" />
                             <span className="truncate max-w-[150px]">{aff.internalNotes}</span>
                           </div>
                        )}
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                           <div className="font-mono text-xs bg-slate-100 dark:bg-black/20 px-2 py-1 rounded">{aff.code}</div>
                           <EditPartnerModal partner={aff} />
                        </div>
                        <div className="text-xs font-bold text-green-600">¥{aff.balance.toLocaleString()}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* CAMPAIGNS SECTION */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t('campaigns.title')}</h2>
            <CreateCampaignModal funnels={user.funnels} />
          </div>
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
             {campaigns.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic">{t('campaigns.empty')}</div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {campaigns.map(camp => (
                  <li key={camp.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold">{camp.name}</div>
                        <div className="text-xs text-slate-500">Funnel: {camp.funnel.name}</div>
                         {camp.internalNotes && (
                           <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                             <Lock className="h-3 w-3 opacity-50" />
                             <span className="truncate max-w-[150px]">{camp.internalNotes}</span>
                           </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                           <div className={`text-xs font-bold px-2 py-1 rounded ${camp.isActive ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                              {camp.type === 'percent' ? `${camp.value}%` : `¥${camp.value}`}
                           </div>
                           <EditCampaignModal campaign={camp} />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* RECENT COMMISSIONS */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">{t('commissions.title')}</h2>
        <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          {recentCommissions.length === 0 ? (
             <div className="p-8 text-center text-slate-500 italic">{t('commissions.empty')}</div>
          ) : (
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 font-bold uppercase text-xs">
                 <tr>
                   <th className="p-4">{t('commissions.date')}</th>
                   <th className="p-4">{t('commissions.partner')}</th>
                   <th className="p-4">{t('commissions.referred')}</th>
                   <th className="p-4 text-right">{t('commissions.amount')}</th>
                   <th className="p-4">{t('commissions.status')}</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                 {recentCommissions.map((comm) => (
                   <tr key={comm.id}>
                     <td className="p-4">{comm.createdAt.toLocaleDateString()}</td>
                     <td className="p-4 font-bold">{comm.affiliate.user.name}</td>
                     <td className="p-4 text-slate-500">{comm.order?.contact?.email || "-"}</td>
                     <td className="p-4 text-right font-mono">¥{comm.amount.toLocaleString()}</td>
                     <td className="p-4">
                       <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold uppercase">{comm.status}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          )}
        </div>
      </div>
    </div>
  );
}