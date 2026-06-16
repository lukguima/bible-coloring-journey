"use client";

import { useState, useCallback, useRef, useEffect } from "react";

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
  customImageUrl?: string;
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillHex: string,
  tolerance = 40
) {
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const toIdx = (x: number, y: number) => (y * width + x) * 4;
  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  const si = toIdx(sx, sy);
  const sr = data[si], sg = data[si + 1], sb = data[si + 2];

  // Skip dark pixels (outlines)
  if (sr < 80 && sg < 80 && sb < 80) return;

  const { r: fr, g: fg, b: fb } = hexToRgb(fillHex);

  // Already this color
  if (Math.abs(sr - fr) < 5 && Math.abs(sg - fg) < 5 && Math.abs(sb - fb) < 5) return;

  const matches = (idx: number) =>
    Math.abs(data[idx] - sr) <= tolerance &&
    Math.abs(data[idx + 1] - sg) <= tolerance &&
    Math.abs(data[idx + 2] - sb) <= tolerance;

  const visited = new Uint8Array(width * height);
  const stack: [number, number][] = [[sx, sy]];

  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    const vi = y * width + x;
    if (visited[vi]) continue;
    const idx = vi * 4;
    if (!matches(idx)) continue;
    visited[vi] = 1;
    data[idx] = fr;
    data[idx + 1] = fg;
    data[idx + 2] = fb;
    data[idx + 3] = 255;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  ctx.putImageData(imageData, 0, 0);
}

export default function ColoringCanvas({
  pageId,
  areas,
  title,
  savedColors,
  onSave,
  customImageUrl,
}: ColoringCanvasProps) {
  const [selectedColor, setSelectedColor] = useState("#A9C8D8");
  const [colors, setColors] = useState<Record<string, string>>(savedColors || {});
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isImageMode = !!customImageUrl;

  // Load custom image onto canvas
  useEffect(() => {
    if (!isImageMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImageLoaded(true);
    };
    img.src = customImageUrl!;
  }, [customImageUrl, isImageMode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    floodFill(ctx, x, y, selectedColor);
  };

  const handleAreaClick = useCallback(
    (areaId: string) => {
      const newColors = { ...colors, [areaId]: selectedColor };
      setColors(newColors);
      onSave?.(newColors);
    },
    [colors, selectedColor, onSave]
  );

  const handleClear = () => {
    if (isImageMode && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = customImageUrl!;
    } else {
      setColors({});
      onSave?.({});
    }
  };

  const handleDownloadPage = () => {
    if (isImageMode && canvasRef.current) {
      const link = document.createElement("a");
      link.download = `${pageId}-colored.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    } else {
      window.print();
    }
  };

  const colorPalette = (
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
  );

  const actions = (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      <button
        onClick={handleClear}
        style={{ padding: "8px 16px", backgroundColor: "#F8F1E7", color: "#7A4E2D", border: "1px solid #EFE4D0", borderRadius: "20px", fontSize: "13px", fontWeight: 600, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}
      >
        Clear Colors
      </button>
      <button
        onClick={handleDownloadPage}
        style={{ padding: "8px 16px", backgroundColor: "#263B5E", color: "#FFFFFF", border: "none", borderRadius: "20px", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}
      >
        {isImageMode ? "⬇️ Download PNG" : "🖨️ Print Page"}
      </button>
    </div>
  );

  if (isImageMode) {
    return (
      <div>
        {colorPalette}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "2px solid #EFE4D0", overflow: "hidden", marginBottom: "16px", position: "relative" }}>
          {!imageLoaded && (
            <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", fontSize: "14px" }}>
              Carregando imagem...
            </div>
          )}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{ width: "100%", display: imageLoaded ? "block" : "none", cursor: "crosshair" }}
          />
        </div>
        {actions}
      </div>
    );
  }

  // SVG mode (default)
  return (
    <div>
      {colorPalette}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "2px solid #EFE4D0", overflow: "hidden", marginBottom: "16px" }}>
        <svg viewBox="0 0 400 300" style={{ width: "100%", display: "block" }}>
          <text x="200" y="25" textAnchor="middle" fontSize="14" fill="#263B5E" fontFamily="Cormorant Garamond, serif" fontWeight="bold">
            {title}
          </text>
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
      {actions}
    </div>
  );
}
