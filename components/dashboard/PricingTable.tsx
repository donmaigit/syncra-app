"use client";

import { useState } from "react";
import { Check, X as XIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { createSubscriptionCheckout } from "@/app/actions/billing-actions";

type PricingProps = {
  currentPlan?: string;
  prices: {
    starter: { m: string; y: string };
    pro: { m: string; y: string };
    agency: { m: string; y: string };
  };
};

export function PricingTable({ currentPlan, prices }: PricingProps) {
  const t = useTranslations("Pricing");
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, planName: string) => {
    setLoading(planName);
    const res = await createSubscriptionCheckout(priceId);
    if (res?.url) window.location.href = res.url;
    setLoading(null);
  };

  const plans = [
    {
      key: "starter",
      name: t("starter_name"),
      desc: t("starter_desc"),
      price: interval === "month" ? "¥4,980" : "¥49,800",
      id: interval === "month" ? prices.starter.m : prices.starter.y,
      features: [
        { text: t("features.funnels_3"), included: true },
        { text: t("features.domains_0"), included: false },
        { text: t("features.leads_500"), included: true },
        { text: t("features.templates_basic"), included: true },
        { text: t("features.ai_limited"), included: true },
        { text: t("features.products_2"), included: true },
        { text: t("features.branding"), included: false },
        { text: t("features.support_standard"), included: true },
      ],
      highlight: false,
    },
    {
      key: "pro",
      name: t("pro_name"),
      desc: t("pro_desc"),
      price: interval === "month" ? "¥9,980" : "¥99,800",
      id: interval === "month" ? prices.pro.m : prices.pro.y,
      features: [
        { text: t("features.funnels_unlimited"), included: true },
        { text: t("features.domains_1"), included: true },
        { text: t("features.leads_10k"), included: true },
        { text: t("features.templates_all"), included: true },
        { text: t("features.ai_full"), included: true },
        { text: t("features.products_unlimited"), included: true },
        { text: t("features.affiliate"), included: true },
        { text: t("features.branding"), included: true },
        { text: t("features.support_priority"), included: true },
      ],
      highlight: true,
    },
    {
      key: "agency",
      name: t("agency_name"),
      desc: t("agency_desc"),
      price: interval === "month" ? "¥29,800" : "¥298,000",
      id: interval === "month" ? prices.agency.m : prices.agency.y,
      features: [
        { text: t("features.funnels_unlimited"), included: true },
        { text: t("features.domains_10"), included: true },
        { text: t("features.leads_unlimited"), included: true },
        { text: t("features.affiliate"), included: true },
        { text: t("features.membership"), included: true },
        { text: t("features.team"), included: true },
        { text: t("features.branding"), included: true },
        { text: t("features.support_dedicated"), included: true },
      ],
      highlight: false,
    },
  ];

  return (
    <div>
      {/* TOGGLE SWITCH */}
      <div className="flex justify-center items-center gap-4 mb-10">
        <span className={`cursor-pointer ${interval === "month" ? "font-bold text-slate-900 dark:text-white" : "text-slate-500"}`} onClick={() => setInterval("month")}>
          {t("monthly")}
        </span>
        
        <button
          onClick={() => setInterval(interval === "month" ? "year" : "month")}
          className={`relative w-14 h-8 rounded-full transition-colors focus:outline-none ${
            interval === "year" ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
          }`}
        >
          <div
            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
              interval === "year" ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
        
        <span className={`cursor-pointer ${interval === "year" ? "font-bold text-slate-900 dark:text-white" : "text-slate-500"}`} onClick={() => setInterval("year")}>
          {t("yearly")}
        </span>

        {/* 2 Months Free Badge - Only visible on Year */}
        <span className={`ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-bold px-2 py-1 rounded-full transition-opacity duration-300 ${interval === 'year' ? 'opacity-100' : 'opacity-0'}`}>
          {t("save_badge")}
        </span>
      </div>

      {/* PRICING CARDS */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.key;
          
          return (
            <div 
              key={plan.key} 
              className={`relative p-8 rounded-2xl border transition-all flex flex-col ${
                plan.highlight 
                  ? "border-purple-500 bg-white dark:bg-[#1E293B] shadow-2xl scale-105 z-10" 
                  : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 opacity-90 hover:opacity-100"
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                  RECOMMENDED
                </div>
              )}
              
              {/* CENTERED HEADER */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{plan.desc}</p>
                <div className="text-4xl font-bold">
                  {plan.price} <span className="text-lg font-normal text-slate-500">{interval === "month" ? t("mo") : t("yr")}</span>
                </div>
                {/* Trial Note logic */}
                <p className="text-xs text-green-600 font-bold mt-2 h-4">
                  {plan.key !== 'starter' ? t("trial_note") : ""}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${feature.included ? '' : 'opacity-50'}`}>
                    {feature.included ? (
                      <Check className={`h-5 w-5 shrink-0 ${plan.highlight ? "text-purple-500" : "text-green-500"}`}/> 
                    ) : (
                      <XIcon className="h-5 w-5 shrink-0 text-slate-400"/>
                    )}
                    <span className="text-slate-700 dark:text-slate-300 text-left">{feature.text}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                 <button disabled className="w-full py-3 rounded-xl border border-slate-300 dark:border-white/20 font-bold text-slate-400 cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button 
                  onClick={() => handleCheckout(plan.id, plan.key)}
                  disabled={loading !== null}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                    plan.highlight 
                      ? "bg-purple-600 hover:bg-purple-500 shadow-purple-500/25" 
                      : "bg-slate-900 dark:bg-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {loading === plan.key ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : t("start_trial")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}