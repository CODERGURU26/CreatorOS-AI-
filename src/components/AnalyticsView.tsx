import React, { useState, useEffect } from "react";
import {
  BarChart3,
} from "lucide-react";

export default function AnalyticsView() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(d => {
         setData(d.data || null);
         setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#050505] text-white font-sans relative">
      <div className="mb-8 pb-6 border-b border-white/5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Performance Analytics</h1>
        <p className="text-xs text-[#A1A1AA]">
          Real-time insights from your connected Instagram account.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-[#A1A1AA] font-mono border border-white/5 bg-[#111111]/20 rounded-2xl">
          Loading metrics from Instagram API...
        </div>
      ) : !data || data.length === 0 ? (
        <div className="py-24 text-center text-xs text-[#A1A1AA] font-mono border border-white/5 bg-[#111111]/20 rounded-2xl">
          No analytics data available. Ensure your Instagram Professional account is linked.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((metric: any, idx: number) => (
            <div key={idx} className="bg-[#111111]/90 border border-white/8 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono text-[#A1A1AA]">
                {metric.title}
              </h3>
              <div className="text-3xl font-extrabold text-white">
                {metric.value.toLocaleString()}
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
                 Time-series historical charting is currently limited by the Instagram Basic Display API. A CreatorOS Pro subscription and an Instagram Business Graph API token is required for 30-day lookback windows.
             </p>
          </div>
        </div>
      )}
    </div>
  );
}
