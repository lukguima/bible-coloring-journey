"use client";

import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F7F7F5" }}>
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Mobile header trigger */}
        <div
          className="md:hidden"
          style={{ backgroundColor: "#263B5E", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", color: "#D8B76A", fontWeight: 700 }}>
            Bible Coloring Journey
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#A9C8D8", fontSize: "20px" }}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
