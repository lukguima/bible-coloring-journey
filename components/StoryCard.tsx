"use client";

import Link from "next/link";
import { Story } from "@/data/stories";
import { Lock, CheckCircle, BookOpen } from "lucide-react";
import LockOverlay from "./LockOverlay";

interface StoryCardProps {
  story: Story;
  completed?: boolean;
}

export default function StoryCard({ story, completed = false }: StoryCardProps) {
  const isPremium = story.status === "premium";

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid #EFE4D0",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: "0 1px 3px rgba(122,78,45,0.08)",
      }}
      onMouseEnter={(e) => {
        if (!isPremium) {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 30px rgba(122,78,45,0.14)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(122,78,45,0.08)";
      }}
    >
      {/* Emoji hero */}
      <div
        style={{
          height: "100px",
          background: "linear-gradient(135deg, #A9C8D833, #EFE4D0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "48px",
        }}
      >
        {story.emoji}
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: isPremium ? "#D8B76A" : "#8E9672",
              fontFamily: "'Nunito', system-ui, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {isPremium ? <Lock size={10} /> : null}
            {isPremium ? "Premium" : "Free"}
          </span>
          {completed && <CheckCircle size={16} color="#8E9672" />}
        </div>

        <h3
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "17px",
            fontWeight: 700,
            color: "#263B5E",
            marginBottom: "4px",
            lineHeight: 1.3,
          }}
        >
          {story.title}
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "#C76F4A",
            fontFamily: "'Nunito', system-ui, sans-serif",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          {story.reference}
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "#7A4E2D",
            fontFamily: "'Nunito', system-ui, sans-serif",
            lineHeight: 1.5,
            marginBottom: "12px",
          }}
        >
          {story.shortDescription}
        </p>

        {isPremium ? (
          <Link
            href="/unlock"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px",
              backgroundColor: "#F8F1E7",
              color: "#263B5E",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "'Nunito', system-ui, sans-serif",
              textDecoration: "none",
              border: "1px solid #D8B76A",
            }}
          >
            <Lock size={12} />
            Unlock Full Pack
          </Link>
        ) : (
          <Link
            href={`/stories/${story.slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px",
              backgroundColor: "#263B5E",
              color: "#FFFFFF",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "'Nunito', system-ui, sans-serif",
              textDecoration: "none",
            }}
          >
            <BookOpen size={12} />
            {completed ? "Read Again" : "Open Story"}
          </Link>
        )}
      </div>
    </div>
  );
}
