"use client";

import { useState, useEffect } from "react";
import { 
  ChevronRight, ChevronDown, Settings, Sliders, Trash2, 
  AlignLeft, AlignCenter, AlignRight, Palette, Type, MoreHorizontal, Layout, Share2, Plus, X, Link as LinkIcon, Unlink,
  Bold, Italic, Underline, Smartphone, CreditCard, AlertTriangle, ExternalLink, AlertCircle,
  ArrowUpFromLine, ArrowDownFromLine, ArrowLeftFromLine, ArrowRightFromLine
} from "lucide-react";
import ImageUploader from "../ImageUploader"; 
import { Link } from "@/navigation"; 

const ErrorToast = ({ message, onClose }: { message: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-5 fade-in cursor-pointer" onClick={onClose}>
      <AlertCircle size={20} />
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};

const Accordion = ({ title, children, defaultOpen = false, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 dark:border-white/5 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
        <div className="flex items-center gap-2">{Icon && <Icon size={14} />} {title}</div>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="px-4 pb-4 animate-in slide-in-from-top-1">{children}</div>}
    </div>
  );
};

const RangeControl = ({ label, value, onChange, min = 0, max = 100, unit = "px" }: any) => (
  <div className="mb-3">
    <div className="flex justify-between mb-1"><label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label><span className="text-[10px] text-slate-400 font-mono">{value}{unit}</span></div>
    <input type="range" min={min} max={max} value={parseInt(value) || 0} onChange={(e) => onChange(e.target.value + unit)} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
  </div>
);

