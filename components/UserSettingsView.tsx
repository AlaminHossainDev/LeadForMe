"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Save, User, Globe, Shield, LogIn, LogOut, CheckCircle, Loader2 } from "lucide-react";
import { useFirebase } from "../context/FirebaseContext";
import { getSettings, saveSettings, UserSettings } from "../lib/store";

export default function UserSettingsView() {
  const { user, loginWithGoogle, logout, guestMode } = useFirebase();
  const [agencyName, setAgencyName] = useState("");
  const [agencyWebsite, setAgencyWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getSettings(user?.uid || null, guestMode);
      setAgencyName(data.agencyName);
      setAgencyWebsite(data.agencyWebsite);
    }
    load();
  }, [user, guestMode]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await saveSettings(user?.uid || null, guestMode, {
      agencyName,
      agencyWebsite,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Firebase Sign-in / Mode Status */}
      <div className="bg-panel-bg border border-border-p rounded-xl p-6 shadow-lg">
        <h3 className="text-md font-display font-semibold text-text-p mb-2 flex items-center gap-1.5">
          <Shield className="w-4.5 h-4.5 text-emerald-400" />
          Account & Data Sync
        </h3>

        {user ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-sm text-text-s font-sans">
                Logged in as <span className="text-emerald-400 font-semibold">{user.displayName || user.email}</span>
              </p>
              <p className="text-xs text-text-s opacity-60 font-sans mt-0.5">
                All lead pipelines and AI reports are securely synchronized with Firestore.
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg font-sans transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-text-s font-sans leading-relaxed">
              You are currently using <span className="text-emerald-400 font-semibold">Local Sandbox Mode</span>. Your data is stored in your local browser cache. Sign in to sync your leads to Firestore permanently.
            </p>
            <button
              onClick={loginWithGoogle}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-semibold rounded-lg font-sans transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              <LogIn className="w-4 h-4" />
              Sign In with Google
            </button>
          </div>
        )}
      </div>

      {/* Agency Branding Settings Form */}
      <div className="bg-panel-bg border border-border-p rounded-xl p-6 shadow-lg">
        <h3 className="text-md font-display font-semibold text-text-p mb-4 flex items-center gap-1.5">
          <User className="w-4.5 h-4.5 text-emerald-400" />
          Agency Details
        </h3>

        <form onSubmit={handleSave} className="space-y-4 font-sans">
          <div>
            <label className="text-xs text-text-s block mb-1">Agency Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-text-s" />
              <input
                type="text"
                placeholder="e.g. Vanguard Design Studio"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-input-bg border border-border-s rounded-lg text-text-p font-sans focus:outline-none focus:border-emerald-500 transition-colors placeholder-zinc-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-s block mb-1">Agency Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 w-4 h-4 text-text-s" />
              <input
                type="text"
                placeholder="e.g. vanguardweb.design"
                value={agencyWebsite}
                onChange={(e) => setAgencyWebsite(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-input-bg border border-border-s rounded-lg text-text-p font-sans focus:outline-none focus:border-emerald-500 transition-colors placeholder-zinc-500 text-sm"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3 justify-end">
            {saved && (
              <span className="text-emerald-400 text-xs flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Settings Saved
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold rounded-lg font-sans text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
