"use client";

import { useState, useCallback } from "react";
import Confetti from "@/components/Confetti";

const STARS = [
  { id: "s1", x: 15, y: 20, found: false },
  { id: "s2", x: 30, y: 60, found: false },
  { id: "s3", x: 50, y: 15, found: false },
  { id: "s4", x: 65, y: 45, found: false },
  { id: "s5", x: 80, y: 25, found: false },
  { id: "s6", x: 42, y: 70, found: false },
  { id: "s7", x: 72, y: 72, found: false },
];

interface FindTheStarsGameProps {
  onComplete?: () => void;
}

export default function FindTheStarsGame({ onComplete }: FindTheStarsGameProps) {
  const [stars, setStars] = useState(STARS);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hint, setHint] = useState("");

  const foundCount = stars.filter((s) => s.found).length;

  const handleStarClick = useCallback((id: string) => {
    setStars((prev) => {
      const next = prev.map((s) => s.id === id ? { ...s, found: true } : s);
      const total = next.filter((s) => s.found).length;
      if (total === STARS.length) {
        setShowConfetti(true);
        setIsComplete(true);
        onComplete?.();
      }
      return next;
    });
    setHint("⭐ Found a star!");
    setTimeout(() => setHint(""), 1500);
  }, [onComplete]);

  const handleReset = () => {
    setStars(STARS);
    setIsComplete(false);
    setHint("");
  };

  return (
    <div>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
          Stars found: <strong style={{ color: "#263B5E" }}>{foundCount}/{STARS.length}</strong>
        </div>
        {hint && (
          <span style={{ fontSize: "14px", color: "#D8B76A", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
            {hint}
          </span>
        )}
      </div>

      {/* Sky scene */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "60%",
          backgroundColor: "#1a1a3e",
          borderRadius: "20px",
          overflow: "hidden",
          marginBottom: "16px",
          cursor: "default",
          backgroundImage: "radial-gradient(ellipse at 50% 100%, #263B5E44 0%, transparent 70%)",
        }}
      >
        {/* Decorative hills */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30%",
          background: "linear-gradient(to bottom, #1a3a1a, #0d2010)",
          borderRadius: "50% 50% 0 0 / 20% 20% 0 0",
        }} />
        <div style={{
          position: "absolute",
          bottom: 0,
          left: "-10%",
          width: "50%",
          height: "25%",
          background: "#0d2010",
          borderRadius: "50% 50% 0 0",
        }} />

        {/* Moon */}
        <div style={{
          position: "absolute",
          right: "10%",
          top: "10%",
          fontSize: "28px",
          opacity: 0.9,
        }}>🌙</div>

        {/* Background decorative stars */}
        {[{ x: 5, y: 8 }, { x: 25, y: 35 }, { x: 55, y: 50 }, { x: 88, y: 12 }, { x: 93, y: 38 }].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: "8px",
              opacity: 0.4,
              color: "#FFFFFF",
            }}
          >
            ✦
          </div>
        ))}

        {/* Clickable stars */}
        {stars.map((star) => (
          <button
            key={star.id}
            onClick={() => !star.found && handleStarClick(star.id)}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}%`,
              transform: "translate(-50%, -50%)",
              width: "40px",
              height: "40px",
              border: "none",
              backgroundColor: "transparent",
              cursor: star.found ? "default" : "pointer",
              fontSize: "24px",
              transition: "transform 0.2s ease",
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              if (!star.found) (e.currentTarget as HTMLButtonElement).style.transform = "translate(-50%, -50%) scale(1.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translate(-50%, -50%) scale(1)";
            }}
          >
            {star.found ? "⭐" : "✦"}
          </button>
        ))}
      </div>

      <p style={{ fontSize: "13px", color: "#7A4E2D88", fontFamily: "'Nunito', sans-serif", marginBottom: "16px", textAlign: "center" }}>
        Click the glowing spots to find hidden stars!
      </p>

      {isComplete && (
        <div
          style={{
            backgroundColor: "#D8B76A22",
            border: "2px solid #D8B76A",
            borderRadius: "16px",
            padding: "16px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "28px", marginBottom: "4px" }}>⭐</div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#263B5E", fontWeight: 700, marginBottom: "4px" }}>
            Great job!
          </p>
          <p style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
            God gave Abraham a special promise — his family would be as many as the stars!
          </p>
          <p style={{ fontSize: "13px", color: "#D8B76A", fontFamily: "'Nunito', sans-serif", fontWeight: 700, marginTop: "6px" }}>
            You earned the Star Finder badge! ⭐
          </p>
        </div>
      )}

      <button
        onClick={handleReset}
        style={{
          padding: "10px 24px",
          backgroundColor: "#F8F1E7",
          color: "#263B5E",
          border: "2px solid #263B5E",
          borderRadius: "24px",
          fontSize: "14px",
          fontWeight: 700,
          fontFamily: "'Nunito', sans-serif",
          cursor: "pointer",
        }}
      >
        Reset Game
      </button>
    </div>
  );
}
