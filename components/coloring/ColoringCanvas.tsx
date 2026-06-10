"use client";

import { useState, useCallback } from "react";

const COLORS = [
  "#C76F4A", "#D8B76A", "#A9C8D8", "#8E9672", "#263B5E",
  "#F8F1E7", "#FFFFFF", "#7A4E2D", "#FF6B6B", "#4ECDC4",
  "#FFE66D", "#A8E6CF", "#FF8B94", "#B8B8FF", "#2D2D2D",
];

interface ColorArea {
  id: string;
  path: string;
  label: string;
}

interface ColoringCanvasProps {
  pageId: string;
  areas: ColorArea[];
  title: string;
  savedColors?: Record<string, string>;
  onSave?: (colors: Record<string, string>) => void;
}

export default function ColoringCanvas({ pageId, areas, title, savedColors, onSave }: ColoringCanvasProps) {
  const [selectedColor, setSelectedColor] = useState("#A9C8D8");
  const [colors, setColors] = useState<Record<string, string>>(savedColors || {});

  const handleAreaClick = useCallback((areaId: string) => {
    const newColors = { ...colors, [areaId]: selectedColor };
    setColors(newColors);
    onSave?.(newColors);
  }, [colors, selectedColor, onSave]);

  const handleClear = () => {
    setColors({});
    onSave?.({});
  };

  return (
    <div>
      {/* Color palette */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Choose a color:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: color,
                border: selectedColor === color ? "3px solid #263B5E" : "2px solid #EFE4D0",
                cursor: "pointer",
                transform: selectedColor === color ? "scale(1.2)" : "scale(1)",
                transition: "transform 0.15s ease",
                boxShadow: color === "#FFFFFF" ? "0 0 0 1px #EFE4D0" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "2px solid #EFE4D0",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        <svg viewBox="0 0 400 300" style={{ width: "100%", display: "block" }}>
          {/* Title */}
          <text x="200" y="25" textAnchor="middle" fontSize="14" fill="#263B5E" fontFamily="Cormorant Garamond, serif" fontWeight="bold">
            {title}
          </text>

          {/* Color areas */}
          {areas.map((area) => (
            <path
              key={area.id}
              d={area.path}
              fill={colors[area.id] || "#FAFAFA"}
              stroke="#2D2D2D"
              strokeWidth="1.5"
              strokeLinejoin="round"
              style={{ cursor: "pointer" }}
              onClick={() => handleAreaClick(area.id)}
            >
              <title>{area.label}</title>
            </path>
          ))}
        </svg>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={handleClear}
          style={{
            padding: "8px 16px",
            backgroundColor: "#F8F1E7",
            color: "#7A4E2D",
            border: "1px solid #EFE4D0",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "'Nunito', sans-serif",
            cursor: "pointer",
          }}
        >
          Clear Colors
        </button>
        <button
          onClick={() => window.print()}
          style={{
            padding: "8px 16px",
            backgroundColor: "#263B5E",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: "'Nunito', sans-serif",
            cursor: "pointer",
          }}
        >
          🖨️ Print Page
        </button>
        <a
          href={`/downloads/${pageId}.pdf`}
          style={{
            padding: "8px 16px",
            backgroundColor: "#8E9672",
            color: "#FFFFFF",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: "'Nunito', sans-serif",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ⬇️ Download PDF
        </a>
      </div>
    </div>
  );
}
