"use client";

import CreationOrderGame from "@/components/games/CreationOrderGame";
import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreationOrderPage() {
  const { completeGame, isGameCompleted } = useProgress();
  const completed = isGameCompleted("creation-order");

  const handleComplete = () => {
    completeGame("creation-order", "creation-explorer");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 16px 80px" }}>
        <Link href="/games" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#263B5E", textDecoration: "none", fontSize: "14px", fontFamily: "'Nunito', sans-serif", fontWeight: 600, marginBottom: "24px" }}>
          <ArrowLeft size={16} /> Back to Games
        </Link>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            🌍 Bible Game
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "36px", color: "#263B5E", marginBottom: "8px", fontWeight: 700 }}>
            Creation Order
          </h1>
          <p style={{ fontSize: "15px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
            Put the seven days of creation in the right order!
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
            <span style={{ fontSize: "20px" }}>🌍</span>
            <span style={{ fontSize: "13px", color: "#263B5E", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
              You already earned the Creation Explorer badge! Play again for fun.
            </span>
          </div>
        )}

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "24px", boxShadow: "0 4px 20px rgba(122,78,45,0.08)" }}>
          <CreationOrderGame onComplete={handleComplete} />
        </div>

        <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#A9C8D822", borderRadius: "16px" }}>
          <p style={{ fontSize: "13px", color: "#263B5E", fontFamily: "'Nunito', sans-serif", lineHeight: 1.6 }}>
            <strong>Bible Connection:</strong> "In the beginning God created the heavens and the earth." God made everything in 6 days and rested on the 7th. Genesis 1:1
          </p>
        </div>
      </div>
    </div>
  );
}
