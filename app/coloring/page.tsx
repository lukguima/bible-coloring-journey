"use client";

import { useState } from "react";
import ColoringCanvas from "@/components/coloring/ColoringCanvas";
import ColoringPageSelector from "@/components/coloring/ColoringPageSelector";
import { useProgress } from "@/hooks/useProgress";
import { useColoringImages } from "@/hooks/useColoringImages";
import Link from "next/link";

const PAGES = [
  {
    id: "creation",
    title: "God Creates the World",
    emoji: "🌍",
    description: "Color the beautiful creation scene",
    areas: [
      { id: "sky", label: "Sky", path: "M40 40 L360 40 L360 150 L40 150 Z" },
      { id: "sun", label: "Sun", path: "M300 60 m-25,0 a25,25 0 1,0 50,0 a25,25 0 1,0 -50,0" },
      { id: "ground", label: "Ground", path: "M40 150 L360 150 L360 260 L40 260 Z" },
      { id: "tree-trunk", label: "Tree Trunk", path: "M100 260 L100 200 L120 200 L120 260 Z" },
      { id: "tree-leaves", label: "Tree Leaves", path: "M75 210 Q110 160 145 210 Q120 190 75 210 Z" },
      { id: "tree2-trunk", label: "Tree 2 Trunk", path: "M250 260 L250 185 L270 185 L270 260 Z" },
      { id: "tree2-leaves", label: "Tree 2 Leaves", path: "M220 195 Q260 140 300 195 Q265 175 220 195 Z" },
      { id: "flower1", label: "Flower", path: "M170 240 m-12,0 a12,12 0 1,0 24,0 a12,12 0 1,0 -24,0" },
      { id: "flower2", label: "Flower 2", path: "M200 250 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0" },
      { id: "cloud1", label: "Cloud", path: "M60 70 Q80 55 100 65 Q115 50 135 60 Q145 70 130 80 Q115 90 90 85 Q65 90 60 70 Z" },
      { id: "cloud2", label: "Cloud 2", path: "M180 55 Q200 42 220 52 Q235 40 255 50 Q265 60 250 70 Q235 80 210 75 Q182 80 180 55 Z" },
    ],
  },
  {
    id: "noahs-ark",
    title: "Noah's Ark",
    emoji: "⛵",
    description: "Color Noah's big ark on the water",
    areas: [
      { id: "water", label: "Water", path: "M40 200 Q130 185 200 195 Q270 185 360 200 L360 270 L40 270 Z" },
      { id: "ark-hull", label: "Ark Hull", path: "M80 200 L120 160 L280 160 L320 200 Q200 215 80 200 Z" },
      { id: "ark-house", label: "Ark House", path: "M130 160 L130 100 L270 100 L270 160 Z" },
      { id: "ark-roof", label: "Ark Roof", path: "M115 100 L200 60 L285 100 Z" },
      { id: "window1", label: "Window", path: "M155 120 L175 120 L175 145 L155 145 Z" },
      { id: "window2", label: "Window 2", path: "M185 120 L205 120 L205 145 L185 145 Z" },
      { id: "window3", label: "Window 3", path: "M215 120 L235 120 L235 145 L215 145 Z" },
      { id: "sky-bg", label: "Sky", path: "M40 40 L360 40 L360 195 L40 195 Z" },
      { id: "cloud1", label: "Cloud", path: "M60 70 Q80 55 100 65 Q115 50 135 60 Q145 70 130 80 Q95 88 60 70 Z" },
      { id: "sun", label: "Sun", path: "M310 65 m-22,0 a22,22 0 1,0 44,0 a22,22 0 1,0 -44,0" },
    ],
  },
  {
    id: "rainbow",
    title: "The Rainbow Promise",
    emoji: "🌈",
    description: "Color the beautiful rainbow",
    areas: [
      { id: "sky", label: "Sky", path: "M40 40 L360 40 L360 270 L40 270 Z" },
      { id: "rainbow-red", label: "Rainbow Red", path: "M40 200 Q200 60 360 200 Q355 195 350 195 Q200 65 50 195 Z" },
      { id: "rainbow-orange", label: "Rainbow Orange", path: "M50 210 Q200 80 350 210 Q345 205 340 205 Q200 90 60 205 Z" },
      { id: "rainbow-yellow", label: "Rainbow Yellow", path: "M65 222 Q200 100 335 222 Q328 215 325 215 Q200 108 75 215 Z" },
      { id: "rainbow-green", label: "Rainbow Green", path: "M80 234 Q200 118 320 234 Q312 228 308 228 Q200 125 88 228 Z" },
      { id: "rainbow-blue", label: "Rainbow Blue", path: "M95 246 Q200 136 305 246 Q297 239 292 239 Q200 143 103 239 Z" },
      { id: "ground", label: "Ground", path: "M40 255 L360 255 L360 280 L40 280 Z" },
      { id: "cloud-left", label: "Cloud Left", path: "M40 190 Q70 165 100 178 Q115 160 140 172 Q155 185 138 198 Q110 210 70 205 Q38 210 40 190 Z" },
      { id: "cloud-right", label: "Cloud Right", path: "M260 185 Q290 162 320 174 Q335 157 355 170 Q368 183 353 195 Q325 207 288 202 Q258 208 260 185 Z" },
    ],
  },
];

