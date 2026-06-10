interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  height?: number;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  color = "#C76F4A",
  height = 10,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
            fontSize: "12px",
            color: "#7A4E2D",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 600,
          }}
        >
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div
        style={{
          height: `${height}px`,
          backgroundColor: "#EFE4D0",
          borderRadius: `${height}px`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: `${height}px`,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}
