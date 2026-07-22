import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  CheckCircle,
  FileEdit,
} from "lucide-react";
import { CalendarEntry, OnboardingData } from "../types";

interface PlannerViewProps {
  onboardingData: OnboardingData;
}

export default function PlannerView({ onboardingData }: PlannerViewProps) {
  const [calendar, setCalendar] = useState<any[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form inputs
  const [newTopic, setNewTopic] = useState("");
  const [newTime, setNewTime] = useState("12:00 PM");
  const [newDay, setNewDay] = useState(6);
  const [newFormat, setNewFormat] = useState("Instagram Reel");
  const [newMix, setNewMix] = useState("Viral Hook / Trend");
  const [newDesc, setNewDesc] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    try {
      const res = await fetch("/api/posts/scheduled");
      const data = await res.json();
      if (data.posts) {
        setCalendar(data.posts);
      }
    } catch (err) {
      console.error("Failed to fetch scheduled posts:", err);
    }
  };

  // Synthesize custom slot from Gemini
  const handleSynthesizeSlot = async () => {
    setIsSynthesizing(true);
    try {
      const response = await fetch("/api/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "content_planner",
          prompt: `Creator Type: ${onboardingData.creatorType}. Generate 1 highly viral, specific video schedule topic idea.`,
        }),
      });
      const data = await response.json();
      
      const newCalItem = data.calendar?.[0] || {
        day: calendar.length + 1,
        time: "1:15 PM",
        topic: `Symmetric ${onboardingData.creatorType} Vision`,
        format: "TikTok Short",
        mixType: "Viral Hook",
        description: "Aesthetic B-roll showing keyboard typing with striking typographic overlay text.",
      };

      const customEntry: CalendarEntry = {
        day: calendar.length + 1,
        time: newCalItem.time || "12:00 PM",
        topic: newCalItem.topic || "AI Autonomous Secret",
        format: newCalItem.format || "Instagram Reel",
        mixType: newCalItem.mixType || "Educational / Authority",
        description: newCalItem.description || "Synthesized script description.",
        status: "draft",
      };

      setCalendar((prev) => [...prev, customEntry]);
    } catch (err) {
      console.error("Failed to synthesize calendar entry with Gemini:", err);
      // Sim fallback
      const customEntry: CalendarEntry = {
        day: calendar.length + 1,
        time: "6:00 PM",
        topic: `Symmetric ${onboardingData.creatorType} Vision`,
        format: "TikTok Short",
        mixType: "Viral Hook",
        description: "Aesthetic B-roll showing keyboard typing with striking typographic overlay text.",
        status: "draft",
      };
      setCalendar((prev) => [...prev, customEntry]);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Toggle entry status (Approve to Publish)
  const toggleStatus = async (id: string, currentStatus: string) => {
    if (currentStatus === 'pending_approval') {
      try {
        const res = await fetch(`/api/posts/approve/${id}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          fetchScheduledPosts();
        } else {
          alert("Failed to publish: " + data.error);
        }
      } catch (err) {
        alert("Error publishing post");
      }
    }
  };

  // Add custom manual post
  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    try {
      const res = await fetch("/api/posts/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: `${newTopic}\n\n${newDesc}`,
          media_url: newMediaUrl || "https://www.w3schools.com/html/mov_bbb.mp4", // default fallback for testing
          scheduled_at: new Date(Date.now() + newDay * 24 * 60 * 60 * 1000).toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchScheduledPosts();
      }
    } catch (err) {
      console.error("Failed to schedule:", err);
    }

    setShowAddModal(false);
    setNewTopic("");
    setNewDesc("");
    setNewMediaUrl("");
  };

  // Delete post
  const handleDeletePost = (day: number) => {
    setCalendar((prev) => prev.filter((item) => item.day !== day));
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#050505] text-white font-sans relative">
      
      {/* Glow spotlight */}
      <div className="absolute top-0 right-1/3 w-[300px] h-[300px] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Content Planner</h1>
          <p className="text-xs text-[#A1A1AA]">
            Symmetric posting timeline curated dynamically by your Content Planner agent.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/8 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Post
          </button>
          
          <button
            onClick={handleSynthesizeSlot}
            disabled={isSynthesizing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] hover:brightness-110 active:scale-95 disabled:opacity-40 text-white text-xs font-semibold tracking-wide transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            {isSynthesizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Synthesize Next Draft
              </>
            )}
          </button>
        </div>
      </div>

      {/* Core Posting List */}
      <div className="space-y-4">
        {calendar.map((item) => (
          <div
            key={item.day}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 shadow-lg transition-all flex flex-col md:flex-row justify-between md:items-center gap-6"
          >
            
            {/* Info and timing segment */}
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded-md">
                  Day {item.day}
                </span>
                <span className="text-[10px] font-mono text-[#A1A1AA] bg-white/5 border border-white/5 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#A1A1AA]" /> {item.time}
                </span>
                <span className="text-[10px] text-purple-400 bg-purple-500/10 font-medium px-2 py-0.5 rounded-md">
                  {item.format}
                </span>
                <span className="text-[10px] text-amber-400 bg-amber-400/10 font-medium px-2 py-0.5 rounded-md">
                  {item.mixType}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{item.topic}</h3>
              <p className="text-xs text-[#A1A1AA] font-light leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Controls / Status toggling segment */}
            <div className="flex items-center gap-3 justify-end shrink-0">
              <button
                onClick={() => toggleStatus(item.id, item.status)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer select-none uppercase tracking-wide ${
                  item.status === "published"
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : item.status === "pending_approval"
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    : "bg-white/5 border-white/5 text-[#A1A1AA] hover:text-white"
                }`}
              >
                {item.status === 'pending_approval' ? "Approve & Publish" : item.status}
              </button>

              <button
                onClick={() => handleDeletePost(item.day)}
                className="p-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 transition-all cursor-pointer"
                title="Delete Post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Manual Input Post Modal Dialog */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop glass */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111111] border border-white/8 rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10"
            >
              <h3 className="text-base font-bold text-white mb-4">Add Manual Calendar Entry</h3>
              
              <form onSubmit={handleAddPost} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-[#A1A1AA] uppercase">Video Topic Title</label>
                  <input
                    type="text"
                    required
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g., The Secret Cost of Quick Gains"
                    className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#A1A1AA] uppercase">Post Day</label>
                    <input
                      type="number"
                      required
                      value={newDay}
                      onChange={(e) => setNewDay(parseInt(e.target.value))}
                      className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#A1A1AA] uppercase">Posting Hour</label>
                    <input
                      type="text"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#A1A1AA] uppercase">Format</label>
                    <select
                      value={newFormat}
                      onChange={(e) => setNewFormat(e.target.value)}
                      className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Instagram Reel">Instagram Reel</option>
                      <option value="TikTok Short">TikTok Short</option>
                      <option value="YouTube Short">YouTube Short</option>
                      <option value="LinkedIn Post">LinkedIn Post</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#A1A1AA] uppercase">Media URL (Video/Reel)</label>
                    <input
                      type="url"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      placeholder="https://example.com/video.mp4"
                      className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-[#A1A1AA] uppercase">Video Visual Guidelines</label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe specific scene angles and script overlay guidelines..."
                    className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-[#A1A1AA] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-white text-black text-xs font-semibold rounded-xl"
                  >
                    Add Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Small missing inline icon loader helper
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
