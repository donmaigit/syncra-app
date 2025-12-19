import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DollarSign, ExternalLink, AlertCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CopyButton } from "@/components/dashboard/CopyButton";

export default async function PartnerPortalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");

  // 1. Get Affiliate Profile
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { affiliateProfile: true }
  });

  const affiliate = user?.affiliateProfile;

  // 2. Fetch Available Campaigns
  const campaigns = await prisma.affiliateCampaign.findMany({
    where: { isActive: true },
    include: { 
      funnel: {
        include: {
          user: { select: { subdomain: true } }
        }
      } 
    }
  });

  if (!affiliate) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
        <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-6 text-purple-600">
          <DollarSign className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Become a Partner</h1>
        <p className="text-slate-500 mb-8">
          Join our affiliate program and earn commissions by promoting high-converting funnels.
        </p>
        <form action={async () => {
          "use server";
          const session = await getServerSession(authOptions);
          if(!session?.user?.email) return;
          
          const user = await prisma.user.findUnique({ where: { email: session.user.email }});
          if(!user) return;

          const code = (user.name || "user").toLowerCase().replace(/\s/g, '-') + "-" + Math.floor(Math.random()*1000);
          
          await prisma.affiliate.create({
            data: { userId: user.id, code }
          });
          redirect("/dashboard/partner");
        }}>
          <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg">
            Activate Partner Account
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 text-slate-900 dark:text-white max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-purple-500" /> Partner Portal
        </h1>
        <p className="text-slate-500">Promote offers and track your earnings.</p>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-sm text-slate-500 font-bold uppercase mb-2">Unpaid Balance</div>
          <div className="text-3xl font-bold">¥{affiliate.balance.toLocaleString()}</div>
        </div>
        <div className="p-6 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-sm text-slate-500 font-bold uppercase mb-2">Your Code</div>
          <div className="text-2xl font-mono bg-slate-100 dark:bg-black/20 p-2 rounded inline-block">
            {affiliate.code}
          </div>
        </div>
        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
            <AlertCircle className="h-5 w-5" /> Payout Info
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Payouts are processed manually at the end of each month for balances over ¥5,000.
          </p>
        </div>
      </div>

      {/* CAMPAIGNS LIST */}
      <h2 className="text-xl font-bold mb-6">Active Offers</h2>
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <p className="text-slate-500 italic">No active campaigns available right now.</p>
        ) : (
          campaigns.map(camp => {
            const subdomain = camp.funnel.user.subdomain;
            const slug = camp.funnel.slug;
            const affiliateLink = `https://${subdomain}.syncra.page/${slug}?ref=${affiliate.code}`;
            
            return (
              <div key={camp.id} className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold">{camp.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-0.5 rounded font-bold">
                      Commission: {camp.type === 'percent' ? `${camp.value}%` : `¥${camp.value}`}
                    </span>
                    <span>•</span>
                    <span>Funnel: {camp.funnel.name}</span>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-black/20 p-2 rounded-lg border border-slate-200 dark:border-white/5">
                    <code className="text-xs text-slate-500 truncate max-w-[200px]">{affiliateLink}</code>
                    <CopyButton text={affiliateLink} />
                  </div>
                  <a href={affiliateLink} target="_blank" className="text-xs text-center text-blue-500 hover:underline flex items-center justify-center gap-1">
                    Test Link <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}