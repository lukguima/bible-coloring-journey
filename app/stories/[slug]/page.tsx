"use client";

import { stories } from "@/data/stories";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { ArrowLeft, CheckCircle, Palette, Gamepad2, Download, BookOpen } from "lucide-react";
import Confetti from "@/components/Confetti";
import { useState } from "react";

export default function StoryDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const story = stories.find((s) => s.slug === slug);
  const { completeStory, isStoryCompleted } = useProgress();
  const [showConfetti, setShowConfetti] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  if (!story) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📖</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#263B5E" }}>Story not found</h2>
          <Link href="/stories" style={{ color: "#C76F4A", fontFamily: "'Nunito', sans-serif" }}>← Back to Stories</Link>
        </div>
      </div>
    );
  }

  const isPremium = story.status === "premium";
  const isCompleted = isStoryCompleted(story.id);

  const handleComplete = () => {
    if (!isCompleted) {
      completeStory(story.id);
      setShowConfetti(true);
      setJustCompleted(true);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7" }}>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px 80px" }}>
        <Link href="/stories" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#263B5E", textDecoration: "none", fontSize: "14px", fontFamily: "'Nunito', sans-serif", fontWeight: 600, marginBottom: "24px" }}>
          <ArrowLeft size={16} /> Back to Stories
        </Link>

        {isPremium ? (
          /* Premium locked view */
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", overflow: "hidden", boxShadow: "0 4px 20px rgba(122,78,45,0.08)" }}>
            <div
              style={{
                height: "160px",
                background: "linear-gradient(135deg, #263B5E, #1a2940)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "72px",
              }}
            >
              {story.emoji}
            </div>
            <div style={{ padding: "32px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔒</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#263B5E", marginBottom: "8px" }}>
                {story.title}
              </h1>
              <p style={{ fontSize: "14px", color: "#C76F4A", fontFamily: "'Nunito', sans-serif", fontWeight: 600, marginBottom: "16px" }}>
                {story.reference}
              </p>
              <p style={{ fontSize: "15px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", lineHeight: 1.6, marginBottom: "24px" }}>
                {story.shortDescription}
              </p>
              <Link
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
                Unlock Full Genesis Pack — $9
              </Link>
            </div>
          </div>
        ) : (
          /* Free story view */
          <>
            {/* Hero */}
            <div
              style={{
                height: "160px",
                background: "linear-gradient(135deg, #A9C8D844, #D8B76A22)",
                borderRadius: "24px 24px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "80px",
                marginBottom: "0",
              }}
            >
              {story.emoji}
            </div>

            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "0 0 24px 24px", padding: "32px", marginBottom: "20px", boxShadow: "0 4px 20px rgba(122,78,45,0.08)" }}>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Genesis Story
                </span>
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 40px)", color: "#263B5E", marginBottom: "6px", fontWeight: 700 }}>
                {story.title}
              </h1>
              <p style={{ fontSize: "14px", color: "#C76F4A", fontFamily: "'Nunito', sans-serif", fontWeight: 700, marginBottom: "24px" }}>
                📖 {story.reference}
              </p>

              {/* Story text */}
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#F8F1E7",
                  borderRadius: "16px",
                  borderLeft: "4px solid #A9C8D8",
                  marginBottom: "24px",
                }}
              >
                <p style={{ fontSize: "16px", color: "#263B5E", fontFamily: "'Nunito', sans-serif", lineHeight: 1.8, margin: 0 }}>
                  {story.storyText}
                </p>
              </div>

              {/* Lesson */}
              <div
                style={{
                  padding: "16px 20px",
                  backgroundColor: "#8E967222",
                  borderRadius: "14px",
                  marginBottom: "16px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "20px", flexShrink: 0 }}>💡</span>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#8E9672", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px", fontFamily: "'Nunito', sans-serif" }}>
                    What We Learn
                  </div>
                  <p style={{ fontSize: "15px", color: "#263B5E", fontFamily: "'Nunito', sans-serif", fontWeight: 600, margin: 0 }}>
                    {story.lesson}
                  </p>
                </div>
              </div>

              {/* Reflection */}
              <div
                style={{
                  padding: "16px 20px",
                  backgroundColor: "#C76F4A11",
                  borderRadius: "14px",
                  marginBottom: "28px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "20px", flexShrink: 0 }}>🤔</span>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#C76F4A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px", fontFamily: "'Nunito', sans-serif" }}>
                    Talk Together
                  </div>
                  <p style={{ fontSize: "15px", color: "#263B5E", fontFamily: "'Nunito', sans-serif", fontWeight: 600, margin: 0 }}>
                    {story.reflectionQuestion}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <Link href="/coloring" style={{ padding: "12px", backgroundColor: "#A9C8D8", color: "#263B5E", borderRadius: "14px", textDecoration: "none", textAlign: "center", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Palette size={14} /> Color This Page
                </Link>
                {story.gameId && (
                  <Link href={`/games/${story.gameId}`} style={{ padding: "12px", backgroundColor: "#D8B76A22", color: "#263B5E", border: "2px solid #D8B76A", borderRadius: "14px", textDecoration: "none", textAlign: "center", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <Gamepad2 size={14} /> Play a Game
                  </Link>
                )}
                <Link href="/printables" style={{ padding: "12px", backgroundColor: "#8E967222", color: "#8E9672", border: "2px solid #8E9672", borderRadius: "14px", textDecoration: "none", textAlign: "center", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Download size={14} /> Printables
                </Link>
              </div>

              {/* Complete button */}
              {(isCompleted || justCompleted) ? (
                <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#8E967222", borderRadius: "14px", border: "2px solid #8E9672" }}>
                  <CheckCircle size={24} color="#8E9672" style={{ marginBottom: "6px" }} />
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#8E9672", fontFamily: "'Nunito', sans-serif", margin: 0 }}>
                    Story Completed! 🎉
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleComplete}
                  style={{
                    width: "100%",
                    padding: "14px",
                    backgroundColor: "#263B5E",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "14px",
                    fontSize: "15px",
                    fontWeight: 800,
                    fontFamily: "'Nunito', sans-serif",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircle size={16} />
                  Mark as Complete
                </button>
              )}
            </div>

            {/* Next story */}
            <div style={{ textAlign: "center" }}>
              <Link href="/stories" style={{ color: "#C76F4A", fontSize: "14px", fontFamily: "'Nunito', sans-serif", fontWeight: 600, textDecoration: "none" }}>
                ← Explore more Bible stories
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
