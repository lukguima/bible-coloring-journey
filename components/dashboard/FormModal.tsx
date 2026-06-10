"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

interface FormModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const widths = { sm: "400px", md: "560px", lg: "720px" };

export default function FormModal({ open, title, onClose, children, size = "md" }: FormModalProps) {
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", width: "100%", maxWidth: widths[size], boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: "4px" }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
