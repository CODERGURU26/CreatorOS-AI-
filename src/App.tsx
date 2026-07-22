import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { OnboardingData, AgentLog } from "./types";
import { INITIAL_LOGS } from "./utils";

// Component imports
import LandingPage from "./components/LandingPage";
import OnboardingFlow from "./components/OnboardingFlow";
import ConnectView from "./components/ConnectView";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import AgentsView from "./components/AgentsView";
import PlannerView from "./components/PlannerView";
import StudioView from "./components/StudioView";
import CompetitorView from "./components/CompetitorView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "onboarding" | "connect" | "app">("landing");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [errorType, setErrorType] = useState<string | null>(null);

  // User & IG Account State
  const [user, setUser] = useState<any>(null);
  const [igAccount, setIgAccount] = useState<any>(null);

  // Load onboarding data if saved, or use defaults
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    creatorType: "Business",
    platforms: ["Instagram"],
    goals: ["More Followers", "More Reach"],
    isCompleted: false,
  });

  // State for system operations log feed
  const [activeLogs, setActiveLogs] = useState<AgentLog[]>([]);

  // Sync state from server on boot
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    const connectComplete = params.get("connect_complete") === "true";

    if (errorParam) {
      setErrorType(errorParam);
      setCurrentView("connect");
      return;
    }

    const syncSession = (attempt = 1) => {
      fetch("/api/me", { credentials: "same-origin" })
        .then(res => res.json())
        .then(data => {
          if (!data?.authenticated) {
            if (connectComplete && attempt < 3) {
              setTimeout(() => syncSession(attempt + 1), 800);
              return;
            }
            setCurrentView("landing");
            return;
          }

          setUser(data.user);
          setIgAccount(data.igAccount);

          if (data.igAccount) {
            if (data.user?.onboardingData?.isCompleted) {
              setOnboardingData(data.user.onboardingData);
              setCurrentView("app");
            } else {
              setCurrentView("onboarding");
            }
          } else {
            setCurrentView("connect");
          }
        })
        .catch(() => {
          if (connectComplete) {
            setCurrentView("connect");
            return;
          }
          setCurrentView("landing");
        });
    };

    syncSession();
  }, []);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    setOnboardingData(data);
    // Persist onboarding data server-side
    fetch("/api/user/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).catch(() => {});
    setCurrentView("connect");
  };

  const handleLogOut = () => {
    document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setIgAccount(null);
    setCurrentView("landing");
  };

  // Content Calendar tab grid visualizer subcomponent
  const renderCalendarTabGrid = () => {
    // Generate a simple mock grid representing 30 days of posting
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    return (
      <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#050505] text-white font-sans relative">
        {/* Background glow spotlights */}
        <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-[#7C3AED]/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#06B6D4]/5 blur-[100px] pointer-events-none" />

        <div className="mb-8 pb-6 border-b border-white/5 relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">Content Calendar</h1>
          <p className="text-xs text-[#A1A1AA]">
            30-day posting matrix with auto-scheduler queue indicators.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 relative z-10">
          {days.map((d) => {
            const hasPost = d <= 5; // Day 1-5 has post from INITIAL_CALENDAR
            const isToday = d === 1;
            return (
              <div
                key={d}
                className={`p-4 h-28 rounded-2xl border flex flex-col justify-between transition-all glass-card-hover ${
                  isToday
                    ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/5"
                    : "border-white/5 bg-white/[0.02]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-mono font-bold ${isToday ? "text-purple-300" : "text-[#A1A1AA]"}`}>
                    Day {d} {isToday && <span className="text-[9px] text-purple-400 bg-purple-400/15 px-1.5 py-0.5 rounded ml-1 font-mono uppercase">Today</span>}
                  </span>
                </div>

                {hasPost ? (
                  <div className="space-y-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <p className="text-[10px] text-white truncate font-semibold">Slot Active</p>
                    <span className="text-[9px] text-[#A1A1AA] font-mono block">12:00 PM</span>
                  </div>
                ) : (
                  <span className="text-[9px] text-white/15 font-mono">Empty Slot</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="app-root" className="bg-[#050505] text-white min-h-screen selection:bg-purple-500/30 selection:text-white relative overflow-hidden">
      {/* Immersive UI Global Aurora Atmospheric Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#7C3AED]/8 to-transparent blur-[140px] animate-aurora-1 pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-[#06B6D4]/8 to-transparent blur-[140px] animate-aurora-2 pointer-events-none z-0" />
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none z-0" />

      <AnimatePresence mode="wait">
        
        {/* Landing Page Route */}
        {currentView === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <LandingPage
              onStartFree={() => setCurrentView("onboarding")}
              onWatchDemo={() => setCurrentView("onboarding")}
            />
          </motion.div>
        )}

        {/* Onboarding Flow Route */}
        {currentView === "onboarding" && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <OnboardingFlow onOnboardingComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {/* Connect Account Screen Route */}
        {currentView === "connect" && (
          <motion.div
            key="connect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <ConnectView errorType={errorType} />
          </motion.div>
        )}

        {/* Core SaaS App Console Shell Route */}
        {currentView === "app" && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex h-screen overflow-hidden relative z-10"
          >
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onboardingData={onboardingData}
              onLogOut={handleLogOut}
              userEmail={user?.email || "user@example.com"}
              igAccount={igAccount}
            />

            {/* Inner Route Panels Swapper */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeTab === "dashboard" && (
                  <motion.div
                    key="dashboard-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <DashboardView
                      onboardingData={onboardingData}
                      activeLogs={activeLogs}
                      setActiveLogs={setActiveLogs}
                      onNavigate={(tab) => setActiveTab(tab)}
                      igAccount={igAccount}
                    />
                  </motion.div>
                )}

                {activeTab === "agents" && (
                  <motion.div
                    key="agents-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <AgentsView onboardingData={onboardingData} />
                  </motion.div>
                )}

                {activeTab === "planner" && (
                  <motion.div
                    key="planner-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <PlannerView onboardingData={onboardingData} />
                  </motion.div>
                )}

                {activeTab === "studio" && (
                  <motion.div
                    key="studio-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <StudioView onboardingData={onboardingData} />
                  </motion.div>
                )}

                {activeTab === "competitor" && (
                  <motion.div
                    key="competitor-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <CompetitorView />
                  </motion.div>
                )}

                {activeTab === "analytics" && (
                  <motion.div
                    key="analytics-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <AnalyticsView />
                  </motion.div>
                )}

                {activeTab === "calendar" && (
                  <motion.div
                    key="calendar-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {renderCalendarTabGrid()}
                  </motion.div>
                )}

                {activeTab === "settings" && (
                  <motion.div
                    key="settings-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <SettingsView
                      onboardingData={onboardingData}
                      setOnboardingData={setOnboardingData}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
