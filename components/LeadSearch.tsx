"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, MapPin, Loader2, Sparkles, CheckCircle, HelpCircle, ArrowRight } from "lucide-react";
import { Lead } from "../lib/store";

interface LeadSearchProps {
  onAddLead: (lead: Lead) => void;
  existingLeads: Lead[];
}

export default function LeadSearch({ onAddLead, existingLeads }: LeadSearchProps) {
  const [category, setCategory] = useState("Dentist");
  const [location, setLocation] = useState("Denver, CO");
  const [searching, setSearching] = useState(false);
  const [searchStep, setSearchStep] = useState("");
  const [searchResults, setSearchResults] = useState<Partial<Lead>[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !location) return;

    setSearching(true);
    setSearchResults([]);

    const steps = [
      "Connecting to Google Maps API...",
      "Scraping local business directories...",
      "Extracting domain addresses...",
      "Filtering out large enterprise sites..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setSearchStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Generate 8 beautiful dynamic mock results tailored to user search niche & location!
    const cleanLocation = location.split(",")[0].trim();
    const cleanCategory = category.trim();
    
    const companyTemplates = [
      { prefix: "", suffix: "Hub" },
      { prefix: "Elite", suffix: "" },
      { prefix: "Downtown", suffix: "Group" },
      { prefix: "Apex", suffix: "" },
      { prefix: "", suffix: "Experts" },
      { prefix: "Metro", suffix: "Associates" },
      { prefix: "Summit", suffix: "Solutions" },
      { prefix: "Vanguard", suffix: "" },
    ];

    const streets = [
      "Pine St", "Broadway", "Pearl St", "Oak Ave", "Maple Dr", "Main St", "Cedar Rd", "Elm St"
    ];

    const mockFound: Partial<Lead>[] = companyTemplates.map((template, idx) => {
      const companyName = template.prefix 
        ? `${template.prefix} ${cleanCategory} ${template.suffix}`.trim()
        : `${cleanLocation} ${cleanCategory} ${template.suffix}`.trim();
        
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const website = `www.${slug}.com`;
      const phone = `(303) 555-0${100 + (idx + 1) * 11}`;
      const address = `${100 + (idx + 1) * 118} ${streets[idx % streets.length]}, ${location}`;

      return {
        id: `search-${Date.now()}-${idx + 1}`,
        name: companyName,
        website: website,
        phone: phone,
        address: address,
        industry: `${cleanCategory} Services`,
        status: "discovered",
        siteSpeed: 0,
        mobileFriendly: false,
        seoScore: 0,
        sslEnabled: false,
      };
    });

    setSearchResults(mockFound);
    setSearching(false);
    setSearchStep("");
  };

  return (
    <div className="space-y-6">
      {/* Search Bar Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-panel-bg border border-border-p rounded-xl p-6 shadow-xl"
      >
        <h2 className="text-xl font-display font-semibold text-text-p mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-400" />
          Scan Google Maps for Prospects
        </h2>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label className="text-xs text-text-s block mb-1 font-sans">Business Niche / Category</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-text-s" />
              <input
                type="text"
                placeholder="e.g. Dentist, Roofer, Lawyer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input-bg border border-border-s rounded-lg text-text-p font-sans focus:outline-none focus:border-emerald-500 transition-colors placeholder-zinc-500"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs text-text-s block mb-1 font-sans">Location / City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-text-s" />
              <input
                type="text"
                placeholder="e.g. Denver, CO"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input-bg border border-border-s rounded-lg text-text-p font-sans focus:outline-none focus:border-emerald-500 transition-colors placeholder-zinc-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={searching}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold rounded-lg font-sans transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Map...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Find Local Leads
                </>
              )}
            </button>
          </div>
        </form>

        {searching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center gap-3 bg-input-bg border border-emerald-500/20 p-3 rounded-lg text-emerald-400 font-mono text-xs"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{searchStep}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-s font-display uppercase tracking-wider">
            Discovered Map Matches ({searchResults.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {searchResults.map((result, idx) => {
              const alreadySaved = existingLeads.some((l) => l.website === result.website);

              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-panel-bg border border-border-p hover:border-border-s transition-all rounded-xl p-5 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono uppercase bg-border-s text-text-p px-2 py-0.5 rounded">
                        {result.industry}
                      </span>
                      {alreadySaved && (
                        <span className="text-xs text-emerald-400 font-sans flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Saved
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-display font-medium text-text-p line-clamp-1">{result.name}</h4>
                    <p className="text-sm text-text-s font-mono line-clamp-1 mb-4">{result.website}</p>

                    <div className="space-y-2 text-xs text-text-s font-sans mb-4">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-text-s opacity-60" />
                        {result.address}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddLead(result as Lead)}
                    disabled={alreadySaved}
                    className="w-full py-2 bg-input-bg hover:bg-border-s disabled:bg-zinc-900 disabled:text-zinc-600 border border-border-s disabled:border-zinc-800 text-text-p font-medium rounded-lg text-sm font-sans transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {alreadySaved ? (
                      "Added to CRM Pipeline"
                    ) : (
                      <>
                        Add to Pipeline
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
