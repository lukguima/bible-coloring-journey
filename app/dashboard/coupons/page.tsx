"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import ConfirmDeleteDialog from "@/components/dashboard/ConfirmDeleteDialog";
import FormModal from "@/components/dashboard/FormModal";
import { FormField, Input, Select } from "@/components/dashboard/FormField";
import { useCoupons } from "@/hooks/useAdminData";
import { Edit2, Trash2, Tag } from "lucide-react";
import type { Coupon } from "@/types";

export default function CouponsPage() {
  const { data, create, update, remove } = useCoupons();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Coupon>>({});

  const filtered = data.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditItem(null);
    setForm({ code: "", description: "", discountType: "percentage", discountValue: 10, maxUses: 100, currentUses: 0, status: "active", productIds: [], startDate: "", endDate: "" });
    setModalOpen(true);
  };
  const openEdit = (c: Coupon) => { setEditItem(c); setForm(c); setModalOpen(true); };

  const handleSave = () => {
    if (!form.code) return;
    if (editItem) {
      update(editItem.id, { ...form, updatedAt: new Date().toISOString() });
    } else {
      create({ ...form, id: `cpn-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Coupon);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader title="Coupons" onNew={openCreate} newLabel="Coupon" searchValue={search} onSearchChange={setSearch} />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <EmptyState icon={<Tag />} title="No coupons" description="Create discount coupons for your products." action={<button onClick={openCreate} style={{ padding: "10px 20px", backgroundColor: "#263B5E", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Create Coupon</button>} />
        ) : (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                  {["Code", "Discount", "Uses", "Expires", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6B7280", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937", fontFamily: "monospace", backgroundColor: "#F3F4F6", display: "inline-block", padding: "2px 8px", borderRadius: "4px" }}>{c.code}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", marginTop: "2px" }}>{c.description}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600, color: "#263B5E", fontFamily: "'Nunito', sans-serif" }}>
                      {c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue}`}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>
                      {c.currentUses}/{c.maxUses}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>
                      {c.endDate ? new Date(c.endDate).toLocaleDateString() : "—"}
                    </td>
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

      <FormModal open={modalOpen} title={editItem ? "Edit Coupon" : "New Coupon"} onClose={() => setModalOpen(false)}>
        <FormField label="Code" required hint="Uppercase, no spaces"><Input value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, "") })} placeholder="WELCOME10" /></FormField>
        <FormField label="Description"><Input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="Discount Type">
            <Select value={form.discountType || "percentage"} onChange={(e) => setForm({ ...form, discountType: e.target.value as "percentage" | "fixed" })}>
              <option value="percentage">Percentage (%)</option><option value="fixed">Fixed ($)</option>
            </Select>
          </FormField>
          <FormField label="Discount Value"><Input type="number" value={form.discountValue || 0} onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) })} /></FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="Max Uses"><Input type="number" value={form.maxUses || 100} onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) })} /></FormField>
          <FormField label="Status">
            <Select value={form.status || "active"} onChange={(e) => setForm({ ...form, status: e.target.value as Coupon["status"] })}>
              <option value="active">Active</option><option value="inactive">Inactive</option><option value="expired">Expired</option>
            </Select>
          </FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="Start Date"><Input type="date" value={form.startDate?.split("T")[0] || ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></FormField>
          <FormField label="End Date"><Input type="date" value={form.endDate?.split("T")[0] || ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></FormField>
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
