"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useCollections } from "@/hooks/useAdminData";
import { useProducts } from "@/hooks/useAdminData";
import { useLeads } from "@/hooks/useAdminData";
import { useAnalytics } from "@/hooks/useAnalytics";
import { stories } from "@/data/stories";
import { games } from "@/data/games";
import { printables } from "@/data/printables";
import { Library, Package, Users, BarChart3, BookOpen, Gamepad2, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: collections } = useCollections();
  const { data: products } = useProducts();
  const { data: leads } = useLeads();
  const { getMetrics } = useAnalytics();
  const metrics = getMetrics();

  const quickLinks = [
    { href: "/dashboard/collections", label: "Collections", icon: <Library size={16} />, count: collections.length },
    { href: "/dashboard/products", label: "Products", icon: <Package size={16} />, count: products.length },
    { href: "/dashboard/stories", label: "Stories", icon: <BookOpen size={16} />, count: stories.length },
    { href: "/dashboard/games", label: "Games", icon: <Gamepad2 size={16} />, count: games.length },
    { href: "/dashboard/printables", label: "Printables", icon: <FileText size={16} />, count: printables.length },
    { href: "/dashboard/leads", label: "Leads", icon: <Users size={16} />, count: leads.length },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader title="Overview" />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          <MetricCard label="Total Leads" value={leads.length} icon={<Users size={16} color="#263B5E" />} color="#263B5E" subtext="from waitlist + free" />
          <MetricCard label="Story Completions" value={metrics.storiesCompleted} icon={<BookOpen size={16} color="#C76F4A" />} color="#C76F4A" />
          <MetricCard label="Game Completions" value={metrics.gamesCompleted} icon={<Gamepad2 size={16} color="#8E9672" />} color="#8E9672" />
          <MetricCard label="Unlock Clicks" value={metrics.unlockClicks} icon={<TrendingUp size={16} color="#D8B76A" />} color="#D8B76A" />
          <MetricCard label="Printable Downloads" value={metrics.printableDownloads} icon={<FileText size={16} color="#A9C8D8" />} color="#A9C8D8" />
          <MetricCard label="Waitlist Signups" value={metrics.waitlistSubmissions} icon={<Users size={16} color="#C76F4A" />} color="#C76F4A" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
          {/* Quick Nav */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif", margin: 0 }}>Content Areas</h2>
            </div>
            <div style={{ padding: "8px" }}>
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "8px", textDecoration: "none", color: "#1F2937", fontFamily: "'Nunito', sans-serif", fontSize: "13px", fontWeight: 500 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6B7280" }}>
                    {link.icon} <span style={{ color: "#1F2937" }}>{link.label}</span>
                  </span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>{link.count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Products overview */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif", margin: 0 }}>Products</h2>
              <Link href="/dashboard/products" style={{ fontSize: "12px", color: "#263B5E", textDecoration: "none", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>View all →</Link>
            </div>
            <div style={{ padding: "8px" }}>
              {products.slice(0, 5).map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "8px" }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "#1F2937", fontFamily: "'Nunito', sans-serif", fontWeight: 500 }}>{p.title}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>${p.price} · {p.licenseType}</div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", padding: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif", marginBottom: "16px" }}>Quick Links</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {[
              { href: "/dashboard/settings", label: "Configure Checkout URL", color: "#263B5E" },
              { href: "/dashboard/announcements", label: "Manage Announcements", color: "#C76F4A" },
              { href: "/dashboard/leads", label: "View Leads", color: "#8E9672" },
              { href: "/dashboard/analytics", label: "Analytics", color: "#D8B76A" },
              { href: "/", label: "View Public Site ↗", color: "#6B7280" },
            ].map((action) => (
              <Link key={action.href} href={action.href} style={{ padding: "8px 16px", backgroundColor: action.color + "18", color: action.color, borderRadius: "8px", fontSize: "13px", fontWeight: 600, fontFamily: "'Nunito', sans-serif", textDecoration: "none" }}>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
