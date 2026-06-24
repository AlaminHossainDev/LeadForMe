"use client";

import React from "react";
import { DBLead } from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  Briefcase,
  Flame,
  Globe,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ExternalLink
} from "lucide-react";

interface DashboardHomeProps {
  leads: DBLead[];
  onSelectLead: (lead: DBLead) => void;
  onNavigate: (tab: string) => void;
}

export default function DashboardHome({ leads, onSelectLead, onNavigate }: DashboardHomeProps) {
  // 1. Calculate main stats
  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.leadStatus === "Hot").length;
  
  // Audited sites count: let's say a lead is audited if it has notes describing score or if its score has been modified
  const auditedLeads = leads.filter((l) => l.opportunityScore > 0).length;

  // Pipeline stages value estimation (e.g. $1,500 for PROPOSAL_SENT, $2,500 for WON, etc.)
  const pipelineValue = leads.reduce((sum, lead) => {
    switch (lead.pipelineStage) {
      case "NEW": return sum + 500;
      case "CONTACTED": return sum + 1000;
      case "FOLLOW_UP": return sum + 1200;
      case "MEETING_BOOKED": return sum + 2000;
      case "PROPOSAL_SENT": return sum + 3500;
      case "WON": return sum + 5000;
      default: return sum;
    }
  }, 0);

  // 2. Format chart data: Pipeline Stages
  const stagesList = ["NEW", "CONTACTED", "FOLLOW_UP", "MEETING_BOOKED", "PROPOSAL_SENT", "WON", "LOST"];
  const stageData = stagesList.map(stage => ({
    name: stage.replace("_", " "),
    Leads: leads.filter(l => l.pipelineStage === stage).length,
  }));

  // 3. Format chart data: Lead status
  const statusData = [
    { name: "Hot", value: leads.filter(l => l.leadStatus === "Hot").length, color: "#10b981" },
    { name: "Warm", value: leads.filter(l => l.leadStatus === "Warm").length, color: "#f59e0b" },
    { name: "Cold", value: leads.filter(l => l.leadStatus === "Cold").length, color: "#ef4444" },
  ].filter(item => item.value > 0);

  // Fallback charts if no data
  const defaultStageData = [
    { name: "NEW", Leads: 4 },
    { name: "CONTACTED", Leads: 7 },
    { name: "FOLLOW UP", Leads: 5 },
    { name: "MEETING", Leads: 2 },
    { name: "PROPOSAL", Leads: 1 },
    { name: "WON", Leads: 3 }
  ];

  const defaultStatusData = [
    { name: "Hot", value: 5, color: "#10b981" },
    { name: "Warm", value: 8, color: "#f59e0b" },
    { name: "Cold", value: 4, color: "#ef4444" }
  ];

  // Recent Hot Leads to follow up on
  const recentHotLeads = leads
    .filter(l => l.leadStatus === "Hot" && l.pipelineStage === "NEW")
    .slice(0, 5);

  return (
    <div id="dashboard-home" className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Agency Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">Here is a real-time health summary of your web design pipeline and lead audits.</p>
        </div>
        <button
          onClick={() => onNavigate("search")}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-semibold rounded-xl text-sm transition duration-150 inline-flex items-center space-x-2 shadow-lg shadow-emerald-500/10 shrink-0"
        >
          <span>Discover New Leads</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Discovery Leads", value: totalLeads, icon: Briefcase, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
          { title: "Hot Agency Prospects", value: hotLeads, icon: Flame, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { title: "Websites Audited", value: auditedLeads, icon: Globe, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
          { title: "Estimated Deal Value", value: `$${pipelineValue.toLocaleString()}`, icon: TrendingUp, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" }
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.title}</span>
              <p className="text-3xl font-extrabold text-white">{stat.value}</p>
            </div>
            <div className={`p-3.5 rounded-xl border ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline stage distribution */}
        <div className="lg:col-span-8 p-6 bg-slate-900/30 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-200">CRM Pipeline Distribution</h3>
            <p className="text-xs text-slate-500">Leads grouped by business contract pipeline stage.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={totalLeads > 0 ? stageData : defaultStageData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                  cursor={{ fill: "#1e293b", opacity: 0.3 }}
                />
                <Bar dataKey="Leads" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead status Pie Chart */}
        <div className="lg:col-span-4 p-6 bg-slate-900/30 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-200">Opportunity Temperature</h3>
            <p className="text-xs text-slate-500">Breakdown of leads by priority hotness.</p>
          </div>
          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={totalLeads > 0 ? statusData : defaultStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(totalLeads > 0 ? statusData : defaultStatusData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend Overlay */}
            <div className="absolute text-center">
              <span className="text-xs text-slate-500 uppercase font-mono block">Status</span>
              <span className="text-xl font-bold text-white">{totalLeads > 0 ? `${hotLeads} Hot` : "Demo Mode"}</span>
            </div>
          </div>
          <div className="flex justify-around text-xs text-slate-400 border-t border-slate-800/60 pt-4">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Hot</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Warm</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Cold</span>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Action Items */}
      <div className="p-6 bg-slate-900/30 border border-slate-800/80 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-200">Hot Leads Waiting for Outreach</h3>
            <p className="text-xs text-slate-500">Uncontacted local business opportunities with severe website issues.</p>
          </div>
          <button
            onClick={() => onNavigate("crm")}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center space-x-1"
          >
            <span>View Pipeline Board</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentHotLeads.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-slate-950/20 border border-slate-900 border-dashed">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">All caught up! No uncontacted Hot leads.</p>
            <p className="text-xs text-slate-600 mt-1">Discover more businesses or drag items into NEW on the pipeline board.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-mono text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Business Name</th>
                  <th className="pb-3">Industry</th>
                  <th className="pb-3">Opportunity</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {recentHotLeads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-slate-800/20 transition duration-150">
                    <td className="py-4 pl-2 font-semibold text-slate-200">
                      <div className="flex flex-col">
                        <span>{lead.businessName}</span>
                        <span className="text-xs font-normal text-slate-500 flex items-center space-x-1">
                          <span className="truncate max-w-[200px]">{lead.website || "No website"}</span>
                          {lead.website && <ExternalLink className="w-2.5 h-2.5 shrink-0" />}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-400">{lead.category}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {lead.opportunityScore}%
                        </span>
                        <span className="text-xs font-medium text-slate-500">Score</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-400 font-mono text-xs">{lead.phone || "N/A"}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 font-semibold rounded-lg text-xs transition duration-150"
                      >
                        Launch Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
