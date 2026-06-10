"use client";

import Link from "next/link";
import { Game } from "@/data/games";
import { CheckCircle, Gamepad2 } from "lucide-react";

interface GameCardProps {
  game: Game;
  completed?: boolean;
}

export default function GameCard({ game, completed = false }: GameCardProps) {
  return (
    <Link
      href={`/games/${game.slug}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          padding: "24px",
          border: `2px solid ${completed ? "#8E9672" : "#EFE4D0"}`,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          cursor: "pointer",
          boxShadow: "0 1px 3px rgba(122,78,45,0.08)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 30px rgba(122,78,45,0.14)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(122,78,45,0.08)";
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <span style={{ fontSize: "40px" }}>{game.emoji}</span>
          {completed && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle size={18} color="#8E9672" />
            </div>
          )}
        </div>
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "19px",
            fontWeight: 700,
            color: "#263B5E",
            marginBottom: "6px",
            lineHeight: 1.3,
          }}
        >
          {game.title}
        </h3>
        <p
          style={{
            fontSize: "13px",
            color: "#7A4E2D",
            fontFamily: "'Nunito', system-ui, sans-serif",
            lineHeight: 1.5,
            marginBottom: "16px",
          }}
        >
          {game.description}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              fontSize: "11px",
              color: "#8E9672",
              fontFamily: "'Nunito', system-ui, sans-serif",
              fontWeight: 600,
            }}
          >
            {game.ageRange}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              color: "#D8B76A",
              fontFamily: "'Nunito', system-ui, sans-serif",
              fontWeight: 700,
            }}
          >
            🏅 {game.badge}
          </div>
        </div>
        <div
          style={{
            marginTop: "12px",
            padding: "8px",
            backgroundColor: completed ? "#8E967222" : "#263B5E",
            color: completed ? "#8E9672" : "#FFFFFF",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "'Nunito', system-ui, sans-serif",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <Gamepad2 size={13} />
          {completed ? "Play Again" : "Play Now"}
        </div>
      </div>
    </Link>
  );
}
