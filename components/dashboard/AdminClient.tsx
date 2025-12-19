"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { 
  Shield, CreditCard, Save, Users, Calendar, Download, LayoutDashboard, 
  TrendingUp, Activity, Layers, Megaphone, Handshake, CheckCircle, XCircle, RefreshCw,
  Search, MoreHorizontal, Ban, PlayCircle, Lock, ArrowUpDown, DollarSign, LogIn, 
  Filter, ChevronDown
} from "lucide-react";
import { updateSystemSettings, getPlatformStats, getAdminUsers, updateUserStatus } from "@/app/actions/admin-actions";
import { useRouter } from "next/navigation";
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DateRangeFilter from "@/components/ui/DateRangeFilter"; // Import reusable component

// --- HOOKS ---
function useOutsideClick(ref: any, callback: () => void) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
}

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex items-start justify-between hover:scale-[1.02] transition-transform">
    <div>
      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400">{subtext}</p>
    </div>
    <div className={`p-3 rounded-xl bg-opacity-10 dark:bg-opacity-20 ${color.bg} ${color.text}`}>
      <Icon size={24} />
    </div>
  </div>
);

const PlanChip = ({ label, count, color }: any) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
    <span>{label}</span><span className="bg-white/50 px-1.5 rounded-md text-black/60">{count}</span>
  </div>
);

const ActionMenuDropdown = ({ u, onClose, onAction }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, onClose);

  return (
    <div ref={ref} className="absolute right-10 top-2 w-40 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 flex flex-col p-1 animate-in zoom-in-95 origin-top-right">
      <button onClick={() => onAction(u.id, 'login')} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-left hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg"><LogIn size={14}/> Login as User</button>
      <button onClick={() => onAction(u.id, 'active')} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-left hover:bg-green-50 text-green-600 rounded-lg"><CheckCircle size={14}/> Set Active</button>
      <button onClick={() => onAction(u.id, 'suspended')} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-left hover:bg-orange-50 text-orange-600 rounded-lg"><Lock size={14}/> Suspend</button>
      <button onClick={() => onAction(u.id, 'banned')} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-left hover:bg-red-50 text-red-600 rounded-lg"><Ban size={14}/> Ban User</button>
    </div>
  );
};

const HealthRow = ({ label, active }: any) => (<div className="flex items-center justify-between text-sm"><span className="text-slate-500">{label}</span>{active ? <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle size={14}/> Online</span> : <span className="text-red-500 font-bold flex items-center gap-1"><XCircle size={14}/> Error</span>}</div>);
const StatusRow = ({ label, enabled, isJapan }: any) => (<div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg text-sm"><span className="font-medium flex items-center gap-2">{label} {isJapan && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">JP</span>}</span>{enabled ? <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={14}/> Active</span> : <span className="text-slate-400 font-bold flex items-center gap-1"><XCircle size={14}/> Disabled</span>}</div>);

const ToggleCard = ({ name, label, description, checked, colorClass, isJapan }: any) => (
  <label className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
    <div className="flex flex-col">
      <span className="font-bold flex items-center gap-2">
        {label} {isJapan && <span className="text-[10px] bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300 px-1.5 rounded">JP</span>}
      </span>
      {description && <span className="text-xs text-slate-500 font-normal mt-0.5">{description}</span>}
    </div>
    <div className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" name={name} defaultChecked={checked} className="peer sr-only" />
      <div className={`w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${colorClass}`}></div>
    </div>
  </label>
);

