"use client";

import { stories } from "@/data/stories";
import StoryCard from "@/components/StoryCard";
import SectionHeading from "@/components/SectionHeading";
import { useProgress } from "@/hooks/useProgress";

export default function StoriesPage() {
  const { isStoryCompleted } = useProgress();

  const freeStories = stories.filter((s) => s.status === "free");
  const premiumStories = stories.filter((s) => s.status === "premium");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7" }}>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #A9C8D833 0%, #EFE4D0 100%)",
          padding: "48px 16px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          📖 Bible Stories
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 6vw, 52px)", color: "#263B5E", marginBottom: "12px", fontWeight: 700 }}>
          Genesis Story Library
        </h1>
        <p style={{ fontSize: "16px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", maxWidth: "500px", margin: "0 auto" }}>
          Explore the wonderful stories of Genesis — from creation to Joseph's forgiveness.
        </p>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 16px 80px" }}>
        {/* Free Stories */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#263B5E", fontWeight: 700, margin: 0 }}>
              Free Stories
            </h2>
            <span style={{
              padding: "3px 10px",
              backgroundColor: "#8E967222",
              color: "#8E9672",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
            }}>
              ✓ Free Access
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {freeStories.map((story) => (
              <StoryCard key={story.id} story={story} completed={isStoryCompleted(story.id)} />
            ))}
          </div>
        </div>

        {/* Premium Stories */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#263B5E", fontWeight: 700, margin: 0 }}>
              Full Genesis Collection
            </h2>
            <span style={{
              padding: "3px 10px",
              backgroundColor: "#D8B76A22",
              color: "#D8B76A",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
            }}>
              🔒 Premium
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
            {premiumStories.map((story) => (
              <StoryCard key={story.id} story={story} completed={isStoryCompleted(story.id)} />
            ))}
          </div>

          {/* Unlock CTA */}
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
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#D8B76A", marginBottom: "8px" }}>
              Unlock All 12 Genesis Stories
            </h3>
            <p style={{ fontSize: "15px", color: "#A9C8D8", fontFamily: "'Nunito', sans-serif", marginBottom: "24px", maxWidth: "420px", margin: "0 auto 24px" }}>
              Get the full interactive experience with all stories, coloring pages, games, and printables.
            </p>
            <a
              href="/unlock"
              style={{
                display: "inline-block",
                padding: "14px 32px",
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
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
