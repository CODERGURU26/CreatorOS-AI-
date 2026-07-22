import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Settings,
  ShieldCheck,
  Cpu,
  Clock,
  CheckCircle,
  Globe,
  Database,
} from "lucide-react";
import { OnboardingData } from "../types";

interface SettingsViewProps {
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}

export default function SettingsView({ onboardingData, setOnboardingData }: SettingsViewProps) {
  const [autonomousFreq, setAutonomousFreq] = useState("2 Hours");
  const [autopilotMode, setAutopilotMode] = useState(true);
  const [autoScheduler, setAutoScheduler] = useState(true);

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#050505] text-white font-sans relative">
      
      {/* Glow background */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-white/5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-xs text-[#A1A1AA]">
          Calibrate API keys, autopilot timings, and workspace profiles for your autonomous agent pool.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Profile and Scheduler (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Autopilot settings */}
          <div className="bg-[#111111]/90 border border-white/8 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-purple-400" /> Autopilot Calibration
            </h3>

            <div className="space-y-4">
              {/* Autopilot Switch */}
              <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-white">Full Autopilot (AI CEO Autonomy)</h4>
                  <p className="text-[10px] text-[#A1A1AA] mt-0.5 leading-normal max-w-sm">
                    Allow the AI CEO to autonomously draft, beat-match, write captions, and publish directly to connected sockets without human approval.
                  </p>
                </div>
                <button
                  onClick={() => setAutopilotMode(!autopilotMode)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${
                    autopilotMode ? "bg-[#7C3AED]" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      autopilotMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Auto scheduler */}
              <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-white">Autonomous Captions & SEO Generator</h4>
                  <p className="text-[10px] text-[#A1A1AA] mt-0.5 leading-normal max-w-sm">
                    Automatically rewrite captions and hashtags based on real-time trend feedback loops from the Learning Agent.
                  </p>
                </div>
                <button
                  onClick={() => setAutoScheduler(!autoScheduler)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${
                    autoScheduler ? "bg-[#7C3AED]" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      autoScheduler ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Frequency selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                  Scan Frequency Interval
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["2 Hours", "6 Hours", "24 Hours"].map((freq) => {
                    const isSelected = autonomousFreq === freq;
                    return (
                      <button
                        key={freq}
                        onClick={() => setAutonomousFreq(freq)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/10 text-white"
                            : "border-white/5 bg-white/[0.01] hover:bg-white/5 text-[#A1A1AA]"
                        }`}
                      >
                        {freq}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Profile settings */}
          <div className="bg-[#111111]/90 border border-white/8 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-cyan-400" /> Channel Blueprint Profiles
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[#A1A1AA] uppercase">Onboarding Niche</label>
                <input
                  type="text"
                  disabled
                  value={onboardingData.creatorType}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white/50 cursor-not-allowed font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[#A1A1AA] uppercase">Associated User Handle</label>
                <input
                  type="text"
                  disabled
                  value="guruuu2468"
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white/50 cursor-not-allowed font-mono"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Encapsulated API Key Security Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#111111]/90 border border-white/8 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl" />

            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                  Symmetric Security Vault
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">Encapsulated Server Integration</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-light leading-relaxed text-[#A1A1AA]">
              <p>
                In alignment with SaaS-level security practices, all dynamic agent integrations are bound directly to the secure container runtime.
              </p>

              <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-white/40">SDK Secret Socket:</span>
                  <span className="text-green-400 bg-green-400/10 px-1.5 py-0.2 rounded font-bold uppercase">Locked</span>
                </div>
                <p className="text-[11px] leading-relaxed font-light text-white/60">
                  Your <span className="text-cyan-400">GEMINI_API_KEY</span> is automatically injected directly into the backend server process from user secrets. It is never exposed, rendered, or transferred to client-side browser files.
                </p>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-[#A1A1AA]">
                <Database className="w-4.5 h-4.5 text-[#7C3AED] shrink-0 mt-0.5" />
                <span>
                  All database and analytical queries are proxy-routed securely. Direct Client API key entry is blocked by default to maintain absolute credential isolation.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
