import { getTranslations } from 'next-intl/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { getDashboardStats } from "@/app/actions/analytics-actions";
import { getSystemHealth } from "@/app/actions/admin-actions";
import DashboardClient from "@/components/dashboard/DashboardClient";
import FunnelSelect from "@/components/dashboard/FunnelSelect";
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { getRange } from '@/lib/date-helper';

export default async function DashboardPage({ params, searchParams }: { params: { locale: string }, searchParams: { period?: string; from?: string; to?: string; funnel?: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Dashboard' });
  const tAdmin = await getTranslations({ locale: params.locale, namespace: 'Admin.periods' });
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) redirect('/');

  // 1. RESOLVE DATE
  let startDate: Date | undefined;
  let endDate: Date | undefined;
  if (searchParams.period) {
    const range = getRange(searchParams.period);
    startDate = range.start;
    endDate = range.end;
  } else if (searchParams.from && searchParams.to) {
    startDate = new Date(searchParams.from);
    endDate = new Date(searchParams.to);
    endDate.setHours(23, 59, 59, 999);
  }

  // 2. FETCH DATA
  const stats = await getDashboardStats(startDate, endDate, searchParams.funnel);
  const health = await getSystemHealth();

  // 3. PREPARE TRANSLATIONS
  const clientTranslations = {
    welcome: t('welcome'),
    tabs: {
      overview: t('tabs.overview'),
      analytics: t('tabs.analytics'),
      activity: t('tabs.activity')
    },
    stats: {
      revenue: t('stats.revenue'),
      orders: t('stats.orders'),
      orders_sub: t('stats.orders_sub'),
      leads: t('stats.leads'),
      leads_sub: t('stats.leads_sub'),
      conversion: t('stats.conversion'),
      conversion_sub: t('stats.conversion_sub'),
      pageviews: t('stats.pageviews'),
      pageviews_sub: t('stats.pageviews_sub'),
      customers: t('stats.customers'),
      customers_sub: t('stats.customers_sub'),
      aov: t('stats.aov'),
      aov_sub: t('stats.aov_sub'),
      epc: t('stats.epc'),
      epc_sub: t('stats.epc_sub'),
      db_active: t('stats.db_active'),
      trend_label: t('stats.trend_label')
    },
    status: {
      online: t('status.online'),
      offline: t('status.offline'),
      operational: t('status.operational'),
      downtime: t('status.downtime')
    },
    assets: {
      funnels: t('assets.funnels'),
      drafts: t('assets.drafts'),
      events: t('assets.events'),
      events_sub: t('assets.events_sub'),
      calendars: t('assets.calendars'),
      calendars_sub: t('assets.calendars_sub'),
      affiliates: t('assets.affiliates'),
      affiliates_sub: t('assets.affiliates_sub')
    },
    charts: {
      revenue_title: t('charts.revenue_title'),
      revenue_desc: t('charts.revenue_desc'),
      traffic_title: t('charts.traffic_title'),
      traffic_desc: t('charts.traffic_desc'),
      funnel_title: t('charts.funnel_title'),
      funnel_desc: t('charts.funnel_desc')
    },
    tooltips: {
      conversion: t('tooltips.conversion'),
      pageviews: t('tooltips.pageviews'),
      customers: t('tooltips.customers'),
      aov: t('tooltips.aov'),
      epc: t('tooltips.epc')
    },
    leads_table: {
      sales_title: t('leads_table.sales_title'),
      leads_title: t('leads_table.leads_title'),
      empty: t('leads_table.empty'),
      source: t('leads_table.source')
    }
  };

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

  return (
    <div className="p-6 md:p-10 text-slate-900 dark:text-white pb-20 max-w-[1600px] mx-auto">
      
      {/* HEADER ROW WITH FILTERS */}
      <div className="flex flex-col lg:flex-row justify-end items-start lg:items-center gap-4 mb-2">
        {/* Title is now handled inside DashboardClient */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
          <FunnelSelect funnels={stats.funnelsList} />
          <DateRangeFilter translations={periodTranslations} mode="url" />
        </div>
      </div>

      {/* DASHBOARD CLIENT */}
      <DashboardClient 
        stats={stats} 
        health={health} 
        t={clientTranslations} 
        userName={session.user.name || 'User'}
        currentDate={new Date().toLocaleDateString(params.locale === 'ja' ? 'ja-JP' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />

    </div>
  );
}