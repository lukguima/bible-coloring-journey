"use client";

import PricingCard from "@/components/PricingCard";
import { useCheckout } from "@/hooks/useCheckout";
import { X } from "lucide-react";

const PLANS = [
  {
    plan: "Free Adventure",
    price: "$0",
    description: "Try before you commit. Perfect for exploring the app.",
    features: ["3 Genesis Bible stories", "3 coloring page previews", "1 Bible game", "1 verse card", "1 completion badge"],
    ctaLabel: "Start Free",
    ctaHref: "/free-adventure",
    highlighted: false,
    badge: undefined,
  },
  {
    plan: "Genesis Full Pack",
    price: "$9",
    description: "The complete interactive Genesis experience for your family.",
    features: [
      "Full Genesis printable PDF (US Letter + A4)",
      "All 12 interactive Bible stories",
      "All 5 Bible games",
      "Memory verse cards",
      "Certificate of completion",
      "Parent reflection guide",
      "35+ coloring and activity pages",
    ],
    ctaLabel: "Get Full Pack",
    ctaHref: "#",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    plan: "Church / Classroom",
    price: "$29",
    description: "For Sunday school teachers, churches, and Christian schools.",
    features: [
      "Everything in Full Pack",
      "Classroom use (up to 30 children)",
      "Sunday School activity pack",
      "Teacher guide",
      "Group discussion questions",
      "Printable name tags",
      "Class completion certificate",
    ],
    ctaLabel: "Get Classroom License",
    ctaHref: "#",
    highlighted: false,
    badge: undefined,
  },
];

export default function UnlockPage() {
  const { openCheckout, showModal, closeModal } = useCheckout();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7" }}>
      <div style={{ background: "linear-gradient(135deg, #D8B76A22, #A9C8D833)", padding: "64px 16px", textAlign: "center", borderBottom: "1px solid #EFE4D0" }}>
        <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
          🔓 Get Full Access
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 6vw, 56px)", color: "#263B5E", marginBottom: "12px", fontWeight: 700 }}>
          Choose Your Adventure
        </h1>
        <p style={{ fontSize: "16px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", maxWidth: "500px", margin: "0 auto" }}>
          Start free or get the full Genesis experience for your family or classroom.
        </p>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "64px 16px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px", marginBottom: "56px" }}>
          {PLANS.map((plan) => (
            <div key={plan.plan} onClick={() => plan.ctaHref === "#" && openCheckout()}>
              <PricingCard
                plan={plan.plan}
                price={plan.price}
                description={plan.description}
                features={plan.features}
                ctaLabel={plan.ctaLabel}
                ctaHref={plan.ctaHref === "#" ? "#" : plan.ctaHref}
                highlighted={plan.highlighted}
                badge={plan.badge}
              />
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "28px", border: "1px solid #EFE4D0", textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>💛</div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", color: "#263B5E", marginBottom: "6px" }}>
            100% Satisfaction Guarantee
          </h3>
          <p style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", lineHeight: 1.6, maxWidth: "480px", margin: "0 auto" }}>
            If you're not completely happy with your purchase, contact us within 30 days and we'll make it right. No questions asked.
          </p>
        </div>

        {/* FAQ mini */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {[
            { q: "Is this a one-time payment?", a: "Yes! You pay once and get lifetime access to all included materials." },
            { q: "Can I print unlimited copies?", a: "Yes, for personal/family use. Classroom license allows use with up to 30 students." },
            { q: "Do I need an account?", a: "No account needed. Progress is saved automatically on your device." },
            { q: "What payment methods are accepted?", a: "We accept all major credit cards, PayPal, and local payment methods via our checkout." },
          ].map((item) => (
            <div key={item.q} style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "20px", border: "1px solid #EFE4D0" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", color: "#263B5E", fontWeight: 700, marginBottom: "6px" }}>{item.q}</div>
              <p style={{ fontSize: "13px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", lineHeight: 1.5, margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "40px 32px", maxWidth: "440px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🛒</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", color: "#263B5E", marginBottom: "8px" }}>
              Checkout Integration Coming Soon
            </h3>
            <p style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", lineHeight: 1.6, marginBottom: "24px" }}>
              Add your Hotmart, Stripe, or payment link in the dashboard settings to activate checkout.
            </p>
            <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
              <a href="/dashboard/settings" style={{ padding: "12px", backgroundColor: "#263B5E", color: "#FFFFFF", borderRadius: "14px", textDecoration: "none", fontSize: "14px", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
                Go to Dashboard Settings
              </a>
              <button onClick={closeModal} style={{ padding: "10px", backgroundColor: "transparent", border: "1px solid #EFE4D0", borderRadius: "14px", fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
