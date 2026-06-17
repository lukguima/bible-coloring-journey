"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Library, Package, Palette, BookOpen,
  Gamepad2, FileText, Users, Megaphone, Rocket,
  Tag, UserCheck, Image, BarChart3, Settings, ExternalLink, X, Brush, Sparkles, ImagePlay
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/content-engine", label: "Content Engine", icon: Sparkles },
  { href: "/dashboard/image-queue", label: "Image Queue", icon: ImagePlay },
  { href: "/dashboard/collections", label: "Collections", icon: Library },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/drawings", label: "Drawings", icon: Palette },
  { href: "/dashboard/coloring", label: "Coloring Pages", icon: Brush },
  { href: "/dashboard/stories", label: "Stories", icon: BookOpen },
  { href: "/dashboard/games", label: "Games", icon: Gamepad2 },
  { href: "/dashboard/printables", label: "Printables", icon: FileText },
  { href: "/dashboard/customers", label: "Customers Info", icon: Users },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/launches", label: "Launches", icon: Rocket },
  { href: "/dashboard/coupons", label: "Coupons", icon: Tag },
  { href: "/dashboard/leads", label: "Leads", icon: UserCheck },
  { href: "/dashboard/media", label: "Media", icon: Image },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ open = true, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  const content = (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        backgroundColor: "#263B5E",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #FFFFFF1A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#D8B76A", lineHeight: 1 }}>
            Bible Coloring
          </div>
          <div style={{ fontSize: "11px", color: "#A9C8D8", fontFamily: "'Nunito', sans-serif", marginTop: "2px" }}>
            Admin Dashboard
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#A9C8D8", padding: "4px" }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "10px",
                marginBottom: "2px",
                textDecoration: "none",
                backgroundColor: isActive ? "#FFFFFF18" : "transparent",
                color: isActive ? "#FFFFFF" : "#A9C8D8",
                fontSize: "13px",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: isActive ? 700 : 400,
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* View site */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #FFFFFF1A" }}>
        <Link
          href="/"
          target="_blank"
          style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#A9C8D8", textDecoration: "none", fontFamily: "'Nunito', sans-serif" }}
        >
          <ExternalLink size={13} />
          View Public Site
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex">{content}</div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden" style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose} />
          <div style={{ position: "relative", zIndex: 1 }}>{content}</div>
        </div>
      )}
    </>
  );
}