const SpacingControl = ({ label, values, onChange, t }: any) => {
  const [isLinked, setIsLinked] = useState(!!values.all || (!values.top && !values.right));
  const steps = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100];
  const handleAllChange = (val: string) => onChange('all', val);
  const handleSideChange = (side: string, val: string) => onChange(side, val);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
        <button onClick={() => setIsLinked(!isLinked)} className={`flex items-center gap-1 px-2 py-1 rounded transition-colors text-[10px] ${isLinked ? 'bg-purple-100 text-purple-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`} title={isLinked ? "Unlink" : "Link"}>
          {isLinked ? <LinkIcon size={10} /> : <Unlink size={10} />}<span>{t.linkValues}</span>
        </button>
      </div>
      {isLinked ? (
        <div className="flex items-center gap-2">
           <input type="range" min={0} max={100} value={parseInt(values.all || values.top) || 0} onChange={(e) => handleAllChange(e.target.value + 'px')} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
           <span className="text-[10px] font-mono w-8 text-right">{parseInt(values.all || values.top) || 0}px</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {['top', 'right', 'bottom', 'left'].map(side => (
            <div key={side} className="relative">
               <span className="absolute left-2 top-1.5 text-[9px] font-bold text-slate-400 uppercase z-10 pointer-events-none">
                 {side === 'top' && <ArrowUpFromLine size={10}/>}{side === 'bottom' && <ArrowDownFromLine size={10}/>}{side === 'left' && <ArrowLeftFromLine size={10}/>}{side === 'right' && <ArrowRightFromLine size={10}/>}
               </span>
               <select value={values[side] || values.all || '0px'} onChange={(e) => handleSideChange(side, e.target.value)} className="w-full pl-6 p-1 text-xs border rounded bg-slate-50 dark:bg-black/20 outline-none focus:border-purple-500 appearance-none font-mono">
                 {steps.map(s => <option key={s} value={`${s}px`}>{s}px</option>)}<option value="auto">Auto</option>
               </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface RightSidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  selectedBlock: any;
  updateSelectedBlock: (field: string, value: any, isStyle?: boolean) => void;
  deleteSelectedBlock: () => void;
  pageSettings: any;
  setPageSettings: (s: any) => void;
  setIsDirty: (v: boolean) => void;
  availableEvents: any[];
  locale: string;
  keysConfigured: { stripe: boolean, univa: boolean, aqua: boolean };
}

export default function RightSidebar({
  isOpen, setIsOpen, selectedBlock, updateSelectedBlock, deleteSelectedBlock,
  pageSettings, setPageSettings, setIsDirty, availableEvents, locale, keysConfigured
}: RightSidebarProps) {

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const manageList = (listKey: string, newItemTemplate: any) => {
    const list = selectedBlock.content[listKey] || [];
    const addItem = () => updateSelectedBlock(listKey, [...list, newItemTemplate]);
    const removeItem = (index: number) => {
      const newList = [...list];
      newList.splice(index, 1);
      updateSelectedBlock(listKey, newList);
    };
    const updateItem = (index: number, field: string, val: any) => {
      const newList = [...list];
      newList[index] = { ...newList[index], [field]: val };
      updateSelectedBlock(listKey, newList);
    };
    return { list, addItem, removeItem, updateItem };
  };

  const addLink = () => updateSelectedBlock('links', [...(selectedBlock.content.links || []), { text: "Link", url: "#" }]);
  const updateLink = (idx: number, field: string, val: string) => {
    const newLinks = [...(selectedBlock.content.links || [])];
    newLinks[idx] = { ...newLinks[idx], [field]: val };
    updateSelectedBlock('links', newLinks);
  };
  const removeLink = (idx: number) => {
    const newLinks = [...(selectedBlock.content.links || [])];
    newLinks.splice(idx, 1);
    updateSelectedBlock('links', newLinks);
  };

  const handleInputTypeChange = (type: string) => {
    updateSelectedBlock('inputType', type);
    let label = "Label", placeholder = "";
    const isJa = locale === 'ja';
    switch(type) {
      case 'email': label = isJa ? "メールアドレス" : "Email"; placeholder = "name@example.com"; break;
      case 'tel': label = isJa ? "電話番号" : "Phone"; placeholder = "090-1234-5678"; break;
      case 'text': label = isJa ? "お名前" : "Name"; placeholder = isJa ? "山田 太郎" : "John Doe"; break;
      case 'textarea': label = isJa ? "メッセージ" : "Message"; placeholder = isJa ? "内容を入力..." : "Message details..."; break;
    }
    updateSelectedBlock('label', label);
    updateSelectedBlock('placeholder', placeholder);
  };

  const t: any = {
    settings: locale === 'ja' ? '設定' : 'Settings',
    page: locale === 'ja' ? 'ページ設定' : 'Page Settings',
    content: locale === 'ja' ? 'コンテンツ' : 'Content',
    design: locale === 'ja' ? 'デザイン' : 'Design',
    typography: locale === 'ja' ? 'タイポグラフィ' : 'Typography',
    spacing: locale === 'ja' ? 'スペース & レイアウト' : 'Spacing',
    items: locale === 'ja' ? 'アイテム管理' : 'Manage Items',
    productName: locale === 'ja' ? '商品名' : 'Product Name',
    price: locale === 'ja' ? '価格' : 'Price',
    btnText: locale === 'ja' ? 'ボタンテキスト' : 'Button Text',
    title: locale === 'ja' ? 'タイトル' : 'Title',
    subtitle: locale === 'ja' ? 'サブタイトル' : 'Subtitle',
    link: locale === 'ja' ? 'リンクURL' : 'Link URL',
    image: locale === 'ja' ? '画像' : 'Image',
    background: locale === 'ja' ? '背景色' : 'Background Color',
    text: locale === 'ja' ? '文字色' : 'Text Color',
    fontFamily: locale === 'ja' ? 'フォント' : 'Font Family',
    fontSize: locale === 'ja' ? 'サイズ' : 'Size',
    fontWeight: locale === 'ja' ? '太さ' : 'Weight',
    lineHeight: locale === 'ja' ? '行間' : 'Line Height',
    letterSpacing: locale === 'ja' ? '字間' : 'Tracking',
    shadow: locale === 'ja' ? '文字の影' : 'Text Shadow',
    margin: locale === 'ja' ? '外側の余白 (Margin)' : 'Margin',
    padding: locale === 'ja' ? '内側の余白 (Padding)' : 'Padding',
    linkValues: locale === 'ja' ? '値をリンク' : 'Link Values',
    provider: locale === 'ja' ? '決済プロバイダー' : 'Payment Provider',
    paymentMethods: locale === 'ja' ? '決済方法' : 'Payment Methods',
    creditCard: locale === 'ja' ? 'クレジットカード' : 'Credit Card',
    bankTransfer: locale === 'ja' ? '銀行振込' : 'Bank Transfer',
    bankInfo: locale === 'ja' ? '振込先情報' : 'Bank Info',
    collectAddress: locale === 'ja' ? '住所を収集 (JP)' : 'Collect Address (JP)',
    enableZip: locale === 'ja' ? '郵便番号自動入力' : 'Enable Zip Auto-fill',
    paymentRequiredAlert: locale === 'ja' ? '少なくとも1つの決済方法を選択する必要があります。' : 'You must select at least one payment method.',
    warningTitle: (p: string) => locale === 'ja' ? `${p}が設定されていません` : `${p} is not configured`,
    warningBody: locale === 'ja' ? '決済を利用するには、設定画面でAPIキーを保存してください。' : 'You must set your API keys in Settings before this checkout will work.',
    goToSettings: locale === 'ja' ? '設定画面へ' : 'Go to Settings',
    ph_bank: locale === 'ja' ? '例: 三菱UFJ銀行' : 'e.g. Bank of America',
    ph_branch: locale === 'ja' ? '例: 本店営業部' : 'e.g. Main Branch',
    ph_number: locale === 'ja' ? '例: 1234567' : 'e.g. 123456789',
    ph_holder: locale === 'ja' ? '例: カ) シンクラ' : 'e.g. SYNCRA Inc.',
  };

  const currentProvider = selectedBlock?.content?.provider || 'stripe';
  const isProviderReady = 
    currentProvider === 'stripe' ? keysConfigured.stripe :
    currentProvider === 'univapay' ? keysConfigured.univa :
    currentProvider === 'aquagates' ? keysConfigured.aqua : false;

  return (
    <div className={`bg-white dark:bg-[#1E293B] border-l border-slate-200 dark:border-white/10 flex flex-col z-30 transition-all duration-300 relative ${isOpen ? 'w-80' : 'w-0'}`}>
       
       {errorMsg && <ErrorToast message={errorMsg} onClose={() => setErrorMsg(null)} />}

       <button onClick={() => setIsOpen(!isOpen)} className="absolute -left-3 top-20 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full p-1 shadow-md z-50 hover:bg-purple-50 text-slate-500">
         <ChevronRight size={12} className={`transition-transform ${!isOpen && 'rotate-180'}`}/>
       </button>
       
       <div className={`flex-1 flex flex-col overflow-hidden ${!isOpen && 'opacity-0 hidden'}`}>
         <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5 shrink-0">
           <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-slate-700 dark:text-slate-300">
             {selectedBlock ? <Settings size={14} /> : <Sliders size={14} />}
             {selectedBlock ? t.settings : t.page}
           </span>
           {selectedBlock && (
             <button onClick={deleteSelectedBlock} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 size={16} /></button>
           )}
         </div>
         
         <div className="flex-1 overflow-y-auto custom-scrollbar">
            {selectedBlock ? (
              <>
                <Accordion title={t.content} icon={AlignLeft} defaultOpen={true}>
                   <div className="space-y-4 pt-2">
                      
                      {selectedBlock.type === 'checkout' && (
                        <>
                          <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-lg">
                            <label className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase mb-1 block flex items-center gap-1"><CreditCard size={12}/> {t.provider}</label>
                            <select value={currentProvider} onChange={(e) => updateSelectedBlock('provider', e.target.value)} className="w-full p-2 text-sm font-bold border-none rounded bg-white dark:bg-black/20 focus:ring-2 focus:ring-purple-500 outline-none">
                              <option value="stripe">Stripe {keysConfigured.stripe ? '✅' : `⚠️`}</option><option value="univapay">UnivaPay {keysConfigured.univa ? '✅' : `⚠️`}</option><option value="aquagates">AQUAGATES {keysConfigured.aqua ? '✅' : `⚠️`}</option>
                            </select>
                            {!isProviderReady && (
                              <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-xs border border-red-200 dark:border-red-900/50">
                                <div className="font-bold flex items-center gap-1 mb-1"><AlertTriangle size={12}/> {t.warningTitle(currentProvider === 'stripe' ? 'Stripe' : currentProvider === 'univapay' ? 'UnivaPay' : 'AQUAGATES')}</div>
                                <p className="leading-snug opacity-90 mb-2">{t.warningBody}</p>
                                <a href="/dashboard/settings" target="_blank" className="inline-flex items-center gap-1 font-bold underline hover:text-red-900 dark:hover:text-red-100">{t.goToSettings} <ExternalLink size={10}/></a>
                              </div>
                            )}
                          </div>

                          <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{t.productName}</label><input type="text" value={selectedBlock.content.productName || ""} onChange={(e) => updateSelectedBlock('productName', e.target.value)} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-black/20" /></div>
                          <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{t.price}</label><input type="number" value={selectedBlock.content.price || 0} onChange={(e) => updateSelectedBlock('price', parseInt(e.target.value))} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-black/20" /></div>
                          <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{t.btnText}</label><input type="text" value={selectedBlock.content.buttonText || ""} onChange={(e) => updateSelectedBlock('buttonText', e.target.value)} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-black/20" placeholder={locale==='ja'?'支払う':'Pay Now'} /></div>

                          <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                            <label className="text-[10px] font-bold text-purple-600 uppercase mb-2 block">{t.paymentMethods}</label>
                            <div className="space-y-2">
                               <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <input type="checkbox" checked={selectedBlock.content.enableCard !== false} onChange={(e) => { const isUnchecking = !e.target.checked; const isBankEnabled = selectedBlock.content.enableBank === true; if (isUnchecking && !isBankEnabled) { setErrorMsg(t.paymentRequiredAlert); return; } updateSelectedBlock('enableCard', e.target.checked); }} className="rounded text-purple-600 focus:ring-purple-500" />
                                  <span className="text-sm text-slate-700 dark:text-slate-300">{t.creditCard}</span>
                               </label>
                               <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <input type="checkbox" checked={selectedBlock.content.enableBank === true} onChange={(e) => { const isUnchecking = !e.target.checked; const isCardEnabled = selectedBlock.content.enableCard !== false; if (isUnchecking && !isCardEnabled) { setErrorMsg(t.paymentRequiredAlert); return; } updateSelectedBlock('enableBank', e.target.checked); }} className="rounded text-purple-600 focus:ring-purple-500" />
                                  <span className="text-sm text-slate-700 dark:text-slate-300">{t.bankTransfer}</span>
                               </label>
                            </div>
                          </div>

                          {selectedBlock.content.enableBank && (
                             <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2 bg-slate-50 dark:bg-white/5 p-2 rounded">
                               <p className="text-[10px] font-bold uppercase text-slate-400">{t.bankInfo}</p>
                               <input type="text" placeholder={t.ph_bank} value={selectedBlock.content.bankName || ""} onChange={(e) => updateSelectedBlock('bankName', e.target.value)} className="w-full p-1.5 text-xs border rounded bg-white dark:bg-black/20" />
                               <input type="text" placeholder={t.ph_branch} value={selectedBlock.content.branchName || ""} onChange={(e) => updateSelectedBlock('branchName', e.target.value)} className="w-full p-1.5 text-xs border rounded bg-white dark:bg-black/20" />
                               <input type="text" placeholder={t.ph_number} value={selectedBlock.content.accountNumber || ""} onChange={(e) => updateSelectedBlock('accountNumber', e.target.value)} className="w-full p-1.5 text-xs border rounded bg-white dark:bg-black/20" />
                               <input type="text" placeholder={t.ph_holder} value={selectedBlock.content.accountHolder || ""} onChange={(e) => updateSelectedBlock('accountHolder', e.target.value)} className="w-full p-1.5 text-xs border rounded bg-white dark:bg-black/20" />
                             </div>
                          )}

                          <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
                             <label className="text-[10px] font-bold text-slate-500 uppercase block">{t.content}</label>
                             <label className="flex items-center gap-2 cursor-pointer select-none">
                                {/* FIX: Explicitly check for true to ensure unchecked by default */}
                                <input type="checkbox" checked={selectedBlock.content.collectAddress === true} onChange={(e) => updateSelectedBlock('collectAddress', e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{t.collectAddress}</span>
                             </label>
                             {selectedBlock.content.collectAddress === true && (
                               <label className="flex items-center gap-2 cursor-pointer select-none pl-4">
                                  <input type="checkbox" checked={selectedBlock.content.fields?.enableZipAutoFill !== false} onChange={(e) => updateSelectedBlock('fields', { ...selectedBlock.content.fields, enableZipAutoFill: e.target.checked })} className="rounded text-purple-600 focus:ring-purple-500" />
                                  <span className="text-xs text-slate-500 dark:text-slate-400">{t.enableZip}</span>
                               </label>
                             )}
                          </div>
                        </>
                      )}

                      {/* OPTIN FORM TOGGLES */}
                      {selectedBlock.type === 'optin_form' && (
                        <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
                           <label className="text-[10px] font-bold text-slate-500 uppercase block">Form Mode</label>
                           
                           <label className="flex items-center gap-2 cursor-pointer select-none bg-green-50 dark:bg-green-900/10 p-2 rounded border border-green-100 dark:border-green-900/30">
                              <input type="checkbox" checked={selectedBlock.content.fields?.useLineLogin === true} onChange={(e) => updateSelectedBlock('fields', { ...selectedBlock.content.fields, useLineLogin: e.target.checked })} className="rounded text-green-600 focus:ring-green-500" />
                              <span className="text-sm font-bold text-green-700 dark:text-green-400 flex items-center gap-1"><Smartphone size={14}/> Use LINE Login</span>
                           </label>

                           {!selectedBlock.content.fields?.useLineLogin && (
                             <>
                               <label className="text-[10px] font-bold text-slate-500 uppercase block mt-2">Fields</label>
                               <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <input type="checkbox" checked={selectedBlock.content.fields?.showName !== false} onChange={(e) => updateSelectedBlock('fields', { ...selectedBlock.content.fields, showName: e.target.checked })} className="rounded text-purple-600" />
                                  <span className="text-sm text-slate-700 dark:text-slate-300">Show Name</span>
                               </label>
                               <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <input type="checkbox" checked={selectedBlock.content.fields?.showPhone !== false} onChange={(e) => updateSelectedBlock('fields', { ...selectedBlock.content.fields, showPhone: e.target.checked })} className="rounded text-purple-600" />
                                  <span className="text-sm text-slate-700 dark:text-slate-300">Show Phone</span>
                               </label>
                               <label className="flex items-center gap-2 cursor-pointer select-none">
                                  {/* FIX: Explicitly check === true so it is UNCHECKED by default */}
                                  <input type="checkbox" checked={selectedBlock.content.collectAddress === true} onChange={(e) => updateSelectedBlock('collectAddress', e.target.checked)} className="rounded text-purple-600" />
                                  <span className="text-sm text-slate-700 dark:text-slate-300">{t.collectAddress}</span>
                               </label>
                               {selectedBlock.content.collectAddress === true && (
                                 <label className="flex items-center gap-2 cursor-pointer select-none pl-4">
                                    <input type="checkbox" checked={selectedBlock.content.fields?.enableZipAutoFill !== false} onChange={(e) => updateSelectedBlock('fields', { ...selectedBlock.content.fields, enableZipAutoFill: e.target.checked })} className="rounded text-purple-600 focus:ring-purple-500" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{t.enableZip}</span>
                                 </label>
                               )}
                             </>
                           )}
                        </div>
                      )}

                      {/* GENERIC BLOCKS */}
                      {selectedBlock.content.title !== undefined && (<div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{t.title}</label><input type="text" value={selectedBlock.content.title} onChange={(e) => updateSelectedBlock('title', e.target.value)} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-black/20" /></div>)}
                      {selectedBlock.content.subtitle !== undefined && (<div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{t.subtitle}</label><textarea value={selectedBlock.content.subtitle} onChange={(e) => updateSelectedBlock('subtitle', e.target.value)} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-black/20 h-16" /></div>)}
                      {selectedBlock.content.text !== undefined && (<div><div className="flex justify-between mb-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Text (HTML)</label></div><textarea value={selectedBlock.content.text} onChange={(e) => updateSelectedBlock('text', e.target.value)} className="w-full p-3 text-xs border rounded-lg bg-slate-50 dark:bg-black/20 h-24 font-mono focus:ring-2 focus:ring-purple-500 outline-none" /></div>)}
                      {selectedBlock.content.buttonText !== undefined && !['checkout', 'optin_form'].includes(selectedBlock.type) && (<div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{t.btnText}</label><input type="text" value={selectedBlock.content.buttonText} onChange={(e) => updateSelectedBlock('buttonText', e.target.value)} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-black/20 font-bold text-purple-600" /></div>)}
                      {selectedBlock.content.buttonUrl !== undefined && (<div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{t.link}</label><input type="text" value={selectedBlock.content.buttonUrl} onChange={(e) => updateSelectedBlock('buttonUrl', e.target.value)} className="w-full p-2 text-xs font-mono border rounded bg-slate-50 dark:bg-black/20" placeholder="https://..." /></div>)}
                      
                      {selectedBlock.type === 'image' && (<div><label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">{t.image}</label><ImageUploader value={selectedBlock.content.url || selectedBlock.content.src} onChange={(url) => updateSelectedBlock('url', url)} locale={locale} /></div>)}
                      {selectedBlock.type === 'video' && (<div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Video ID (YouTube)</label><input type="text" value={selectedBlock.content.videoId} onChange={(e) => updateSelectedBlock('videoId', e.target.value)} className="w-full p-2 text-sm font-mono border rounded bg-slate-50 dark:bg-black/20" placeholder="dQw4w9WgXcQ" /></div>)}
                      
                      {selectedBlock.type === 'faq' && (() => {
                        const { list, addItem, removeItem, updateItem } = manageList('items', { q: "Q?", a: "A." });
                        return (<div><div className="flex justify-between items-center mb-2"><label className="text-[10px] font-bold text-slate-500 uppercase">{t.items}</label><button onClick={addItem} className="text-purple-600"><Plus size={14}/></button></div><div className="space-y-3">{list.map((item:any, i:number)=>(<div key={i} className="bg-slate-50 dark:bg-white/5 p-2 rounded border relative"><button onClick={()=>removeItem(i)} className="absolute top-2 right-2 text-slate-400"><X size={12}/></button><input value={item.q} onChange={(e)=>updateItem(i,'q',e.target.value)} className="w-full mb-1 text-xs font-bold bg-transparent outline-none"/><textarea value={item.a} onChange={(e)=>updateItem(i,'a',e.target.value)} className="w-full text-xs bg-transparent outline-none resize-none"/></div>))}</div></div>);
                      })()}

                      {selectedBlock.type === 'features' && (() => {
                        const { list, addItem, removeItem, updateItem } = manageList('items', { title: "Feature", desc: "Description" });
                        return (<div><div className="flex justify-between items-center mb-2"><label className="text-[10px] font-bold text-slate-500 uppercase">{t.items}</label><button onClick={addItem} className="text-purple-600"><Plus size={14}/></button></div><div className="space-y-2">{list.map((item:any, i:number)=>(<div key={i} className="flex gap-2 items-center bg-slate-50 dark:bg-white/5 p-2 rounded border"><div className="flex-1"><input value={item.title} onChange={(e)=>updateItem(i,'title',e.target.value)} className="w-full text-xs font-bold bg-transparent outline-none"/><input value={item.desc} onChange={(e)=>updateItem(i,'desc',e.target.value)} className="w-full text-[10px] text-slate-500 bg-transparent outline-none"/></div><button onClick={()=>removeItem(i)} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button></div>))}</div></div>);
                      })()}

                      {selectedBlock.type === 'input_field' && (
                        <div>
                           <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Input Type</label>
                           <select value={selectedBlock.content.inputType || 'text'} onChange={(e) => handleInputTypeChange(e.target.value)} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-black/20 mb-3"><option value="text">Text (Name)</option><option value="email">Email</option><option value="tel">Phone</option><option value="textarea">Long Text</option></select>
                           <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Label</label><input type="text" value={selectedBlock.content.label || ""} onChange={(e) => updateSelectedBlock('label', e.target.value)} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-black/20 mb-3" />
                           <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Placeholder</label><input type="text" value={selectedBlock.content.placeholder || ""} onChange={(e) => updateSelectedBlock('placeholder', e.target.value)} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-black/20" />
                        </div>
                      )}
                   </div>
                </Accordion>

                {/* DESIGN ACCORDION */}
                <Accordion title={t.design} icon={Palette} defaultOpen={true}>
                   <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">{t.background}</label>
                        <div className="grid grid-cols-5 gap-2">
                          {['transparent', '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#000000', '#1e293b', '#0f172a', '#9333ea', '#dc2626'].map(c => (
                            <button key={c} onClick={() => updateSelectedBlock('backgroundColor', c, true)} className={`w-8 h-8 rounded-md border border-slate-200 dark:border-white/10 shadow-sm ${selectedBlock.styles.backgroundColor === c ? 'ring-2 ring-purple-500 ring-offset-1' : ''}`} style={{backgroundColor: c}} title={c} />
                          ))}
                        </div>
                        <input type="color" value={selectedBlock.styles.backgroundColor || '#ffffff'} onChange={(e) => updateSelectedBlock('backgroundColor', e.target.value, true)} className="w-full h-8 mt-2 cursor-pointer rounded border border-slate-200" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">{t.text}</label>
                        <div className="flex gap-2">
                          {['#000000', '#334155', '#ffffff', '#9333ea'].map(c => (
                            <button key={c} onClick={() => updateSelectedBlock('textColor', c, true)} className={`w-8 h-8 rounded-full border border-slate-200 ${selectedBlock.styles.textColor === c ? 'ring-2 ring-purple-500 ring-offset-1' : ''}`} style={{backgroundColor: c}} />
                          ))}
                          <input type="color" value={selectedBlock.styles.textColor || '#000000'} onChange={(e) => updateSelectedBlock('textColor', e.target.value, true)} className="flex-1 h-8 cursor-pointer rounded border border-slate-200" />
                        </div>
                      </div>
                   </div>
                </Accordion>

                {/* TYPOGRAPHY ACCORDION */}
                <Accordion title={t.typography} icon={Type}>
                   <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">{t.fontFamily}</label>
                        <select value={selectedBlock.styles.fontFamily || 'inherit'} onChange={(e) => updateSelectedBlock('fontFamily', e.target.value, true)} className="w-full p-2 text-xs border rounded bg-slate-50 dark:bg-black/20">
                           <option value="inherit">Default (System)</option>
                           <optgroup label="Japanese">
                             <option value="'Noto Sans JP', sans-serif">Noto Sans JP</option><option value="'Noto Serif JP', serif">Noto Serif JP</option><option value="'Hiragino Kaku Gothic ProN', sans-serif">Hiragino Kaku Gothic</option><option value="'Yu Gothic', sans-serif">Yu Gothic</option>
                           </optgroup>
                           <optgroup label="Sans Serif">
                             <option value="Arial, sans-serif">Arial</option><option value="Tahoma, sans-serif">Tahoma</option><option value="Verdana, sans-serif">Verdana</option><option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                           </optgroup>
                           <optgroup label="Serif">
                             <option value="'Times New Roman', serif">Times New Roman</option><option value="Georgia, serif">Georgia</option>
                           </optgroup>
                           <optgroup label="Other">
                             <option value="'Courier New', monospace">Courier New</option><option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                           </optgroup>
                        </select>
                      </div>

                      <div className="space-y-2">
                          <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg p-1 w-full">
                              {['left', 'center', 'right'].map((a) => (
                                <button key={a} onClick={() => updateSelectedBlock('textAlign', a, true)} className={`flex-1 py-1.5 rounded-md ${selectedBlock.styles.textAlign === a ? 'bg-white shadow text-purple-600' : 'text-slate-400'}`}>
                                  {a === 'left' ? <AlignLeft size={16} className="mx-auto"/> : a === 'center' ? <AlignCenter size={16} className="mx-auto"/> : <AlignRight size={16} className="mx-auto"/>}
                                </button>
                              ))}
                          </div>
                          <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg p-1 w-full">
                              <button onClick={() => updateSelectedBlock('fontWeight', selectedBlock.styles.fontWeight === 'bold' ? 'normal' : 'bold', true)} className={`flex-1 py-1.5 rounded-md ${selectedBlock.styles.fontWeight === 'bold' ? 'bg-white shadow text-purple-600' : 'text-slate-400'}`}><Bold size={16} className="mx-auto"/></button>
                              <button onClick={() => updateSelectedBlock('fontStyle', selectedBlock.styles.fontStyle === 'italic' ? 'normal' : 'italic', true)} className={`flex-1 py-1.5 rounded-md ${selectedBlock.styles.fontStyle === 'italic' ? 'bg-white shadow text-purple-600' : 'text-slate-400'}`}><Italic size={16} className="mx-auto"/></button>
                              <button onClick={() => updateSelectedBlock('textDecoration', selectedBlock.styles.textDecoration === 'underline' ? 'none' : 'underline', true)} className={`flex-1 py-1.5 rounded-md ${selectedBlock.styles.textDecoration === 'underline' ? 'bg-white shadow text-purple-600' : 'text-slate-400'}`}><Underline size={16} className="mx-auto"/></button>
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">{t.size}</label>
                          <div className="flex bg-slate-100 dark:bg-white/5 rounded p-1">
                            {['0.875rem', '1rem', '1.25rem', '1.5rem', '2rem', '3rem'].map((s, i) => (
                              <button key={s} onClick={() => updateSelectedBlock('fontSize', s, true)} className={`flex-1 py-1 text-[10px] font-bold rounded hover:bg-white ${selectedBlock.styles.fontSize === s ? 'bg-white text-purple-600 shadow' : 'text-slate-400'}`}>{i===0?'XS':i===5?'XL':i+1}</button>
                            ))}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                         <div>
                           <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{t.fontWeight}</label>
                           <select value={selectedBlock.styles.fontWeight || 'normal'} onChange={(e) => updateSelectedBlock('fontWeight', e.target.value, true)} className="w-full p-1.5 text-xs border rounded bg-slate-50 dark:bg-black/20">
                             <option value="normal">Default</option>{[100, 200, 300, 400, 500, 600, 700, 800, 900].map(w => <option key={w} value={w}>{w}</option>)}
                           </select>
                         </div>
                         <div>
                           <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{t.fontSize} (Custom)</label>
                           <input type="text" placeholder="16px" value={selectedBlock.styles.fontSize || ""} onChange={(e) => updateSelectedBlock('fontSize', e.target.value, true)} className="w-full p-1.5 text-xs border rounded bg-slate-50 dark:bg-black/20" />
                         </div>
                         <div>
                           <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{t.lineHeight}</label>
                           <select value={selectedBlock.styles.lineHeight || '1.5'} onChange={(e) => updateSelectedBlock('lineHeight', e.target.value, true)} className="w-full p-1.5 text-xs border rounded bg-slate-50 dark:bg-black/20">
                             {Array.from({length: 14}, (_, i) => (0.7 + i * 0.1).toFixed(1)).map(lh => <option key={lh} value={lh}>{lh}</option>)}
                           </select>
                         </div>
                         <div>
                           <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{t.letterSpacing}</label>
                           <select value={selectedBlock.styles.letterSpacing || 'normal'} onChange={(e) => updateSelectedBlock('letterSpacing', e.target.value, true)} className="w-full p-1.5 text-xs border rounded bg-slate-50 dark:bg-black/20">
                             <option value="normal">0</option><option value="0.05em">0.05</option><option value="0.1em">0.1</option><option value="0.2em">0.2</option><option value="-0.05em">-0.05</option>
                           </select>
                         </div>
                      </div>

                      <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{t.shadow}</label>
                         <select value={selectedBlock.styles.textShadow || 'none'} onChange={(e) => updateSelectedBlock('textShadow', e.target.value, true)} className="w-full p-1.5 text-xs border rounded bg-slate-50 dark:bg-black/20">
                           <option value="none">None</option><option value="1px 1px 2px rgba(0,0,0,0.1)">Gray (Small)</option><option value="2px 2px 4px rgba(0,0,0,0.2)">Gray (Medium)</option><option value="1px 1px 0 #fff">White Outline</option><option value="2px 2px 0 #000">Hard Shadow</option>
                         </select>
                      </div>
                   </div>
                </Accordion>

                <Accordion title={t.spacing} icon={MoreHorizontal}>
                   <div className="space-y-4 pt-2">
                      <SpacingControl label={t.padding} t={t} values={{ all: selectedBlock.styles.padding, top: selectedBlock.styles.paddingTop, right: selectedBlock.styles.paddingRight, bottom: selectedBlock.styles.paddingBottom, left: selectedBlock.styles.paddingLeft }} onChange={(side: string, val: string) => { if(side === 'all') updateSelectedBlock('padding', val, true); else updateSelectedBlock(`padding${side.charAt(0).toUpperCase() + side.slice(1)}`, val, true); }} />
                      <div className="border-t border-slate-100 dark:border-white/5 my-2"></div>
                      <SpacingControl label={t.margin} t={t} values={{ all: selectedBlock.styles.margin, top: selectedBlock.styles.marginTop, right: selectedBlock.styles.marginRight, bottom: selectedBlock.styles.marginBottom, left: selectedBlock.styles.marginLeft }} onChange={(side: string, val: string) => { if(side === 'all') updateSelectedBlock('margin', val, true); else updateSelectedBlock(`margin${side.charAt(0).toUpperCase() + side.slice(1)}`, val, true); }} />
                   </div>
                </Accordion>
              </>
            ) : (
              <>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 mb-6 text-center">
                  <p className="text-xs text-slate-500 mb-2">No block selected</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.page}</p>
                </div>
                <Accordion title="Page Background" icon={Palette} defaultOpen={true}>
                   <div className="space-y-2 pt-2">
                      <div className="grid grid-cols-5 gap-2">
                        {['#ffffff', '#f8fafc', '#f3f4f6', '#fffbeb', '#f0f9ff', '#0f172a', '#1e293b', '#000000', '#111827', '#312e81'].map(c => (
                          <button key={c} onClick={() => { setPageSettings({ ...pageSettings, background: c }); setIsDirty(true); }} className={`w-8 h-8 rounded-full border border-slate-200 shadow-sm ${pageSettings.background === c ? 'ring-2 ring-purple-500 ring-offset-1' : ''}`} style={{backgroundColor: c}} />
                        ))}
                      </div>
                      <input type="color" value={pageSettings.background} onChange={(e) => { setPageSettings({ ...pageSettings, background: e.target.value }); setIsDirty(true); }} className="w-full h-8 mt-2 cursor-pointer rounded border" />
                   </div>
                </Accordion>
                <Accordion title="Page Spacing" icon={Layout} defaultOpen={true}>
                   <div className="pt-2">
                      <RangeControl label="Padding" value={parseInt(pageSettings.padding) || 0} onChange={(val: any) => { setPageSettings({...pageSettings, padding: val}); setIsDirty(true); }} max={100} />
                   </div>
                </Accordion>
              </>
            )}
         </div>
       </div>
    </div>
  );
}