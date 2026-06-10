"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import { Gamepad2 } from "lucide-react";
import { games } from "@/data/games";

export default function GamesPage() {
  const [search, setSearch] = useState("");
  const filtered = games.filter((g) => g.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader title="Games" searchValue={search} onSearchChange={setSearch} />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        <div style={{ marginBottom: "16px", padding: "12px 16px", backgroundColor: "#FEF3C7", borderRadius: "8px", fontSize: "13px", color: "#92400E", fontFamily: "'Nunito', sans-serif" }}>
          Games are built into the codebase in <code style={{ fontFamily: "monospace", backgroundColor: "#FEF9C3", padding: "1px 5px", borderRadius: "3px" }}>data/games.ts</code> + <code style={{ fontFamily: "monospace", backgroundColor: "#FEF9C3", padding: "1px 5px", borderRadius: "3px" }}>components/games/</code>. Visual game builder coming in future update.
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={<Gamepad2 />} title="No games found" description="Edit data/games.ts to manage games." />
        ) : (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                  {["Game", "Age Range", "Badge", "Status"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6B7280", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "20px" }}>{g.emoji}</span>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#1F2937", fontFamily: "'Nunito', sans-serif" }}>{g.title}</div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>{g.description?.slice(0, 60)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{g.ageRange}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{g.badge}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status="active" /></td>
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
