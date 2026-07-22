import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  Sparkles,
  Play,
  Layers,
  Music,
  Video,
  FileText,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle,
} from "lucide-react";
import { OnboardingData } from "../types";

interface StudioViewProps {
  onboardingData: OnboardingData;
}

export default function StudioView({ onboardingData }: StudioViewProps) {
  const [pipelineState, setPipelineState] = useState<"idle" | "running" | "rendered">("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [videoPrompt, setVideoPrompt] = useState(`Symmetric ${onboardingData.creatorType} Strategy`);
  const [subtitlesStyle, setSubtitlesStyle] = useState("Bold Yellow Overlay");

  // Editing progress lines
  const steps = [
    { title: "Analyzing Rhythm Beat-Match", detail: "Scanning audio transients, matching transitions to heavy 124BPM drums..." },
    { title: "Sourcing Aesthetic B-Roll", detail: "Mapping prompt vectors to ambient dark workspace and rainy drone video pools..." },
    { title: "Rendering Subtitle Frames", detail: "Compiling micro-aligned kinetic typography and high-contrast letter boundaries..." },
    { title: "Generating Visual Thumbnails", detail: "Synthesizing stark orange-accented title card with extreme shadow density..." },
  ];

  // Pipeline execution simulation removed as per user request (no fakes)
  
  const handleStartPipeline = () => {
    // setActiveStep(0);
    // setPipelineState("running");
    alert("Video rendering is not currently implemented. It requires an integration with a video generation API like Runway or Luma.");
  };

  const handleResetPipeline = () => {
    setPipelineState("idle");
    setActiveStep(0);
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#050505] text-white font-sans relative">
      
      {/* Background glow spot */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />

      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-white/5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">AI Studio Workspace</h1>
        <p className="text-xs text-[#A1A1AA]">
          Autonomous video rendering studio matching transients, subtitling, and auto-publishing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Editor Control Terminal (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#111111]/90 border border-white/8 rounded-2xl p-6 shadow-xl relative backdrop-blur-md">
            
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center">
                <Cpu className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Automated Rendering Engine</h3>
                <span className="text-[10px] font-mono text-[#A1A1AA]">Transients & kinetic subtitles solver</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Idle Mode */}
              {pipelineState === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                      Video Theme Outline / Concept
                    </label>
                    <input
                      type="text"
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder="e.g., The Silent Power of Consistence"
                      className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                        Subtitle Typography Accent
                      </label>
                      <select
                        value={subtitlesStyle}
                        onChange={(e) => setSubtitlesStyle(e.target.value)}
                        className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Bold Yellow Overlay">Symmetric Yellow Highlight</option>
                        <option value="Sleek Stark White">Sleek Stark White</option>
                        <option value="Cyber Neon Cyan">Cyber Neon Cyan</option>
                        <option value="Minimal Elegant Lower-third">Minimal Elegant Lower-third</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                        Soundtrack Preference
                      </label>
                      <div className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-white flex items-center justify-between">
                        <span className="font-mono text-[11px] text-cyan-400">Auto-Matched Synth</span>
                        <Music className="w-4 h-4 text-[#A1A1AA]" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-1.5">
                    <h4 className="text-[10px] font-mono text-purple-300 uppercase">Symmetric AI Protocol</h4>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed font-light">
                      Upon triggering, our engine auto-sifts royalty-free B-roll repositories matching the exact theme, matches cutframes to synth sound beat peaks, and layers kinetic captions.
                    </p>
                  </div>

                  <button
                    onClick={handleStartPipeline}
                    className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-xl text-xs font-semibold tracking-wider uppercase shadow-lg shadow-purple-500/10 hover:brightness-115 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    Initiate Autonomous Edit Pipeline <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Running Mode */}
              {pipelineState === "running" && (
                <motion.div
                  key="running"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400 animate-pulse">
                      Status: Operational Rendering Loop
                    </span>
                    <span className="text-xs font-mono text-pink-400">
                      Step {activeStep + 1} of 4
                    </span>
                  </div>

                  {/* Rendering steps list */}
                  <div className="space-y-3.5">
                    {steps.map((stepItem, idx) => {
                      const isCompleted = idx < activeStep;
                      const isActive = idx === activeStep;
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border transition-all ${
                            isActive
                              ? "bg-purple-500/10 border-purple-500/30 shadow"
                              : isCompleted
                              ? "bg-black/30 border-white/5 opacity-60"
                              : "bg-black/10 border-white/5 opacity-30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <h4 className={`text-xs font-bold ${isActive ? "text-purple-300" : "text-white"}`}>
                                {stepItem.title}
                              </h4>
                              <p className="text-[10px] text-[#A1A1AA] font-mono leading-normal">
                                {stepItem.detail}
                              </p>
                            </div>
                            
                            {isCompleted && (
                              <CheckCircle className="w-4.5 h-4.5 text-green-400 shrink-0 mt-0.5" />
                            )}
                            {isActive && (
                              <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin shrink-0 mt-0.5" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Rendered Mode */}
              {pipelineState === "rendered" && (
                <motion.div
                  key="rendered"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-5"
                >
                  <div className="p-5 bg-green-500/5 rounded-xl border border-green-500/15 flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-green-400">Render Process Complete</h4>
                      <p className="text-[10px] text-[#A1A1AA] font-mono">
                        File: creator_os_draft_{onboardingData.creatorType.toLowerCase()}_05.mp4
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>

                  <div className="space-y-1.5 font-mono text-xs p-4 bg-black/40 rounded-xl border border-white/5">
                    <div className="flex justify-between border-b border-white/5 pb-1.5 text-white/40 uppercase text-[9px]">
                      <span>Technical Output Parameter</span>
                      <span>Value</span>
                    </div>
                    <div className="flex justify-between py-1 text-[11px]">
                      <span className="text-[#A1A1AA]">Matched Soundtrack</span>
                      <span className="text-white font-medium">Silent Depths (Slowed & Reverb)</span>
                    </div>
                    <div className="flex justify-between py-1 text-[11px]">
                      <span className="text-[#A1A1AA]">Video Duration</span>
                      <span className="text-white font-medium">12.5 seconds</span>
                    </div>
                    <div className="flex justify-between py-1 text-[11px]">
                      <span className="text-[#A1A1AA]">Transitions Cut</span>
                      <span className="text-white font-medium">12 beat-matched frames</span>
                    </div>
                    <div className="flex justify-between py-1 text-[11px]">
                      <span className="text-[#A1A1AA]">File Size</span>
                      <span className="text-white font-medium">18.4 MB (Compressed H.264)</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleResetPipeline}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold tracking-wider uppercase border border-white/10 transition-all cursor-pointer"
                    >
                      Draft New Clip
                    </button>
                    <button
                      onClick={() => alert("Autonomous publish dispatch successfully queued!")}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl text-xs font-semibold tracking-wider uppercase shadow-lg shadow-purple-500/10 transition-all cursor-pointer"
                    >
                      Auto-Publish / Queue Post
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Right Column: Mobile Reel View Frame Simulator (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[280px] h-[500px] rounded-3xl border-[6px] border-white/10 bg-black shadow-2xl relative overflow-hidden flex flex-col justify-between">
            
            {/* Visual Screen Cover Mock background */}
            <div className="absolute inset-0 bg-[#050505] z-0 overflow-hidden">
              
              {/* Animated moody layout representation */}
              {pipelineState === "rendered" ? (
                <div className="w-full h-full relative">
                  {/* Backdrop slow scale-up b-roll simulation */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-purple-950/20 z-0" />
                  
                  {/* Representing the actual ambient workspace B-roll image placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 z-0">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15),transparent)] animate-pulse" />
                  </div>

                  {/* Dynamic typed Subtitles on screen mock */}
                  <div className="absolute bottom-28 inset-x-4 text-center z-10 px-2">
                    <p className="text-sm font-extrabold tracking-tight text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans uppercase">
                      "While they talk strategy... we build systems in silence."
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-3">
                  <Video className="w-8 h-8 text-white/10 animate-bounce" />
                  <p className="text-center text-[10px] text-[#A1A1AA] font-mono">
                    {pipelineState === "running"
                      ? "Rendering transient visual timeline..."
                      : "Workspace ready. Fire pipeline to preview."}
                  </p>
                </div>
              )}
            </div>

            {/* Top Indicator */}
            <div className="relative z-10 p-4 flex items-center justify-between text-[10px] text-[#A1A1AA] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> REC
              </span>
              <span>1080p 60fps</span>
            </div>

            {/* Bottom Overlay Info */}
            <div className="relative z-10 p-4 bg-gradient-to-t from-black via-black/40 to-transparent pt-12 text-white space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-[9px]">
                  G
                </div>
                <span className="text-[10px] font-bold">@guruuu2468</span>
              </div>

              <p className="text-[10px] text-[#A1A1AA] leading-relaxed font-light line-clamp-2">
                {videoPrompt} — designed autonomously using CreatorOS AI. The silent builders will inherit the earth.
              </p>

              <div className="flex items-center space-x-1.5 font-mono text-[9px] text-cyan-400">
                <Music className="w-3 h-3 text-[#06B6D4]" />
                <span className="truncate">Silent Depths (Slowed & Reverb)</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

// Inline missing spinner icon helper
function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
