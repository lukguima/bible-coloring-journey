"use client";

import { stories } from "@/data/stories";
import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";

const FREE_STORIES = stories.filter((s) => s.status === "free");

export default function FreeAdventurePage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7" }}>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #A9C8D844 0%, #D8B76A22 100%)",
          padding: "48px 16px",
          textAlign: "center",
          borderBottom: "1px solid #EFE4D0",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#C76F4A",
            color: "#FFFFFF",
            padding: "4px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "'Nunito', sans-serif",
            marginBottom: "16px",
          }}
        >
          <Sparkles size={12} />
          FREE ADVENTURE
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 6vw, 52px)", color: "#263B5E", marginBottom: "12px", fontWeight: 700 }}>
          Start Your Free Bible Adventure
        </h1>
        <p style={{ fontSize: "16px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", maxWidth: "520px", margin: "0 auto 24px" }}>
          Explore 3 Genesis stories, play a Bible game, and color a beautiful scene — completely free!
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
          {["3 Bible Stories", "1 Bible Game", "1 Coloring Page", "1 Verse Card", "1 Badge"].map((item) => (
            <span key={item} style={{ padding: "6px 14px", backgroundColor: "#FFFFFF", color: "#263B5E", borderRadius: "20px", fontSize: "13px", fontWeight: 600, fontFamily: "'Nunito', sans-serif", border: "1px solid #EFE4D0" }}>
              ✓ {item}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 16px 80px" }}>
        {/* Free Stories */}
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", color: "#263B5E", marginBottom: "24px", fontWeight: 700, textAlign: "center" }}>
          Your 3 Free Stories
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "48px" }}>
          {FREE_STORIES.map((story, i) => (
            <div key={story.id} style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", overflow: "hidden", border: "1px solid #EFE4D0", boxShadow: "0 2px 12px rgba(122,78,45,0.06)" }}>
              <div style={{ display: "flex", gap: "0" }}>
                {/* Emoji panel */}
                <div style={{ width: "120px", minWidth: "120px", background: `linear-gradient(135deg, #A9C8D8${i === 0 ? "44" : i === 1 ? "33" : "55"}, #EFE4D0)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "52px" }}>
                  {story.emoji}
                </div>
                {/* Content */}
                <div style={{ padding: "20px", flex: 1 }}>
                  <div style={{ fontSize: "11px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                    Story {i + 1} · {story.reference}
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", color: "#263B5E", marginBottom: "6px", fontWeight: 700 }}>
                    {story.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", lineHeight: 1.5, marginBottom: "12px" }}>
                    {story.shortDescription}
                  </p>
                  <div style={{ padding: "8px 12px", backgroundColor: "#F8F1E7", borderRadius: "10px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>Lesson: </span>
                    <span style={{ fontSize: "12px", color: "#263B5E", fontFamily: "'Nunito', sans-serif" }}>{story.lesson}</span>
                  </div>
                  <Link
                    href={`/stories/${story.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 20px",
                      backgroundColor: "#263B5E",
                      color: "#FFFFFF",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: 700,
                      fontFamily: "'Nunito', sans-serif",
                      textDecoration: "none",
                    }}
                  >
                    <BookOpen size={13} />
                    Start Story
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Free activities */}
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", color: "#263B5E", marginBottom: "24px", fontWeight: 700, textAlign: "center" }}>
          Free Activities
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "48px" }}>
          {[
            { href: "/games/rainbow-quiz", emoji: "🌈", title: "Rainbow Quiz", desc: "Test your Noah knowledge", badge: "Promise Keeper" },
            { href: "/coloring", emoji: "🎨", title: "Coloring Studio", desc: "Color creation, Noah's ark & rainbow", badge: null },
            { href: "/printables", emoji: "📄", title: "Free Printables", desc: "3 coloring pages + verse card", badge: null },
            { href: "/progress", emoji: "🏅", title: "Track Progress", desc: "Earn badges and see your journey", badge: null },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "20px", border: "1px solid #EFE4D0", textAlign: "center", transition: "transform 0.2s ease", cursor: "pointer" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.transform = "translateY(0)")}
              >
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>{item.emoji}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "#263B5E", marginBottom: "4px" }}>{item.title}</h3>
                <p style={{ fontSize: "12px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>{item.desc}</p>
                {item.badge && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#D8B76A", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                    🏅 Earn: {item.badge}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Upgrade CTA */}
        <div
          style={{
            background: "linear-gradient(135deg, #263B5E, #1a2940)",
            borderRadius: "24px",
            padding: "40px 32px",
            textAlign: "center",
            color: "#FFFFFF",
          }}
        >
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📚</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", color: "#D8B76A", marginBottom: "8px" }}>
            Ready for the Full Adventure?
          </h2>
          <p style={{ fontSize: "15px", color: "#A9C8D8", fontFamily: "'Nunito', sans-serif", marginBottom: "8px" }}>
            Unlock all 12 Genesis stories, games, printables, and more for just $9.
          </p>
          <p style={{ fontSize: "13px", color: "#A9C8D8aa", fontFamily: "'Nunito', sans-serif", marginBottom: "24px" }}>
            Perfect for homeschool, Sunday school, and family devotions.
          </p>
          <Link
            href="/unlock"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              backgroundColor: "#D8B76A",
              color: "#263B5E",
              borderRadius: "32px",
              fontSize: "16px",
              fontWeight: 800,
              fontFamily: "'Nunito', sans-serif",
              textDecoration: "none",
            }}
          >
            Get Full Genesis Pack — $9
          </Link>
        </div>
      </div>
    </div>
  );
}
