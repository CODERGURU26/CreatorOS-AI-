import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Play,
  ArrowRight,
  TrendingUp,
  Cpu,
  Video,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface LandingPageProps {
  onStartFree: () => void;
  onWatchDemo: () => void;
}

export default function LandingPage({ onStartFree, onWatchDemo }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<"hunter" | "studio" | "ceo">("hunter");

  // Auto-rotation removed as per user request


  return (
    <div id="landing-page" className="min-h-screen bg-transparent text-white relative overflow-hidden font-sans">
      
      {/* Dynamic Aurora Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#7C3AED]/12 via-blue-900/5 to-transparent blur-[150px] animate-aurora-1 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#06B6D4]/12 via-purple-900/5 to-transparent blur-[150px] animate-aurora-2 pointer-events-none" />

      {/* Floating Star/Particle Canvas Simulator */}
      <div className="absolute inset-0 opacity-20 pointer-events-none grid-overlay" />

      {/* Header / Navbar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] flex items-center justify-center p-[1px] shadow-lg shadow-purple-500/15">
            <div className="w-full h-full bg-[#050505] rounded-[11px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#A1A1AA]">
              CreatorOS<span className="text-cyan-400 font-mono text-xs ml-1 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/10">AI</span>
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm text-[#A1A1AA]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#agents" className="hover:text-white transition-colors">Agents</a>
          <a href="#demo" className="hover:text-white transition-colors">How It Works</a>
        </div>

        <button
          onClick={onStartFree}
          className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer"
        >
          <span className="relative z-10 flex items-center gap-1.5">
            Launch Console <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </button>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Text & Hero Action */}
        <div className="lg:col-span-6 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs font-mono text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>The World's First Autonomous Content Agency</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white font-display">
              CreatorOS <span className="bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent text-glow-cyan">AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#A1A1AA] font-light leading-relaxed max-w-lg font-display">
              Plan. Create. Publish. Analyze. Grow. <span className="text-white font-medium">Autonomously.</span>
            </p>
          </div>

          <p className="text-base text-[#A1A1AA] max-w-md leading-relaxed">
            Run an entire content business using an integrated system of specialized AI agents. They scan trends, edit videos, write captions, script hooks, and optimize daily — while you sleep.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={onStartFree}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] hover:brightness-110 active:scale-95 text-sm font-semibold tracking-wide transition-all shadow-lg shadow-purple-500/20 text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onWatchDemo}
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 active:scale-95 text-sm font-semibold tracking-wide transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" /> Watch Agent Demo
            </button>
          </div>

          {/* Social Proof Stats */}
          <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-bold text-white font-display">2.4M+</p>
              <p className="text-xs text-[#A1A1AA]">Reels Sourced</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-display">99.8%</p>
              <p className="text-xs text-[#A1A1AA]">Autonomous Uptime</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-display">4.2x</p>
              <p className="text-xs text-[#A1A1AA]">Average Reach Boost</p>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Live OS Simulation Dashboard Card */}
        <div className="lg:col-span-6 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-cyan-500/5 rounded-3xl blur-2xl pointer-events-none" />

          {/* The Dashboard Shell Frame */}
          <div className="relative glass-panel rounded-2xl shadow-2xl shadow-black overflow-hidden">
            
            {/* Window controls header bar */}
            <div className="px-4 py-3 bg-black/20 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500/30" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/30" />
                <span className="w-3 h-3 rounded-full bg-green-500/30" />
              </div>
              <div className="text-[11px] font-mono text-[#A1A1AA] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span>creator_os_agent_pool.sh</span>
              </div>
              <div className="w-12" />
            </div>

            {/* Dashboard Live Status Overview */}
            <div className="p-6 space-y-6">
              
              {/* Top Banner Widget: AI Worked While You Slept */}
              <div className="bg-white/5 border border-white/8 rounded-xl p-5 relative overflow-hidden glass-card">
                <div className="absolute top-0 right-0 p-3 text-cyan-400">
                  <TrendingUp className="w-5 h-5 animate-bounce" />
                </div>
                <h3 className="font-semibold text-sm text-white mb-3 flex items-center gap-2 font-display">
                  <Clock className="w-4 h-4 text-[#7C3AED]" /> AI worked while you slept:
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-xs text-[#A1A1AA]">
                    <li className="flex items-center gap-2 text-white">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      <span>Found 47 trending audios</span>
                    </li>
                    <li className="flex items-center gap-2 text-white">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      <span>Created 6 cinematic reels</span>
                    </li>
                    <li className="flex items-center gap-2 text-white">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      <span>Scheduled 4 automated posts</span>
                    </li>
                    <li className="flex items-center gap-2 text-white">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      <span>Generated 38 custom captions</span>
                    </li>
                  </ul>

                  <div className="bg-black/40 rounded-lg p-3 border border-white/5 flex flex-col justify-center">
                    <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">Estimated Reach Goal</span>
                    <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      1.8 Million
                    </span>
                    <span className="text-[10px] text-green-400 font-mono mt-1">+68.4% compared to manual</span>
                  </div>
                </div>
              </div>

              {/* Agent Activity Tab Controller Preview */}
              <div className="space-y-3">
                <div className="flex items-center space-x-1 p-0.5 bg-black/40 rounded-lg border border-white/5">
                  <button
                    onClick={() => setActiveTab("hunter")}
                    className={`flex-1 text-center py-1.5 text-xs rounded-md transition-all ${
                      activeTab === "hunter"
                        ? "bg-white/10 text-white font-medium border border-white/8"
                        : "text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    Trend Hunter
                  </button>
                  <button
                    onClick={() => setActiveTab("studio")}
                    className={`flex-1 text-center py-1.5 text-xs rounded-md transition-all ${
                      activeTab === "studio"
                        ? "bg-white/10 text-white font-medium border border-white/8"
                        : "text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    AI Studio
                  </button>
                  <button
                    onClick={() => setActiveTab("ceo")}
                    className={`flex-1 text-center py-1.5 text-xs rounded-md transition-all ${
                      activeTab === "ceo"
                        ? "bg-white/10 text-white font-medium border border-white/8"
                        : "text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    AI CEO Briefing
                  </button>
                </div>

                <div className="h-44 bg-black/30 border border-white/5 rounded-xl p-4 overflow-hidden relative font-mono text-xs">
                  <AnimatePresence mode="wait">
                    {activeTab === "hunter" && (
                      <motion.div
                        key="hunter"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        <div className="flex justify-between items-center text-[#A1A1AA] border-b border-white/5 pb-1.5">
                          <span>[Agent ID: trend_hunter_v2.5]</span>
                          <span className="text-purple-400">Scraping Active</span>
                        </div>
                        <p className="text-white text-[11px] leading-relaxed">
                          ⚡ <span className="text-[#A1A1AA]">Signal acquired:</span> Niche "Gym Motivation" trending audio found: <span className="text-purple-400 font-semibold">"Overcome - Synth wave remix"</span> with 142K uses.
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="bg-white/5 p-2 rounded border border-white/5">
                            <div className="text-[10px] text-[#A1A1AA]">Competition Score</div>
                            <div className="text-white font-bold text-sm">Low (12/100)</div>
                          </div>
                          <div className="bg-white/5 p-2 rounded border border-white/5">
                            <div className="text-[10px] text-[#A1A1AA]">Opportunity Score</div>
                            <div className="text-cyan-400 font-bold text-sm">98 / 100</div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "studio" && (
                      <motion.div
                        key="studio"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        <div className="flex justify-between items-center text-[#A1A1AA] border-b border-white/5 pb-1.5">
                          <span>[Agent ID: ai_studio_renderer]</span>
                          <span className="text-pink-400">Rendering Reel</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[11px]">
                            <span>Draft #3: Sourcing Visual B-roll</span>
                            <span className="text-cyan-400">82%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-[pulse_1.5s_infinite]" style={{ width: "82%" }} />
                          </div>
                        </div>
                        <p className="text-[11px] text-[#A1A1AA] leading-normal">
                          ✔ Subtitle frames compiled. Beat-matched transients synchronized at 124BPM. Custom caption written (Emotional style).
                        </p>
                      </motion.div>
                    )}

                    {activeTab === "ceo" && (
                      <motion.div
                        key="ceo"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2.5"
                      >
                        <div className="flex justify-between items-center text-[#A1A1AA] border-b border-white/5 pb-1.5">
                          <span>[Agent ID: ai_ceo_architect]</span>
                          <span className="text-green-400">Briefing Active</span>
                        </div>
                        <div className="text-white font-medium text-[11px]">
                          "Good morning. Yesterday: Followers +492, Views +128.5K. Rain Content generated 62% better retention. Increasing rain aesthetic weight in today's renderings."
                        </div>
                        <div className="text-[#A1A1AA] text-[10px]">
                          Recommendation: Shift 2 draft reels to 12:45 PM. Expected reach next week is 580K.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onStartFree}
                className="w-full py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] hover:brightness-110 active:scale-[0.98] text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/15 cursor-pointer"
              >
                Enter Autonomous Control Room <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>
        </div>

      </main>

      {/* Trust Badges / Features quick overview */}
      <section id="features" className="bg-black/20 border-y border-white/5 py-12 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-3">
            <Cpu className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white font-display">10 Specialized Agents</h4>
              <p className="text-xs text-[#A1A1AA]">Collaborating continuously</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white font-display">Full-Stack Security</h4>
              <p className="text-xs text-[#A1A1AA]">Server-side API encapsulation</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Video className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white font-display">Automated Editing</h4>
              <p className="text-xs text-[#A1A1AA]">Transitions, subtitles & beats</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white font-display">Algorithmic Audits</h4>
              <p className="text-xs text-[#A1A1AA]">Learning agent strategy shift</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
