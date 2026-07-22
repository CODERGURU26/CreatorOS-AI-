import React from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Video,
  Search,
  BarChart3,
  CalendarDays,
  Settings,
  LogOut,
  Cpu,
} from "lucide-react";
import { OnboardingData } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onboardingData: OnboardingData;
  onLogOut: () => void;
  userEmail: string;
  igAccount?: any;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onboardingData,
  onLogOut,
  userEmail,
  igAccount,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "agents", label: "AI Agents", icon: Users },
    { id: "planner", label: "Content Planner", icon: Calendar },
    { id: "studio", label: "AI Studio", icon: Video },
    { id: "competitor", label: "Competitor Analysis", icon: Search },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "calendar", label: "Content Calendar", icon: CalendarDays },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-black/40 border-r border-white/5 backdrop-blur-2xl h-screen flex flex-col justify-between text-white font-sans shrink-0 relative z-10">
      
      {/* Top Brand Logo Container */}
      <div className="p-6 border-b border-white/5 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] flex items-center justify-center p-[1px] shadow-lg shadow-purple-500/15 shrink-0">
            <div className="w-full h-full bg-[#050505] rounded-[7px] flex items-center justify-center">
              <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight text-white block">
              CreatorOS <span className="text-cyan-400 font-mono text-[9px] bg-cyan-400/10 px-1.5 py-0.2 rounded ml-0.5 border border-cyan-400/10">AI</span>
            </span>
            <span className="text-[10px] text-[#A1A1AA] font-mono capitalize">
              {onboardingData.creatorType} Engine
            </span>
          </div>
        </div>

        {/* Operating System Core Health Metric */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-[#A1A1AA] font-mono">Autonomous Core</span>
          </div>
          <span className="text-[9px] text-emerald-400 font-mono bg-emerald-400/10 px-2 py-0.5 rounded uppercase font-semibold border border-emerald-400/10">
            Active
          </span>
        </div>
      </div>

      {/* Center Navigation List */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isSelected = activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 border-l-2 ${
                isSelected
                  ? "bg-white/[0.03] text-white border-[#7C3AED] shadow-sm shadow-purple-500/5"
                  : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.015] border-transparent"
              }`}
            >
              <IconComponent
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isSelected ? "text-[#7C3AED]" : "text-[#A1A1AA]"
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="p-4 border-t border-white/5 bg-black/10 space-y-3">
        <div className="flex items-center space-x-3 p-1.5">
          {igAccount?.profile_picture_url ? (
            <img src={igAccount.profile_picture_url} alt="Profile" className="w-8 h-8 rounded-full border border-white/10" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-purple-500/10">
              {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">{igAccount?.username || "Creator"}</h4>
            <p className="text-[10px] text-[#A1A1AA] font-mono truncate">{userEmail}</p>
          </div>
        </div>

        <button
          onClick={onLogOut}
          className="w-full flex items-center justify-center space-x-2 p-2 rounded-xl text-xs font-semibold text-red-400 bg-red-400/5 hover:bg-red-400/10 border border-red-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Console</span>
        </button>
      </div>

    </aside>
  );
}
