"use client";

import { useState } from "react";
import Confetti from "@/components/Confetti";

const QUESTIONS = [
  {
    question: "Who built the ark?",
    options: ["Moses", "Noah", "Abraham", "Joseph"],
    correct: "Noah",
  },
  {
    question: "What did God place in the sky as a promise?",
    options: ["A star", "A cloud", "A rainbow", "The sun"],
    correct: "A rainbow",
  },
  {
    question: "What animals entered the ark?",
    options: ["Only farm animals", "Two of every kind", "Only birds", "Only big animals"],
    correct: "Two of every kind",
  },
  {
    question: "What does the rainbow remind us?",
    options: ["It will rain soon", "God keeps His promises", "Spring is coming", "The flood was fun"],
    correct: "God keeps His promises",
  },
];

interface RainbowQuizGameProps {
  onComplete?: () => void;
}

export default function RainbowQuizGame({ onComplete }: RainbowQuizGameProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(QUESTIONS.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const question = QUESTIONS[currentQ];
  const answered = answers[currentQ];
  const score = answers.filter((a, i) => a === QUESTIONS[i].correct).length;

  const handleAnswer = (option: string) => {
    if (answered) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      setShowResults(true);
      if (score === QUESTIONS.length) {
        setShowConfetti(true);
        onComplete?.();
      } else if (score >= QUESTIONS.length - 1) {
        onComplete?.();
      }
    }
  };

  const handleReset = () => {
    setCurrentQ(0);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div>
        <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
        <div
          style={{
            textAlign: "center",
            padding: "24px",
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            border: "2px solid #EFE4D0",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>
            {score === 4 ? "🌈" : score >= 3 ? "⭐" : "💪"}
          </div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", color: "#263B5E", marginBottom: "4px" }}>
            {score === 4 ? "Perfect Score!" : score >= 3 ? "Well Done!" : "Good Try!"}
          </h3>
          <p style={{ fontSize: "16px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", marginBottom: "20px" }}>
            You got <strong style={{ color: "#263B5E" }}>{score} out of {QUESTIONS.length}</strong> correct!
          </p>

          {score >= 3 && (
            <div style={{
              backgroundColor: "#C76F4A11",
              border: "2px solid #C76F4A",
              borderRadius: "14px",
              padding: "14px",
              marginBottom: "20px",
            }}>
              <p style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
                You earned the <strong>Promise Keeper</strong> badge! 🌈
              </p>
            </div>
          )}

          {QUESTIONS.map((q, i) => (
            <div
              key={i}
              style={{
                textAlign: "left",
                padding: "12px",
                backgroundColor: answers[i] === q.correct ? "#8E967222" : "#C76F4A11",
                borderRadius: "12px",
                marginBottom: "8px",
              }}
            >
              <div style={{ fontSize: "13px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", marginBottom: "4px" }}>
                {answers[i] === q.correct ? "✅" : "❌"} {q.question}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#263B5E", fontFamily: "'Nunito', sans-serif" }}>
                {answers[i] === q.correct ? answers[i] : `Your answer: ${answers[i]} (Correct: ${q.correct})`}
              </div>
            </div>
          ))}

          <button
            onClick={handleReset}
            style={{
              marginTop: "12px",
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
            Try Again 🎮
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <span style={{ fontSize: "13px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
          Question {currentQ + 1} of {QUESTIONS.length}
        </span>
        <div style={{ display: "flex", gap: "4px" }}>
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: i === currentQ ? "#C76F4A" : i < currentQ ? "#8E9672" : "#EFE4D0",
              }}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "16px",
          border: "1px solid #EFE4D0",
        }}
      >
        <div style={{ fontSize: "32px", textAlign: "center", marginBottom: "12px" }}>🌈</div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", color: "#263B5E", textAlign: "center", marginBottom: "20px" }}>
          {question.question}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {question.options.map((option) => {
            const isSelected = answered === option;
            const isCorrect = answered != null && option === question.correct;
            const isWrong = answered != null && isSelected && option !== question.correct;

            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={!!answered}
                style={{
                  padding: "14px 12px",
                  border: `2px solid ${isCorrect ? "#8E9672" : isWrong ? "#C76F4A" : isSelected ? "#A9C8D8" : "#EFE4D0"}`,
                  borderRadius: "14px",
                  backgroundColor: isCorrect ? "#8E967222" : isWrong ? "#C76F4A11" : isSelected ? "#A9C8D822" : "#F8F1E7",
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "'Nunito', sans-serif",
                  color: "#263B5E",
                  cursor: answered ? "default" : "pointer",
                  textAlign: "center",
                  transition: "all 0.15s ease",
                }}
              >
                {isCorrect ? "✅ " : isWrong ? "❌ " : ""}{option}
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: answered === question.correct ? "#8E967222" : "#C76F4A11",
              borderRadius: "12px",
              textAlign: "center",
              fontSize: "14px",
              fontFamily: "'Nunito', sans-serif",
              color: "#263B5E",
            }}
          >
            {answered === question.correct
              ? "🎉 Wonderful! That's right!"
              : `🤔 Try again next time! The answer was: ${question.correct}`}
          </div>
        )}
      </div>

      {answered && (
        <button
          onClick={handleNext}
          style={{
            padding: "12px 28px",
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
          {currentQ < QUESTIONS.length - 1 ? "Next Question →" : "See Results 🎉"}
        </button>
      )}
    </div>
  );
}
