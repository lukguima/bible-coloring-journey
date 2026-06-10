"use client";

import { useState, useCallback } from "react";
import Confetti from "@/components/Confetti";

const VERSE_WORDS = ["In", "the", "beginning", "God", "created", "the", "heavens", "and", "the", "earth."];
const VERSE_REFERENCE = "Genesis 1:1";
const FULL_VERSE = "In the beginning God created the heavens and the earth.";

interface VersePuzzleGameProps {
  onComplete?: () => void;
}

export default function VersePuzzleGame({ onComplete }: VersePuzzleGameProps) {
  const [wordBank, setWordBank] = useState(() => {
    return [...VERSE_WORDS].map((w, i) => ({ id: `w-${i}-${w}`, word: w, used: false }));
  });
  const [sentence, setSentence] = useState<Array<{ id: string; word: string }>>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const addWord = useCallback((id: string, word: string) => {
    setWordBank((prev) => prev.map((w) => w.id === id ? { ...w, used: true } : w));
    setSentence((prev) => [...prev, { id, word }]);
    setChecked(false);
  }, []);

  const removeWord = useCallback((id: string) => {
    setSentence((prev) => prev.filter((w) => w.id !== id));
    setWordBank((prev) => prev.map((w) => w.id === id ? { ...w, used: false } : w));
    setChecked(false);
  }, []);

  const handleCheck = () => {
    const built = sentence.map((w) => w.word).join(" ");
    const correct = built === FULL_VERSE;
    setChecked(true);
    setIsCorrect(correct);
    if (correct) {
      setShowConfetti(true);
      onComplete?.();
    }
  };

  const handleReset = () => {
    setWordBank([...VERSE_WORDS].map((w, i) => ({ id: `w-${i}-${w}`, word: w, used: false })));
    setSentence([]);
    setIsCorrect(false);
    setChecked(false);
  };

  return (
    <div>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <p style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", marginBottom: "16px" }}>
        Click the words in the right order to build the verse!
      </p>

      {/* Sentence area */}
      <div
        style={{
          minHeight: "72px",
          backgroundColor: "#FFFFFF",
          border: `2px solid ${checked ? (isCorrect ? "#8E9672" : "#C76F4A") : "#EFE4D0"}`,
          borderRadius: "16px",
          padding: "12px 16px",
          marginBottom: "16px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
        }}
      >
        {sentence.length === 0 && (
          <span style={{ color: "#7A4E2D88", fontSize: "14px", fontFamily: "'Nunito', sans-serif" }}>
            Click words below to build the verse...
          </span>
        )}
        {sentence.map((w) => (
          <button
            key={w.id}
            onClick={() => !isCorrect && removeWord(w.id)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#A9C8D8",
              color: "#263B5E",
              border: "none",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              cursor: isCorrect ? "default" : "pointer",
              transition: "opacity 0.15s ease",
            }}
          >
            {w.word}
          </button>
        ))}
      </div>

      {/* Word bank */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "20px",
          padding: "16px",
          backgroundColor: "#F8F1E7",
          borderRadius: "16px",
        }}
      >
        {wordBank.map((w) => (
          <button
            key={w.id}
            onClick={() => !w.used && !isCorrect && addWord(w.id, w.word)}
            disabled={w.used || isCorrect}
            style={{
              padding: "8px 14px",
              backgroundColor: w.used ? "#EFE4D0" : "#263B5E",
              color: w.used ? "#7A4E2D55" : "#FFFFFF",
              border: "none",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              cursor: w.used ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {w.word}
          </button>
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
                You did it!
              </p>
              <p style={{ fontSize: "13px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", marginTop: "4px" }}>
                You earned the <strong>Verse Builder</strong> badge! 📖
              </p>
              <div style={{
                marginTop: "12px",
                padding: "12px",
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "16px",
                color: "#263B5E",
                fontStyle: "italic",
              }}>
                "{FULL_VERSE}"<br />
                <span style={{ fontSize: "13px", color: "#C76F4A", fontStyle: "normal", fontWeight: 600 }}>— {VERSE_REFERENCE}</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>🤔</div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "#C76F4A" }}>
                Try again — you're learning!
              </p>
            </>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {!isCorrect && sentence.length > 0 && (
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
            Check Verse ✓
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
          Start Over
        </button>
      </div>
    </div>
  );
}
