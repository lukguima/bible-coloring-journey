"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import ConfirmDeleteDialog from "@/components/dashboard/ConfirmDeleteDialog";
import FormModal from "@/components/dashboard/FormModal";
import { FormField, Input, Textarea, Select } from "@/components/dashboard/FormField";
import { useProducts } from "@/hooks/useAdminData";
import { Edit2, Trash2, Package } from "lucide-react";
import type { Product } from "@/types";

export default function ProductsPage() {
  const { data, create, update, remove } = useProducts();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});

  const filtered = data.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: "", slug: "", price: 0, status: "draft", accessLevel: "premium", productType: "ebook", currency: "USD", licenseType: "personal", collectionId: "genesis", includedItems: [], bonuses: [], tags: [] });
    setModalOpen(true);
  };
  const openEdit = (p: Product) => { setEditItem(p); setForm(p); setModalOpen(true); };

  const handleSave = () => {
    if (!form.title) return;
    if (editItem) {
      update(editItem.id, { ...form, updatedAt: new Date().toISOString() });
    } else {
      create({ ...form, id: `prod-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), shortDescription: form.shortDescription || "", description: form.description || "", subtitle: form.subtitle || "", coverImage: "", mockupImage: "", targetAudience: "", ageRange: "4–9", format: "Digital", releaseDate: new Date().toISOString(), checkoutUrl: form.checkoutUrl || "", includedItems: [], bonuses: [], tags: [] } as Product);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader title="Products" onNew={openCreate} newLabel="Product" searchValue={search} onSearchChange={setSearch} />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <EmptyState icon={<Package />} title="No products" description="Create your first product to configure pricing and checkout." action={<button onClick={openCreate} style={{ padding: "10px 20px", backgroundColor: "#263B5E", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Create Product</button>} />
        ) : (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                  {["Product", "Price", "Type", "Access", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6B7280", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#1F2937", fontFamily: "'Nunito', sans-serif" }}>{p.title}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>{p.shortDescription}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#1F2937", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>${p.price}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{p.productType}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={p.accessLevel} /></td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={p.status} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => openEdit(p)} style={{ padding: "5px 8px", border: "1px solid #E5E7EB", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#6B7280" }}><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteId(p.id)} style={{ padding: "5px 8px", border: "1px solid #FEE2E2", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#EF4444" }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FormModal open={modalOpen} title={editItem ? "Edit Product" : "New Product"} onClose={() => setModalOpen(false)} size="lg">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="Title" required><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Slug"><Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></FormField>
        </div>
        <FormField label="Short Description"><Input value={form.shortDescription || ""} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></FormField>
        <FormField label="Description"><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <FormField label="Price ($)"><Input type="number" value={form.price || 0} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} /></FormField>
          <FormField label="Status"><Select value={form.status || "draft"} onChange={(e) => setForm({ ...form, status: e.target.value as Product["status"] })}><option value="draft">Draft</option><option value="active">Active</option><option value="hidden">Hidden</option><option value="archived">Archived</option></Select></FormField>
          <FormField label="Access Level"><Select value={form.accessLevel || "premium"} onChange={(e) => setForm({ ...form, accessLevel: e.target.value as "free" | "premium" })}><option value="free">Free</option><option value="premium">Premium</option></Select></FormField>
        </div>
        <FormField label="Checkout URL" hint="Hotmart, Stripe, or custom payment link"><Input value={form.checkoutUrl || ""} onChange={(e) => setForm({ ...form, checkoutUrl: e.target.value })} placeholder="https://..." /></FormField>
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button onClick={() => setModalOpen(false)} style={{ flex: 1, padding: "10px", border: "1px solid #E5E7EB", borderRadius: "8px", backgroundColor: "#FFFFFF", fontSize: "13px", fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", backgroundColor: "#263B5E", color: "#FFFFFF", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>Save</button>
        </div>
      </FormModal>

      <ConfirmDeleteDialog open={!!deleteId} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
