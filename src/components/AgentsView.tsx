import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Play,
  Copy,
  Check,
  Flame,
  Volume2,
  Calendar,
  Layers,
  FileText,
  TrendingUp,
  Cpu,
  Tv,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { AGENT_CARDS_INFO } from "../utils";
import { OnboardingData } from "../types";

interface AgentsViewProps {
  onboardingData: OnboardingData;
}

export default function AgentsView({ onboardingData }: AgentsViewProps) {
  const [selectedAgentId, setSelectedAgentId] = useState("trend_hunter");
  const [promptInput, setPromptInput] = useState(
    AGENT_CARDS_INFO.find((a) => a.id === "trend_hunter")?.defaultPrompt || ""
  );
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [enableHighThinking, setEnableHighThinking] = useState(false);

  const activeAgent = AGENT_CARDS_INFO.find((a) => a.id === selectedAgentId)!;

  // Handle agent selection change
  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId);
    setExecutionResult(null);
    const ag = AGENT_CARDS_INFO.find((a) => a.id === agentId)!;
    setPromptInput(ag.defaultPrompt);
    setEnableHighThinking(agentId === "ai_ceo");
  };

  // Run server API request
  const handleRunAgent = async () => {
    setIsRunning(true);
    setExecutionResult(null);
    try {
      const response = await fetch("/api/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgentId,
          prompt: promptInput,
          enableHighThinking,
        }),
      });
      const data = await response.json();
      setExecutionResult(data);
    } catch (err) {
      console.error("Execution failed:", err);
    } finally {
      setIsRunning(false);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-transparent text-white font-sans relative">
      
      {/* Background glow spotlights */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-[#7C3AED]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#06B6D4]/5 blur-[100px] pointer-events-none" />

      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-white/5 relative z-10">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white to-[#D4D4D8] bg-clip-text text-transparent">AI Agent Pool</h1>
        <p className="text-xs text-[#A1A1AA]">
          Direct operational dispatch center for CreatorOS AI's 10 cognitive specialists.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Column: 10 Agent Selector Rails (5 cols) */}
        <div className="lg:col-span-4 space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {AGENT_CARDS_INFO.map((agent) => {
            const isSelected = agent.id === selectedAgentId;
            return (
              <button
                key={agent.id}
                onClick={() => handleAgentSelect(agent.id)}
                className={`w-full p-4 rounded-xl text-left border transition-all flex items-start space-x-3.5 relative overflow-hidden group glass-card-hover ${
                  isSelected
                    ? "border-purple-500/40 bg-white/[0.04] shadow-lg shadow-purple-500/5"
                    : "border-white/5 bg-white/[0.015]"
                }`}
              >
                {/* Accent decoration inside active block */}
                {isSelected && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#7C3AED] via-[#3B82F6] to-[#06B6D4]" />
                )}

                {/* Agent Color Sphere */}
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${agent.avatarColor} flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/10`}>
                  <Cpu className="w-4 h-4" />
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-xs text-white font-display">{agent.name}</h3>
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/10 px-1.5 py-0.2 rounded leading-none uppercase font-semibold">
                      IDLE
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A1A1AA] font-mono mt-0.5 truncate">{agent.role}</p>
                  <p className="text-[10px] text-[#D4D4D8] font-light mt-1.5 line-clamp-2 leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Dynamic Interactive Terminal Console (8 cols) */}
        <div className="lg:col-span-8">
          <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Header Control Panel */}
            <div className="px-6 py-4 border-b border-white/5 bg-black/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3.5 h-3.5 rounded bg-gradient-to-tr ${activeAgent.avatarColor} shrink-0`} />
                <div>
                  <h2 className="font-bold text-sm text-white font-display">{activeAgent.name} Console</h2>
                  <span className="text-[10px] text-[#A1A1AA] font-mono">{activeAgent.role}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[10px] font-mono text-[#A1A1AA]">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span>Autonomous Pipeline</span>
              </div>
            </div>

            {/* Console Content Panel */}
            <div className="p-6 space-y-6">
              
              {/* Agent Description */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                  Operational Guidelines
                </h4>
                <p className="text-xs text-white leading-relaxed font-light">
                  {activeAgent.description} This agent processes data stream telemetry through Gemini to render custom growth blueprints.
                </p>
              </div>

              {/* Console Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                  Define Target Scope / Prompt Topic
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder={activeAgent.defaultPrompt}
                    disabled={isRunning}
                    className="flex-1 bg-black/40 border border-white/8 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 font-mono"
                  />
                  <button
                    onClick={handleRunAgent}
                    disabled={isRunning || !promptInput.trim()}
                    className="px-6 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Execute
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* High Thinking Mode Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/20 mt-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full transition-all ${enableHighThinking ? "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "bg-white/20"}`} />
                  <div>
                    <span className="text-xs font-bold text-white block">Enable High Thinking Mode</span>
                    <span className="text-[10px] text-[#A1A1AA] font-mono block">
                      Forces <span className="text-purple-300">gemini-3.1-pro-preview</span> with high reasoning levels.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEnableHighThinking(!enableHighThinking)}
                  disabled={isRunning}
                  className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer outline-none relative flex items-center ${
                    enableHighThinking ? "bg-purple-600" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform shadow ${
                      enableHighThinking ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Execution Results Segment */}
              <div className="border-t border-white/5 pt-6 min-h-[240px]">
                <AnimatePresence mode="wait">
                  {isRunning ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-16 flex flex-col items-center justify-center space-y-4 font-mono text-xs text-[#A1A1AA]"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                        <Sparkles className="w-4 h-4 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-white font-semibold">Gemini processing query payload...</p>
                        <p className="text-[10px] text-white/30">Auto-aligning social graph parameters</p>
                      </div>
                    </motion.div>
                  ) : executionResult ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                          Telemetry Outflow (Raw/Parsed JSON)
                        </h3>
                        {executionResult?._isSimulated ? (
                          <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/10 px-2 py-0.5 rounded font-mono" title={executionResult?._simulationReason}>
                            Sandbox Simulation (Gemini Fallback)
                          </span>
                        ) : (
                          <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded font-mono">
                            Success
                          </span>
                        )}
                      </div>

                      {/* CONDITIONAL COMPONENT RENDER BASED ON AGENT ID */}
                      
                      {/* 1. Trend Hunter */}
                      {selectedAgentId === "trend_hunter" && (
                        <div className="space-y-5">
                          {/* Opportunity Score */}
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#A1A1AA] uppercase">Niche Opportunity Index</span>
                              <div className="text-xl font-bold mt-1 text-white">{executionResult.nicheOpportunityScore}/100</div>
                            </div>
                            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                          </div>

                          {/* Trending Audios */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-white flex items-center gap-1">
                              <Volume2 className="w-4 h-4 text-purple-400" /> Trending Soundtracks
                            </h4>
                            <div className="bg-black/30 border border-white/5 rounded-xl overflow-hidden">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-white/[0.02] border-b border-white/5 text-[#A1A1AA] font-mono text-[10px] uppercase">
                                  <tr>
                                    <th className="p-3">Track / Title</th>
                                    <th className="p-3">Trend Index</th>
                                    <th className="p-3">Video Volume</th>
                                    <th className="p-3">Velocity</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {executionResult.trendingAudios?.map((audio: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-white/[0.01]">
                                      <td className="p-3 font-semibold text-white">{audio.title}</td>
                                      <td className="p-3 text-cyan-400">{audio.trendScore}%</td>
                                      <td className="p-3 text-[#A1A1AA] font-mono">{audio.useCount}</td>
                                      <td className="p-3 text-green-400 font-mono">{audio.growthRate}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Hashtags and Topics */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">Actionable Hashtags</span>
                              <div className="flex flex-wrap gap-1.5 p-3.5 bg-black/20 border border-white/5 rounded-xl">
                                {executionResult.trendingHashtags?.map((hash: any, idx: number) => (
                                  <span key={idx} className="text-[11px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">
                                    {hash.tag || hash} <span className="text-white/30 text-[9px]">({hash.opportunityScore || "90"})</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">Growth Summary</span>
                              <p className="text-xs text-[#A1A1AA] leading-relaxed p-3.5 bg-black/20 border border-white/5 rounded-xl">
                                {executionResult.summary}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. Content Planner */}
                      {selectedAgentId === "content_planner" && (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                              <span className="text-[10px] text-[#A1A1AA] font-mono uppercase block">Best Posting Hour</span>
                              <p className="text-base font-bold text-purple-300 mt-1">
                                {executionResult.bestPostingTimes?.[0]?.time || "12:00 PM & 6:30 PM"}
                              </p>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                              <span className="text-[10px] text-[#A1A1AA] font-mono uppercase block">Recommended Series</span>
                              <p className="text-xs font-bold text-white mt-1 leading-relaxed">
                                {executionResult.seriesIdeas?.[0]?.title || "The Dark Room Protocols"}
                              </p>
                            </div>
                          </div>

                          {/* Roadmap */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block">Growth Roadmap Plan</span>
                            <ul className="space-y-1.5">
                              {executionResult.growthRoadmap?.map((road: string, idx: number) => (
                                <li key={idx} className="text-xs text-white flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                                  <span>{road}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 5-Day Calendar table */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block">Generated Actionable Slots</span>
                            <div className="space-y-2.5">
                              {executionResult.calendar?.map((slot: any, idx: number) => (
                                <div key={idx} className="p-4 bg-black/30 border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-1.5 py-0.2 rounded uppercase">
                                        Day {slot.day} - {slot.time}
                                      </span>
                                      <span className="text-[10px] font-mono text-purple-400 bg-[#7C3AED]/10 px-1.5 py-0.2 rounded">
                                        {slot.mixType}
                                      </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-white mt-1.5">{slot.topic}</h4>
                                    <p className="text-[11px] text-[#A1A1AA] leading-relaxed mt-1 font-light">
                                      {slot.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. Caption Writer */}
                      {selectedAgentId === "caption_writer" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {executionResult.captions?.map((cap: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl border border-white/5 bg-[#111111] flex flex-col justify-between h-52 relative group"
                            >
                              <div>
                                <span className="text-[9px] font-mono uppercase bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded block w-max">
                                  {cap.style} Style
                                </span>
                                <p className="text-xs text-[#A1A1AA] leading-relaxed font-light line-clamp-4 mt-3">
                                  "{cap.content}"
                                </p>
                                {cap.cta && (
                                  <p className="text-[10px] text-cyan-400 mt-2 font-medium">
                                    <span className="text-white/30 font-mono">CTA:</span> {cap.cta}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => copyToClipboard(`${cap.content} ${cap.cta || ""}`, idx)}
                                className="w-full mt-3 py-2 bg-white/5 hover:bg-white/10 text-[10px] text-[#A1A1AA] font-semibold tracking-wider uppercase rounded-lg border border-white/5 flex items-center justify-center gap-1"
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-green-400" /> Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" /> Copy Text
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 4. Hashtag Agent */}
                      {selectedAgentId === "hashtag_generator" && (
                        <div className="space-y-6">
                          <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                            <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">SEO Strategy Recommendation</span>
                            <p className="text-xs text-white leading-relaxed font-light mt-1.5">
                              {executionResult.analyticsHook}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-[#111111] rounded-xl border border-white/5">
                              <span className="text-[10px] text-[#A1A1AA] font-mono uppercase block mb-2">⚡ Trending Tags</span>
                              <div className="flex flex-wrap gap-1.5">
                                {executionResult.trending?.map((tag: string) => (
                                  <span key={tag} className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="p-4 bg-[#111111] rounded-xl border border-white/5">
                              <span className="text-[10px] text-[#A1A1AA] font-mono uppercase block mb-2">🎯 High Conversion</span>
                              <div className="flex flex-wrap gap-1.5">
                                {executionResult.highConversion?.map((tag: string) => (
                                  <span key={tag} className="text-xs font-mono text-purple-300 bg-purple-400/10 px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="p-4 bg-[#111111] rounded-xl border border-white/5">
                              <span className="text-[10px] text-[#A1A1AA] font-mono uppercase block mb-2">📈 Medium Competition</span>
                              <div className="flex flex-wrap gap-1.5">
                                {executionResult.mediumCompetition?.map((tag: string) => (
                                  <span key={tag} className="text-xs font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="p-4 bg-[#111111] rounded-xl border border-white/5">
                              <span className="text-[10px] text-[#A1A1AA] font-mono uppercase block mb-2">🌲 Evergreen Consistency</span>
                              <div className="flex flex-wrap gap-1.5">
                                {executionResult.evergreen?.map((tag: string) => (
                                  <span key={tag} className="text-xs font-mono text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 5. Competitor Intelligence */}
                      {selectedAgentId === "competitor_intelligence" && (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                              <span className="text-[10px] text-[#A1A1AA] font-mono uppercase">Target Profile</span>
                              <p className="text-sm font-extrabold mt-1 text-white">{executionResult.username}</p>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                              <span className="text-[10px] text-[#A1A1AA] font-mono uppercase">Estimated Engagement</span>
                              <p className="text-sm font-extrabold mt-1 text-cyan-400">{executionResult.estimatedEngagement}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">Channel Strengths</span>
                              <ul className="space-y-1.5">
                                {executionResult.strengths?.map((str: string, idx: number) => (
                                  <li key={idx} className="text-xs text-white flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                                    <span>{str}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-2">
                              <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">Channel Weaknesses</span>
                              <ul className="space-y-1.5">
                                {executionResult.weaknesses?.map((weak: string, idx: number) => (
                                  <li key={idx} className="text-xs text-white flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                    <span className="text-[#A1A1AA]">{weak}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block">Action Plan recommendations</span>
                            <div className="space-y-2">
                              {executionResult.actionPlan?.map((plan: string, idx: number) => (
                                <div key={idx} className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 text-xs text-purple-200">
                                  {plan}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* OTHER AGENTS FALLBACK GENERAL FORMATTING */}
                      {!["trend_hunter", "content_planner", "caption_writer", "hashtag_generator", "competitor_intelligence"].includes(selectedAgentId) && (
                        <div className="bg-[#111111] rounded-xl border border-white/5 p-5 space-y-4">
                          <p className="text-xs text-[#A1A1AA] font-mono">
                            {executionResult.salutation || "Execution completed successfully. Payload parsed:"}
                          </p>

                          {executionResult.recommendations && (
                            <ul className="space-y-2.5">
                              {executionResult.recommendations.map((rec: string, idx: number) => (
                                <li key={idx} className="text-xs text-white leading-relaxed flex items-start gap-2">
                                  <Sparkles className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {executionResult.todaysTasks && (
                            <div className="space-y-2 pt-2 border-t border-white/5">
                              <span className="text-[10px] text-[#A1A1AA] font-mono uppercase">Automated Tasks Initiated</span>
                              <ul className="space-y-1.5">
                                {executionResult.todaysTasks.map((t: string, idx: number) => (
                                  <li key={idx} className="text-xs text-white font-mono flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    <span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {executionResult.message && (
                            <p className="text-xs text-white font-light leading-relaxed">
                              {executionResult.message}
                            </p>
                          )}
                        </div>
                      )}

                    </motion.div>
                  ) : (
                    <div className="py-20 text-center text-xs text-[#A1A1AA] font-mono">
                      Console waiting. Provide input parameters and select "Execute" above.
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