const StatusBadge = ({ status }: { status: string }) => { if (status === 'banned') return <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded"><Ban size={12}/> Banned</span>; if (status === 'suspended') return <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded"><Lock size={12}/> Suspended</span>; return <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded"><CheckCircle size={12}/> Active</span>; };

// --- MAIN CLIENT ---
export default function AdminClient({ settings, leads, stats: initialStats, users: initialUsers, health, t }: any) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(initialStats || {});
  const [users, setUsers] = useState(initialUsers || []);
  const [userSearch, setUserSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', dir: 'desc' });
  const [columns, setColumns] = useState({ plan: true, status: true, stats: true, joined: true, login: true });
  
  const [showColMenu, setShowColMenu] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(colMenuRef, () => setShowColMenu(false));

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const handleDateChange = (start: string, end: string, label: string) => {
    startTransition(async () => {
      const newStats = await getPlatformStats(start, end);
      setStats(newStats);
    });
  };

  const handleUserSearch = (term: string) => {
    setUserSearch(term);
    startTransition(async () => {
      const results = await getAdminUsers(term);
      setUsers(results);
    });
  };

  const handleSort = (key: string) => {
    const dir = sortConfig.key === key && sortConfig.dir === 'desc' ? 'asc' : 'desc';
    setSortConfig({ key, dir });
    const sorted = [...users].sort((a: any, b: any) => {
      let valA = key === 'stats' ? a._count.funnels : a[key];
      let valB = key === 'stats' ? b._count.funnels : b[key];
      if (key === 'createdAt' || key === 'lastLogin') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      }
      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    setUsers(sorted);
  };

  const handleUserAction = async (userId: string, action: string) => {
    setOpenMenuId(null);
    if (!confirm(`Confirm: Set user status to ${action}?`)) return;
    await updateUserStatus(userId, action);
    setUsers(users.map((u: any) => u.id === userId ? { ...u, accountStatus: action } : u));
  };

  const handleSaveSettings = async (formData: FormData) => {
    setSaving(true);
    const enableStripe = formData.get("enableStripe") === "on";
    const enableUniva = formData.get("enableUniva") === "on";
    const enableAqua = formData.get("enableAqua") === "on";
    await updateSystemSettings({ enableStripe, enableUniva, enableAqua });
    alert(t?.saved || "Saved!");
    router.refresh(); 
    setSaving(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto text-slate-900 dark:text-white pb-20">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl shadow-sm"><Shield size={32} /></div>
          <div><h1 className="text-3xl font-bold tracking-tight">{t?.title}</h1><p className="text-slate-500 font-medium">{t?.subtitle}</p></div>
        </div>
        
        {/* NEW REUSABLE FILTER COMPONENT */}
        {activeTab === 'overview' && (
          <DateRangeFilter 
            mode="state"
            translations={t?.periods || {}}
            onFilterChange={handleDateChange}
          />
        )}
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl mb-8 w-fit overflow-x-auto">
        {[
          { id: 'overview', icon: LayoutDashboard, label: t?.tabs?.overview },
          { id: 'users', icon: Users, label: t?.tabs?.users },
          { id: 'settings', icon: CreditCard, label: t?.tabs?.config },
          { id: 'waitlist', icon: Activity, label: t?.tabs?.leads, count: leads?.length }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <tab.icon size={16}/> {tab.label} {tab.count !== undefined && <span className="bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* --- OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-2 ${isPending ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
          
          <div className="flex gap-4 overflow-x-auto pb-2">
            <PlanChip label="Starter" count={stats.plans?.starter || 0} color="bg-blue-100 text-blue-700" />
            <PlanChip label="Pro" count={stats.plans?.pro || 0} color="bg-purple-100 text-purple-700" />
            <PlanChip label="Agency" count={stats.plans?.agency || 0} color="bg-orange-100 text-orange-700" />
            <PlanChip label="Trial" count={stats.plans?.free || 0} color="bg-slate-100 text-slate-700" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Syncra MRR" value={`¥${stats.mrr?.toLocaleString()}`} subtext="Excl. Staff/Managers" icon={TrendingUp} color={{bg:'bg-green-500', text:'text-green-500'}} />
            <StatCard title="Total Merchants" value={stats.totalMerchants} subtext="Paying Customers" icon={Users} color={{bg:'bg-blue-500', text:'text-blue-500'}} />
            <StatCard title="Total End-Users" value={stats.totalContacts} subtext="Contacts in DB" icon={Activity} color={{bg:'bg-orange-500', text:'text-orange-500'}} />
            <StatCard 
  title="Total Funnels" 
  value={stats.totalFunnels} // Now shows only LIVE
  // Update subtext to show drafts
  subtext={`${stats.draftFunnels || 0} Drafts • Pages Published`} 
  icon={Layers} 
  color={{bg:'bg-purple-500', text:'text-purple-500'}} 
/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Merchants' GMV" value={`¥${stats.totalGmv?.toLocaleString()}`} subtext="Total Sales Volume" icon={DollarSign} color={{bg:'bg-indigo-500', text:'text-indigo-500'}} />
            <StatCard title="Events Created" value={stats.totalEvents} subtext="Webinars/Seminars" icon={Megaphone} color={{bg:'bg-pink-500', text:'text-pink-500'}} />
            <StatCard title="Calendars" value={stats.totalCalendars} subtext="Booking Types" icon={Calendar} color={{bg:'bg-cyan-500', text:'text-cyan-500'}} />
            <StatCard title="Affiliates" value={stats.totalAffiliates} subtext="Registered Partners" icon={Handshake} color={{bg:'bg-yellow-500', text:'text-yellow-500'}} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-96">
            <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold">Revenue Trends</h3>
                <div className="flex gap-4 text-xs font-bold">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-500 rounded-full"/> Merchant Sales</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"/> Syncra Revenue</div>
                </div>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.graphData || []}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(val)=>`¥${val/1000}k`} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm h-full overflow-y-auto">
              <h3 className="font-bold mb-6 flex items-center gap-2"><Activity size={18} /> {t?.status?.title}</h3>
              <div className="space-y-4">
                <StatusRow label="Stripe Connect" enabled={settings.enableStripe} />
                <StatusRow label="UnivaPay API" enabled={settings.enableUniva} isJapan />
                <StatusRow label="AQUAGATES" enabled={settings.enableAqua} isJapan />
                <div className="h-px bg-slate-100 dark:bg-white/5 my-4" />
                <div className="space-y-3">
                  <HealthRow label="Database" active={health?.database} />
                  <HealthRow label="Stripe Webhooks" active={health?.stripeWebhook} />
                  <HealthRow label="Resend (Email)" active={health?.resend} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- USERS --- */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search..." value={userSearch} onChange={(e) => handleUserSearch(e.target.value)} className="w-full pl-10 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] outline-none" />
            </div>
            
            <div className="relative" ref={colMenuRef}>
              <button onClick={() => setShowColMenu(!showColMenu)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5"><Filter size={14}/> Columns</button>
              {showColMenu && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 p-2 space-y-1">
                  {Object.keys(columns).map(col => (<label key={col} className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded cursor-pointer"><input type="checkbox" checked={columns[col as keyof typeof columns]} onChange={(e) => setColumns({...columns, [col]: e.target.checked})} className="rounded text-purple-600" /><span className="text-xs font-bold capitalize">{col}</span></label>))}
                </div>
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-white/10 overflow-visible shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 font-bold uppercase text-xs">
                <tr><th className="p-4">Merchant</th>{columns.plan && <th className="p-4 cursor-pointer" onClick={()=>handleSort('plan')}>Plan <ArrowUpDown size={12} className="inline"/></th>}{columns.status && <th className="p-4 cursor-pointer" onClick={()=>handleSort('accountStatus')}>Status <ArrowUpDown size={12} className="inline"/></th>}{columns.stats && <th className="p-4 cursor-pointer" onClick={()=>handleSort('stats')}>Stats <ArrowUpDown size={12} className="inline"/></th>}{columns.joined && <th className="p-4 cursor-pointer" onClick={()=>handleSort('createdAt')}>Joined <ArrowUpDown size={12} className="inline"/></th>}{columns.login && <th className="p-4 cursor-pointer" onClick={()=>handleSort('lastLogin')}>Last Login <ArrowUpDown size={12} className="inline"/></th>}<th className="p-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 relative">
                    <td className="p-4"><div className="font-bold">{u.name}</div><div className="text-xs text-slate-500">{u.email}</div></td>
                    {columns.plan && <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.plan === 'agency' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>{u.plan}</span></td>}
                    {columns.status && <td className="p-4"><StatusBadge status={u.accountStatus} /></td>}
                    {columns.stats && <td className="p-4 text-xs"><div className="flex items-center gap-1"><Layers size={12}/> {u._count.funnels}</div><div className="flex items-center gap-1 mt-1 text-slate-500">{u.stripeConnectOnboarded ? <CheckCircle size={12} className="text-green-500"/> : <XCircle size={12}/>} Stripe</div></td>}
                    {columns.joined && <td className="p-4 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>}
                    {columns.login && <td className="p-4 text-xs text-slate-500">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "-"}</td>}
                    <td className="p-4 text-right relative">
                      <button onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-900"><MoreHorizontal size={16}/></button>
                      
                      {openMenuId === u.id && (
                        <ActionMenuDropdown u={u} onClose={() => setOpenMenuId(null)} onAction={handleUserAction} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SETTINGS --- */}
      {activeTab === 'settings' && (
        <form action={handleSaveSettings} className="bg-white dark:bg-[#1E293B] p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm max-w-3xl animate-in fade-in slide-in-from-bottom-2">
          <div className="mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">{t?.config?.gateways}</h3>
            <p className="text-sm text-slate-500 mt-1">{t?.config?.gateways_subtitle || "Toggle providers on/off globally."}</p>
          </div>
          
          <div className="space-y-4">
            <ToggleCard 
              name="enableStripe" 
              label="Stripe Connect" 
              description={t?.config?.stripe_desc || "Standard card processing."} 
              checked={settings.enableStripe} 
              colorClass="peer-checked:bg-green-500" 
            />
            <ToggleCard 
              name="enableUniva" 
              label="UnivaPay API" 
              description={t?.config?.univa_desc || "High-risk friendly gateway."}
              checked={settings.enableUniva} 
              colorClass="peer-checked:bg-green-500" 
              isJapan 
            />
            <ToggleCard 
              name="enableAqua" 
              label="AQUAGATES" 
              description={t?.config?.aqua_desc || "Alternative gateway."}
              checked={settings.enableAqua} 
              colorClass="peer-checked:bg-green-500" 
              isJapan 
            />
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all">{saving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18} />} {t?.config?.save}</button>
          </div>
        </form>
      )}

      {activeTab === 'waitlist' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
           <div className="overflow-x-auto">
            {leads && leads.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 font-bold uppercase text-xs"><tr><th className="p-4">Email</th><th className="p-4">Source</th><th className="p-4">Registered At</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">{leads.map((lead:any) => (<tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-white/5"><td className="p-4 font-medium">{lead.email}</td><td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">{lead.source}</span></td><td className="p-4 text-slate-500 flex items-center gap-2"><Calendar size={14}/> {new Date(lead.createdAt).toLocaleDateString()}</td></tr>))}</tbody>
              </table>
            ) : <div className="p-8 text-center text-slate-400 italic">No legacy leads found.</div>}
           </div>
        </div>
      )}
    </div>
  );
}