export default function ColoringPage() {
  const [selectedPageId, setSelectedPageId] = useState("creation");
  const { saveColoringProgress, getColoringProgress } = useProgress();
  const { getImage, isLoaded } = useColoringImages();

  const selectedPage = PAGES.find((p) => p.id === selectedPageId)!;
  const customImage = isLoaded ? getImage(selectedPage.id) : undefined;

  const handleDownloadAll = () => {
    const svgPages = PAGES.map((page) => {
      const savedColors = getColoringProgress(page.id) || {};
      const paths = page.areas
        .map(
          (area) =>
            `<path d="${area.path}" fill="${savedColors[area.id] || "#FAFAFA"}" stroke="#2D2D2D" stroke-width="1.5" stroke-linejoin="round"/>`
        )
        .join("\n");
      return `
        <div style="page-break-after:always;padding:20px;display:flex;flex-direction:column;align-items:center;">
          <h2 style="font-family:Georgia,serif;color:#263B5E;margin-bottom:16px;">${page.emoji} ${page.title}</h2>
          <svg viewBox="0 0 400 300" style="width:100%;max-width:600px;">
            ${paths}
          </svg>
        </div>
      `;
    });

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bible Coloring Journey — All Pages</title>
      <style>body{margin:0;background:#fff;} @media print{.no-print{display:none}}</style>
    </head><body>
      <div class="no-print" style="padding:16px;text-align:center;background:#F8F1E7;border-bottom:1px solid #EFE4D0;">
        <button onclick="window.print()" style="padding:10px 24px;background:#263B5E;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;">
          🖨️ Imprimir / Salvar como PDF
        </button>
      </div>
      ${svgPages.join("")}
    </body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
            🎨 Coloring Studio
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 44px)", color: "#263B5E", marginBottom: "8px", fontWeight: 700 }}>
            Color the Bible Stories
          </h1>
          <p style={{ fontSize: "15px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", maxWidth: "500px", margin: "0 auto" }}>
            Choose a scene, pick a color, and click to color the picture. Then print or download it!
          </p>
        </div>

        {/* Page selector */}
        <ColoringPageSelector
          pages={PAGES.map((p) => ({ id: p.id, title: p.title, emoji: p.emoji, description: p.description }))}
          selectedId={selectedPageId}
          onSelect={setSelectedPageId}
        />

        {/* Canvas */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "24px", boxShadow: "0 4px 20px rgba(122,78,45,0.08)" }}>
          {customImage && (
            <div style={{ marginBottom: "12px", padding: "8px 12px", backgroundColor: "#F0FDF4", borderRadius: "8px", fontSize: "12px", color: "#166534", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: "6px" }}>
              ✨ Usando imagem personalizada — clique para pintar!
            </div>
          )}
          <ColoringCanvas
            pageId={selectedPage.id}
            areas={selectedPage.areas}
            title={selectedPage.title}
            savedColors={getColoringProgress(selectedPage.id)}
            onSave={(colors) => saveColoringProgress(selectedPage.id, colors)}
            customImageUrl={customImage}
          />
        </div>

        {/* Download all PDF */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={handleDownloadAll}
            style={{
              padding: "12px 28px",
              backgroundColor: "#8E9672",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "24px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📄 Baixar todas as páginas como PDF
          </button>
        </div>

        {/* Info */}
        <div style={{ marginTop: "24px", padding: "20px", backgroundColor: "#A9C8D822", borderRadius: "16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "24px" }}>💡</span>
          <div>
            <p style={{ fontSize: "14px", color: "#263B5E", fontFamily: "'Nunito', sans-serif", fontWeight: 700, marginBottom: "4px" }}>
              How to use the Coloring Studio
            </p>
            <p style={{ fontSize: "13px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", lineHeight: 1.6 }}>
              Select a color from the palette, then click any area of the picture to fill it with that color. Use the download button to save your colored page, or download all pages as PDF.
            </p>
          </div>
        </div>

        {/* Link to printables */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <p style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", marginBottom: "12px" }}>
            Want more coloring pages?
          </p>
          <Link
            href="/printables"
            style={{ padding: "12px 24px", backgroundColor: "#263B5E", color: "#FFFFFF", borderRadius: "24px", fontSize: "14px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", textDecoration: "none" }}
          >
            View All Printables →
          </Link>
        </div>
      </div>
    </div>
  );
}
