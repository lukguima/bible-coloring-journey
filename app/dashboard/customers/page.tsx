"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import ConfirmDeleteDialog from "@/components/dashboard/ConfirmDeleteDialog";
import FormModal from "@/components/dashboard/FormModal";
import { FormField, Input, Textarea, Select } from "@/components/dashboard/FormField";
import { useCustomerInfo } from "@/hooks/useAdminData";
import { Edit2, Trash2, Users } from "lucide-react";
import type { CustomerInfo } from "@/types";

export default function CustomersPage() {
  const { data, create, update, remove } = useCustomerInfo();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CustomerInfo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<CustomerInfo>>({});

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: "", content: "", placement: "home", status: "active" });
    setModalOpen(true);
  };
  const openEdit = (c: CustomerInfo) => { setEditItem(c); setForm(c); setModalOpen(true); };

  const handleSave = () => {
    if (!form.title) return;
    if (editItem) {
      update(editItem.id, { ...form, updatedAt: new Date().toISOString() });
    } else {
      create({ ...form, id: `info-${Date.now()}`, updatedAt: new Date().toISOString() } as CustomerInfo);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader title="Customers Info" onNew={openCreate} newLabel="Info Block" />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        <p style={{ fontSize: "13px", color: "#6B7280", fontFamily: "'Nunito', sans-serif", marginBottom: "20px" }}>
          Customer-facing information blocks displayed on specific pages of the public site.
        </p>
        {data.length === 0 ? (
          <EmptyState icon={<Users />} title="No info blocks" description="Add customer-facing info blocks for your public pages." action={<button onClick={openCreate} style={{ padding: "10px 20px", backgroundColor: "#263B5E", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Add Info Block</button>} />
        ) : (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                  {["Title", "Placement", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6B7280", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#1F2937", fontFamily: "'Nunito', sans-serif" }}>{c.title}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>{c.content.slice(0, 80)}...</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{c.placement}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => openEdit(c)} style={{ padding: "5px 8px", border: "1px solid #E5E7EB", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#6B7280" }}><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteId(c.id)} style={{ padding: "5px 8px", border: "1px solid #FEE2E2", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#EF4444" }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FormModal open={modalOpen} title={editItem ? "Edit Info Block" : "New Info Block"} onClose={() => setModalOpen(false)}>
        <FormField label="Title" required><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
        <FormField label="Content"><Textarea value={form.content || ""} onChange={(e) => setForm({ ...form, content: e.target.value })} /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="Placement">
            <Select value={form.placement || "home"} onChange={(e) => setForm({ ...form, placement: e.target.value as CustomerInfo["placement"] })}>
              <option value="home">Home</option>
              <option value="unlock">Unlock</option>
              <option value="printables">Printables</option>
              <option value="guide">Guide</option>
              <option value="global">Global</option>
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status || "active"} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
