import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ContactsClient from "@/components/dashboard/ContactsClient";
import { getTranslations } from 'next-intl/server';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { getRange } from '@/lib/date-helper';

export default async function ContactsPage({ params, searchParams }: { params: { locale: string }, searchParams: { period?: string; from?: string; to?: string; } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const t = await getTranslations({ locale: params.locale, namespace: 'Contacts' });
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
  let startDate: string | undefined;
  let endDate: string | undefined;

  if (searchParams.period) {
    const { start, end } = getRange(searchParams.period);
    startDate = start.toISOString();
    endDate = end.toISOString();
  } else if (searchParams.from && searchParams.to) {
    const start = new Date(searchParams.from);
    const end = new Date(searchParams.to);
    end.setHours(23, 59, 59, 999);
    startDate = start.toISOString();
    endDate = end.toISOString();
  }

  return (
    <div className="p-6 md:p-10 space-y-8 text-slate-900 dark:text-white pb-20">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t('subtitle')}</p>
        </div>
        <DateRangeFilter translations={periodTranslations} mode="url" />
      </div>
      
      <ContactsClient 
        locale={params.locale} 
        startDate={startDate} 
        endDate={endDate} 
      />
    </div>
  );
}