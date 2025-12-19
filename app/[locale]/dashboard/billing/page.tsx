import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreditCard } from "lucide-react";
import { createCustomerPortal } from "@/app/actions/billing-actions";
import { PricingTable } from "@/components/dashboard/PricingTable";
import { getTranslations } from "next-intl/server";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");
  const t = await getTranslations("Pricing");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // Pass ENV vars safely to client
  const prices = {
    starter: { m: process.env.STRIPE_STARTER_MONTHLY!, y: process.env.STRIPE_STARTER_YEARLY! },
    pro: { m: process.env.STRIPE_PRO_MONTHLY!, y: process.env.STRIPE_PRO_YEARLY! },
    agency: { m: process.env.STRIPE_AGENCY_MONTHLY!, y: process.env.STRIPE_AGENCY_YEARLY! },
  };

  const isPaidUser = user?.plan !== "free" && user?.subscriptionStatus === "active";

  return (
    <div className="p-10 text-slate-900 dark:text-white max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-slate-500 mb-10">{t('subtitle')}</p>

      {/* MANAGE SUBSCRIPTION BUTTON (Only if they paid) */}
      {isPaidUser && (
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm mb-10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{t('current_plan')}</h3>
            <p className="text-slate-500">
              Active Plan: <span className="font-bold text-purple-600 uppercase">{user?.plan}</span>
            </p>
          </div>
          <form action={async () => {
            "use server";
            const res = await createCustomerPortal();
            if (res?.url) redirect(res.url);
          }}>
            <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">
              <CreditCard className="h-4 w-4" /> {t('manage_btn')}
            </button>
          </form>
        </div>
      )}

      {/* PRICING TABLE COMPONENT */}
      <PricingTable currentPlan={user?.plan} prices={prices} />
    </div>
  );
}