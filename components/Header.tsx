"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, BookOpen, Sparkles } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/stories", label: "Stories" },
  { href: "/coloring", label: "Coloring" },
  { href: "/games", label: "Games" },
  { href: "/printables", label: "Printables" },
  { href: "/progress", label: "Progress" },
  { href: "/unlock", label: "Unlock" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header
        style={{
          backgroundColor: "#F8F1E7",
          borderBottom: "1px solid #EFE4D0",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 1rem",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: "#A9C8D8",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              📖
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 700,
                  fontSize: "18px",
                  color: "#263B5E",
                  lineHeight: 1,
                }}
              >
                Bible Coloring
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "13px",
                  color: "#C76F4A",
                  lineHeight: 1,
                  marginTop: "2px",
                }}
              >
                Journey
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }} className="hidden md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  fontFamily: "'Nunito', system-ui, sans-serif",
                  color: pathname === link.href ? "#263B5E" : "#7A4E2D",
                  backgroundColor: pathname === link.href ? "#A9C8D833" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link
              href="/free-adventure"
              style={{
                display: "none",
                padding: "8px 16px",
                backgroundColor: "#C76F4A",
                color: "#FFFFFF",
                borderRadius: "24px",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "'Nunito', system-ui, sans-serif",
                textDecoration: "none",
                transition: "background-color 0.15s ease",
              }}
              className="md:inline-flex items-center gap-1"
            >
              <Sparkles size={14} />
              Start Free
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                padding: "8px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#263B5E",
                borderRadius: "8px",
              }}
              className="md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div
            style={{
              backgroundColor: "#F8F1E7",
              borderTop: "1px solid #EFE4D0",
              padding: "12px 16px 16px",
            }}
            className="md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 500,
                  fontFamily: "'Nunito', system-ui, sans-serif",
                  color: pathname === link.href ? "#263B5E" : "#7A4E2D",
                  backgroundColor: pathname === link.href ? "#A9C8D833" : "transparent",
                  textDecoration: "none",
                  marginBottom: "2px",
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/free-adventure"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                marginTop: "8px",
                padding: "12px",
                backgroundColor: "#C76F4A",
                color: "#FFFFFF",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                fontFamily: "'Nunito', system-ui, sans-serif",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              ✨ Start Free Adventure
            </Link>
          </div>
        )}
      </header>

      {/* Sticky mobile CTA */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 40,
        }}
      >
        <Link
          href="/free-adventure"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "12px 24px",
            backgroundColor: "#C76F4A",
            color: "#FFFFFF",
            borderRadius: "32px",
            fontSize: "15px",
            fontWeight: 800,
            fontFamily: "'Nunito', system-ui, sans-serif",
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(199,111,74,0.4)",
          }}
        >
          <Sparkles size={16} />
          Start Free Adventure
        </Link>
      </div>
    </>
  );
}
