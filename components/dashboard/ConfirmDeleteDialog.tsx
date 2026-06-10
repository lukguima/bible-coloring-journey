"use client";

interface ConfirmDeleteDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteDialog({
  open,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "28px 24px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize: "32px", textAlign: "center", marginBottom: "12px" }}>🗑️</div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif", textAlign: "center", marginBottom: "8px" }}>
          {title}
        </h3>
        <p style={{ fontSize: "14px", color: "#6B7280", fontFamily: "'Nunito', sans-serif", textAlign: "center", lineHeight: 1.5, marginBottom: "24px" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px", backgroundColor: "#F3F4F6", color: "#1F2937", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "10px", backgroundColor: "#EF4444", color: "#FFFFFF", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
