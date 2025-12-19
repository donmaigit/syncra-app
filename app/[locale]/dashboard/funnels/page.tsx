import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { Link } from '@/navigation';
import { ExternalLink, Edit, Settings, Lock } from 'lucide-react';
import { CreateFunnelModal } from '@/components/dashboard/CreateFunnelModal';
import { DeleteButton } from '@/components/dashboard/DeleteButton';
import { deleteFunnel } from '@/app/actions/funnel-actions';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { getRange } from '@/lib/date-helper';

export default async function FunnelsPage({ searchParams }: { searchParams: { period?: string; from?: string; to?: string; } }) {
  const t = await getTranslations('Funnels');
  // Fetch periods from Admin namespace to reuse translations
  const tAdmin = await getTranslations('Admin.periods');
  
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

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { subdomain: true, id: true }
  });

  if (!user) redirect('/');

  // --- DATE FILTER LOGIC ---
  let dateFilter: any = {};
  
  if (searchParams.period) {
    // Case A: Preset (e.g. ?period=last_30d)
    const { start, end } = getRange(searchParams.period);
    dateFilter = { updatedAt: { gte: start, lte: end } };
  } else if (searchParams.from && searchParams.to) {
    // Case B: Custom (e.g. ?from=2025-01-01&to=2025-01-31)
    const start = new Date(searchParams.from);
    const end = new Date(searchParams.to);
    end.setHours(23, 59, 59, 999); // Ensure end of day
    dateFilter = { updatedAt: { gte: start, lte: end } };
  }

  const funnels = await prisma.funnel.findMany({
    where: { 
      userId: user.id,
      ...dateFilter 
    },
    orderBy: { updatedAt: 'desc' },
    include: { user: { select: { subdomain: true } } }
  });

  return (
    <div className="p-6 md:p-10 text-slate-900 dark:text-white pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your sales pages and offers.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <DateRangeFilter translations={periodTranslations} mode="url" />
          <CreateFunnelModal subdomain={user.subdomain ?? ""} />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {funnels.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-slate-300 dark:border-white/10 text-slate-500 bg-slate-50 dark:bg-slate-900/50">
            <p className="mb-4 italic">{t('empty')}</p>
          </div>
        ) : (
          funnels.map((funnel) => {
             const displayUrl = funnel.customDomain ? funnel.customDomain : `${funnel.user.subdomain}.syncra.page/${funnel.slug}`;
             const publicUrl = funnel.customDomain ? `https://${funnel.customDomain}` : `https://${funnel.user.subdomain}.syncra.page/${funnel.slug}`;

            return (
              <div key={funnel.id} className="group relative rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] p-6 hover:border-purple-500/50 transition-all shadow-sm flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-lg font-bold truncate text-slate-900 dark:text-white" title={funnel.name}>{funnel.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${funnel.published ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{funnel.published ? 'LIVE' : 'DRAFT'}</span>
                  </div>
                </div>
                <div className="mb-4 min-h-[40px]">
                   {funnel.internalNotes ? (
                     <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex items-start gap-2" title={funnel.internalNotes}><Lock className="h-3 w-3 mt-1 shrink-0 opacity-50" />{funnel.internalNotes}</p>
                   ) : <p className="text-sm text-slate-400 italic flex items-center gap-2"><Lock className="h-3 w-3 opacity-30" /> No internal notes.</p>}
                </div>
                <div className="mb-6 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-black/30 p-2.5 rounded border border-slate-200 dark:border-white/5 truncate">
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-50" /><span className="truncate select-all">{displayUrl}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
                  <Link href={`/editor/${funnel.id}`} className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"><Edit className="h-4 w-4" /> Editor</Link>
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 py-2.5 text-sm font-medium transition-colors"><ExternalLink className="h-4 w-4" /> View</a>
                  <Link href={`/dashboard/funnels/${funnel.id}/settings`} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 py-2.5 text-sm font-medium transition-colors"><Settings className="h-4 w-4" /> Settings</Link>
                  <div className="flex items-center justify-center"><DeleteButton itemName={funnel.name} onDelete={async () => { "use server"; await deleteFunnel(funnel.id); }} /></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}