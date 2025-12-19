"use client";

import { useState, useEffect } from "react";
import { User, CreditCard, Users, Save, ExternalLink, MessageCircle, CheckCircle, Smartphone, Trash2, Key, Copy } from "lucide-react";
import { updateProfile, updateLineSettings, updatePaymentSettings } from "@/app/actions/settings-actions";
import { createStripeConnectAccount, getStripeStatus, getStripeLoginLink } from "@/app/actions/stripe-actions";
import { inviteTeamMember, getTeamMembers, removeTeamMember } from "@/app/actions/team-actions";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function SettingsClient({ user, systemSettings }: { user: any, systemSettings?: any }) {
  const t = useTranslations('Settings');
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  
  // --- PROFILE STATE ---
  const [formData, setFormData] = useState({ 
    lastName: user.lastName || "", 
    firstName: user.firstName || "", 
    email: user.email || "" 
  });

  // Fallback for legacy data
  useEffect(() => {
    if ((!user.lastName && !user.firstName) && user.name) {
      const parts = user.name.split(' ');
      const last = parts[0] || "";
      const first = parts.slice(1).join(' ') || "";
      setFormData(prev => ({ ...prev, lastName: last, firstName: first }));
    }
  }, [user]);
  
  // LINE State
  const [lineData, setLineData] = useState({
    channelId: user.lineChannelId || "",
    channelSecret: user.lineChannelSecret || "",
    accessToken: user.lineAccessToken || ""
  });

  // Payment State
  const [payData, setPayData] = useState({
    univaStoreId: user.univaStoreId || "",
    univaAppToken: user.univaAppToken || "",
    univaSecret: user.univaSecret || "",
    aquaSiteId: user.aquaSiteId || "",
    aquaAccessToken: user.aquaAccessToken || ""
  });

  const [stripeConnected, setStripeConnected] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.syncra.jp';
  const univaWebhook = `${origin}/api/webhooks/univapay/${user.id}`;
  const aquaWebhook = `${origin}/api/webhooks/aquagates/${user.id}`;

  useEffect(() => {
    if (activeTab === 'billing') getStripeStatus().then(res => setStripeConnected(res.connected));
    if (activeTab === 'team') getTeamMembers().then(setMembers);
  }, [activeTab]);

  // HANDLERS
  const handleSaveProfile = async () => {
    setLoading(true);
    const res = await updateProfile(formData);
    if (res.success) { alert(t('profile.save_success')); router.refresh(); }
    setLoading(false);
  };

  const handleSaveLine = async () => {
    setLoading(true);
    const res = await updateLineSettings(lineData);
    if (res.success) { alert(t('integrations.save_success')); router.refresh(); } else { alert(t('integrations.save_error')); }
    setLoading(false);
  };

  const handleSavePayments = async () => {
    setLoading(true);
    const res = await updatePaymentSettings(payData);
    if (res.success) { alert(t('billing.payment_saved')); router.refresh(); } else { alert(t('billing.payment_error')); }
    setLoading(false);
  };

  const handleConnectStripe = async () => {
    setLoading(true);
    const res = await createStripeConnectAccount();
    if (res.url) window.location.href = res.url;
    else alert("Stripe Error: " + res.error);
    setLoading(false);
  };

  const handleStripeDashboard = async () => {
    const res = await getStripeLoginLink();
    if (res.url) window.open(res.url, '_blank');
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setLoading(true);
    const form = new FormData();
    form.append("email", inviteEmail);
    const res = await inviteTeamMember(form);
    if (res.success) { setInviteEmail(""); setMembers(await getTeamMembers()); } else { alert(res.error); }
    setLoading(false);
  };

  const handleRemoveMember = async (id: string) => {
    if(!confirm(t('team.confirm_remove'))) return;
    await removeTeamMember(id);
    setMembers(members.filter(m => m.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t('common.copied'));
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* SIDEBAR */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        {['general', 'billing', 'integrations', 'team'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-purple-50 text-purple-700 dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
          >
            {tab === 'general' && <User size={18}/>}
            {tab === 'billing' && <CreditCard size={18}/>}
            {tab === 'integrations' && <MessageCircle size={18}/>}
            {tab === 'team' && <Users size={18}/>}
            {t(`menu.${tab}`)}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="flex-1 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-8 shadow-sm">
        
        {/* --- GENERAL --- */}
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-lg">
            <div><h3 className="text-lg font-bold mb-1">{t('profile.title')}</h3><p className="text-sm text-slate-500">{t('profile.desc')}</p></div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">{t('profile.last_name')}</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-white/5" placeholder={t('profile.last_name_ph')} />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">{t('profile.first_name')}</label>
                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-white/5" placeholder={t('profile.first_name_ph')} />
                </div>
              </div>
              <div><label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">{t('profile.email')}</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-white/5" /></div>
            </div>
            <button onClick={handleSaveProfile} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50">{loading ? t('profile.saving') : t('profile.save')}</button>
          </div>
        )}

        {/* --- BILLING --- */}
        {activeTab === 'billing' && (
          <div className="space-y-10">
            {systemSettings?.enableStripe !== false && (
              <div className="space-y-4">
                <div><h3 className="text-lg font-bold">Stripe Connect</h3><p className="text-sm text-slate-500">{t('billing.stripe_desc')}</p></div>
                <div className="p-6 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${stripeConnected ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>{stripeConnected ? <CheckCircle size={24} /> : <CreditCard size={24} />}</div>
                    <div><h4 className="font-bold text-slate-900 dark:text-white">Stripe Connect</h4><p className="text-sm text-slate-500">{stripeConnected ? t('billing.connected') : t('billing.not_connected')}</p></div>
                  </div>
                  {stripeConnected ? <button onClick={handleStripeDashboard} className="flex items-center gap-2 px-4 py-2 border rounded-lg font-bold">{t('billing.view_dashboard')} <ExternalLink size={16} /></button> : <button onClick={handleConnectStripe} disabled={loading} className="px-6 py-3 bg-[#635BFF] text-white rounded-lg font-bold shadow-md">{loading ? t('billing.connecting') : t('billing.connect_stripe')}</button>}
                </div>
              </div>
            )}

            {systemSettings?.enableUniva && (
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                <div><h3 className="text-lg font-bold flex items-center gap-2"><Key size={20} className="text-orange-500"/> UnivaPay</h3><p className="text-sm text-slate-500">{t('billing.univa_desc')}</p></div>
                <div className="grid grid-cols-1 gap-4 max-w-lg">
                  <div><label className="block text-xs font-bold uppercase mb-1">Store ID</label><input type="text" value={payData.univaStoreId} onChange={(e) => setPayData({...payData, univaStoreId: e.target.value})} className="w-full p-2 border rounded bg-white dark:bg-white/5 text-sm font-mono"/></div>
                  <div><label className="block text-xs font-bold uppercase mb-1">App Token</label><input type="text" value={payData.univaAppToken} onChange={(e) => setPayData({...payData, univaAppToken: e.target.value})} className="w-full p-2 border rounded bg-white dark:bg-white/5 text-sm font-mono"/></div>
                  <div><label className="block text-xs font-bold uppercase mb-1">Secret Key</label><input type="password" value={payData.univaSecret} onChange={(e) => setPayData({...payData, univaSecret: e.target.value})} className="w-full p-2 border rounded bg-white dark:bg-white/5 text-sm font-mono"/></div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-xs text-blue-800 dark:text-blue-300">
                    <p className="font-bold mb-1">{t('billing.webhook_title')}</p>
                    <div className="flex items-center gap-2 bg-white dark:bg-black/20 p-2 rounded border border-blue-200 dark:border-blue-800"><code className="flex-1 truncate">{univaWebhook}</code><button onClick={() => copyToClipboard(univaWebhook)} className="text-blue-600 hover:text-blue-800"><Copy size={14}/></button></div>
                  </div>
                </div>
              </div>
            )}

            {systemSettings?.enableAqua && (
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                <div><h3 className="text-lg font-bold flex items-center gap-2"><Key size={20} className="text-blue-500"/> AQUAGATES</h3><p className="text-sm text-slate-500">{t('billing.aqua_desc')}</p></div>
                <div className="grid grid-cols-1 gap-4 max-w-lg">
                  <div><label className="block text-xs font-bold uppercase mb-1">Site ID</label><input type="text" value={payData.aquaSiteId} onChange={(e) => setPayData({...payData, aquaSiteId: e.target.value})} className="w-full p-2 border rounded bg-white dark:bg-white/5 text-sm font-mono"/></div>
                  <div><label className="block text-xs font-bold uppercase mb-1">Access Token</label><input type="password" value={payData.aquaAccessToken} onChange={(e) => setPayData({...payData, aquaAccessToken: e.target.value})} className="w-full p-2 border rounded bg-white dark:bg-white/5 text-sm font-mono"/></div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-xs text-blue-800 dark:text-blue-300">
                    <p className="font-bold mb-1">{t('billing.webhook_title')}</p>
                    <div className="flex items-center gap-2 bg-white dark:bg-black/20 p-2 rounded border border-blue-200 dark:border-blue-800"><code className="flex-1 truncate">{aquaWebhook}</code><button onClick={() => copyToClipboard(aquaWebhook)} className="text-blue-600 hover:text-blue-800"><Copy size={14}/></button></div>
                  </div>
                </div>
              </div>
            )}

            {(systemSettings?.enableUniva || systemSettings?.enableAqua) && (
              <div className="pt-4"><button onClick={handleSavePayments} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"><Save size={18} /> {loading ? t('profile.saving') : t('billing.save_payment')}</button></div>
            )}
          </div>
        )}

        {/* --- INTEGRATIONS --- */}
        {activeTab === 'integrations' && (
          <div className="space-y-8">
            <div><h3 className="text-lg font-bold mb-1 flex items-center gap-2"><Smartphone size={20} className="text-[#06C755]"/> {t('integrations.line_title')}</h3><p className="text-sm text-slate-500">{t('integrations.line_desc')}</p></div>
            <div className="space-y-4 max-w-lg">
              <div><label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">{t('integrations.channel_id')}</label><input type="text" value={lineData.channelId} onChange={(e) => setLineData({...lineData, channelId: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-white/5 font-mono text-sm" /></div>
              <div><label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">{t('integrations.channel_secret')}</label><input type="password" value={lineData.channelSecret} onChange={(e) => setLineData({...lineData, channelSecret: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-white/5 font-mono text-sm" /></div>
              <div><label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">{t('integrations.access_token')}</label><textarea rows={3} value={lineData.accessToken} onChange={(e) => setLineData({...lineData, accessToken: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-white/5 font-mono text-xs" /></div>
              <div className="pt-4"><button onClick={handleSaveLine} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-[#06C755] text-white rounded-lg font-bold hover:opacity-90 transition-all"><Save size={18} /> {loading ? t('integrations.saving') : t('integrations.save')}</button></div>
            </div>
          </div>
        )}

        {/* --- TEAM --- */}
        {activeTab === 'team' && (
          <div className="space-y-8">
            <div><h3 className="text-lg font-bold mb-1">{t('team.title')}</h3><p className="text-sm text-slate-500">{t('team.desc')}</p></div>
            <div className="flex gap-2">
              <input type="email" placeholder={t('team.invite_placeholder')} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="flex-1 p-3 border rounded-lg bg-white dark:bg-white/5" />
              <button onClick={handleInvite} disabled={loading || !inviteEmail} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold hover:opacity-90">{loading ? t('team.sending') : t('team.invite_btn')}</button>
            </div>
            <div className="space-y-4">
              {members.length === 0 ? <p className="text-center py-8 text-slate-400 text-sm">{t('team.no_invites')}</p> : members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{m.email.charAt(0).toUpperCase()}</div>
                      <div><div className="font-bold text-sm dark:text-white">{m.email}</div><div className="text-xs text-slate-500 capitalize flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${m.status === 'accepted' ? 'bg-green-500' : 'bg-amber-500'}`} />{m.status}</div></div>
                    </div>
                    <button onClick={() => handleRemoveMember(m.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}