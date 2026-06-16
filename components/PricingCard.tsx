import { Check } from "lucide-react";
import Link from "next/link";

interface PricingCardProps {
  plan: string;
  price: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
  onCtaClick?: () => void;
}

export default function PricingCard({
  plan,
  price,
  description,
  features,
  ctaLabel,
  ctaHref,
  highlighted = false,
  badge,
  onCtaClick,
}: PricingCardProps) {
  return (
    <div
      style={{
        backgroundColor: highlighted ? "#263B5E" : "#FFFFFF",
        borderRadius: "24px",
        padding: "28px 24px",
        border: highlighted ? "none" : "2px solid #EFE4D0",
        boxShadow: highlighted ? "0 12px 40px rgba(38,59,94,0.3)" : "0 2px 8px rgba(122,78,45,0.06)",
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {badge && (
        <div
          style={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#C76F4A",
            color: "#FFFFFF",
            fontSize: "11px",
            fontWeight: 800,
            fontFamily: "'Nunito', sans-serif",
            padding: "4px 14px",
            borderRadius: "20px",
            whiteSpace: "nowrap",
          }}
        >
          {badge}
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: highlighted ? "#A9C8D8" : "#8E9672",
            fontFamily: "'Nunito', sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "6px",
          }}
        >
          {plan}
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "44px",
            fontWeight: 700,
            color: highlighted ? "#D8B76A" : "#263B5E",
            lineHeight: 1,
            marginBottom: "8px",
          }}
        >
          {price}
        </div>
        <p
          style={{
            fontSize: "13px",
            color: highlighted ? "#A9C8D8" : "#7A4E2D",
            fontFamily: "'Nunito', sans-serif",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 }}>
        {features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
            <Check size={14} style={{ color: highlighted ? "#D8B76A" : "#C76F4A", flexShrink: 0, marginTop: "2px" }} />
            <span style={{ fontSize: "13px", color: highlighted ? "#EFE4D0" : "#263B5E", fontFamily: "'Nunito', sans-serif", lineHeight: 1.4 }}>
              {f}
            </span>
          </li>
        ))}
      </ul>

      {onCtaClick ? (
        <button
          onClick={onCtaClick}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: highlighted ? "#D8B76A" : "#263B5E",
            color: highlighted ? "#263B5E" : "#FFFFFF",
            border: "none",
            borderRadius: "14px",
            fontSize: "15px",
            fontWeight: 800,
            fontFamily: "'Nunito', sans-serif",
            cursor: "pointer",
          }}
        >
          {ctaLabel}
        </button>
      ) : (
        <Link
          href={ctaHref}
          style={{
            display: "block",
            padding: "14px",
            backgroundColor: highlighted ? "#D8B76A" : "#263B5E",
            color: highlighted ? "#263B5E" : "#FFFFFF",
            borderRadius: "14px",
            fontSize: "15px",
            fontWeight: 800,
            fontFamily: "'Nunito', sans-serif",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
