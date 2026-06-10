"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import ConfirmDeleteDialog from "@/components/dashboard/ConfirmDeleteDialog";
import FormModal from "@/components/dashboard/FormModal";
import { FormField, Input, Textarea, Select } from "@/components/dashboard/FormField";
import { useAnnouncements } from "@/hooks/useAdminData";
import { Edit2, Trash2, Megaphone } from "lucide-react";
import type { Announcement } from "@/types";

const EMPTY: Partial<Announcement> = {
  title: "", message: "", type: "info", placement: "home",
  ctaLabel: "", ctaUrl: "", backgroundColor: "#A9C8D8",
  startDate: "", endDate: "", status: "draft",
};

export default function AnnouncementsPage() {
  const { data, create, update, remove } = useAnnouncements();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Announcement>>(EMPTY);

  const filtered = data.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (a: Announcement) => { setEditItem(a); setForm(a); setModalOpen(true); };

  const handleSave = () => {
    if (!form.title) return;
    if (editItem) {
      update(editItem.id, { ...form, updatedAt: new Date().toISOString() });
    } else {
      create({ ...form, id: `ann-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Announcement);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader title="Announcements" onNew={openCreate} newLabel="Announcement" searchValue={search} onSearchChange={setSearch} />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <EmptyState icon={<Megaphone />} title="No announcements" description="Create announcements to display on your public pages." action={<button onClick={openCreate} style={{ padding: "10px 20px", backgroundColor: "#263B5E", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Create Announcement</button>} />
        ) : (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                  {["Title", "Type", "Placement", "CTA", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6B7280", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: a.backgroundColor, border: "1px solid #E5E7EB", flexShrink: 0 }} />
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1F2937", fontFamily: "'Nunito', sans-serif" }}>{a.title}</div>
                      </div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", marginLeft: "18px" }}>{a.message.slice(0, 60)}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{a.type}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{a.placement}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{a.ctaLabel || "—"}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={a.status} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => openEdit(a)} style={{ padding: "5px 8px", border: "1px solid #E5E7EB", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#6B7280" }}><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteId(a.id)} style={{ padding: "5px 8px", border: "1px solid #FEE2E2", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#EF4444" }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FormModal open={modalOpen} title={editItem ? "Edit Announcement" : "New Announcement"} onClose={() => setModalOpen(false)} size="lg">
        <FormField label="Title" required><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
        <FormField label="Message"><Textarea value={form.message || ""} onChange={(e) => setForm({ ...form, message: e.target.value })} /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="Type">
            <Select value={form.type || "info"} onChange={(e) => setForm({ ...form, type: e.target.value as Announcement["type"] })}>
              <option value="info">Info</option><option value="promo">Promo</option><option value="launch">Launch</option><option value="update">Update</option>
            </Select>
          </FormField>
          <FormField label="Placement">
            <Select value={form.placement || "home"} onChange={(e) => setForm({ ...form, placement: e.target.value as Announcement["placement"] })}>
              <option value="home">Home</option><option value="topbar">Top Bar</option><option value="dashboard">Dashboard</option><option value="all">All Pages</option>
            </Select>
          </FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="CTA Label"><Input value={form.ctaLabel || ""} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} placeholder="Learn More" /></FormField>
          <FormField label="CTA URL"><Input value={form.ctaUrl || ""} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} placeholder="/unlock" /></FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="Background Color"><Input type="color" value={form.backgroundColor || "#A9C8D8"} onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })} /></FormField>
          <FormField label="Status">
            <Select value={form.status || "draft"} onChange={(e) => setForm({ ...form, status: e.target.value as Announcement["status"] })}>
              <option value="draft">Draft</option><option value="active">Active</option><option value="scheduled">Scheduled</option><option value="expired">Expired</option>
            </Select>
          </FormField>
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button onClick={() => setModalOpen(false)} style={{ flex: 1, padding: "10px", border: "1px solid #E5E7EB", borderRadius: "8px", backgroundColor: "#FFFFFF", fontSize: "13px", fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", backgroundColor: "#263B5E", color: "#FFFFFF", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Save</button>
        </div>
      </FormModal>

      <ConfirmDeleteDialog open={!!deleteId} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
