type Status = "active" | "draft" | "archived" | "hidden" | "free" | "premium" | "planning" | "prelaunch" | "live" | "closed" | "scheduled" | "expired" | "inactive";

const STATUS_STYLES: Record<Status, { bg: string; color: string; label: string }> = {
  active:    { bg: "#D1FAE5", color: "#065F46", label: "Active" },
  draft:     { bg: "#FEF3C7", color: "#92400E", label: "Draft" },
  archived:  { bg: "#F3F4F6", color: "#6B7280", label: "Archived" },
  hidden:    { bg: "#E0E7FF", color: "#3730A3", label: "Hidden" },
  free:      { bg: "#DBEAFE", color: "#1E40AF", label: "Free" },
  premium:   { bg: "#FEF3C7", color: "#92400E", label: "Premium" },
  planning:  { bg: "#F3F4F6", color: "#6B7280", label: "Planning" },
  prelaunch: { bg: "#FDE8D8", color: "#C76F4A", label: "Pre-Launch" },
  live:      { bg: "#D1FAE5", color: "#065F46", label: "Live" },
  closed:    { bg: "#F3F4F6", color: "#6B7280", label: "Closed" },
  scheduled: { bg: "#EDE9FE", color: "#5B21B6", label: "Scheduled" },
  expired:   { bg: "#FEE2E2", color: "#991B1B", label: "Expired" },
  inactive:  { bg: "#F3F4F6", color: "#6B7280", label: "Inactive" },
};

export default function StatusBadge({ status }: { status: Status | string }) {
  const s = STATUS_STYLES[status as Status] ?? { bg: "#F3F4F6", color: "#6B7280", label: status };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}
