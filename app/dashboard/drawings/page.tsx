"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import ConfirmDeleteDialog from "@/components/dashboard/ConfirmDeleteDialog";
import FormModal from "@/components/dashboard/FormModal";
import { FormField, Input, Textarea, Select } from "@/components/dashboard/FormField";
import { useDrawings } from "@/hooks/useAdminData";
import { useImageQueue } from "@/hooks/useImageQueue";
import { Edit2, Trash2, Palette, SendHorizontal } from "lucide-react";
import type { Drawing } from "@/types";

export default function DrawingsPage() {
  const { data, create, update, remove } = useDrawings();
  const { createJob } = useImageQueue();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Drawing | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Drawing>>({});
  const [queuedId, setQueuedId] = useState<string | null>(null);

  const sendToQueue = (d: Drawing) => {
    createJob({
      source: "drawings",
      drawingId: d.id,
      collectionId: d.collectionId,
      title: `${d.title} Coloring Page`,
      prompt: d.description || `Coloring page illustration for "${d.title}" — ${d.bibleReference}. ${d.lesson || ""}`,
      negativePrompt: "text, words, letters, numbers, watermark, signature, color fills, grayscale, shading",
      imageType: "coloring_page",
      priority: "normal",
      status: "pending",
      notes: `Drawing ID: ${d.id}`,
    });
    setQueuedId(d.id);
    setTimeout(() => setQueuedId(null), 2000);
  };

  const filtered = data.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: "", slug: "", description: "", bibleReference: "", lesson: "", reflectionQuestion: "", status: "draft", accessLevel: "free", difficulty: "easy", ageRange: "4–9", collectionId: "genesis", storyId: "", imageUrl: "", svgContent: "", printablePdfUrl: "", thumbnailUrl: "", tags: [] });
    setModalOpen(true);
  };
  const openEdit = (d: Drawing) => { setEditItem(d); setForm(d); setModalOpen(true); };

  const handleSave = () => {
    if (!form.title) return;
    if (editItem) {
      update(editItem.id, { ...form, updatedAt: new Date().toISOString() });
    } else {
      create({ ...form, id: `drw-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Drawing);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader title="Drawings" onNew={openCreate} newLabel="Drawing" searchValue={search} onSearchChange={setSearch} />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <EmptyState icon={<Palette />} title="No drawings" description="Add your first coloring page drawing." action={<button onClick={openCreate} style={{ padding: "10px 20px", backgroundColor: "#263B5E", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Add Drawing</button>} />
        ) : (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                  {["Title", "Bible Ref", "Difficulty", "Access", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6B7280", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#1F2937", fontFamily: "'Nunito', sans-serif" }}>{d.title}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>{d.lesson?.slice(0, 50)}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{d.bibleReference}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{d.difficulty}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={d.accessLevel} /></td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={d.status} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => openEdit(d)} style={{ padding: "5px 8px", border: "1px solid #E5E7EB", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#6B7280" }}><Edit2 size={13} /></button>
                        <button onClick={() => sendToQueue(d)} title="Send to Image Queue" style={{ padding: "5px 8px", border: "none", borderRadius: "6px", backgroundColor: queuedId === d.id ? "#16A34A" : "#7C3AED", cursor: "pointer", color: "#FFFFFF" }}>
                          <SendHorizontal size={13} />
                        </button>
                        <button onClick={() => setDeleteId(d.id)} style={{ padding: "5px 8px", border: "1px solid #FEE2E2", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#EF4444" }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FormModal open={modalOpen} title={editItem ? "Edit Drawing" : "New Drawing"} onClose={() => setModalOpen(false)} size="lg">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="Title" required><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Bible Reference"><Input value={form.bibleReference || ""} onChange={(e) => setForm({ ...form, bibleReference: e.target.value })} placeholder="Genesis 1:1" /></FormField>
        </div>
        <FormField label="Description"><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
        <FormField label="Lesson"><Input value={form.lesson || ""} onChange={(e) => setForm({ ...form, lesson: e.target.value })} /></FormField>
        <FormField label="Reflection Question"><Input value={form.reflectionQuestion || ""} onChange={(e) => setForm({ ...form, reflectionQuestion: e.target.value })} /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <FormField label="Difficulty"><Select value={form.difficulty || "easy"} onChange={(e) => setForm({ ...form, difficulty: e.target.value as "easy" | "medium" })}><option value="easy">Easy</option><option value="medium">Medium</option></Select></FormField>
          <FormField label="Access"><Select value={form.accessLevel || "free"} onChange={(e) => setForm({ ...form, accessLevel: e.target.value as "free" | "premium" })}><option value="free">Free</option><option value="premium">Premium</option></Select></FormField>
          <FormField label="Status"><Select value={form.status || "draft"} onChange={(e) => setForm({ ...form, status: e.target.value as Drawing["status"] })}><option value="draft">Draft</option><option value="active">Active</option><option value="hidden">Hidden</option></Select></FormField>
        </div>
        <FormField label="Printable PDF URL"><Input value={form.printablePdfUrl || ""} onChange={(e) => setForm({ ...form, printablePdfUrl: e.target.value })} placeholder="/downloads/..." /></FormField>
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button onClick={() => setModalOpen(false)} style={{ flex: 1, padding: "10px", border: "1px solid #E5E7EB", borderRadius: "8px", backgroundColor: "#FFFFFF", fontSize: "13px", fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", backgroundColor: "#263B5E", color: "#FFFFFF", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Save</button>
        </div>
      </FormModal>

      <ConfirmDeleteDialog open={!!deleteId} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
