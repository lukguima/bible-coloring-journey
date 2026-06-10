import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  subtext?: string;
  trend?: string;
}

export default function MetricCard({ label, value, icon, color = "#263B5E", subtext, trend }: MetricCardProps) {
  return (
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{ fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </div>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: "28px", fontWeight: 800, color: "#1F2937", fontFamily: "'Nunito', sans-serif", lineHeight: 1 }}>
        {value}
      </div>
      {subtext && (
        <div style={{ fontSize: "12px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", marginTop: "4px" }}>
          {subtext}
        </div>
      )}
      {trend && (
        <div style={{ fontSize: "12px", color: "#10B981", fontFamily: "'Nunito', sans-serif", marginTop: "4px", fontWeight: 600 }}>
          {trend}
        </div>
      )}
    </div>
  );
}
