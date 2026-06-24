"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, Shield, Star, Award, Zap, Sparkles } from "lucide-react";

export default function BillingView() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Starter Trial",
      price: "Free",
      description: "Perfect for freelancers finding their first clients.",
      features: [
        "15 Google Maps crawls / month",
        "Basic website analysis speed check",
        "5 AI Audit Reports",
        "Local browser sandbox storage",
      ],
      cta: "Current Plan",
      current: true,
      color: "border-border-p",
      bg: "bg-panel-bg",
    },
    {
      name: "Pro Agency",
      price: billingCycle === "monthly" ? "$49" : "$39",
      period: "/ month",
      description: "Designed for active outreach and design agencies.",
      features: [
        "Unlimited Google Maps crawls",
        "Full Lighthouse Core Web Vitals checks",
        "Unlimited AI Website Audits & custom pitch copy",
        "Google Workspace / Gmail custom sequence integration",
        "Permanent Firestore cloud database sync",
        "Priority live agency coach help",
      ],
      cta: "Upgrade to Pro",
      current: false,
      popular: true,
      color: "border-emerald-500/40 shadow-emerald-500/5",
      bg: "bg-panel-bg relative border-emerald-500/30",
    },
    {
      name: "Enterprise Scaler",
      price: billingCycle === "monthly" ? "$129" : "$99",
      period: "/ month",
      description: "For high-volume web development operations.",
      features: [
        "Everything in Pro",
        "Multi-agent team accounts",
        "Direct REST API export triggers",
        "Dedicated proxy crawls for instant scraping",
        "Personalized outreach strategy session",
      ],
      cta: "Contact Sales",
      current: false,
      color: "border-border-p",
      bg: "bg-panel-bg",
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Sandbox Unlock Notification Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center flex items-center justify-center gap-3 text-emerald-500"
      >
        <Sparkles className="w-5 h-5 animate-pulse flex-shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-wider font-mono">
          AI Studio Sandbox Mode: Pro Agency Features are 100% Active and Unlocked!
        </span>
      </motion.div>

      {/* Header and Toggle */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h2 className="text-3xl font-display font-semibold text-text-p">Choose Your Scale</h2>
        <p className="text-sm text-text-s">
          Unlock unlimited Google Maps scraping, comprehensive Lighthouse audits, and high-converting AI email generators.
        </p>

        {/* Toggle billing */}
        <div className="inline-flex items-center p-1 bg-input-bg border border-border-s rounded-full mt-4 font-sans">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              billingCycle === "monthly" ? "bg-emerald-500 text-black animate-none" : "text-text-s hover:text-text-p"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              billingCycle === "yearly" ? "bg-emerald-500 text-black animate-none" : "text-text-s hover:text-text-p"
            }`}
          >
            Yearly (Save 20%)
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-xl border ${plan.color} ${plan.bg} p-6 flex flex-col justify-between shadow-xl`}
          >
            <div>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-emerald-500 text-black text-[10px] font-bold uppercase rounded-full tracking-wider flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                  <Zap className="w-3 h-3 fill-black animate-none" />
                  Most Popular
                </span>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-display font-semibold text-text-p">{plan.name}</h3>
                  <p className="text-xs text-text-s mt-1">{plan.description}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1 my-6">
                <span className="text-4xl font-display font-semibold text-text-p">{plan.price}</span>
                {plan.period && <span className="text-sm text-text-s">{plan.period}</span>}
              </div>

              <div className="border-t border-border-p pt-4 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-xs text-text-s leading-normal">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              disabled={plan.current}
              className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all font-sans cursor-pointer mt-8 flex items-center justify-center gap-1.5 ${
                plan.current
                  ? "bg-border-s text-text-s opacity-60 border border-border-p"
                  : "bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/10"
              }`}
            >
              {plan.current && <Check className="w-3.5 h-3.5" />}
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
