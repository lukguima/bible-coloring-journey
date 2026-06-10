"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import { BookOpen } from "lucide-react";
import { stories as defaultStories } from "@/data/stories";

export default function StoriesPage() {
  const [search, setSearch] = useState("");
  const filtered = defaultStories.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader title="Stories" searchValue={search} onSearchChange={setSearch} />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        <div style={{ marginBottom: "16px", padding: "12px 16px", backgroundColor: "#FEF3C7", borderRadius: "8px", fontSize: "13px", color: "#92400E", fontFamily: "'Nunito', sans-serif" }}>
          Stories are managed in <code style={{ fontFamily: "monospace", backgroundColor: "#FEF9C3", padding: "1px 5px", borderRadius: "3px" }}>data/stories.ts</code>. You can edit them directly in the codebase. Full CMS editing will be available in a future update.
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={<BookOpen />} title="No stories found" description="Edit data/stories.ts to add stories." />
        ) : (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                  {["#", "Title", "Reference", "Status", "Game"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6B7280", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "18px" }}>{s.emoji}</span>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#1F2937", fontFamily: "'Nunito', sans-serif" }}>{s.title}</div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>{s.shortDescription?.slice(0, 60)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{s.reference}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={s.status} /></td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{s.gameId || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
