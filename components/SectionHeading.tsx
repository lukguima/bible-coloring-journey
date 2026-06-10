interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeading({ badge, title, subtitle, centered = true }: SectionHeadingProps) {
  return (
    <div style={{ textAlign: centered ? "center" : "left", marginBottom: "40px" }}>
      {badge && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#A9C8D833",
            color: "#263B5E",
            padding: "4px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "'Nunito', system-ui, sans-serif",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          {badge}
        </div>
      )}
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: 700,
          color: "#263B5E",
          lineHeight: 1.15,
          marginBottom: subtitle ? "12px" : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: "16px",
            color: "#7A4E2D",
            lineHeight: 1.6,
            maxWidth: centered ? "560px" : undefined,
            margin: centered ? "0 auto" : undefined,
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
