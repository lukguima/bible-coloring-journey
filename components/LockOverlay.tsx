import Link from "next/link";
import { Lock } from "lucide-react";

interface LockOverlayProps {
  title?: string;
  description?: string;
}

export default function LockOverlay({
  title = "Unlock the Full Genesis Pack",
  description = "Get all stories, coloring pages, games, verse cards, and printables.",
}: LockOverlayProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(38, 59, 94, 0.85)",
        borderRadius: "inherit",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backdropFilter: "blur(4px)",
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          backgroundColor: "#D8B76A",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >
        <Lock size={22} color="#263B5E" />
      </div>
      <h3
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "18px",
          fontWeight: 700,
          color: "#FFFFFF",
          textAlign: "center",
          marginBottom: "6px",
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "12px",
          color: "#A9C8D8",
          textAlign: "center",
          marginBottom: "16px",
          fontFamily: "'Nunito', system-ui, sans-serif",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      <Link
        href="/unlock"
        style={{
          padding: "10px 20px",
          backgroundColor: "#D8B76A",
          color: "#263B5E",
          borderRadius: "24px",
          fontSize: "13px",
          fontWeight: 800,
          fontFamily: "'Nunito', system-ui, sans-serif",
          textDecoration: "none",
        }}
      >
        Unlock Now
      </Link>
    </div>
  );
}
