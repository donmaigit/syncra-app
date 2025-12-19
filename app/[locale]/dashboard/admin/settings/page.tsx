import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateSystemSettings } from "@/app/actions/admin-actions";
import { Shield, CreditCard, Save } from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  // Simple check - in production, check specific email or role
  if (!session || session.user.role !== 'admin') redirect('/dashboard');

  // Fetch or create default settings
  let settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: { id: "global" } });
  }

  async function saveSettings(formData: FormData) {
    "use server";
    const enableStripe = formData.get("enableStripe") === "on";
    const enableUniva = formData.get("enableUniva") === "on";
    const enableAqua = formData.get("enableAqua") === "on";
    
    await updateSystemSettings({ enableStripe, enableUniva, enableAqua });
  }

  return (
    <div className="p-10 max-w-4xl mx-auto text-slate-900 dark:text-white">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-red-100 text-red-600 rounded-lg"><Shield size={24} /></div>
        <div>
          <h1 className="text-3xl font-bold">Platform Administration</h1>
          <p className="text-slate-500">Global settings for all merchants.</p>
        </div>
      </div>

      <form action={saveSettings} className="bg-white dark:bg-[#1E293B] p-8 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm space-y-8">
        
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><CreditCard size={20}/> Payment Gateways</h3>
          <p className="text-sm text-slate-500 mb-6">Enable or disable payment providers globally. Merchants will only see enabled options.</p>
          
          <div className="space-y-4">
            {/* Stripe */}
            <label className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/10 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5">
              <div>
                <span className="font-bold block">Stripe Connect</span>
                <span className="text-xs text-slate-500">Standard credit card & subscriptions.</span>
              </div>
              <input type="checkbox" name="enableStripe" defaultChecked={settings.enableStripe} className="w-6 h-6 accent-purple-600" />
            </label>

            {/* UnivaPay */}
            <label className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/10 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5">
              <div>
                <span className="font-bold block">UnivaPay API</span>
                <span className="text-xs text-slate-500">Japanese local gateway. High-risk friendly.</span>
              </div>
              <input type="checkbox" name="enableUniva" defaultChecked={settings.enableUniva} className="w-6 h-6 accent-purple-600" />
            </label>

            {/* AQUAGATES */}
            <label className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/10 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5">
              <div>
                <span className="font-bold block">AQUAGATES</span>
                <span className="text-xs text-slate-500">Alternative gateway for specific industries.</span>
              </div>
              <input type="checkbox" name="enableAqua" defaultChecked={settings.enableAqua} className="w-6 h-6 accent-purple-600" />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
          <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg font-bold hover:opacity-90">
            <Save size={18} /> Save Global Settings
          </button>
        </div>

      </form>
    </div>
  );
}