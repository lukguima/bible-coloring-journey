"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import ConfirmDeleteDialog from "@/components/dashboard/ConfirmDeleteDialog";
import FormModal from "@/components/dashboard/FormModal";
import { FormField, Input, Select } from "@/components/dashboard/FormField";
import { useMedia } from "@/hooks/useAdminData";
import { Trash2, Image, Plus } from "lucide-react";
import type { MediaItem } from "@/types";

export default function MediaPage() {
  const { data, create, remove } = useMedia();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<MediaItem>>({ title: "", url: "", altText: "", fileType: "image", tags: [] });

  const filtered = data.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()) || m.url.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (!form.url) return;
    create({ ...form, id: `media-${Date.now()}`, createdAt: new Date().toISOString() } as MediaItem);
    setForm({ title: "", url: "", altText: "", fileType: "image", tags: [] });
    setModalOpen(false);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader title="Media Library" onNew={() => setModalOpen(true)} newLabel="Upload URL" searchValue={search} onSearchChange={setSearch} />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        <div style={{ marginBottom: "16px", padding: "12px 16px", backgroundColor: "#EFF6FF", borderRadius: "8px", fontSize: "13px", color: "#1E40AF", fontFamily: "'Nunito', sans-serif" }}>
          💡 Media Library stores external URLs (CDN, Google Drive, Cloudflare Images). File uploads will be available in a future update.
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={<Image />} title="No media items" description="Add image URLs, PDF links, and SVG files to your media library." action={<button onClick={() => setModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", backgroundColor: "#263B5E", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}><Plus size={14} /> Add Media URL</button>} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
            {filtered.map((m) => (
              <div key={m.id} style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
                <div style={{ height: "120px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
                  {m.fileType === "image" ? "🖼️" : m.fileType === "pdf" ? "📄" : m.fileType === "svg" ? "🎨" : "📁"}
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#1F2937", fontFamily: "'Nunito', sans-serif", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title || "Untitled"}</div>
                  <div style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.url}</div>
                  <button onClick={() => setDeleteId(m.id)} style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}><Trash2 size={11} /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FormModal open={modalOpen} title="Add Media URL" onClose={() => setModalOpen(false)}>
        <FormField label="URL" required hint="Paste an image URL, PDF link, or CDN path"><Input value={form.url || ""} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></FormField>
        <FormField label="Title"><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
        <FormField label="Alt Text"><Input value={form.altText || ""} onChange={(e) => setForm({ ...form, altText: e.target.value })} /></FormField>
        <FormField label="File Type">
          <Select value={form.fileType || "image"} onChange={(e) => setForm({ ...form, fileType: e.target.value as MediaItem["fileType"] })}>
            <option value="image">Image</option><option value="pdf">PDF</option><option value="svg">SVG</option><option value="other">Other</option>
          </Select>
        </FormField>
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button onClick={() => setModalOpen(false)} style={{ flex: 1, padding: "10px", border: "1px solid #E5E7EB", borderRadius: "8px", backgroundColor: "#FFFFFF", fontSize: "13px", fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", backgroundColor: "#263B5E", color: "#FFFFFF", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Add</button>
        </div>
      </FormModal>

      <ConfirmDeleteDialog open={!!deleteId} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
