"use client";

import { useState } from "react";
import { useAdminLeads } from "@/hooks/useAdminData";
import { useAnalytics } from "@/hooks/useAnalytics";

const BOOKS = ["Exodus Coloring Book", "Psalms Coloring Book", "Proverbs Coloring Book", "Life of Jesus Coloring Book", "Bible Heroes Coloring Book"];

export default function WaitlistPage() {
  const { addLead } = useAdminLeads();
  const { trackEvent } = useAnalytics();
  const [form, setForm] = useState({ name: "", email: "", book: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setLoading(true);
    setTimeout(() => {
      addLead({ name: form.name, email: form.email, source: "waitlist", interestedBook: form.book, tags: ["waitlist"] });
      trackEvent("waitlist_submitted", { book: form.book });
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "64px 16px 80px" }}>
        {!submitted ? (
          <>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📬</div>
              <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                Coming Soon
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 44px)", color: "#263B5E", marginBottom: "10px", fontWeight: 700 }}>
                Join the Bible Coloring Journey Waitlist
              </h1>
              <p style={{ fontSize: "15px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", lineHeight: 1.6 }}>
                We're working on Exodus, Psalms, Proverbs, and more! Be the first to know when new coloring books launch.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "32px", boxShadow: "0 4px 20px rgba(122,78,45,0.08)", border: "1px solid #EFE4D0" }}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#263B5E", fontFamily: "'Nunito', sans-serif", marginBottom: "6px" }}>
                  Your Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sarah Johnson"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: "100%", padding: "12px 14px", border: "2px solid #EFE4D0", borderRadius: "12px", fontSize: "14px", fontFamily: "'Nunito', sans-serif", color: "#263B5E", outline: "none", boxSizing: "border-box", backgroundColor: "#F8F1E7" }}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#263B5E", fontFamily: "'Nunito', sans-serif", marginBottom: "6px" }}>
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: "100%", padding: "12px 14px", border: "2px solid #EFE4D0", borderRadius: "12px", fontSize: "14px", fontFamily: "'Nunito', sans-serif", color: "#263B5E", outline: "none", boxSizing: "border-box", backgroundColor: "#F8F1E7" }}
                />
              </div>
              <div style={{ marginBottom: "28px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#263B5E", fontFamily: "'Nunito', sans-serif", marginBottom: "6px" }}>
                  Which book are you most excited for?
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {BOOKS.map((book) => (
                    <label key={book} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px 14px", borderRadius: "10px", backgroundColor: form.book === book ? "#A9C8D833" : "transparent", border: `1px solid ${form.book === book ? "#A9C8D8" : "#EFE4D0"}` }}>
                      <input type="radio" name="book" value={book} checked={form.book === book} onChange={() => setForm({ ...form, book })} style={{ accentColor: "#263B5E" }} />
                      <span style={{ fontSize: "14px", color: "#263B5E", fontFamily: "'Nunito', sans-serif", fontWeight: form.book === book ? 700 : 400 }}>{book}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", padding: "14px", backgroundColor: "#C76F4A", color: "#FFFFFF", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 800, fontFamily: "'Nunito', sans-serif", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Joining..." : "Join the Waitlist →"}
              </button>
            </form>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "24px" }}>
              {BOOKS.map((book, i) => (
                <span key={book} style={{ padding: "4px 12px", backgroundColor: "#FFFFFF", color: "#7A4E2D", borderRadius: "20px", fontSize: "12px", fontFamily: "'Nunito', sans-serif", border: "1px solid #EFE4D0" }}>
                  {["📜", "🎵", "💎", "✝️", "🦸"][i]} {book.replace(" Coloring Book", "")}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 24px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "36px", color: "#263B5E", marginBottom: "12px", fontWeight: 700 }}>
              You're on the List!
            </h2>
            <p style={{ fontSize: "16px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", lineHeight: 1.7, marginBottom: "32px" }}>
              Thank you, {form.name}! We'll email you at {form.email} as soon as{form.book ? ` the ${form.book}` : " the next book"} is ready.
            </p>
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "24px", border: "1px solid #EFE4D0", marginBottom: "32px" }}>
              <p style={{ fontSize: "15px", color: "#263B5E", fontFamily: "'Nunito', sans-serif", fontWeight: 600, margin: 0 }}>
                While you wait, try the free Genesis adventure! 👇
              </p>
            </div>
            <a href="/free-adventure" style={{ padding: "14px 32px", backgroundColor: "#263B5E", color: "#FFFFFF", borderRadius: "32px", fontSize: "16px", fontWeight: 800, fontFamily: "'Nunito', sans-serif", textDecoration: "none" }}>
              Start Free Adventure
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
