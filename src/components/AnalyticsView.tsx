import React, { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";

const formatValue = (value: any) => {
  if (value === null || value === undefined) return "Unavailable";
  if (typeof value === "number") return value.toLocaleString();
  return String(value);
};

export default function AnalyticsView() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/insights")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = data
    ? [
        {
          title: "Followers",
          value: data.accountData?.followers_count,
          description: "Total Instagram followers for the connected account.",
        },
        {
          title: "Posts Published",
          value: data.accountData?.media_count,
          description: "Total media published through your Instagram account.",
        },
        {
          title: "7-day Reach",
          value: data.insightsData?.data?.find((item: any) => item.name === "reach")?.values?.[0]?.value,
          description: "Unique accounts reached in the last day of the selected period.",
        },
        {
          title: "Accounts Engaged",
          value: data.insightsData?.data?.find((item: any) => item.name === "accounts_engaged")?.values?.[0]?.value,
          description: "Accounts that engaged with your content recently.",
        },
        {
          title: "Profile Views",
          value: data.insightsData?.data?.find((item: any) => item.name === "profile_views")?.values?.[0]?.value,
          description: "Visits to your Instagram profile.",
        },
        {
          title: "Average Engagement",
          value: data.avgEngagement ? `${data.avgEngagement.toFixed(2)}%` : null,
          description: "Engagement rate based on recent likes and comments.",
        },
        {
          title: "AI Operations Today",
          value: data.agentOperationsToday,
          description: "Autonomous CI operations executed in the last 24 hours.",
        },
        {
          title: "Best Performing Post",
          value: data.bestMedia?.caption || data.bestMedia?.id,
          description: "The highest-performing recent post by engagement.",
        },
      ]
    : [];

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#050505] text-white font-sans relative">
      <div className="mb-8 pb-6 border-b border-white/5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Performance Analytics</h1>
        <p className="text-xs text-[#A1A1AA]">
          Live Instagram insights from your connected Business or Creator account.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-[#A1A1AA] font-mono border border-white/5 bg-[#111111]/20 rounded-2xl">
          Loading metrics from Instagram API...
        </div>
      ) : !data ? (
        <div className="py-24 text-center text-xs text-[#A1A1AA] font-mono border border-white/5 bg-[#111111]/20 rounded-2xl">
          No analytics data available. Ensure your Instagram Professional account is linked.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((metric, idx) => (
            <div key={idx} className="bg-[#111111]/90 border border-white/8 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono text-[#A1A1AA]">
                {metric.title}
              </h3>
              <div className="text-3xl font-extrabold text-white">
                {formatValue(metric.value)}
              </div>
              <p className="text-xs text-[#A1A1AA] font-light leading-relaxed">
                {metric.description}
              </p>
            </div>
          ))}
          <div className="bg-[#111111]/90 border border-white/8 rounded-2xl p-6 shadow-xl space-y-4 col-span-full md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-sm text-white">Historical Charting</h3>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Time-series historical charting is currently limited by the Instagram API response shape available for this account. Use the dashboard for live key metrics and insights.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
