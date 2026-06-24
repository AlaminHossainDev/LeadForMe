"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Sparkles, Loader2, Play, Check, Copy, ShieldCheck, AlertTriangle, Cpu, Mail, Download, RefreshCw } from "lucide-react";
import { Lead } from "../lib/store";

interface LeadDetailsProps {
  lead: Lead;
  onBack: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
}

export default function LeadDetails({ lead, onBack, onUpdateLead }: LeadDetailsProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [loadingState, setLoadingState] = useState("");

  const runAudit = async () => {
    setAnalyzing(true);
    
    const states = [
      "Contacting headless server...",
      "Simulating Chromium viewport rendering...",
      "Capturing mobile UI elements...",
      "Running Lighthouse Core Web Vitals audit...",
      "Running Gemini 3.5-Flash to analyze opportunities...",
      "Generating strategic outreach pitch..."
    ];

    let stateIdx = 0;
    const interval = setInterval(() => {
      if (stateIdx < states.length - 1) {
        setLoadingState(states[stateIdx]);
        stateIdx++;
      }
    }, 1200);

    try {
      setLoadingState(states[0]);
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          website: lead.website,
          industry: lead.industry
        })
      });

      clearInterval(interval);
      const data = await res.json();

      const updated: Lead = {
        ...lead,
        siteSpeed: data.siteSpeed,
        mobileFriendly: data.mobileFriendly,
        seoScore: data.seoScore,
        sslEnabled: data.sslEnabled,
        opportunityScore: data.opportunityScore,
        aiAudit: data.aiAudit,
        status: "analyzed" as const,
        updatedAt: new Date().toISOString()
      };

      onUpdateLead(updated);
    } catch (error) {
      console.error("Failed to run Gemini audit:", error);
    } finally {
      clearInterval(interval);
      setAnalyzing(false);
      setLoadingState("");
    }
  };

  const copyText = (text: string, type: "subject" | "body") => {
    navigator.clipboard.writeText(text);
    if (type === "subject") {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  // Helper to extract email pitch from markdown
  const extractEmailPitch = (markdown: string) => {
    if (!markdown) return { subject: "", body: "" };
    
    const subjectMatch = markdown.match(/Subject:\s*(.*)/i);
    const bodyStartIndex = markdown.search(/Hi\s+team|Hi\s+\[|Dear\s+/i);
    
    let subject = subjectMatch ? subjectMatch[1].trim() : `Helping ${lead.name} scale operations online`;
    let body = "";
    
    if (bodyStartIndex !== -1) {
      body = markdown.substring(bodyStartIndex).trim();
    } else {
      body = `Hi Team,\n\nI was reviewing your website and noticed some mobile responsiveness and site performance optimization areas. Would you be open to a quick call to look at modern design solutions that can double your mobile conversions?\n\nBest regards,\nYour Web Agency`;
    }

    return { subject, body };
  };

  const { subject: emailSubject, body: emailBody } = extractEmailPitch(lead.aiAudit || "");

  return (
    <div className="space-y-6">
      {/* Header and Back Action */}
      <div className="flex items-center justify-between border-b border-border-p pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pipeline
        </button>
        <span className="text-xs font-mono text-zinc-500">
          Last updated: {new Date(lead.updatedAt).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Info and Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-panel-bg border border-border-p rounded-xl p-6 shadow-lg">
            <span className="text-[10px] font-mono uppercase bg-border-s text-text-p px-2 py-0.5 rounded">
              {lead.industry}
            </span>
            <h2 className="text-2xl font-display font-semibold text-text-p mt-3">{lead.name}</h2>
            <a
              href={`https://${lead.website}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-emerald-400 hover:underline inline-flex items-center gap-1 mt-1 font-mono"
            >
              {lead.website}
            </a>

            <div className="mt-6 space-y-4 font-sans">
              <div className="flex justify-between text-sm py-2 border-b border-border-s">
                <span className="text-text-s font-medium">Phone</span>
                <span className="text-text-p">{lead.phone || "Not Listed"}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-border-s">
                <span className="text-text-s font-medium">Location</span>
                <span className="text-text-p text-right line-clamp-1">{lead.address}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-border-s">
                <span className="text-text-s font-medium">Sales Stage</span>
                <span className="text-emerald-400 font-semibold uppercase font-mono text-xs bg-emerald-500/10 px-2 py-0.5 rounded">
                  {lead.status}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Metrics display */}
          {lead.status === "discovered" ? (
            <div className="bg-panel-bg border border-border-p rounded-xl p-6 shadow-lg flex flex-col items-center justify-center text-center py-10">
              <Cpu className="w-12 h-12 text-text-s opacity-40 mb-4 animate-pulse" />
              <h3 className="text-lg font-display font-medium text-text-p mb-2">No Website Audit Yet</h3>
              <p className="text-sm text-text-s mb-6">
                Connect to our headless scanner to calculate opportunity scores and generate personalized pitches using Gemini AI.
              </p>
              <button
                onClick={runAudit}
                disabled={analyzing}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold rounded-lg font-sans transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Auditing Website...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run Gemini AI Audit
                  </>
                )}
              </button>

              {analyzing && (
                <div className="mt-4 w-full text-left bg-input-bg border border-emerald-500/20 p-3 rounded-lg text-emerald-400 font-mono text-xs">
                  <p className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {loadingState}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-panel-bg border border-border-p rounded-xl p-6 shadow-lg space-y-6">
              <h3 className="text-md font-display font-semibold text-text-p border-b border-border-p pb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Technical Health Scores
              </h3>

              <div className="space-y-4">
                {/* Speed score bar */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-zinc-400">Loading Speed</span>
                    <span className={lead.siteSpeed >= 70 ? "text-emerald-400" : lead.siteSpeed >= 40 ? "text-amber-400" : "text-red-400"}>
                      {lead.siteSpeed}/100
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        lead.siteSpeed >= 70 ? "bg-emerald-500" : lead.siteSpeed >= 40 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${lead.siteSpeed}%` }}
                    />
                  </div>
                </div>

                {/* SEO score bar */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-zinc-400">SEO Score</span>
                    <span className={lead.seoScore >= 70 ? "text-emerald-400" : lead.seoScore >= 40 ? "text-amber-400" : "text-red-400"}>
                      {lead.seoScore}/100
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        lead.seoScore >= 70 ? "bg-emerald-500" : lead.seoScore >= 40 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${lead.seoScore}%` }}
                    />
                  </div>
                </div>

                {/* Badges for binary values */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className={`p-3 rounded-lg border text-center font-sans ${
                    lead.mobileFriendly ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-400"
                  }`}>
                    {lead.mobileFriendly ? (
                      <div className="flex flex-col items-center gap-1 text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        Mobile Ready
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        Not Mobile Ready
                      </div>
                    )}
                  </div>

                  <div className={`p-3 rounded-lg border text-center font-sans ${
                    lead.sslEnabled ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-400"
                  }`}>
                    {lead.sslEnabled ? (
                      <div className="flex flex-col items-center gap-1 text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        SSL Secured
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        Missing SSL
                      </div>
                    )}
                  </div>
                </div>

                {/* Re-run button */}
                <button
                  onClick={runAudit}
                  disabled={analyzing}
                  className="w-full py-2 border border-border-s hover:bg-input-bg/40 text-text-p rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? "animate-spin" : ""}`} />
                  Re-analyze Site
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Columns: Report & Pitch Tabs */}
        {lead.status !== "discovered" && (
          <div className="lg:col-span-2 space-y-6">
            {/* Audit findings */}
            <div className="bg-panel-bg border border-border-p rounded-xl p-6 shadow-lg">
              <h3 className="text-md font-display font-semibold text-text-p border-b border-border-p pb-2 flex items-center gap-1.5 mb-4">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Gemini AI Audit Findings
              </h3>
              <div className="prose prose-invert prose-zinc prose-sm max-w-none text-zinc-300 leading-relaxed font-sans space-y-4">
                {/* Format markdown dynamically */}
                {lead.aiAudit ? (
                  lead.aiAudit.split("\n").map((line, i) => {
                    if (line.startsWith("### ")) {
                      return <h4 key={i} className="text-base font-semibold text-white mt-4">{line.replace("### ", "")}</h4>;
                    }
                    if (line.startsWith("#### ")) {
                      return <h5 key={i} className="text-sm font-semibold text-white mt-3">{line.replace("#### ", "")}</h5>;
                    }
                    if (line.startsWith("- ")) {
                      return <li key={i} className="list-disc ml-4 pl-1 text-zinc-400">{line.replace("- ", "")}</li>;
                    }
                    if (line.trim() === "" || line.startsWith("Subject:") || line.startsWith("Hi team") || line.startsWith("Hi [") || line.startsWith("Dear ")) {
                      return null; // Don't duplicate the outreach section in the technical findings
                    }
                    return <p key={i} className="text-zinc-300 text-sm">{line}</p>;
                  })
                ) : (
                  <p className="text-zinc-500 italic">No report content generated.</p>
                )}
              </div>
            </div>

            {/* Email outreach generator */}
            <div className="bg-panel-bg border border-border-p rounded-xl p-6 shadow-lg">
              <h3 className="text-md font-display font-semibold text-text-p border-b border-border-p pb-2 flex items-center gap-1.5 mb-4">
                <Mail className="w-4 h-4 text-emerald-400" />
                Personalized Outreach Campaign
              </h3>
              <div className="space-y-4 font-sans">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-text-s uppercase font-mono tracking-wider">Email Subject</span>
                    <button
                      onClick={() => copyText(emailSubject, "subject")}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedSubject ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedSubject ? "Copied" : "Copy Subject"}
                    </button>
                  </div>
                  <div className="bg-input-bg border border-border-s p-3 rounded-lg text-text-p font-sans text-sm font-medium">
                    {emailSubject}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-text-s uppercase font-mono tracking-wider">Email Body</span>
                    <button
                      onClick={() => copyText(emailBody, "body")}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedBody ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedBody ? "Copied" : "Copy Email Body"}
                    </button>
                  </div>
                  <pre className="bg-input-bg border border-border-s p-4 rounded-lg text-text-s font-sans text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {emailBody}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
