"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Map, KanbanSquare, Settings, CreditCard, Sparkles, LogIn, LogOut, CheckCircle, Cpu, Loader2, Globe, Sun, Moon } from "lucide-react";
import { useFirebase } from "../context/FirebaseContext";
import { getLeads, saveLead, deleteLead, getSettings, Lead, UserSettings } from "../lib/store";
import LeadSearch from "../components/LeadSearch";
import CrmPipeline from "../components/CrmPipeline";
import LeadDetails from "../components/LeadDetails";
import UserSettingsView from "../components/UserSettingsView";
import BillingView from "../components/BillingView";

export default function WorkspacePage() {
  const { user, loading, guestMode, setGuestMode, loginWithGoogle, logout, theme, toggleTheme } = useFirebase();
  const [activeTab, setActiveTab] = useState<"discover" | "pipeline" | "settings" | "billing">("discover");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [agencyBranding, setAgencyBranding] = useState<UserSettings | null>(null);

  // Sync leads from storage/database
  useEffect(() => {
    async function sync() {
      setLoadingLeads(true);
      const data = await getLeads(user?.uid || null, guestMode);
      setLeads(data);
      setLoadingLeads(false);
    }
    sync();
  }, [user, guestMode]);

  // Sync agency name
  useEffect(() => {
    async function load() {
      const data = await getSettings(user?.uid || null, guestMode);
      setAgencyBranding(data);
    }
    load();
  }, [user, guestMode]);

  const handleAddLead = async (partialLead: Lead) => {
    const newLead: Lead = {
      ...partialLead,
      id: `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "discovered",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLeads((prev) => [newLead, ...prev]);
    await saveLead(user?.uid || null, guestMode, newLead);
  };

  const handleUpdateStatus = async (leadId: string, status: Lead["status"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status, updatedAt: new Date().toISOString() } : l))
    );

    const leadToUpdate = leads.find((l) => l.id === leadId);
    if (leadToUpdate) {
      await saveLead(user?.uid || null, guestMode, {
        ...leadToUpdate,
        status,
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (selectedLead?.id === leadId) {
      setSelectedLead(null);
    }
    await deleteLead(user?.uid || null, guestMode, leadId);
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    if (selectedLead?.id === updatedLead.id) {
      setSelectedLead(updatedLead);
    }
    await saveLead(user?.uid || null, guestMode, updatedLead);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
          <p className="text-sm text-text-s font-mono">Initializing LeadForMe workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg flex flex-col md:flex-row font-sans text-text-s transition-colors duration-150">
      
      {/* Dynamic Navigation Sidebar */}
      <aside className="w-full md:w-64 bg-sidebar-bg border-b md:border-b-0 md:border-r border-border-p flex flex-col justify-between p-5 md:min-h-screen">
        <div>
          {/* Logo Branding & Theme Toggle Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-emerald-500/20">
                L
              </div>
              <div>
                <h1 className="text-lg font-display font-semibold text-text-p tracking-tight">LeadForMe</h1>
                <span className="text-[10px] font-mono text-emerald-500">
                  {guestMode ? "Local Sandbox" : "Cloud Sync Mode"}
                </span>
              </div>
            </div>

            {/* Sun/Moon Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              className="p-2 bg-input-bg hover:bg-border-s border border-border-s rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => {
                setActiveTab("discover");
                setSelectedLead(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "discover" && !selectedLead
                  ? "bg-input-bg text-text-p border-l-2 border-emerald-500 font-semibold"
                  : "text-text-s hover:text-text-p hover:bg-input-bg/40"
              }`}
            >
              <Map className="w-4 h-4 text-emerald-400" />
              Scan Google Maps
            </button>

            <button
              onClick={() => {
                setActiveTab("pipeline");
                setSelectedLead(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "pipeline" || selectedLead
                  ? "bg-input-bg text-text-p border-l-2 border-emerald-500 font-semibold"
                  : "text-text-s hover:text-text-p hover:bg-input-bg/40"
              }`}
            >
              <KanbanSquare className="w-4 h-4 text-emerald-400" />
              Lead Pipeline Board
            </button>

            <button
              onClick={() => {
                setActiveTab("billing");
                setSelectedLead(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "billing"
                  ? "bg-input-bg text-text-p border-l-2 border-emerald-500 font-semibold"
                  : "text-text-s hover:text-text-p hover:bg-input-bg/40"
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Plans & Pricing
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                setSelectedLead(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-input-bg text-text-p border-l-2 border-emerald-500 font-semibold"
                  : "text-text-s hover:text-text-p hover:bg-input-bg/40"
              }`}
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              Agency Profile
            </button>
          </nav>
        </div>

        {/* Agency Profile Info at bottom of Sidebar */}
        <div className="mt-8 pt-4 border-t border-border-p space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-border-s flex items-center justify-center text-text-p font-bold uppercase text-xs">
              {agencyBranding?.agencyName ? agencyBranding.agencyName.substring(0, 2) : "AG"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-text-p truncate">
                {agencyBranding?.agencyName || "My Agency"}
              </p>
              <span className="text-[10px] text-text-s opacity-60 font-mono truncate block">
                {agencyBranding?.agencyWebsite || "No agency site"}
              </span>
            </div>
          </div>

          {/* Quick login/logout indicator in sidebar */}
          {user ? (
            <button
              onClick={logout}
              className="w-full py-1.5 px-3 bg-border-s hover:bg-border-p text-text-p text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="w-full py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In with Google
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {selectedLead ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <LeadDetails
              lead={selectedLead}
              onBack={() => setSelectedLead(null)}
              onUpdateLead={handleUpdateLead}
            />
          </motion.div>
        ) : (
          <div className="space-y-6">
            {activeTab === "discover" && (
              <LeadSearch onAddLead={handleAddLead} existingLeads={leads} />
            )}

            {activeTab === "pipeline" && (
              <CrmPipeline
                leads={leads}
                onSelectLead={setSelectedLead}
                onUpdateStatus={handleUpdateStatus}
                onDeleteLead={handleDeleteLead}
              />
            )}

            {activeTab === "settings" && <UserSettingsView />}

            {activeTab === "billing" && <BillingView />}
          </div>
        )}
      </main>
    </div>
  );
}
