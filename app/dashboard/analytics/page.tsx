"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { BarChart3, BookOpen, Gamepad2, FileText, Users, TrendingUp, MousePointerClick } from "lucide-react";

export default function AnalyticsPage() {
  const { events, getMetrics, clearEvents } = useAnalytics();
  const m = getMetrics();

  const recentEvents = [...events].reverse().slice(0, 50);

  const EVENT_LABELS: Record<string, string> = {
    story_completed: "📖 Story Completed",
    game_completed: "🎮 Game Completed",
    start_free_adventure_clicked: "🚀 Free Adventure Start",
    unlock_clicked: "🔓 Unlock Clicked",
    printable_download_clicked: "📄 Printable Download",
    waitlist_submitted: "📬 Waitlist Signup",
    badge_unlocked: "🏅 Badge Unlocked",
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader title="Analytics" />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          <MetricCard label="Total Events" value={m.totalEvents} icon={<BarChart3 size={16} color="#263B5E" />} color="#263B5E" />
          <MetricCard label="Stories Completed" value={m.storiesCompleted} icon={<BookOpen size={16} color="#C76F4A" />} color="#C76F4A" />
          <MetricCard label="Games Completed" value={m.gamesCompleted} icon={<Gamepad2 size={16} color="#8E9672" />} color="#8E9672" />
          <MetricCard label="Free Adventure Starts" value={m.freeAdventureStarts} icon={<TrendingUp size={16} color="#A9C8D8" />} color="#A9C8D8" />
          <MetricCard label="Unlock Clicks" value={m.unlockClicks} icon={<MousePointerClick size={16} color="#D8B76A" />} color="#D8B76A" />
          <MetricCard label="Printable Downloads" value={m.printableDownloads} icon={<FileText size={16} color="#C76F4A" />} color="#C76F4A" />
          <MetricCard label="Waitlist Signups" value={m.waitlistSubmissions} icon={<Users size={16} color="#263B5E" />} color="#263B5E" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Conversion funnel */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif", margin: 0 }}>Conversion Funnel</h2>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {[
                { label: "Free Adventure Starts", value: m.freeAdventureStarts, color: "#A9C8D8" },
                { label: "Stories Completed", value: m.storiesCompleted, color: "#8E9672" },
                { label: "Unlock Page Clicks", value: m.unlockClicks, color: "#D8B76A" },
                { label: "Waitlist Signups", value: m.waitlistSubmissions, color: "#C76F4A" },
              ].map((step) => {
                const max = m.freeAdventureStarts || 1;
                const pct = Math.min(100, Math.round((step.value / max) * 100));
                return (
                  <div key={step.label} style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", color: "#374151", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>{step.label}</span>
                      <span style={{ fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{step.value}</span>
                    </div>
                    <div style={{ height: "8px", backgroundColor: "#F3F4F6", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, backgroundColor: step.color, borderRadius: "4px", transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent events */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif", margin: 0 }}>Recent Events</h2>
              {events.length > 0 && (
                <button onClick={() => { if (confirm("Clear all analytics events? This cannot be undone.")) clearEvents(); }} style={{ fontSize: "11px", color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                  Clear All
                </button>
              )}
            </div>
            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {recentEvents.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#9CA3AF", fontSize: "13px", fontFamily: "'Nunito', sans-serif" }}>
                  No events yet. Events are tracked as visitors interact with the site.
                </div>
              ) : (
                recentEvents.map((e) => (
                  <div key={e.id} style={{ padding: "10px 20px", borderBottom: "1px solid #F9FAFB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#374151", fontFamily: "'Nunito', sans-serif" }}>
                      {EVENT_LABELS[e.eventName] || e.eventName}
                    </span>
                    <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>
                      {new Date(e.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#FEF3C7", borderRadius: "8px", fontSize: "13px", color: "#92400E", fontFamily: "'Nunito', sans-serif" }}>
          📊 Analytics data is stored locally in this browser. Connect Google Analytics or a backend in a future update for persistent, cross-device analytics.
        </div>
      </div>
    </div>
  );
}
