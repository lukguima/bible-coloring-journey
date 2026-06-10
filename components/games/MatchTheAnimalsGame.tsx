"use client";

import { useState, useCallback } from "react";
import Confetti from "@/components/Confetti";

const ANIMALS = [
  { id: "lion-1", pair: "lion", emoji: "🦁", name: "Lion" },
  { id: "lion-2", pair: "lion", emoji: "🦁", name: "Lion" },
  { id: "giraffe-1", pair: "giraffe", emoji: "🦒", name: "Giraffe" },
  { id: "giraffe-2", pair: "giraffe", emoji: "🦒", name: "Giraffe" },
  { id: "elephant-1", pair: "elephant", emoji: "🐘", name: "Elephant" },
  { id: "elephant-2", pair: "elephant", emoji: "🐘", name: "Elephant" },
  { id: "dove-1", pair: "dove", emoji: "🕊️", name: "Dove" },
  { id: "dove-2", pair: "dove", emoji: "🕊️", name: "Dove" },
  { id: "sheep-1", pair: "sheep", emoji: "🐑", name: "Sheep" },
  { id: "sheep-2", pair: "sheep", emoji: "🐑", name: "Sheep" },
  { id: "monkey-1", pair: "monkey", emoji: "🐒", name: "Monkey" },
  { id: "monkey-2", pair: "monkey", emoji: "🐒", name: "Monkey" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface MatchTheAnimalsGameProps {
  onComplete?: () => void;
}

export default function MatchTheAnimalsGame({ onComplete }: MatchTheAnimalsGameProps) {
  const [cards, setCards] = useState(() => shuffle(ANIMALS));
  const [selected, setSelected] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSelect = useCallback((id: string) => {
    if (matched.includes(id) || selected.includes(id) || selected.length === 2) return;

    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setAttempts((a) => a + 1);
      const [a, b] = newSelected.map((sid) => cards.find((c) => c.id === sid)!);
      if (a.pair === b.pair) {
        const newMatched = [...matched, a.id, b.id];
        setMatched(newMatched);
        setSelected([]);
        if (newMatched.length === cards.length) {
          setShowConfetti(true);
          setIsComplete(true);
          onComplete?.();
        }
      } else {
        setTimeout(() => setSelected([]), 1000);
      }
    }
  }, [selected, matched, cards, onComplete]);

  const handleReset = () => {
    setCards(shuffle(ANIMALS));
    setSelected([]);
    setMatched([]);
    setIsComplete(false);
    setAttempts(0);
  };

  return (
    <div>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
          Pairs found: <strong style={{ color: "#263B5E" }}>{matched.length / 2}/{cards.length / 2}</strong>
        </div>
        <div style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
          Attempts: <strong style={{ color: "#263B5E" }}>{attempts}</strong>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {cards.map((card) => {
          const isSelected = selected.includes(card.id);
          const isMatched = matched.includes(card.id);
          return (
            <button
              key={card.id}
              onClick={() => handleSelect(card.id)}
              disabled={isMatched}
              style={{
                aspectRatio: "1",
                border: isMatched
                  ? "2px solid #8E9672"
                  : isSelected
                  ? "2px solid #C76F4A"
                  : "2px solid #EFE4D0",
                borderRadius: "16px",
                backgroundColor: isMatched ? "#8E967222" : isSelected ? "#C76F4A11" : "#FFFFFF",
                fontSize: "clamp(24px, 6vw, 36px)",
                cursor: isMatched ? "default" : "pointer",
                transition: "all 0.15s ease",
                transform: isSelected ? "scale(1.05)" : "scale(1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {card.emoji}
            </button>
          );
        })}
      </div>

      {isComplete && (
        <div
          style={{
            backgroundColor: "#8E967222",
            border: "2px solid #8E9672",
            borderRadius: "16px",
            padding: "20px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎉</div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", color: "#263B5E", marginBottom: "4px" }}>
            Great job!
          </h3>
          <p style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
            All animals are paired! You earned the <strong>Ark Helper</strong> badge! 🏅
          </p>
        </div>
      )}

      <button
        onClick={handleReset}
        style={{
          padding: "10px 24px",
          backgroundColor: isComplete ? "#263B5E" : "#F8F1E7",
          color: isComplete ? "#FFFFFF" : "#263B5E",
          border: "2px solid #263B5E",
          borderRadius: "24px",
          fontSize: "14px",
          fontWeight: 700,
          fontFamily: "'Nunito', sans-serif",
          cursor: "pointer",
        }}
      >
        {isComplete ? "Play Again 🎮" : "Reset Game"}
      </button>
    </div>
  );
}
