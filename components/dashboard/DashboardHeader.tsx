"use client";

import { Menu, Search } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  onMenuClick?: () => void;
  onNew?: () => void;
  newLabel?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
}

export default function DashboardHeader({
  title,
  onMenuClick,
  onNew,
  newLabel = "New",
  searchValue,
  onSearchChange,
}: DashboardHeaderProps) {
  return (
    <header
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        padding: "0 20px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onMenuClick}
          className="md:hidden"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: "4px" }}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 style={{ fontSize: "17px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif", margin: 0 }}>
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {onSearchChange !== undefined && (
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ paddingLeft: "30px", paddingRight: "12px", paddingTop: "7px", paddingBottom: "7px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px", fontFamily: "'Nunito', sans-serif", outline: "none", width: "180px", backgroundColor: "#F9FAFB" }}
            />
          </div>
        )}

        {onNew && (
          <button
            onClick={onNew}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", backgroundColor: "#263B5E", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}
          >
            + {newLabel}
          </button>
        )}

        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#263B5E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "#FFFFFF", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
          A
        </div>
      </div>
    </header>
  );
}
