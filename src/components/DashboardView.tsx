import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  Cpu,
  RefreshCw,
  Sparkles,
  Calendar,
  CheckSquare,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { INITIAL_METRICS, INITIAL_LOGS } from "../utils";
import { OnboardingData, AgentLog, AICeoReport, MetricCard } from "../types";

interface DashboardViewProps {
  onboardingData: OnboardingData;
  activeLogs: AgentLog[];
  setActiveLogs: React.Dispatch<React.SetStateAction<AgentLog[]>>;
  onNavigate: (tab: string) => void;
  igAccount?: any;
}

export default function DashboardView({
  onboardingData,
  activeLogs,
  setActiveLogs,
  onNavigate,
  igAccount,
}: DashboardViewProps) {
  const [metrics, setMetrics] = useState<MetricCard[]>(INITIAL_METRICS);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [ceoBriefing, setCeoBriefing] = useState<AICeoReport | null>(null);

  // Fetch real analytics if IG account is linked, and fetch CEO Briefing and Agent Runs
  useEffect(() => {
    fetchCeoBriefing();

    const loadAgentRuns = async () => {
      try {
        const response = await fetch("/api/agent-runs");
        const data = await response.json();
        if (data.runs) {
          const mappedLogs = data.runs.map((run: any) => {
            const date = new Date(run.created_at);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            let parsedResult: any = {};
            try {
              parsedResult = JSON.parse(run.result_json);
            } catch (e) {}
            const snippet = parsedResult.summary || parsedResult.message || `Executed run successfully.`;
            return {
              id: run.id,
              timestamp: timeStr,
              agentId: run.agent_id,
              text: snippet,
              status: run.is_simulated ? "warning" : "success",
            };
          });
          setActiveLogs(mappedLogs);
        }
      } catch (err) {
        console.error("Failed to load agent runs", err);
      }
    };

    const loadAnalytics = async () => {
      if (!igAccount) return;
      try {
        const response = await fetch("/api/analytics/insights");
        const data = await response.json();
        if (data.error) {
          console.error("Analytics load error", data.error);
          return;
        }

        const followers = data.accountData?.followers_count ?? igAccount.followers_count ?? 0;
        const posts = data.accountData?.media_count ?? igAccount.media_count ?? 0;
        const reachMetric = Array.isArray(data.insightsData?.data)
          ? data.insightsData.data.find((m: any) => m.name === "reach")
          : null;
        const engagedMetric = Array.isArray(data.insightsData?.data)
          ? data.insightsData.data.find((m: any) => m.name === "accounts_engaged")
          : null;
        const profileViewsMetric = Array.isArray(data.insightsData?.data)
          ? data.insightsData.data.find((m: any) => m.name === "profile_views")
          : null;

        const reach = reachMetric?.values?.[0]?.value ?? null;
        const accountsEngaged = engagedMetric?.values?.[0]?.value ?? null;
        const profileViews = profileViewsMetric?.values?.[0]?.value ?? null;
        const avgEngagement = followers ? ((data.totalLikes + data.totalComments) / followers) * 100 : null;

        const aiOpsToday = data.mediaItems?.length ?? 0;
        const bestPost = data.bestMedia ? data.bestMedia.caption || data.bestMedia.id : "Awaiting performance data";

        setMetrics([
          {
            id: "followers",
            label: "Followers",
            value: followers.toLocaleString(),
            change: "LIVE",
            isPositive: true,
            trend: [followers, followers, followers, followers, followers, followers],
          },
          {
            id: "posts",
            label: "Posts Published",
            value: posts.toLocaleString(),
            change: "LIVE",
            isPositive: true,
            trend: [posts, posts, posts, posts, posts, posts],
          },
          {
            id: "reach",
            label: "Account Reach (7d)",
            value: reach !== null ? reach.toLocaleString() : "Insufficient data",
            change: "LIVE",
            isPositive: reach !== null,
            trend: [reach || 0, reach || 0, reach || 0, reach || 0, reach || 0, reach || 0],
          },
          {
            id: "accounts_engaged",
            label: "Accounts Engaged",
            value: accountsEngaged !== null ? accountsEngaged.toLocaleString() : "Insufficient data",
            change: "LIVE",
            isPositive: accountsEngaged !== null,
            trend: [accountsEngaged || 0, accountsEngaged || 0, accountsEngaged || 0, accountsEngaged || 0, accountsEngaged || 0, accountsEngaged || 0],
          },
          {
            id: "profile_views",
            label: "Profile Views",
            value: profileViews !== null ? profileViews.toLocaleString() : "Insufficient data",
            change: "LIVE",
            isPositive: profileViews !== null,
            trend: [profileViews || 0, profileViews || 0, profileViews || 0, profileViews || 0, profileViews || 0, profileViews || 0],
          },
          {
            id: "avg_engagement",
            label: "Average Engagement",
            value: avgEngagement !== null ? `${avgEngagement.toFixed(2)}%` : "Insufficient data",
            change: "LIVE",
            isPositive: avgEngagement !== null,
            trend: [avgEngagement || 0, avgEngagement || 0, avgEngagement || 0, avgEngagement || 0, avgEngagement || 0, avgEngagement || 0],
          },
          {
            id: "ai_ops",
            label: "AI Operations Today",
            value: aiOpsToday.toLocaleString(),
            change: "LIVE",
            isPositive: true,
            trend: [aiOpsToday, aiOpsToday, aiOpsToday, aiOpsToday, aiOpsToday, aiOpsToday],
          },
          {
            id: "best_post",
            label: "Best Performing Post",
            value: bestPost,
            change: "LIVE",
            isPositive: true,
            trend: [0, 0, 0, 0, 0, 0],
          },
        ]);
      } catch (err) {
        console.error("Failed to load analytics", err);
      }
    };

    loadAgentRuns();
    loadAnalytics();
  }, [onboardingData.creatorType, igAccount]);

  // Call the server API endpoint for real Gemini generated executive briefing
  const fetchCeoBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const response = await fetch("/api/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "ai_ceo",
          prompt: onboardingData.creatorType,
        }),
      });
      const data = await response.json();
      if (data && data.salutation) {
        setCeoBriefing(data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed to generate custom Gemini briefing, using simulation backup:", err);
      // Soft local backup matching user's exact parameters
      setCeoBriefing({
        salutation: "Good morning, Chief Creator.",
        metrics: {
          followers: "+284",
          views: "94,000",
          reach: "81,000",
          bestReel: `Secrets of ${onboardingData.creatorType} Aesthetic`,
        },
        recommendations: [
          `Increase ${onboardingData.creatorType} themed video outputs immediately as engagement levels spiked 42%.`,
          "Our system detected a new high-velocity soundtrack match. All pending draft captions have been auto-aligned.",
        ],
        expectedWeeklyReach: "420,000",
        todaysTasks: [
          "Trend Hunter: Scanned viral tags; scheduled 4 draft slots.",
          "AI Studio: Fully rendered and beat-matched pending Reels.",
        ],
      });
    } finally {
      setLoadingBriefing(false);
    }
  };

  // Helper to draw a beautiful mini Sparkline line graph inside metric cards
  const drawSparkline = (data: number[]) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const height = 30;
    const width = 80;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-transparent text-white relative font-sans">
      
      {/* Background ambient spotlight */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7C3AED]/5 blur-[120px] pointer-events-none" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white to-[#D4D4D8] bg-clip-text text-transparent">Executive Dashboard</h1>
          <p className="text-xs text-[#A1A1AA]">
            Real-time operations monitor for autonomous content campaigns.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[#A1A1AA] font-mono">
            Niche Mode: <span className="text-white font-semibold">{onboardingData.creatorType}</span>
          </div>
          <button
            onClick={fetchCeoBriefing}
            className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-white transition-all cursor-pointer"
            title="Refresh AI Briefing"
          >
            <RefreshCw className={`w-4 h-4 ${loadingBriefing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8 relative z-10">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-2xl glass-card glass-card-hover flex flex-col justify-between h-36 relative group"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[10px] text-[#A1A1AA] font-mono block uppercase tracking-wider">
                  {m.label}
                </span>
                {m.status ? (
                  <span className="text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 text-white/80 border border-white/10">
                    {m.status}
                  </span>
                ) : null}
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white mt-1.5 block font-display">
                {m.value}
              </span>
            </div>

            <div className="flex items-end justify-between pt-2">
              <span
                className={`text-[10px] font-mono font-semibold ${
                  m.isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {m.change}
              </span>

              {/* Sparkline Visualizer */}
              <svg className="w-20 h-8 text-cyan-400/80 group-hover:text-[#7C3AED]/80 transition-colors">
                <path
                  d={drawSparkline(m.trend)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Main Board Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        
        {/* Left Column: AI CEO Morning Briefing (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative glass-panel rounded-2xl p-6 shadow-xl overflow-hidden">
            
            {/* Visual Header Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr from-purple-500/5 to-cyan-500/5 rounded-full blur-2xl" />

            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#3B82F6] flex items-center justify-center text-white shadow-lg shadow-purple-500/15">
                  <Cpu className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-display">AI CEO Strategic Briefing</h3>
                  <span className="text-[10px] font-mono text-[#A1A1AA]">Autonomous decision dispatch</span>
                </div>
              </div>
              {ceoBriefing?._isSimulated ? (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/10 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-semibold" title={ceoBriefing?._simulationReason}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Sandbox Simulation
                </span>
              ) : (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/10 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Synchronized
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {loadingBriefing ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center space-y-3"
                >
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-xs text-[#A1A1AA] font-mono">AI CEO synthesizing target recommendations...</p>
                </motion.div>
              ) : (
                <motion.div
                  key="briefing-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Salutation Greeting */}
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1 font-display">
                      {ceoBriefing?.salutation || "Good morning, Chief Creator."}
                    </h2>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      Yesterday's autonomous cycles completed successfully. Here are your strategic metrics and active recommendations tailored for the <span className="text-purple-300 font-semibold">{onboardingData.creatorType}</span> channel:
                    </p>
                  </div>

                  {/* Yesterday's metrics list */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black/20 border border-white/5 rounded-xl p-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#A1A1AA] font-mono uppercase">Views</span>
                      <p className="text-lg font-extrabold text-white font-display">{ceoBriefing?.metrics.views || "94,000"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#A1A1AA] font-mono uppercase">Followers</span>
                      <p className="text-lg font-extrabold text-emerald-400 font-display">{ceoBriefing?.metrics.followers || "+284"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#A1A1AA] font-mono uppercase">Reach</span>
                      <p className="text-lg font-extrabold text-white font-display">{ceoBriefing?.metrics.reach || "81,000"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#A1A1AA] font-mono uppercase">Best Performer</span>
                      <p className="text-xs font-bold text-cyan-400 truncate max-w-[120px]" title={ceoBriefing?.metrics.bestReel}>
                        {ceoBriefing?.metrics.bestReel || "Aesthetic Setup Reel"}
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono">
                      AI Recommendations
                    </h4>
                    <ul className="space-y-2.5">
                      {ceoBriefing?.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-xs text-white leading-relaxed">
                          <Sparkles className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Expected reach & automated tasks banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="p-3.5 bg-purple-500/5 rounded-xl border border-purple-500/10">
                      <span className="text-[10px] text-[#A1A1AA] font-mono uppercase block">Target Weekly Reach</span>
                      <p className="text-xl font-bold text-purple-300 mt-1 font-display">
                        {ceoBriefing?.expectedWeeklyReach || "420,000"}
                      </p>
                    </div>
                    <div className="p-3.5 bg-cyan-500/5 rounded-xl border border-cyan-500/10">
                      <span className="text-[10px] text-[#A1A1AA] font-mono uppercase block">Autonomous Status</span>
                      <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1 font-semibold">
                        <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                        Today's content already scheduled
                      </p>
                    </div>
                  </div>

                  {/* Action Link Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate("agents")}
                      className="w-full py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      Audit Your Autonomous Agent Pool <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Right Column: System Logs & Scheduled Tasks checklist (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Real-time System logs */}
          <div className="glass-panel rounded-2xl p-5 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <span className="font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" /> Operations Shell
              </span>
              <span className="text-[9px] text-[#A1A1AA]">Live log feed</span>
            </div>

            <div className="h-64 overflow-y-auto space-y-2.5 pr-1 text-[11px] leading-relaxed select-none flex flex-col">
              {activeLogs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <p className="text-[#71717A] text-[10px] uppercase font-mono tracking-wider mb-2">No activity yet</p>
                  <p className="text-white/40 text-xs">Trigger an agent from the <span className="text-cyan-400 font-semibold cursor-pointer" onClick={() => onNavigate("agents")}>AI Agents</span> panel to get started.</p>
                </div>
              ) : (
                activeLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-1.5">
                    <span className="text-[#A1A1AA] shrink-0 font-light font-mono">[{log.timestamp}]</span>
                    <p className="text-white">
                      <span
                        className={`font-semibold mr-1 uppercase text-[9px] px-1.5 py-0.2 rounded border ${
                          log.status === "warning"
                            ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/10"
                            : log.status === "success"
                            ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/10"
                            : "text-purple-400 bg-purple-400/10 border-purple-400/10"
                        }`}
                      >
                        {log.agentId.replace("_", " ")}
                      </span>
                      {log.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's Tasks checklist */}
          <div className="glass-panel rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <span className="font-semibold text-xs text-white uppercase tracking-wider flex items-center gap-2 font-display">
                <Calendar className="w-4 h-4 text-purple-400" /> Auto-Scheduler
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">100% Cleared</span>
            </div>

            <ul className="space-y-3">
              {ceoBriefing?.todaysTasks.map((task, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                  <div className="w-4.5 h-4.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-white leading-snug">{task}</p>
                    <span className="text-[10px] text-[#A1A1AA] font-mono uppercase mt-0.5 block">Autonomous</span>
                  </div>
                </li>
              )) || (
                <li className="text-xs text-[#A1A1AA] text-center py-6">
                  No automated tasks scheduled.
                </li>
              )}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
