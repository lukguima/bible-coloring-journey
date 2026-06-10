import LockOverlay from "./LockOverlay";
import { Download } from "lucide-react";

interface Printable {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: string;
  status: string;
  downloadUrl: string;
  pages?: number;
  format?: string;
}

interface PrintableCardProps {
  printable: Printable;
  onDownload?: () => void;
}

export default function PrintableCard({ printable, onDownload }: PrintableCardProps) {
  const isPremium = printable.status === "premium";

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid #EFE4D0",
        boxShadow: "0 2px 8px rgba(122,78,45,0.06)",
        position: "relative",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          height: "140px",
          background: "linear-gradient(135deg, #EFE4D0, #A9C8D822)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "52px",
          position: "relative",
        }}
      >
        {printable.emoji}
        {isPremium && !onDownload && <LockOverlay />}
      </div>

      <div style={{ padding: "16px" }}>
        <div
          style={{
            fontSize: "11px",
            color: "#8E9672",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "4px",
          }}
        >
          {printable.type}
        </div>
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "17px",
            color: "#263B5E",
            fontWeight: 700,
            marginBottom: "6px",
            lineHeight: 1.2,
          }}
        >
          {printable.title}
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "#7A4E2D",
            fontFamily: "'Nunito', sans-serif",
            lineHeight: 1.4,
            marginBottom: "12px",
          }}
        >
          {printable.description}
        </p>

        {printable.pages && (
          <div style={{ fontSize: "11px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", marginBottom: "12px" }}>
            📄 {printable.pages} page{printable.pages > 1 ? "s" : ""} · {printable.format || "US Letter"}
          </div>
        )}

        {onDownload ? (
          <button
            onClick={onDownload}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#263B5E",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Download size={13} /> Download Free
          </button>
        ) : isPremium ? (
          <a
            href="/unlock"
            style={{
              display: "block",
              padding: "10px",
              backgroundColor: "#D8B76A",
              color: "#263B5E",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            🔓 Unlock — $9
          </a>
        ) : null}
      </div>
    </div>
  );
}
