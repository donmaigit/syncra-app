import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminClient from "@/components/dashboard/AdminClient";
import { getWaitlistLeads, getPlatformStats, getAdminUsers, getSystemHealth } from "@/app/actions/admin-actions";
import { getTranslations } from 'next-intl/server';

export default async function PlatformAdminPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  
  // Security: Only Superadmin/Admin
  const role = session?.user?.role;
  if (!session || (role !== 'superadmin' && role !== 'admin')) {
    redirect('/dashboard');
  }

  // 1. Settings
  let settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: { 
        id: "global", 
        enableStripe: process.env.ENABLE_STRIPE !== 'false', 
        enableUniva: process.env.ENABLE_UNIVAPAY === 'true', 
        enableAqua: process.env.ENABLE_AQUAGATES === 'true'
      }
    });
  }

  // 2. Data Fetching
  const leads = await getWaitlistLeads();
  const stats = await getPlatformStats('all');
  const users = await getAdminUsers('');
  const health = await getSystemHealth();

  // 3. Translations
  const tRaw = await getTranslations({ locale: params.locale, namespace: 'Admin' });
  
  // FIXED: Added ALL period keys so the dropdown works in Japanese/English
  const t = {
    title: tRaw('title'),
    subtitle: tRaw('subtitle'),
    saved: tRaw('saved'),
    tabs: {
      overview: tRaw('tabs.overview'),
      users: tRaw('tabs.users'),
      config: tRaw('tabs.config'),
      leads: tRaw('tabs.leads')
    },
    stats: {
      mrr: tRaw('stats.mrr'),
      mrr_desc: tRaw('stats.mrr_desc'),
      merchants: tRaw('stats.merchants'),
      contacts: tRaw('stats.contacts'),
      funnels: tRaw('stats.funnels'),
      events: tRaw('stats.events'),
      calendars: tRaw('stats.calendars'),
      affiliates: tRaw('stats.affiliates')
    },
    status: { title: tRaw('status.title') },
    config: { 
      gateways: tRaw('config.gateways'), 
      gateways_desc: tRaw('config.gateways_desc'),
      gateways_subtitle: tRaw('config.gateways_subtitle'), 
      stripe_desc: tRaw('config.stripe_desc'),
      univa_desc: tRaw('config.univa_desc'),
      aqua_desc: tRaw('config.aqua_desc'),
      save: tRaw('config.save') 
    },
    periods: { 
      all_time: tRaw('periods.all_time'),
      today: tRaw('periods.today'),
      yesterday: tRaw('periods.yesterday'),
      this_week: tRaw('periods.this_week'),
      last_7d: tRaw('periods.last_7d'),
      last_week: tRaw('periods.last_week'),
      last_28d: tRaw('periods.last_28d'),
      last_30d: tRaw('periods.last_30d'),
      this_month: tRaw('periods.this_month'),
      last_month: tRaw('periods.last_month'),
      last_90d: tRaw('periods.last_90d'),
      quarter_to_date: tRaw('periods.quarter_to_date'),
      this_year: tRaw('periods.this_year'),
      last_year: tRaw('periods.last_year')
    }
  };

  return <AdminClient settings={settings} leads={leads} stats={stats} users={users} health={health} t={t} />;
}