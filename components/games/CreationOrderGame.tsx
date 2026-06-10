"use client";

import { useState, useCallback } from "react";
import Confetti from "@/components/Confetti";

const CORRECT_ORDER = [
  { day: "Day 1", label: "Light", emoji: "☀️" },
  { day: "Day 2", label: "Sky", emoji: "🌤️" },
  { day: "Day 3", label: "Land and Plants", emoji: "🌿" },
  { day: "Day 4", label: "Sun, Moon, and Stars", emoji: "🌟" },
  { day: "Day 5", label: "Birds and Fish", emoji: "🐟" },
  { day: "Day 6", label: "Animals and People", emoji: "🦁" },
  { day: "Day 7", label: "Rest", emoji: "😌" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface CreationOrderGameProps {
  onComplete?: () => void;
}

export default function CreationOrderGame({ onComplete }: CreationOrderGameProps) {
  const [items, setItems] = useState(() => shuffle(CORRECT_ORDER));
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
    setChecked(false);
  }, []);

  const moveDown = useCallback((index: number) => {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
    setChecked(false);
  }, [items.length]);

  const handleCheck = () => {
    const correct = items.every((item, i) => item.label === CORRECT_ORDER[i].label);
    setChecked(true);
    setIsCorrect(correct);
    if (correct) {
      setShowConfetti(true);
      onComplete?.();
    }
  };

  const handleReset = () => {
    setItems(shuffle(CORRECT_ORDER));
    setChecked(false);
    setIsCorrect(false);
  };

  return (
    <div>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <p style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", marginBottom: "16px" }}>
        Use the arrows to put the days of creation in the correct order.
      </p>

      <div style={{ marginBottom: "20px" }}>
        {items.map((item, index) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: checked
                ? item.label === CORRECT_ORDER[index].label
                  ? "#8E967222"
                  : "#C76F4A22"
                : "#FFFFFF",
              border: `2px solid ${
                checked
                  ? item.label === CORRECT_ORDER[index].label
                    ? "#8E9672"
                    : "#C76F4A"
                  : "#EFE4D0"
              }`,
              borderRadius: "14px",
              padding: "12px 16px",
              marginBottom: "8px",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: "24px", minWidth: "32px" }}>{item.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                {checked ? CORRECT_ORDER[index].day : `Position ${index + 1}`}
              </div>
              <div style={{ fontSize: "15px", fontFamily: "'Cormorant Garamond', serif", color: "#263B5E", fontWeight: 700 }}>
                {item.label}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0 || isCorrect}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #EFE4D0",
                  backgroundColor: "#F8F1E7",
                  cursor: index === 0 ? "not-allowed" : "pointer",
                  opacity: index === 0 ? 0.3 : 1,
                  fontSize: "12px",
                }}
              >
                ↑
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === items.length - 1 || isCorrect}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #EFE4D0",
                  backgroundColor: "#F8F1E7",
                  cursor: index === items.length - 1 ? "not-allowed" : "pointer",
                  opacity: index === items.length - 1 ? 0.3 : 1,
                  fontSize: "12px",
                }}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>

      {checked && (
        <div
          style={{
            backgroundColor: isCorrect ? "#8E967222" : "#C76F4A11",
            border: `2px solid ${isCorrect ? "#8E9672" : "#C76F4A"}`,
            borderRadius: "16px",
            padding: "16px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          {isCorrect ? (
            <>
              <div style={{ fontSize: "28px", marginBottom: "4px" }}>🎉</div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#263B5E", fontWeight: 700 }}>
                Wonderful! You got it right!
              </p>
              <p style={{ fontSize: "13px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
                You earned the <strong>Creation Explorer</strong> badge! 🌍
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>🤔</div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "#C76F4A" }}>
                Try again — you're learning!
              </p>
              <p style={{ fontSize: "12px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
                The highlighted items are in the wrong place. Keep trying!
              </p>
            </>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {!isCorrect && (
          <button
            onClick={handleCheck}
            style={{
              padding: "10px 24px",
              backgroundColor: "#263B5E",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "24px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              cursor: "pointer",
            }}
          >
            Check My Order ✓
          </button>
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
          Shuffle Again
        </button>
      </div>
    </div>
  );
}
