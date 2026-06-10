import { Badge } from "@/types";

interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
}

export default function BadgeCard({ badge, earned }: BadgeCardProps) {
  return (
    <div
      style={{
        backgroundColor: earned ? "#FFFFFF" : "#F8F1E7",
        borderRadius: "16px",
        padding: "16px 12px",
        textAlign: "center",
        border: `2px solid ${earned ? badge.color + "66" : "#EFE4D0"}`,
        boxShadow: earned ? `0 4px 16px ${badge.color}22` : "none",
        opacity: earned ? 1 : 0.5,
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ fontSize: "36px", marginBottom: "8px", filter: earned ? "none" : "grayscale(100%)" }}>
        {badge.emoji}
      </div>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: earned ? "#263B5E" : "#8E9672",
          fontFamily: "'Nunito', sans-serif",
          lineHeight: 1.2,
          marginBottom: "4px",
        }}
      >
        {badge.title}
      </div>
      {earned && (
        <div style={{ fontSize: "10px", color: "#8E9672", fontFamily: "'Nunito', sans-serif" }}>
          ✓ Earned
        </div>
      )}
      {!earned && (
        <div style={{ fontSize: "10px", color: "#8E9672", fontFamily: "'Nunito', sans-serif" }}>
          🔒 Locked
        </div>
      )}
    </div>
  );
}
