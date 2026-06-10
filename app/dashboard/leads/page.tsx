"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import ConfirmDeleteDialog from "@/components/dashboard/ConfirmDeleteDialog";
import { useLeads } from "@/hooks/useAdminData";
import { Trash2, UserCheck, Download } from "lucide-react";

export default function LeadsPage() {
  const { data, remove } = useLeads();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = data.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const header = "Name,Email,Source,Interested Book,Date\n";
    const rows = data.map((l) => `"${l.name}","${l.email}","${l.source}","${l.interestedBook}","${l.createdAt}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bcj-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const SOURCE_LABELS: Record<string, string> = {
    "waitlist": "Waitlist",
    "free-adventure": "Free Adventure",
    "lead-magnet": "Lead Magnet",
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader
        title={`Leads (${data.length})`}
        searchValue={search}
        onSearchChange={setSearch}
      />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        {data.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px", fontWeight: 600, fontFamily: "'Nunito', sans-serif", cursor: "pointer", color: "#1F2937" }}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        )}
        {filtered.length === 0 ? (
          <EmptyState icon={<UserCheck />} title="No leads yet" description="Leads collected from the waitlist and free adventure signup will appear here." />
        ) : (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                  {["Name", "Email", "Source", "Interested Book", "Date", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6B7280", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600, color: "#1F2937", fontFamily: "'Nunito', sans-serif" }}>{l.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{l.email}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{SOURCE_LABELS[l.source] || l.source}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>{l.interestedBook || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => setDeleteId(l.id)} style={{ padding: "5px 8px", border: "1px solid #FEE2E2", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#EF4444" }}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDeleteDialog open={!!deleteId} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
