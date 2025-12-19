"use client";

import { useState } from "react";
import { 
  LayoutDashboard, BarChart3, List, 
  ShoppingCart, Users, Eye, Activity, CreditCard, 
  TrendingUp, TrendingDown, MousePointerClick, Database, 
  Calendar, Gift, Layers, Hand, CalendarDays
} from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { FunnelChart } from "@/components/dashboard/FunnelChart";

interface DashboardClientProps {
  stats: any;
  health: any;
  t: any;
  userName: string;
  currentDate: string;
}

export default function DashboardClient({ stats, health, t, userName, currentDate }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: t.tabs.overview, icon: LayoutDashboard },
    { id: 'analytics', label: t.tabs.analytics, icon: BarChart3 },
    { id: 'activity', label: t.tabs.activity, icon: List },
  ];

  return (
    <div className="space-y-8">
      
      {/* HEADER (Moved inside Client for cleaner prop passing, visuals updated) */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <span className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-xl"><Hand size={24} /></span>
          {t.welcome}, {userName}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 ml-1">
           <CalendarDays size={16} className="text-slate-400" />
           {currentDate}
        </p>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TAB 1: OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          
          {/* ROW 1: KPI PULSE */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              title={t.stats.revenue} 
              value={`¥${stats.totalRevenue.toLocaleString()}`} 
              subtext={
                <span className={`flex items-center gap-1 ${stats.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                   {stats.trend >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} 
                   {stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(1)}% {t.stats.trend_label}
                </span>
              }
              icon={<CreditCard size={18} />} 
              iconColor="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"
            />
            <MetricCard 
              title={t.stats.orders} 
              value={stats.totalSalesCount} 
              subtext={t.stats.orders_sub}
              icon={<ShoppingCart size={18} />} 
              iconColor="text-green-600 bg-green-100 dark:bg-green-900/30"
            />
            <MetricCard 
              title={t.stats.leads} 
              value={stats.totalLeads} 
              subtext={t.stats.leads_sub}
              icon={<Users size={18} />} 
              iconColor="text-blue-600 bg-blue-100 dark:bg-blue-900/30"
            />
            <MetricCard 
              title={t.stats.conversion} 
              value={`${stats.conversionRate}%`} 
              subtext={t.stats.conversion_sub}
              icon={<Activity size={18} />} 
              iconColor="text-amber-600 bg-amber-100 dark:bg-amber-900/30"
              tooltip={t.tooltips.conversion}
            />
          </div>

          {/* ROW 2: ASSETS & SYSTEM STATUS (Compact Row) */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
             <MetricCard 
                title={t.assets.funnels}
                value={stats.assets.liveFunnels}
                subtext={<>{stats.assets.draftFunnels} {t.assets.drafts}</>}
                icon={<Layers size={16} />}
                iconColor="text-slate-500 bg-slate-100 dark:bg-white/5"
             />
             <MetricCard 
                title={t.assets.events}
                value={stats.assets.events}
                subtext={t.assets.events_sub}
                icon={<Calendar size={16} />}
                iconColor="text-slate-500 bg-slate-100 dark:bg-white/5"
             />
             <MetricCard 
                title={t.assets.calendars}
                value={stats.assets.calendars}
                subtext={t.assets.calendars_sub}
                icon={<CalendarDays size={16} />}
                iconColor="text-slate-500 bg-slate-100 dark:bg-white/5"
             />
             <MetricCard 
                title={t.assets.affiliates}
                value={stats.assets.affiliates}
                subtext={t.assets.affiliates_sub}
                icon={<Gift size={16} />}
                iconColor="text-slate-500 bg-slate-100 dark:bg-white/5"
             />
             {/* DB STATUS CARD */}
             <div className="p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.stats.db_active}</div>
                  <span className="p-1.5 rounded-lg text-slate-500 bg-slate-100 dark:bg-white/5"><Database size={16}/></span>
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <div className="relative flex h-2.5 w-2.5">
                        {health?.database ? <><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span></> : <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>}
                      </div>
                      <div className="text-xl font-black tracking-tight">{health?.database ? t.status.online : t.status.offline}</div>
                   </div>
                   <div className="text-xs font-medium text-slate-500">{health?.database ? t.status.operational : t.status.downtime}</div>
                </div>
             </div>
          </div>

          {/* ROW 3: REVENUE GRAPH */}
          <div className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
            <div className="mb-6">
              <h3 className="font-bold text-lg">{t.charts.revenue_title}</h3>
              <p className="text-sm text-slate-500">{t.charts.revenue_desc}</p>
            </div>
            <OverviewChart data={stats.chartData} />
          </div>
        </div>
      )}

      {/* --- TAB 2: ANALYTICS --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
             <MetricCard 
              title={t.stats.pageviews} 
              value={stats.totalPageViews} 
              subtext={t.stats.pageviews_sub}
              icon={<Eye size={18} />} 
              iconColor="text-purple-600 bg-purple-100 dark:bg-purple-900/30"
              tooltip={t.tooltips.pageviews}
            />
             <MetricCard 
              title={t.stats.customers} 
              value={stats.totalCustomers} 
              subtext={t.stats.customers_sub}
              icon={<Users size={18} />} 
              iconColor="text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30"
              tooltip={t.tooltips.customers}
            />
            <MetricCard 
              title={t.stats.aov} 
              value={`¥${stats.aov.toLocaleString()}`} 
              subtext={t.stats.aov_sub}
              icon={<CreditCard size={18} />} 
              iconColor="text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30"
              tooltip={t.tooltips.aov}
            />
            <MetricCard 
              title={t.stats.epc} 
              value={`¥${stats.epc.toLocaleString()}`} 
              subtext={t.stats.epc_sub}
              icon={<MousePointerClick size={18} />} 
              iconColor="text-pink-600 bg-pink-100 dark:bg-pink-900/30"
              tooltip={t.tooltips.epc}
            />
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <div className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
              <h3 className="font-bold text-lg mb-2">{t.charts.traffic_title}</h3>
              <p className="text-sm text-slate-500 mb-6">{t.charts.traffic_desc}</p>
              <TrafficChart data={stats.trafficData} />
            </div>
            <div className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
              <h3 className="font-bold text-lg mb-2">{t.charts.funnel_title}</h3>
              <p className="text-sm text-slate-500 mb-6">{t.charts.funnel_desc}</p>
              <FunnelChart data={stats.funnelChartData} />
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: ACTIVITY --- */}
      {activeTab === 'activity' && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-2">
          
          {/* RECENT SALES */}
          <div className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm h-full">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ShoppingCart size={18}/> {t.leads_table.sales_title}</h3>
            <div className="space-y-3">
              {stats.recentSales.length === 0 ? <div className="text-center text-slate-500 py-10 italic">{t.leads_table.empty}</div> : stats.recentSales.map((order: any) => (
                <div key={order.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600"><ShoppingCart size={14}/></div>
                     <div>
                       <div className="font-bold text-slate-900 dark:text-white">¥{order.amount.toLocaleString()}</div>
                       <div className="text-xs text-slate-500">{order.contact?.email || 'Guest'}</div>
                     </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                    <div className="text-[10px] bg-white dark:bg-black/20 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 mt-1 inline-block truncate max-w-[100px]">{order.funnel.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT LEADS */}
          <div className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm h-full">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={18}/> {t.leads_table.leads_title}</h3>
            <div className="space-y-3">
              {stats.recentLeads.length === 0 ? <div className="text-center text-slate-500 py-10 italic">{t.leads_table.empty}</div> : stats.recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600"><Users size={14}/></div>
                     <div>
                        <div className="font-bold text-slate-900 dark:text-white">{lead.email}</div>
                        <div className="text-xs text-slate-500">{t.leads_table.source}: {lead.source || 'Direct'}</div>
                     </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</div>
                    <div className="text-[10px] bg-white dark:bg-black/20 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 mt-1 inline-block truncate max-w-[100px]">{lead.funnel.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}