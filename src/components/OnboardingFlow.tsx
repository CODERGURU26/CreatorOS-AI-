import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  Globe,
  Settings,
  Cpu,
} from "lucide-react";
import { CREATOR_TYPES, PLATFORMS, GOALS } from "../utils";
import { CreatorType, PlatformType, GoalType, OnboardingData } from "../types";

interface OnboardingFlowProps {
  onOnboardingComplete: (data: OnboardingData) => void;
}

export default function OnboardingFlow({ onOnboardingComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [creatorType, setCreatorType] = useState<CreatorType>("Business");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([
    "Instagram",
  ]);
  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>([
    "More Followers",
    "More Reach",
  ]);

  // Loading simulation states for Step 4
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingLogIndex, setLoadingLogIndex] = useState(0);

  const loadingLogs = [
    `Initializing CreatorOS Core Kernel for ${creatorType} niche...`,
    "Spawning Trend Hunter scraper bots for Reddit, X, and TikTok...",
    "Connecting Visual Finder to cyber-aesthetic and landscape database pools...",
    "Hashtag SEO Agent calibrating evergreen and medium-competition difficulty matrices...",
    "AI CEO architecting 30-day strategy blueprints and daily schedules...",
    "Injecting personalized growth models into autonomous Learning Agent...",
    "CreatorOS Workspace successfully structured. Spawning operational console...",
  ];

  // Platform selection helper
  const togglePlatform = (platform: PlatformType) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  // Goal selection helper
  const toggleGoal = (goal: GoalType) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  // Simulate loading in Step 4 removed as per user request
  useEffect(() => {
    if (step === 4) {
      setLoadingProgress(100);
      setTimeout(() => {
        onOnboardingComplete({
          creatorType,
          platforms: selectedPlatforms,
          goals: selectedGoals,
          isCompleted: true,
        });
      }, 400); // Short UI delay for smooth transition
    }
  }, [step, creatorType, selectedPlatforms, selectedGoals, onOnboardingComplete]);

  // Sync log changes to progress levels
  useEffect(() => {
    if (step === 4) {
      const targetIndex = Math.min(
        Math.floor((loadingProgress / 100) * loadingLogs.length),
        loadingLogs.length - 1
      );
      if (targetIndex !== loadingLogIndex) {
        setLoadingLogIndex(targetIndex);
      }
    }
  }, [loadingProgress, step, loadingLogIndex]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative px-4 py-8 overflow-hidden font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#7C3AED]/10 via-[#3B82F6]/5 to-transparent blur-[120px] pointer-events-none" />

      {/* Progress Dots Header */}
      {step < 4 && (
        <div className="absolute top-8 flex items-center space-x-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-gradient-to-r from-purple-500 to-cyan-500"
                  : s < step
                  ? "w-3 bg-purple-500"
                  : "w-3 bg-white/15"
              }`}
            />
          ))}
        </div>
      )}

      {/* Onboarding Shell Card */}
      <div className="w-full max-w-xl relative">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-white/10 to-transparent rounded-2xl blur-[2px] pointer-events-none" />
        
        <div className="bg-[#111111]/80 border border-white/8 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative">
          
          <AnimatePresence mode="wait">
            {/* Step 1: Creator Type */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex p-2 rounded-xl bg-purple-500/10 text-purple-400 mb-2">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">What type of creator are you?</h2>
                  <p className="text-xs text-[#A1A1AA]">This calibrates Trend Hunter's automated social scrapers.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {CREATOR_TYPES.map((type) => {
                    const isSelected = creatorType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setCreatorType(type as CreatorType)}
                        className={`p-3 rounded-xl border text-xs text-left transition-all duration-300 flex flex-col justify-between h-20 ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/10 text-white shadow-lg shadow-purple-500/5"
                            : "border-white/5 bg-white/[0.02] hover:bg-white/5 text-[#A1A1AA] hover:text-white"
                        }`}
                      >
                        <span className="font-medium">{type}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center self-end">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-white text-black hover:scale-105 active:scale-95 transition-all text-xs font-semibold rounded-xl flex items-center gap-1.5"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Target Platforms */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex p-2 rounded-xl bg-cyan-500/10 text-cyan-400 mb-2">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Select your platforms</h2>
                  <p className="text-xs text-[#A1A1AA]">Our video engines render specific aspect ratios for each platform.</p>
                </div>

                <div className="space-y-2.5">
                  {PLATFORMS.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform as PlatformType);
                    return (
                      <button
                        key={platform}
                        onClick={() => togglePlatform(platform as PlatformType)}
                        className={`w-full p-4 rounded-xl border text-xs font-semibold transition-all duration-300 flex items-center justify-between ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-500/10 text-white"
                            : "border-white/5 bg-white/[0.02] hover:bg-white/5 text-[#A1A1AA]"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{platform}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-cyan-500 border-cyan-500"
                              : "border-white/20"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-black font-bold" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-3 text-xs text-[#A1A1AA] hover:text-white transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={selectedPlatforms.length === 0}
                    className="px-6 py-3 bg-white text-black hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all text-xs font-semibold rounded-xl flex items-center gap-1.5"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Goals */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex p-2 rounded-xl bg-purple-500/10 text-purple-400 mb-2">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Define your core objective</h2>
                  <p className="text-xs text-[#A1A1AA]">Optimizes the AI CEO's autonomous decision prioritization.</p>
                </div>

                <div className="space-y-2.5">
                  {GOALS.map((goal) => {
                    const isSelected = selectedGoals.includes(goal as GoalType);
                    return (
                      <button
                        key={goal}
                        onClick={() => toggleGoal(goal as GoalType)}
                        className={`w-full p-4 rounded-xl border text-xs font-semibold transition-all duration-300 flex items-center justify-between ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/10 text-white"
                            : "border-white/5 bg-white/[0.02] hover:bg-white/5 text-[#A1A1AA]"
                        }`}
                      >
                        <span>{goal}</span>
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-purple-500 border-purple-500"
                              : "border-white/20"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-3 text-xs text-[#A1A1AA] hover:text-white transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={selectedGoals.length === 0}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-500/10"
                  >
                    Build Workspace <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Loading & Cinematic Agent Spawning */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-cyan-500/10 text-cyan-400 mb-2 relative">
                    <Cpu className="w-6 h-6 animate-spin" />
                    <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Configuring CreatorOS AI</h2>
                  <p className="text-xs text-[#A1A1AA]">Symmetric agent orchestration active.</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#A1A1AA]">Spawning Agent Fleet</span>
                    <span className="text-cyan-400 font-semibold">{loadingProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] rounded-full transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                </div>

                {/* Active logs container */}
                <div className="h-32 bg-black/50 border border-white/5 rounded-xl p-4 overflow-hidden font-mono text-xs text-left relative flex flex-col justify-end">
                  <div className="absolute top-0 left-0 p-3 text-[10px] uppercase text-[#A1A1AA] tracking-wider border-b border-white/5 w-full bg-black/20 flex items-center justify-between">
                    <span>System Shell Logs</span>
                    <Settings className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  </div>

                  <div className="space-y-1.5 pt-6 overflow-y-auto">
                    {loadingLogs.slice(0, loadingLogIndex + 1).map((log, index) => {
                      const isCurrent = index === loadingLogIndex;
                      return (
                        <div
                          key={index}
                          className={`transition-all duration-300 ${
                            isCurrent ? "text-cyan-400" : "text-[#A1A1AA]"
                          }`}
                        >
                          <span className="text-purple-500 mr-1.5">❯</span>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-center text-[10px] text-[#A1A1AA] font-mono animate-pulse">
                  Deploying security containers in background...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
