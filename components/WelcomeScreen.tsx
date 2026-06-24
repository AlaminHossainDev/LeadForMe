"use client";

import React, { useState } from "react";
import { useFirebase } from "@/context/FirebaseContext";
import { motion } from "motion/react";
import { Search, Flame, ShieldCheck, Mail, Globe, ArrowRight, CheckCircle } from "lucide-react";

export default function WelcomeScreen() {
  const { login, enableGuestMode } = useFirebase();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="welcome-screen" className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#090d16] text-[#f1f5f9] overflow-hidden">
      {/* Brand & Landing Left Panel (7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between p-8 lg:p-16 relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        {/* Top Header Logo */}
        <div className="flex items-center space-x-2 z-10">
          <div className="bg-emerald-500 text-slate-900 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            LeadForMe
          </span>
        </div>

        {/* Hero Section */}
        <div className="my-16 lg:my-0 max-w-xl z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
              <span>●</span> <span>Active Local B2B Lead Engine</span>
            </span>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight text-white mb-6">
              Find businesses that need a <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">new website</span> before anyone else.
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              LeadForMe discovers high-intent prospects from local maps, crawls their websites, calculates custom opportunity metrics, and generates hyper-personalized cold outreach.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Search, title: "Google Maps Discovery", desc: "Discover targeted industries anywhere." },
              { icon: Globe, title: "Website Audit Crawl", desc: "Instantly detect SSL, speed & layout gaps." },
              { icon: ShieldCheck, title: "Opportunity Score", desc: "Filter low-quality sites with high value." },
              { icon: Mail, title: "AI Outreach Copy", desc: "Auto-generate cold emails & scripts." }
            ].map((item, index) => (
              <div key={index} className="flex space-x-3 p-4 rounded-xl bg-slate-800/20 border border-slate-800/50 backdrop-blur">
                <item.icon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-slate-200">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-600 z-10 mt-8 lg:mt-0">
          © {new Date().getFullYear()} LeadForMe Inc. Developed as a full-stack Next.js + Firebase application.
        </div>
      </div>

      {/* Auth Control Right Panel (5 cols) */}
      <div className="lg:col-span-5 bg-[#0e1423] border-l border-slate-800/80 flex flex-col justify-center p-8 lg:p-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full mx-auto space-y-8 z-10">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-white tracking-tight">Get Started Instantly</h2>
            <p className="text-sm text-slate-400">
              Save your leads securely to the cloud, or start immediately in guest mode.
            </p>
          </div>

          {/* Social Google Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-xl transition duration-200 active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? "Connecting..." : "Continue with Google"}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute w-full border-t border-slate-800" />
            <span className="relative px-3 bg-[#0e1423] text-xs text-slate-500 uppercase tracking-widest font-mono">
              or
            </span>
          </div>

          {/* Guest Access Option */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 text-center lg:text-left space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-emerald-400">Sandbox Trial / Guest Mode</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Try the full dashboard suite instantly. Scans websites, generates audits and CRM logs stored in your browser session.
              </p>
            </div>
            <button
              onClick={enableGuestMode}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white border border-emerald-500/20 rounded-xl text-sm font-semibold transition duration-200"
            >
              <span>Explore as Guest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Features included in basic tier</h4>
            {[
              "Maps Data Scraper Integration",
              "1-Click Technical SSL & Speed Auditor",
              "7-Stage Kanban Agency CRM Pipeline",
              "Multi-Channel Copiable AI Outreach Generator",
              "Local & Cloud Storage Options"
            ].map((f, i) => (
              <div key={i} className="flex items-start space-x-2 text-xs text-slate-500">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
