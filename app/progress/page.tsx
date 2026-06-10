"use client";

import { useProgress } from "@/hooks/useProgress";
import { badges } from "@/data/badges";
import BadgeCard from "@/components/BadgeCard";
import ProgressBar from "@/components/ProgressBar";
import Link from "next/link";
import { Award, BookOpen, Gamepad2, RotateCcw } from "lucide-react";

export default function ProgressPage() {
  const {
    completedStories,
    completedGames,
    earnedBadges,
    getOverallProgress,
    resetProgress,
    hasCertificate,
    isLoaded,
  } = useProgress();

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "24px" }}>Loading...</div>
      </div>
    );
  }

  const overall = getOverallProgress();
  const certificate = hasCertificate();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #263B5E11, #A9C8D833)", padding: "48px 16px", textAlign: "center", borderBottom: "1px solid #EFE4D0" }}>
        <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          🏅 My Journey
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 6vw, 52px)", color: "#263B5E", marginBottom: "8px", fontWeight: 700 }}>
          Your Bible Adventure
        </h1>
        <p style={{ fontSize: "15px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
          Keep exploring, coloring, and learning!
        </p>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 16px 80px" }}>
        {/* Avatar + Overall */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "28px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(122,78,45,0.08)", textAlign: "center" }}>
          <div style={{ fontSize: "72px", marginBottom: "12px" }}>🌟</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", color: "#263B5E", marginBottom: "16px" }}>
            Genesis Explorer
          </h2>
          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <ProgressBar value={overall} label="Overall Progress" color="#C76F4A" height={14} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {[
            { icon: <BookOpen size={24} color="#A9C8D8" />, value: completedStories.length, total: 12, label: "Stories", color: "#A9C8D8" },
            { icon: <Gamepad2 size={24} color="#C76F4A" />, value: completedGames.length, total: 5, label: "Games", color: "#C76F4A" },
            { icon: <Award size={24} color="#D8B76A" />, value: earnedBadges.length, total: 6, label: "Badges", color: "#D8B76A" },
          ].map((stat) => (
            <div key={stat.label} style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "20px", textAlign: "center", border: "1px solid #EFE4D0", boxShadow: "0 1px 4px rgba(122,78,45,0.06)" }}>
              <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}>{stat.icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 700, color: "#263B5E", lineHeight: 1 }}>
                {stat.value}<span style={{ fontSize: "16px", color: "#8E9672" }}>/{stat.total}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", fontWeight: 600, marginTop: "4px" }}>
                {stat.label}
              </div>
              <div style={{ marginTop: "8px" }}>
                <ProgressBar value={stat.value} max={stat.total} color={stat.color} height={6} />
              </div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#263B5E", marginBottom: "20px", fontWeight: 700 }}>
          My Badges
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} earned={earnedBadges.includes(badge.id)} />
          ))}
        </div>

        {/* Certificate */}
        {certificate ? (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "32px", textAlign: "center", border: "2px solid #D8B76A", boxShadow: "0 4px 20px rgba(216,183,106,0.2)", marginBottom: "24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏆</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", color: "#263B5E", marginBottom: "6px" }}>
              Certificate Unlocked!
            </h3>
            <p style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", marginBottom: "20px" }}>
              You completed 3 stories and 3 games! Download your certificate of completion.
            </p>
            <a href="/downloads/certificate.pdf" style={{ padding: "12px 28px", backgroundColor: "#D8B76A", color: "#263B5E", borderRadius: "24px", fontSize: "14px", fontWeight: 800, fontFamily: "'Nunito', sans-serif", textDecoration: "none" }}>
              Download Certificate 🎓
            </a>
          </div>
        ) : (
          <div style={{ backgroundColor: "#F8F1E7", borderRadius: "20px", padding: "24px", textAlign: "center", border: "2px dashed #EFE4D0", marginBottom: "24px" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px", opacity: 0.4 }}>🏆</div>
            <p style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
              Complete 3 stories and 3 games to unlock your Certificate of Completion!
            </p>
            <p style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", marginTop: "4px" }}>
              {completedStories.length < 3 && `${3 - completedStories.length} more ${completedStories.length === 2 ? "story" : "stories"} needed. `}
              {completedGames.length < 3 && `${3 - completedGames.length} more ${completedGames.length === 2 ? "game" : "games"} needed.`}
            </p>
          </div>
        )}

        {/* CTA Links */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "32px" }}>
          <Link href="/stories" style={{ padding: "14px", backgroundColor: "#263B5E", color: "#FFFFFF", borderRadius: "14px", textDecoration: "none", textAlign: "center", fontSize: "14px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <BookOpen size={15} /> Continue Stories
          </Link>
          <Link href="/games" style={{ padding: "14px", backgroundColor: "#C76F4A", color: "#FFFFFF", borderRadius: "14px", textDecoration: "none", textAlign: "center", fontSize: "14px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Gamepad2 size={15} /> Play Games
          </Link>
        </div>

        {/* Reset */}
        <div style={{ textAlign: "center" }}>
          <button onClick={() => { if (confirm("Reset all progress? This cannot be undone.")) resetProgress(); }} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", backgroundColor: "transparent", color: "#7A4E2D88", border: "1px solid #EFE4D0", borderRadius: "20px", fontSize: "12px", fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>
            <RotateCcw size={12} /> Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
}
