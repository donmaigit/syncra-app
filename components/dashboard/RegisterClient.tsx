"use client";

import { useState } from "react";
import { registerUser } from "@/app/actions/register-actions";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, User, Mail, Lock, Globe, Check } from "lucide-react";
import { useTranslations } from "next-intl";

export default function RegisterClient() {
  const t = useTranslations('Register');
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    email: "",
    password: "",
    subdomain: "",
    plan: "starter" 
  });

  const handleChange = (field: string, val: string) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.lastName || !form.firstName || !form.email || !form.password) {
        setError(t('error_missing_fields'));
        return;
      }
    }
    setError("");
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!form.subdomain) { setError(t('error_missing_subdomain')); return; }
    setLoading(true);
    setError("");

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));

    const res = await registerUser(formData);
    
    if (res?.success) {
      router.push("/login?registered=true");
    } else {
      setError(res?.error || t('error_failed'));
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <div className="p-8 bg-slate-50 dark:bg-white/5 text-center border-b border-slate-100 dark:border-white/5">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('title')}</h2>
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3].map(i => <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? 'w-8 bg-purple-600' : 'w-2 bg-slate-200 dark:bg-white/10'}`} />)}
        </div>
      </div>

      <div className="p-8 flex-1">
        {error && <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-bold">{error}</div>}

        {/* STEP 1: ACCOUNT */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('last_name')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} className="w-full pl-9 p-2 border rounded-lg bg-slate-50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-purple-500" placeholder={t('last_name_ph')} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('first_name')}</label>
                <input value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-purple-500" placeholder={t('first_name_ph')} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full pl-9 p-2 border rounded-lg bg-slate-50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-purple-500" placeholder="you@company.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} className="w-full pl-9 p-2 border rounded-lg bg-slate-50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••" />
              </div>
            </div>
            <button onClick={handleNext} className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl mt-4 hover:bg-purple-700 transition-all flex items-center justify-center gap-2">{t('next')} <ArrowRight size={16} /></button>
          </div>
        )}

        {/* STEP 2: WORKSPACE */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">{t('workspace_title')}</h3>
              <p className="text-sm text-slate-500">{t('workspace_desc')}</p>
            </div>
            <div className="relative">
              <Globe className="absolute left-3 top-3 text-slate-400" size={20} />
              <input value={form.subdomain} onChange={(e) => handleChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="w-full pl-10 pr-32 py-3 border-2 border-purple-100 rounded-xl bg-white dark:bg-black/20 outline-none focus:border-purple-500 text-lg font-bold" placeholder="brandname" />
              <div className="absolute right-4 top-3.5 text-slate-400 font-bold">.syncra.page</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">{t('back')}</button>
              <button onClick={handleNext} className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700">{t('next')}</button>
            </div>
          </div>
        )}

        {/* STEP 3: PLAN */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center"><h3 className="text-lg font-bold">{t('plan_title')}</h3></div>
            <div className="space-y-3">
              {[ { id: 'starter', name: 'Starter', price: '¥4,980' }, { id: 'pro', name: 'Pro', price: '¥9,980', rec: true }, { id: 'agency', name: 'Agency', price: '¥29,800' } ].map((p) => (
                <div key={p.id} onClick={() => handleChange('plan', p.id)} className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${form.plan === p.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-100 hover:border-slate-200 dark:border-white/10'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.plan === p.id ? 'border-purple-600' : 'border-slate-300'}`}>{form.plan === p.id && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}</div>
                    <div><span className="font-bold text-sm block">{p.name}</span>{p.rec && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">Recommended</span>}</div>
                  </div>
                  <div className="font-mono font-bold">{p.price}<span className="text-xs text-slate-400">/mo</span></div>
                </div>
              ))}
            </div>
            <button onClick={handleSubmit} disabled={loading} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin" /> : <>{t('complete')} <Check size={18}/></>}</button>
          </div>
        )}
      </div>
    </div>
  );
}