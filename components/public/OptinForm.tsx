"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, ArrowRight, ShieldCheck, MapPin, Mail, Phone, Smartphone, User, Building } from "lucide-react";
import { saveLead } from "@/app/actions/contact-actions"; 
import { useRouter } from "next/navigation";

interface OptinFormProps {
  funnelId: string;
  title?: string;
  buttonText?: string;
  fields?: { 
    showName?: boolean; 
    showPhone?: boolean; 
    showAddress?: boolean; 
    enableZipAutoFill?: boolean; 
    useLineLogin?: boolean;
  };
  redirectUrl?: string;
  successMessage?: string;
  styles?: {
    buttonColor?: string;
    buttonTextColor?: string;
    fontWeight?: string;
    fontSize?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textShadow?: string;
    [key: string]: any;
  };
}

export default function OptinForm({ 
  funnelId, title, buttonText, fields, redirectUrl, successMessage, styles 
}: OptinFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [zip, setZip] = useState("");
  const [pref, setPref] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/-/g, '');
    setZip(val);
    if (fields?.enableZipAutoFill && val.length === 7) {
      try {
        const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${val}`);
        const data = await res.json();
        if (data.results) {
          const { address1, address2, address3 } = data.results[0]; 
          setPref(address1);
          setCity(address2 + address3);
        }
      } catch(e) { console.error(e); }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      funnelId,
      email: formData.get("email") as string,
      lastName: formData.get("lastName") as string,
      firstName: formData.get("firstName") as string,
      phone: formData.get("phone") as string || "",
      zip: formData.get("zip") as string || "",
      prefecture: formData.get("prefecture") as string || "",
      city: formData.get("city") as string || "",
      street: formData.get("street") as string || "",
      building: formData.get("building") as string || ""
    };
    try {
      const res = await saveLead(data); 
      if (res?.success) {
        setSuccess(true);
        if (redirectUrl) setTimeout(() => router.push(redirectUrl), 1500);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleLineLogin = () => {
    window.location.href = `/api/auth/line/login?funnelId=${funnelId}`;
  };

  if (success) {
    return (
      <div className="p-8 text-center bg-green-50 rounded-xl border border-green-200">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-xl font-bold text-green-800">Success!</h3>
        <p className="text-green-700">{successMessage || "Thank you for signing up."}</p>
      </div>
    );
  }

  const isJa = true; 

  const titleStyle = { 
    fontWeight: styles?.fontWeight || 'bold', 
    fontSize: styles?.fontSize || '1.5rem',
    lineHeight: styles?.lineHeight || '1.2'
  };
  const buttonStyle = {
    backgroundColor: styles?.buttonColor || '#9333ea', 
    color: styles?.buttonTextColor || '#ffffff',
    fontWeight: styles?.fontWeight || 'bold',
    fontSize: styles?.fontSize || '1.125rem',
    letterSpacing: styles?.letterSpacing || 'normal',
    textShadow: styles?.textShadow || 'none'
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10">
      {title && <h3 className="text-center mb-6 text-slate-900 dark:text-white" style={titleStyle}>{title}</h3>}
      
      {fields?.useLineLogin ? (
        <div className="space-y-4 text-center">
          <button onClick={handleLineLogin} className="w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 bg-[#06C755]"><Smartphone size={24} fill="white" />{isJa ? "LINEで友だち追加して受け取る" : "Login with LINE"}</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields?.showName !== false && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-left">{isJa ? '姓' : 'Last Name'}</label><input name="lastName" required type="text" placeholder={isJa ? "山田" : "Doe"} className="w-full p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg outline-none text-left" /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-left">{isJa ? '名' : 'First Name'}</label><input name="firstName" required type="text" placeholder={isJa ? "太郎" : "John"} className="w-full p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg outline-none text-left" /></div>
            </div>
          )}
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-left">{isJa ? 'メールアドレス' : 'Email'}</label><div className="relative"><input name="email" required type="email" placeholder="john@example.com" className="w-full p-3 pl-10 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg outline-none text-left" /><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /></div></div>
          {fields?.showPhone !== false && (
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-left">{isJa ? '電話番号' : 'Phone'}</label><div className="relative"><input name="phone" type="tel" placeholder="090-1234-5678" className="w-full p-3 pl-10 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg outline-none text-left" /><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /></div></div>
          )}
          {fields?.showAddress && (
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
               <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 text-left"><MapPin size={12}/> {isJa ? '住所' : 'Address'}</p>
               <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1"><input name="zip" placeholder={isJa ? "郵便番号" : "Zip"} value={zip} onChange={handleZipChange} maxLength={8} className="w-full p-2 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none text-sm font-mono text-left" /></div>
                  <div className="col-span-2"><input name="prefecture" placeholder={isJa ? "都道府県" : "State/Prefecture"} value={pref} onChange={(e) => setPref(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none text-sm text-left" /></div>
               </div>
               <input name="city" placeholder={isJa ? "市区町村" : "City"} value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none text-sm text-left" />
               <input name="street" placeholder={isJa ? "番地" : "Street"} value={street} onChange={(e) => setStreet(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none text-sm text-left" />
               <input name="building" placeholder={isJa ? "建物名・部屋番号" : "Building/Apt"} value={building} onChange={(e) => setBuilding(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-black/20 border rounded-lg outline-none text-sm text-left" />
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full py-4 mt-2 rounded-xl text-white shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2" style={buttonStyle}>
            {loading ? <Loader2 className="animate-spin" /> : <>{buttonText || "Subscribe"} <ArrowRight size={18}/></>}
          </button>
          <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center gap-1"><ShieldCheck size={12} /> We respect your privacy.</p>
        </form>
      )}
    </div>
  );
}