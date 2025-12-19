import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClient from "@/components/dashboard/SettingsClient";
import { getTranslations } from 'next-intl/server';

export default async function SettingsPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // 1. Fetch User with ALL Payment & LINE fields
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { 
      id: true,
      name: true, 
      email: true,
      // LINE
      lineChannelId: true,
      lineChannelSecret: true,
      lineAccessToken: true,
      // STRIPE
      stripeAccountId: true,
      stripeConnectOnboarded: true,
      // UNIVAPAY
      univaStoreId: true,
      univaAppToken: true,
      univaSecret: true,
      // AQUAGATES
      aquaSiteId: true,
      aquaAccessToken: true
    } 
  });

  if (!user) redirect("/login");

  // 2. Fetch Global System Settings (to know what is enabled)
  let systemSettings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  
  // Default fallback if not set yet
  if (!systemSettings) {
    systemSettings = { id: "global", enableStripe: true, enableUniva: false, enableAqua: false, updatedAt: new Date() };
  }

  const t = await getTranslations({ locale: params.locale, namespace: 'Settings' });

  return (
    <div className="p-6 md:p-10 space-y-8 text-slate-900 dark:text-white pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">{t('subtitle')}</p>
      </div>
      
      {/* Pass both User Data and System Settings to the Client */}
      <SettingsClient user={user} systemSettings={systemSettings} />
    </div>
  );
}