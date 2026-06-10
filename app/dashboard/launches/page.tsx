"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import ConfirmDeleteDialog from "@/components/dashboard/ConfirmDeleteDialog";
import FormModal from "@/components/dashboard/FormModal";
import { FormField, Input, Textarea, Select } from "@/components/dashboard/FormField";
import { useLaunches } from "@/hooks/useAdminData";
import { Edit2, Trash2, Rocket } from "lucide-react";
import type { Launch } from "@/types";

export default function LaunchesPage() {
  const { data, create, update, remove } = useLaunches();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Launch | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Launch>>({});

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: "", slug: "", description: "", status: "planning", waitlistEnabled: true, ctaLabel: "Join Waitlist", ctaUrl: "/waitlist", launchDate: "", preLaunchStartDate: "", offerDetails: "", emailSequenceNotes: "" });
    setModalOpen(true);
  };
  const openEdit = (l: Launch) => { setEditItem(l); setForm(l); setModalOpen(true); };

  const handleSave = () => {
    if (!form.title) return;
    if (editItem) {
      update(editItem.id, { ...form, updatedAt: new Date().toISOString() });
    } else {
      create({ ...form, id: `launch-${Date.now()}`, productId: "", bannerImage: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Launch);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader title="Launches" onNew={openCreate} newLabel="Launch" />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        {data.length === 0 ? (
          <EmptyState icon={<Rocket />} title="No launches" description="Plan your next book launch with a waitlist and email sequence." action={<button onClick={openCreate} style={{ padding: "10px 20px", backgroundColor: "#263B5E", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Create Launch</button>} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {data.map((l) => (
              <div key={l.id} style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif", marginBottom: "4px" }}>{l.title}</div>
                    <StatusBadge status={l.status} />
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => openEdit(l)} style={{ padding: "5px 8px", border: "1px solid #E5E7EB", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#6B7280" }}><Edit2 size={13} /></button>
                    <button onClick={() => setDeleteId(l.id)} style={{ padding: "5px 8px", border: "1px solid #FEE2E2", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#EF4444" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <p style={{ fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif", lineHeight: 1.5, marginBottom: "12px" }}>{l.description}</p>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>
                    {l.launchDate && <div>🚀 Launch: {new Date(l.launchDate).toLocaleDateString()}</div>}
                    {l.waitlistEnabled && <div style={{ marginTop: "2px" }}>📬 Waitlist enabled</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FormModal open={modalOpen} title={editItem ? "Edit Launch" : "New Launch"} onClose={() => setModalOpen(false)} size="lg">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="Title" required><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Slug"><Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></FormField>
        </div>
        <FormField label="Description"><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="Launch Date"><Input type="date" value={form.launchDate?.split("T")[0] || ""} onChange={(e) => setForm({ ...form, launchDate: e.target.value })} /></FormField>
          <FormField label="Pre-Launch Start"><Input type="date" value={form.preLaunchStartDate?.split("T")[0] || ""} onChange={(e) => setForm({ ...form, preLaunchStartDate: e.target.value })} /></FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="Status">
            <Select value={form.status || "planning"} onChange={(e) => setForm({ ...form, status: e.target.value as Launch["status"] })}>
              <option value="planning">Planning</option><option value="prelaunch">Pre-Launch</option><option value="live">Live</option><option value="closed">Closed</option>
            </Select>
          </FormField>
          <FormField label="CTA Label"><Input value={form.ctaLabel || ""} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} /></FormField>
        </div>
        <FormField label="CTA URL"><Input value={form.ctaUrl || ""} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} /></FormField>
        <FormField label="Offer Details"><Textarea value={form.offerDetails || ""} onChange={(e) => setForm({ ...form, offerDetails: e.target.value })} /></FormField>
        <FormField label="Email Sequence Notes"><Textarea value={form.emailSequenceNotes || ""} onChange={(e) => setForm({ ...form, emailSequenceNotes: e.target.value })} /></FormField>
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button onClick={() => setModalOpen(false)} style={{ flex: 1, padding: "10px", border: "1px solid #E5E7EB", borderRadius: "8px", backgroundColor: "#FFFFFF", fontSize: "13px", fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", backgroundColor: "#263B5E", color: "#FFFFFF", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Save</button>
        </div>
      </FormModal>

      <ConfirmDeleteDialog open={!!deleteId} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
