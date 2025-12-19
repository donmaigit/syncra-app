import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Globe, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
// FIX: Kept your original Named Imports to prevent build errors
import { ClientSettingsForm } from "@/components/dashboard/ClientSettingsForm";
import { DomainSettingsForm } from "@/components/dashboard/DomainSettingsForm";

export default async function FunnelSettingsPage({ params }: { params: { funnelId: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/");
  }

  // OPTIMIZED QUERY: Fetch Funnel + User Data in one go
  const funnel = await prisma.funnel.findUnique({
    where: { id: params.funnelId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          subdomain: true,
          plan: true
        }
      }
    }
  });

  // Security Check: Ensure funnel exists and belongs to user
  if (!funnel || funnel.user.email !== session.user.email) {
    redirect("/dashboard/funnels");
  }

  const plan = funnel.user.plan || "free";
  const canUseCustomDomain = plan === "pro" || plan === "agency";

  return (
    <div className="p-6 md:p-10 max-w-4xl text-slate-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-8">Funnel Settings</h1>

      {/* 1. GENERAL SETTINGS */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-8 mb-8 shadow-sm">
        {/* FIX: Handle nullable subdomain with fallback */}
        <ClientSettingsForm funnel={funnel} subdomain={funnel.user.subdomain ?? ""} />
      </div>

      {/* 2. CUSTOM DOMAIN SECTION */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
            <Globe className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">Custom Domain</h3>
            <p className="text-slate-500 text-sm mb-6">
              Connect your own domain (e.g., <code>mybrand.com</code> or <code>pages.mybrand.com</code>) to this funnel.
            </p>

            {/* DNS Instructions */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg mb-6 text-sm border border-slate-100 dark:border-white/5">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> DNS Setup Instructions:
              </h4>
              <p className="mb-1">1. Go to your domain provider.</p>
              <p className="mb-1">2. Create a <strong>CNAME</strong> record.</p>
              <p className="mb-1">3. Name: <code>{funnel.slug}</code> (or your chosen subdomain)</p>
              <p>4. Value/Target: <code>cname.syncra.page</code></p>
            </div>

            {canUseCustomDomain ? (
              <DomainSettingsForm funnelId={funnel.id} currentDomain={funnel.customDomain} />
            ) : (
              <div className="flex items-center gap-4 bg-slate-100 dark:bg-black/40 p-4 rounded-lg border border-slate-200 dark:border-white/5 opacity-75">
                <Lock className="h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="font-bold text-slate-500">Custom Domains are locked.</p>
                  <p className="text-xs text-slate-400">Upgrade to Pro to connect your own domain.</p>
                </div>
                <a href="/dashboard/billing" className="text-blue-500 text-sm font-bold hover:underline">Upgrade</a>
              </div>
            )}
            
            {funnel.customDomain && (
              <div className="mt-4 flex items-center gap-2 text-green-500 text-sm font-bold">
                <CheckCircle2 className="h-4 w-4" /> Connected: <a href={`https://${funnel.customDomain}`} target="_blank" className="hover:underline">{funnel.customDomain}</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}