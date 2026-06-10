"use client";

import { games } from "@/data/games";
import GameCard from "@/components/GameCard";
import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";

export default function GamesPage() {
  const { isGameCompleted } = useProgress();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7" }}>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #263B5E11 0%, #A9C8D833 100%)",
          padding: "48px 16px",
          textAlign: "center",
          borderBottom: "1px solid #EFE4D0",
        }}
      >
        <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          🎮 Bible Games
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 6vw, 52px)", color: "#263B5E", marginBottom: "12px", fontWeight: 700 }}>
          Fun Bible Games for Kids
        </h1>
        <p style={{ fontSize: "16px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", maxWidth: "520px", margin: "0 auto" }}>
          Learn Bible stories through interactive games. Complete each game to earn a special badge!
        </p>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 16px 80px" }}>
        {/* Badge preview */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            padding: "20px 24px",
            marginBottom: "40px",
            border: "1px solid #EFE4D0",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
              Complete all games to earn
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#263B5E", fontWeight: 700 }}>
              Genesis Adventurer Badge 🏆
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {games.map((g) => (
              <div
                key={g.id}
                title={g.badge}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: isGameCompleted(g.id) ? "#8E967222" : "#F8F1E7",
                  border: `2px solid ${isGameCompleted(g.id) ? "#8E9672" : "#EFE4D0"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  filter: isGameCompleted(g.id) ? "none" : "grayscale(1)",
                  opacity: isGameCompleted(g.id) ? 1 : 0.5,
                }}
              >
                {g.emoji}
              </div>
            ))}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link
              href="/progress"
              style={{ fontSize: "13px", color: "#C76F4A", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textDecoration: "none" }}
            >
              View Progress →
            </Link>
          </div>
        </div>

        {/* Games grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {games.map((game) => (
            <GameCard key={game.id} game={game} completed={isGameCompleted(game.id)} />
          ))}
        </div>

        {/* Tip */}
        <div
          style={{
            marginTop: "48px",
            padding: "24px",
            backgroundColor: "#A9C8D822",
            borderRadius: "20px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "15px", color: "#263B5E", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
            💡 Tip for parents: These games reinforce the Bible stories your child is learning.
          </p>
          <p style={{ fontSize: "13px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", marginTop: "4px" }}>
            Play together and use the Bible connections at the bottom of each game to spark conversation!
          </p>
          <Link
            href="/guide"
            style={{ display: "inline-block", marginTop: "12px", fontSize: "13px", color: "#C76F4A", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textDecoration: "none" }}
          >
            Read the Parent & Teacher Guide →
          </Link>
        </div>
      </div>
    </div>
  );
}
