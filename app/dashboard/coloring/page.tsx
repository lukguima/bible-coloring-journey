"use client";

import { useRef } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useColoringImages } from "@/hooks/useColoringImages";
import { Upload, Trash2, ImageIcon } from "lucide-react";

const PAGES = [
  { id: "creation", title: "God Creates the World", emoji: "🌍" },
  { id: "noahs-ark", title: "Noah's Ark", emoji: "⛵" },
  { id: "rainbow", title: "The Rainbow Promise", emoji: "🌈" },
];

export default function ColoringImagesPage() {
  const { images, setImage, removeImage } = useColoringImages();
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFile = (pageId: string, file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) setImage(pageId, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader title="Coloring Pages" />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            backgroundColor: "#EFF6FF",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#1E40AF",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          Faça upload de uma imagem PNG/JPG para substituir a ilustração padrão de cada página de colorir. A imagem enviada se torna interativa — o usuário pode clicar para pintar as áreas dentro do app.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {PAGES.map((page) => {
            const customImage = images[page.id];
            return (
              <div
                key={page.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid #E5E7EB",
                  overflow: "hidden",
                }}
              >
                {/* Preview */}
                <div
                  style={{
                    height: "180px",
                    backgroundColor: "#F9FAFB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  {customImage ? (
                    <img
                      src={customImage}
                      alt={page.title}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", color: "#9CA3AF" }}>
                      <ImageIcon size={40} style={{ marginBottom: "8px", opacity: 0.4 }} />
                      <div style={{ fontSize: "12px", fontFamily: "'Nunito', sans-serif" }}>
                        Usando ilustração padrão (SVG)
                      </div>
                    </div>
                  )}
                  {customImage && (
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        backgroundColor: "#22C55E",
                        color: "#FFFFFF",
                        fontSize: "10px",
                        fontWeight: 700,
                        fontFamily: "'Nunito', sans-serif",
                        padding: "2px 8px",
                        borderRadius: "20px",
                      }}
                    >
                      Imagem personalizada
                    </div>
                  )}
                </div>

                {/* Info + actions */}
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "20px" }}>{page.emoji}</span>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif" }}>
                        {page.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>
                        ID: {page.id}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      ref={(el) => { inputRefs.current[page.id] = el; }}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(page.id, file);
                        e.target.value = "";
                      }}
                    />
                    <button
                      onClick={() => inputRefs.current[page.id]?.click()}
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        backgroundColor: "#263B5E",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 700,
                        fontFamily: "'Nunito', sans-serif",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Upload size={13} />
                      {customImage ? "Substituir imagem" : "Enviar imagem"}
                    </button>
                    {customImage && (
                      <button
                        onClick={() => removeImage(page.id)}
                        style={{
                          padding: "9px 12px",
                          backgroundColor: "#FFFFFF",
                          color: "#EF4444",
                          border: "1px solid #FEE2E2",
                          borderRadius: "8px",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Trash2 size={13} />
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
