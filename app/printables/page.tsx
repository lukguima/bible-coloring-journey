"use client";

import { printables } from "@/data/printables";
import PrintableCard from "@/components/PrintableCard";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function PrintablesPage() {
  const { trackEvent } = useAnalytics();

  const free = printables.filter((p) => p.status === "free");
  const premium = printables.filter((p) => p.status === "premium");

  const handleDownload = (id: string, url: string) => {
    trackEvent("printable_download_clicked", { id });
    if (url) window.open(url, "_blank");
    else alert("Download coming soon! File will be available shortly.");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7" }}>
      <div style={{ background: "linear-gradient(135deg, #8E967222, #A9C8D833)", padding: "48px 16px", textAlign: "center", borderBottom: "1px solid #EFE4D0" }}>
        <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          📄 Printables
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 6vw, 52px)", color: "#263B5E", marginBottom: "8px", fontWeight: 700 }}>
          Printable Activities & Resources
        </h1>
        <p style={{ fontSize: "16px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", maxWidth: "480px", margin: "0 auto" }}>
          Download, print, and bring the Bible stories to life at home, church, or school.
        </p>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 16px 80px" }}>
        {/* Free */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#263B5E", fontWeight: 700, margin: 0 }}>Free Printables</h2>
            <span style={{ padding: "3px 10px", backgroundColor: "#8E967222", color: "#8E9672", borderRadius: "20px", fontSize: "12px", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>✓ Free Download</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
            {free.map((p) => (
              <PrintableCard key={p.id} printable={p} onDownload={() => handleDownload(p.id, p.downloadUrl)} />
            ))}
          </div>
        </div>

        {/* Premium */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#263B5E", fontWeight: 700, margin: 0 }}>Premium Printables</h2>
            <span style={{ padding: "3px 10px", backgroundColor: "#D8B76A22", color: "#D8B76A", borderRadius: "20px", fontSize: "12px", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>🔒 Full Pack</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
            {premium.map((p) => (
              <PrintableCard key={p.id} printable={p} />
            ))}
          </div>

          <div style={{ background: "linear-gradient(135deg, #263B5E, #1a2940)", borderRadius: "24px", padding: "40px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🖨️</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#D8B76A", marginBottom: "8px" }}>
              Unlock All Printables
            </h3>
            <p style={{ fontSize: "15px", color: "#A9C8D8", fontFamily: "'Nunito', sans-serif", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>
              Get the full PDF collection — 35+ pages in US Letter and A4 format, verse cards, certificate, and more.
            </p>
            <a href="/unlock" style={{ display: "inline-block", padding: "14px 32px", backgroundColor: "#D8B76A", color: "#263B5E", borderRadius: "32px", fontSize: "16px", fontWeight: 800, fontFamily: "'Nunito', sans-serif", textDecoration: "none" }}>
              Get Full Genesis Pack — $9
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
