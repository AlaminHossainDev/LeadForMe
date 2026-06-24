"use client";

import React from "react";
import { motion } from "motion/react";
import { FileText, ArrowRight, Trash2, Calendar, Phone, Globe, ChevronRight } from "lucide-react";
import { Lead } from "../lib/store";

interface CrmPipelineProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, status: Lead["status"]) => void;
  onDeleteLead: (leadId: string) => void;
}

const STAGES: { id: Lead["status"]; title: string; color: string; border: string; bg: string }[] = [
  { id: "discovered", title: "Discovered Map", color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5" },
  { id: "analyzed", title: "Site Analyzed", color: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/5" },
  { id: "contacted", title: "Pitch Sent", color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5" },
  { id: "won", title: "Won Lead 🎉", color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
  { id: "lost", title: "Lost", color: "text-zinc-500", border: "border-zinc-800", bg: "bg-zinc-950/20" },
];

export default function CrmPipeline({ leads, onSelectLead, onUpdateStatus, onDeleteLead }: CrmPipelineProps) {
  // Aggregate stats
  const totalCount = leads.length;
  const highIntentCount = leads.filter((l) => l.opportunityScore >= 80).length;
  const averageOpportunity = totalCount > 0 ? Math.round(leads.reduce((sum, l) => sum + l.opportunityScore, 0) / totalCount) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-panel-bg border border-border-p p-5 rounded-xl flex flex-col justify-between shadow-lg">
          <span className="text-xs font-sans text-text-s">Total Active Leads</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-display font-semibold text-text-p">{totalCount}</span>
            <span className="text-xs text-text-s">Businesses Found</span>
          </div>
        </div>
        <div className="bg-panel-bg border border-border-p p-5 rounded-xl flex flex-col justify-between shadow-lg">
          <span className="text-xs font-sans text-text-s">High-Intent (Score &gt;= 80)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-display font-semibold text-emerald-500">{highIntentCount}</span>
            <span className="text-xs text-text-s">Need immediate help</span>
          </div>
        </div>
        <div className="bg-panel-bg border border-border-p p-5 rounded-xl flex flex-col justify-between shadow-lg">
          <span className="text-xs font-sans text-text-s">Average Opportunity Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-display font-semibold text-blue-500">{averageOpportunity}%</span>
            <span className="text-xs text-text-s">High Score = Great Lead</span>
          </div>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.id);

          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 min-w-[260px] bg-input-bg/30 border ${stage.border} rounded-xl p-4 flex flex-col h-[calc(100vh-320px)] min-h-[480px] shadow-inner`}
            >
              {/* Stage Header */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-p">
                <h4 className={`text-sm font-display font-semibold ${stage.color} flex items-center gap-1.5`}>
                  {stage.title}
                </h4>
                <span className="text-xs bg-border-s text-text-s px-2 py-0.5 rounded-full font-mono">
                  {stageLeads.length}
                </span>
              </div>

              {/* Scrollable list of cards */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {stageLeads.length === 0 ? (
                  <div className="h-24 border border-dashed border-border-s rounded-lg flex items-center justify-center text-xs text-text-s opacity-60 font-sans">
                    No leads here
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <motion.div
                      layoutId={`lead-card-${lead.id}`}
                      key={lead.id}
                      className="bg-panel-bg border border-border-p hover:border-border-s p-3.5 rounded-lg shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                              lead.opportunityScore >= 80
                                ? "bg-red-500/10 text-red-400"
                                : lead.opportunityScore >= 50
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            Score: {lead.opportunityScore}%
                          </span>
                          <button
                            onClick={() => onDeleteLead(lead.id)}
                            className="text-text-s hover:text-red-500 transition-colors p-1 rounded hover:bg-border-s opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h5 className="text-sm font-display font-medium text-text-p line-clamp-1 mb-1">{lead.name}</h5>
                        <p className="text-xs text-text-s font-mono line-clamp-1 mb-3">{lead.website}</p>
                      </div>

                      <div className="pt-2 border-t border-border-s flex items-center justify-between gap-2 mt-2">
                        {/* Status Mover */}
                        <div className="flex gap-1">
                          {STAGES.map(
                            (s) =>
                              s.id !== lead.status && (
                                <button
                                  key={s.id}
                                  title={`Move to ${s.title}`}
                                  onClick={() => onUpdateStatus(lead.id, s.id)}
                                  className="w-2.5 h-2.5 rounded-full bg-border-s hover:bg-border-p transition-colors cursor-pointer"
                                />
                              )
                          )}
                        </div>

                        <button
                          onClick={() => onSelectLead(lead)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-sans flex items-center gap-0.5 transition-colors cursor-pointer"
                        >
                          Audit Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
