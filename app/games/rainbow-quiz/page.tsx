"use client";

import RainbowQuizGame from "@/components/games/RainbowQuizGame";
import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RainbowQuizPage() {
  const { completeGame, isGameCompleted } = useProgress();
  const completed = isGameCompleted("rainbow-quiz");

  const handleComplete = () => {
    completeGame("rainbow-quiz", "promise-keeper");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 16px 80px" }}>
        <Link href="/games" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#263B5E", textDecoration: "none", fontSize: "14px", fontFamily: "'Nunito', sans-serif", fontWeight: 600, marginBottom: "24px" }}>
          <ArrowLeft size={16} /> Back to Games
        </Link>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            🌈 Bible Game
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "36px", color: "#263B5E", marginBottom: "8px", fontWeight: 700 }}>
            Rainbow Promise Quiz
          </h1>
          <p style={{ fontSize: "15px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
            Answer questions about Noah and God's rainbow promise!
          </p>
        </div>

        {completed && (
          <div style={{
            backgroundColor: "#8E967222",
            border: "2px solid #8E9672",
            borderRadius: "14px",
            padding: "12px 16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{ fontSize: "20px" }}>🌈</span>
            <span style={{ fontSize: "13px", color: "#263B5E", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
              You already earned the Promise Keeper badge! Try again for a perfect score!
            </span>
          </div>
        )}

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "24px", boxShadow: "0 4px 20px rgba(122,78,45,0.08)" }}>
          <RainbowQuizGame onComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
}
