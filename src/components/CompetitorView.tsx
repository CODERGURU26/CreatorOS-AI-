import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Sparkles,
  TrendingUp,
  Cpu,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { CompetitorReport } from "../types";

export default function CompetitorView() {
  const [competitorUsername, setCompetitorUsername] = useState("@lexfridman");
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<CompetitorReport | null>(null);
  const [realData, setRealData] = useState<any>(null);

  const handleRunAnalysis = async () => {
    if (!competitorUsername.trim()) return;
    setIsRunning(true);
    setReport(null);
    setRealData(null);
    try {
      const cleanUsername = competitorUsername.replace('@', '');
      const igRes = await fetch(`/api/competitor?username=${cleanUsername}`);
      const igResult = await igRes.json();
      
      if (igResult.data) {
        setRealData(igResult.data);
      }
      
      const response = await fetch("/api/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "competitor_intelligence",
          prompt: competitorUsername,
        }),
      });
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error("Competitor analysis failed:", err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#050505] text-white font-sans relative">
      
      {/* Spotlight */}
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-red-900/10 blur-[100px] pointer-events-none" />

      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-white/5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Competitor Intelligence</h1>
        <p className="text-xs text-[#A1A1AA]">
          Deep strategic counter-intelligence mapping competitor viral outliers, weaknesses, and direct action plans.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Search Input Bar */}
        <div className="bg-[#111111]/90 border border-white/8 rounded-2xl p-6 shadow-xl relative backdrop-blur-md">
          <div className="max-w-2xl space-y-3">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
              Enter Competitor Social Username (Instagram or TikTok handle)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-[#A1A1AA] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={competitorUsername}
                  onChange={(e) => setCompetitorUsername(e.target.value)}
                  placeholder="e.g., @hubermanlab"
                  className="w-full bg-black/40 border border-white/8 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
              <button
                onClick={handleRunAnalysis}
                disabled={isRunning || !competitorUsername.trim()}
                className="px-6 py-3.5 bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Strategy...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run Deep Strategy Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Strategic Analysis Report Results */}
        <AnimatePresence mode="wait">
          {isRunning ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 bg-[#111111]/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-4 font-mono text-xs text-[#A1A1AA]"
            >
              <div className="w-10 h-10 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
              <div className="space-y-1 text-center">
                <p className="text-white font-semibold">OSINT Scrapers active on username targets...</p>
                <p className="text-[10px] text-white/30">Gemini mapping structural weaknesses and content patterns</p>
              </div>
            </motion.div>
          ) : report ? (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Left Column: Quick Profile Telemetry and Actions (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#111111]/90 border border-white/8 rounded-2xl p-5 shadow-xl font-mono text-xs space-y-4 relative">
                  <div className="absolute top-0 right-0 px-2 py-1 bg-green-500/10 text-green-400 text-[8px] rounded-bl-xl border-l border-b border-green-500/20 uppercase">
                    Verified Public Data
                  </div>
                  <div className="border-b border-white/5 pb-3">
                    <span className="text-[9px] uppercase text-[#A1A1AA]">Profile Scope</span>
                    <h3 className="text-base font-bold text-white mt-1">@{realData?.username || report.username}</h3>
                  </div>

                  <div className="space-y-3 text-[11px]">
                    <div>
                      <span className="text-white/40 block">Real Followers:</span>
                      <span className="text-white font-bold">{realData?.followers_count?.toLocaleString() || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Real Media Count:</span>
                      <span className="text-cyan-400 font-bold">{realData?.media_count?.toLocaleString() || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Sections */}
                <div className="bg-[#111111]/90 border border-white/8 rounded-2xl p-5 shadow-xl font-mono text-xs space-y-4 relative">
                  <div className="absolute top-0 right-0 px-2 py-1 bg-purple-500/10 text-purple-400 text-[8px] rounded-bl-xl border-l border-b border-purple-500/20 uppercase flex items-center gap-1">
                    <Sparkles className="w-2 h-2" /> AI Strategic Analysis
                  </div>
                  
                  <div className="space-y-3 text-[11px] pt-4">
                    <div>
                      <span className="text-white/40 block">Est. Posting Frequency:</span>
                      <span className="text-white font-bold">{report.postingFrequency}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Est. Engagement Rate:</span>
                      <span className="text-cyan-400 font-bold">{report.estimatedEngagement}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Top Keyword Hashtags:</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {report.topHashtags?.map((tag) => (
                          <span key={tag} className="text-[9px] text-[#A1A1AA] bg-white/5 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tactical recommendations banner list */}
                <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider font-mono">
                    Tactical Counter-strategy
                  </h4>
                  <ul className="space-y-2 text-xs text-[#A1A1AA] leading-relaxed">
                    {report.actionPlan?.map((plan, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-purple-400 font-bold">❯</span>
                        <span>{plan}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Outliers and Sourced Audits (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Outlier videos analysis */}
                <div className="bg-[#111111]/90 border border-white/8 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="font-bold text-sm text-white font-sans flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" /> Outlier Viral Content Analysis
                  </h3>
                  
                  <div className="space-y-3.5">
                    {report.topViralReels?.map((reel, idx) => (
                      <div key={idx} className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                            Hook: "{reel.hook}"
                          </span>
                          <span className="text-xs font-extrabold text-white font-mono">{reel.views} Views</span>
                        </div>
                        <p className="text-xs text-[#A1A1AA] font-light leading-relaxed">
                          <span className="text-white/40 font-mono text-[10px] mr-1">Viral Catalyst:</span>
                          {reel.reasonForViral}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sourced strengths and structural flaws */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#111111]/90 border border-white/8 rounded-2xl p-5 shadow-xl space-y-3">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <CheckCircle className="w-4 h-4 text-green-400" /> Strengths
                    </h4>
                    <ul className="space-y-2 text-xs text-[#A1A1AA] leading-normal font-light">
                      {report.strengths?.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-400 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#111111]/90 border border-white/8 rounded-2xl p-5 shadow-xl space-y-3">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <AlertTriangle className="w-4 h-4 text-red-400" /> Structural Flaws
                    </h4>
                    <ul className="space-y-2 text-xs text-[#A1A1AA] leading-normal font-light">
                      {report.weaknesses?.map((weak, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-400 font-bold">•</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <div className="py-24 text-center text-xs text-[#A1A1AA] font-mono border border-white/5 bg-[#111111]/20 rounded-2xl">
              OSINT core waiting. Type in a competitor handle above and click analyze.
            </div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}

