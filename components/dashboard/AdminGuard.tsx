"use client";

import { useState } from "react";

const DASHBOARD_ENABLED = true;

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [entered, setEntered] = useState(false);

  if (!DASHBOARD_ENABLED) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F7F7F5" }}>
        <p style={{ fontSize: "16px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>Dashboard is currently disabled.</p>
      </div>
    );
  }

  if (!entered) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#263B5E" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "48px 40px", textAlign: "center", maxWidth: "380px", width: "100%", margin: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📖</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", color: "#263B5E", marginBottom: "4px", fontWeight: 700 }}>
            Bible Coloring Journey
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", fontFamily: "'Nunito', sans-serif", marginBottom: "28px" }}>
            Admin Dashboard
          </p>
          <button
            onClick={() => setEntered(true)}
            style={{ width: "100%", padding: "14px", backgroundColor: "#263B5E", color: "#FFFFFF", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 800, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}
          >
            Enter Dashboard →
          </button>
          <p style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", marginTop: "12px" }}>
            Authentication will be added in a future update
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
