import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: "center", padding: "64px 32px" }}>
      {icon && (
        <div style={{ fontSize: "48px", marginBottom: "12px", opacity: 0.5 }}>{icon}</div>
      )}
      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif", marginBottom: "6px" }}>
        {title}
      </h3>
      <p style={{ fontSize: "14px", color: "#6B7280", fontFamily: "'Nunito', sans-serif", marginBottom: "20px", maxWidth: "360px", margin: "0 auto 20px" }}>
        {description}
      </p>
      {action}
    </div>
  );
}
