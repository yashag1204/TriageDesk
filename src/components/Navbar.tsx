import React from "react";
import { Sparkles, Layers, Activity, RefreshCw } from "lucide-react";

interface NavbarProps {
  activeTab: "submit" | "dashboard" | "analytics";
  setActiveTab: (tab: "submit" | "dashboard" | "analytics") => void;
  onReset: () => void;
  isResetting: boolean;
  stats: {
    total: number;
    open: number;
    critical: number;
    resolved: number;
  };
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onReset,
  isResetting,
  stats,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-md">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-950">TriageDesk</h1>
            <p className="text-[10px] font-mono text-zinc-500">v1.2.0 • INTENT CLASSIFIER</p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono text-zinc-600">
          <div className="flex items-center gap-2 border-r border-zinc-200 pr-6">
            <span className="h-2 w-2 rounded-full bg-zinc-400 animate-pulse"></span>
            <span>TOTAL: <strong className="text-zinc-900">{stats.total}</strong></span>
          </div>
          <div className="flex items-center gap-2 border-r border-zinc-200 pr-6">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <span>OPEN: <strong className="text-zinc-900">{stats.open}</strong></span>
          </div>
          <div className="flex items-center gap-2 border-r border-zinc-200 pr-6">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
            <span>CRITICAL: <strong className="text-red-600 font-semibold">{stats.critical}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>RESOLVED: <strong className="text-zinc-900">{stats.resolved}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-zinc-100 p-0.5">
            <button
              onClick={() => setActiveTab("submit")}
              id="nav-submit-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === "submit"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
              <span>Submit Bug</span>
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              id="nav-dashboard-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-zinc-500" />
              <span>Agent Board</span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              id="nav-analytics-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-zinc-500" />
              <span className="relative">
                Ops & KPIs
                <span className="absolute -top-1 -right-1.5 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
              </span>
            </button>
          </div>

          <button
            onClick={onReset}
            disabled={isResetting}
            title="Reset to 20 Seeded Past Resolved Tickets"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isResetting ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
