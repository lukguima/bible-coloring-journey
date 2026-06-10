"use client";

import Link from "next/link";
import { Check, Star, BookOpen, Palette, Gamepad2, Download, Award, ChevronDown } from "lucide-react";

const BADGES = [
  { emoji: "📄", label: "Printable PDF" },
  { emoji: "👶", label: "Ages 4–9" },
  { emoji: "⛪", label: "Sunday School Friendly" },
  { emoji: "📱", label: "Screen-Free + Interactive" },
  { emoji: "⚡", label: "Instant Access" },
];

const BENEFITS = [
  {
    emoji: "🖨️",
    title: "Screen-Free Printable Activities",
    desc: "Beautiful coloring pages and activity sheets you can print at home — no screens required for the actual coloring!",
  },
  {
    emoji: "🎮",
    title: "Interactive Bible Games",
    desc: "Fun, age-appropriate games that make Bible stories stick through play and repetition.",
  },
  {
    emoji: "🏫",
    title: "Perfect for Sunday School & Homeschool",
    desc: "Designed with teachers and homeschool parents in mind. Easy to use, ready to print, and theologically sound.",
  },
  {
    emoji: "🧠",
    title: "Helps Kids Remember Bible Stories",
    desc: "Stories, activities, and verse cards work together to build lasting Bible memory in young hearts.",
  },
];

const FEATURES = [
  { href: "/coloring", emoji: "🎨", title: "Coloring Pages", desc: "Interactive & printable" },
  { href: "/stories", emoji: "📖", title: "Bible Story Mode", desc: "12 Genesis stories" },
  { href: "/games", emoji: "🎮", title: "Bible Games", desc: "5 fun mini-games" },
  { href: "/printables", emoji: "📄", title: "Printable Bonuses", desc: "PDF downloads" },
  { href: "/progress", emoji: "🏅", title: "Progress Badges", desc: "Track your journey" },
  { href: "/stories/god-creates-the-world", emoji: "📝", title: "Memory Verse Cards", desc: "Genesis verses" },
];

const INCLUDED = [
  "35+ printable coloring and activity pages",
  "12 Genesis Bible stories with kid-friendly language",
  "Simple Bible references for each story",
  "Interactive Bible games (memory match, quiz, puzzle)",
  "Memory verse cards for key Genesis passages",
  "Parent and teacher reflection prompts",
  "Certificate of completion",
  "US Letter and A4 printable formats",
  "Digital progress tracker with badges",
];

const STEPS = [
  { step: "01", title: "Choose a Bible Story", desc: "Browse 12 Genesis stories from creation to Joseph.", emoji: "📖" },
  { step: "02", title: "Read the Story Together", desc: "Short, kid-friendly text your child will love.", emoji: "👨‍👩‍👧" },
  { step: "03", title: "Color, Play & Learn", desc: "Color the scene, play a game, and discuss the lesson.", emoji: "🎨" },
  { step: "04", title: "Earn Badges & Celebrate", desc: "Track progress and unlock the completion certificate!", emoji: "🏆" },
];

const FUTURE_BOOKS = [
  { emoji: "📜", title: "Exodus Coloring Book", status: "Coming Soon" },
  { emoji: "🎵", title: "Psalms Coloring Book", status: "Coming Soon" },
  { emoji: "💎", title: "Proverbs Coloring Book", status: "Coming Soon" },
  { emoji: "✝️", title: "Life of Jesus Coloring Book", status: "Coming Soon" },
  { emoji: "🦸", title: "Bible Heroes Coloring Book", status: "Coming Soon" },
];

const FAQS = [
  {
    q: "Is this a physical book or digital product?",
    a: "Bible Coloring Journey is a digital product. You get instant access to printable PDF files you can print at home, plus the interactive web app experience.",
  },
  {
    q: "What age is this for?",
    a: "The content is designed for children ages 4–9. Younger children (4–6) will need parental help, while older children (7–9) can enjoy it more independently.",
  },
  {
    q: "Can I use this in Sunday school?",
    a: "Yes! The Church/Classroom license allows use with up to 30 children and includes a Sunday School activity pack and teacher guide.",
  },
  {
    q: "Can I print the pages?",
    a: "Absolutely! All pages are designed for easy printing. Both US Letter and A4 formats are included.",
  },
  {
    q: "Does the app work on mobile?",
    a: "Yes! The web app is fully responsive and works on phones, tablets, and computers.",
  },
  {
    q: "Do I get instant access?",
    a: "Yes! After purchase you get immediate access to all digital files and the web app.",
  },
  {
    q: "Will there be more Bible books?",
    a: "Yes! We're working on Exodus, Psalms, Proverbs, Life of Jesus, and more. Join the waitlist to be first to know!",
  },
];

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "#F8F1E7" }}>
      {/* ===== HERO ===== */}
      <section
        style={{
          background: "linear-gradient(160deg, #F8F1E7 0%, #EFE4D0 60%, #E8D5B7 100%)",
          padding: "64px 16px 80px",
          textAlign: "center",
          borderBottom: "1px solid #EFE4D0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", backgroundColor: "#A9C8D811", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "240px", height: "240px", backgroundColor: "#D8B76A11", borderRadius: "50%", pointerEvents: "none" }} />

        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#A9C8D8",
              color: "#263B5E",
              padding: "5px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 800,
              fontFamily: "'Nunito', sans-serif",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            <Star size={12} />
            Genesis Coloring Book for Kids
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(36px, 7vw, 68px)",
              fontWeight: 700,
              color: "#263B5E",
              lineHeight: 1.1,
              marginBottom: "20px",
            }}
          >
            Help Your Child Discover the Bible Through Coloring
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontSize: "clamp(15px, 2.5vw, 18px)",
              color: "#7A4E2D",
              fontFamily: "'Nunito', sans-serif",
              lineHeight: 1.7,
              marginBottom: "32px",
              maxWidth: "620px",
              margin: "0 auto 32px",
            }}
          >
            A printable and interactive Genesis coloring experience with Bible stories, simple verses, activities, and faith-filled games for kids ages 4–9.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
            <Link
              href="/free-adventure"
              style={{
                padding: "14px 32px",
                backgroundColor: "#C76F4A",
                color: "#FFFFFF",
                borderRadius: "32px",
                fontSize: "16px",
                fontWeight: 800,
                fontFamily: "'Nunito', sans-serif",
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(199,111,74,0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ✨ Start Free Adventure
            </Link>
            <Link
              href="/unlock"
              style={{
                padding: "14px 32px",
                backgroundColor: "transparent",
                color: "#263B5E",
                borderRadius: "32px",
                fontSize: "16px",
                fontWeight: 800,
                fontFamily: "'Nunito', sans-serif",
                textDecoration: "none",
                border: "2px solid #263B5E",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              📚 Get Full Genesis Pack
            </Link>
          </div>

          {/* Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            {BADGES.map((b) => (
              <span
                key={b.label}
                style={{
                  padding: "6px 14px",
                  backgroundColor: "#FFFFFF",
                  color: "#263B5E",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "'Nunito', sans-serif",
                  border: "1px solid #EFE4D0",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* Mockup */}
        <div
          style={{
            maxWidth: "700px",
            margin: "48px auto 0",
            backgroundColor: "#FFFFFF",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 20px 60px rgba(38,59,94,0.12)",
            border: "1px solid #EFE4D0",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            {[
              { emoji: "🌍", label: "God Creates the World", ref: "Gen 1:1" },
              { emoji: "⛵", label: "Noah's Ark", ref: "Gen 6:22" },
              { emoji: "🌈", label: "Rainbow Promise", ref: "Gen 9:13" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  backgroundColor: "#F8F1E7",
                  borderRadius: "16px",
                  padding: "20px 12px",
                  textAlign: "center",
                  border: "1px solid #EFE4D0",
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>{item.emoji}</div>
                <div style={{ fontSize: "12px", fontFamily: "'Cormorant Garamond', serif", color: "#263B5E", fontWeight: 700, lineHeight: 1.3, marginBottom: "4px" }}>{item.label}</div>
                <div style={{ fontSize: "10px", color: "#C76F4A", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>{item.ref}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
            📖 12 Stories · 🎨 35+ Coloring Pages · 🎮 5 Games · 🏅 6 Badges
          </div>
        </div>
      </section>

      {/* ===== PROBLEM SECTION ===== */}
      <section
        style={{
          padding: "80px 16px",
          maxWidth: "860px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
          For Christian Families
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 44px)", color: "#263B5E", marginBottom: "20px", fontWeight: 700 }}>
          Teaching the Bible Should Feel Simple, Joyful, and Engaging
        </h2>
        <p style={{ fontSize: "16px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", lineHeight: 1.8, maxWidth: "660px", margin: "0 auto" }}>
          Many parents want to teach their children God's Word, but kids are often distracted by screens, short attention spans, and boring lessons. Bible Coloring Journey turns Bible learning into a creative, interactive, and faith-filled experience.
        </p>
      </section>

      {/* ===== BENEFITS ===== */}
      <section style={{ backgroundColor: "#FFFFFF", padding: "80px 16px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              Why Families Love It
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 44px)", color: "#263B5E", fontWeight: 700 }}>
              Everything You Need to Make Bible Time Special
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                style={{
                  backgroundColor: "#F8F1E7",
                  borderRadius: "20px",
                  padding: "28px",
                  border: "1px solid #EFE4D0",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.transform = "translateY(0)")}
              >
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>{benefit.emoji}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#263B5E", marginBottom: "8px", fontWeight: 700 }}>
                  {benefit.title}
                </h3>
                <p style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", lineHeight: 1.6 }}>
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES PREVIEW ===== */}
      <section style={{ padding: "80px 16px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              Interactive Experience
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 44px)", color: "#263B5E", fontWeight: 700, marginBottom: "8px" }}>
              A Complete Bible Learning Experience
            </h2>
            <p style={{ fontSize: "15px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
              Everything your child needs to explore Genesis — all in one place.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
            {FEATURES.map((feature) => (
              <Link key={feature.href} href={feature.href} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "20px",
                    padding: "24px",
                    border: "1px solid #EFE4D0",
                    textAlign: "center",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(122,78,45,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(122,78,45,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(122,78,45,0.06)";
                  }}
                >
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>{feature.emoji}</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", color: "#263B5E", marginBottom: "4px", fontWeight: 700 }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                    {feature.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT'S INCLUDED ===== */}
      <section style={{ backgroundColor: "#263B5E", padding: "80px 16px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "13px", color: "#A9C8D8", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              Everything Included
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 44px)", color: "#D8B76A", fontWeight: 700 }}>
              What's Inside the Genesis Pack
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
            {INCLUDED.map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ width: "22px", height: "22px", backgroundColor: "#D8B76A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                  <Check size={13} color="#263B5E" />
                </div>
                <span style={{ fontSize: "15px", color: "#FFFFFF", fontFamily: "'Nunito', sans-serif", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: "80px 16px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              Simple Steps
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 44px)", color: "#263B5E", fontWeight: 700 }}>
              How It Works
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "24px" }}>
            {STEPS.map((step) => (
              <div key={step.step} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "#A9C8D8",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontSize: "28px",
                  }}
                >
                  {step.emoji}
                </div>
                <div style={{ fontSize: "12px", color: "#C76F4A", fontFamily: "'Nunito', sans-serif", fontWeight: 800, marginBottom: "6px" }}>
                  Step {step.step}
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#263B5E", marginBottom: "6px", fontWeight: 700 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "13px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OFFER SECTION ===== */}
      <section style={{ backgroundColor: "#F8F1E7", padding: "80px 16px" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            Special Offer
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 44px)", color: "#263B5E", fontWeight: 700, marginBottom: "8px" }}>
            Genesis Coloring Book for Kids
          </h2>
          <p style={{ fontSize: "14px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", marginBottom: "24px" }}>
            Creation, Noah, Abraham, Joseph and More Bible Stories to Color
          </p>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "28px",
              padding: "40px 32px",
              border: "2px solid #D8B76A",
              boxShadow: "0 8px 40px rgba(216,183,106,0.2)",
              marginBottom: "24px",
            }}
          >
            <div style={{ fontSize: "52px", fontWeight: 800, fontFamily: "'Nunito', sans-serif", color: "#263B5E", lineHeight: 1, marginBottom: "4px" }}>
              $9
            </div>
            <div style={{ fontSize: "14px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", marginBottom: "24px" }}>
              One-time payment · Instant access
            </div>

            {["Printable PDF (US Letter + A4)", "Interactive web activities", "12 Genesis Bible stories", "5 Bible games", "Bonus verse cards", "Certificate of completion", "Personal use license"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", textAlign: "left" }}>
                <Check size={15} color="#8E9672" />
                <span style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>{item}</span>
              </div>
            ))}

            <Link
              href="/unlock"
              style={{
                display: "block",
                marginTop: "24px",
                padding: "16px",
                backgroundColor: "#C76F4A",
                color: "#FFFFFF",
                borderRadius: "16px",
                fontSize: "17px",
                fontWeight: 800,
                fontFamily: "'Nunito', sans-serif",
                textDecoration: "none",
                textAlign: "center",
                boxShadow: "0 4px 16px rgba(199,111,74,0.3)",
              }}
            >
              Get Instant Access →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FUTURE COLLECTION ===== */}
      <section style={{ backgroundColor: "#FFFFFF", padding: "80px 16px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              Coming Soon
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 44px)", color: "#263B5E", fontWeight: 700 }}>
              The Bible Coloring Journey Collection
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            {FUTURE_BOOKS.map((book) => (
              <div
                key={book.title}
                style={{
                  backgroundColor: "#F8F1E7",
                  borderRadius: "18px",
                  padding: "24px 16px",
                  textAlign: "center",
                  border: "1px solid #EFE4D0",
                  opacity: 0.8,
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>{book.emoji}</div>
                <div style={{ fontSize: "13px", fontFamily: "'Cormorant Garamond', serif", color: "#263B5E", fontWeight: 700, marginBottom: "6px", lineHeight: 1.3 }}>{book.title}</div>
                <div style={{ fontSize: "10px", color: "#D8B76A", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>{book.status}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/waitlist" style={{ padding: "12px 28px", backgroundColor: "#263B5E", color: "#FFFFFF", borderRadius: "24px", fontSize: "14px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", textDecoration: "none" }}>
              Join the Waitlist
            </Link>
          </div>
        </div>
      </section>

      {/* ===== WHO IS THIS FOR ===== */}
      <section style={{ padding: "80px 16px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            Perfect For
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 44px)", color: "#263B5E", fontWeight: 700, marginBottom: "32px" }}>
            Made for Christian Families & Educators
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
            {[
              { emoji: "👩", label: "Christian Moms" },
              { emoji: "🏠", label: "Homeschool Families" },
              { emoji: "⛪", label: "Sunday School Teachers" },
              { emoji: "🙏", label: "Churches & Kids Ministries" },
              { emoji: "👴", label: "Christian Grandparents" },
              { emoji: "🎒", label: "Christian Schools" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  padding: "20px",
                  border: "1px solid #EFE4D0",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>{item.emoji}</div>
                <div style={{ fontSize: "14px", fontFamily: "'Nunito', sans-serif", color: "#263B5E", fontWeight: 700 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section style={{ backgroundColor: "#FFFFFF", padding: "80px 16px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              FAQ
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 44px)", color: "#263B5E", fontWeight: 700 }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                style={{
                  backgroundColor: "#F8F1E7",
                  borderRadius: "16px",
                  border: "1px solid #EFE4D0",
                  overflow: "hidden",
                }}
              >
                <summary
                  style={{
                    padding: "18px 20px",
                    cursor: "pointer",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#263B5E",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {faq.q}
                  <ChevronDown size={18} color="#C76F4A" style={{ flexShrink: 0 }} />
                </summary>
                <div style={{ padding: "0 20px 18px", fontSize: "15px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section
        style={{
          background: "linear-gradient(135deg, #263B5E 0%, #1a2940 100%)",
          padding: "80px 16px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✝️</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 48px)", color: "#D8B76A", fontWeight: 700, marginBottom: "16px" }}>
            Start the Bible Coloring Journey Today
          </h2>
          <p style={{ fontSize: "16px", color: "#A9C8D8", fontFamily: "'Nunito', sans-serif", lineHeight: 1.7, marginBottom: "32px" }}>
            Help your child discover the beauty of God's Word through creative, joyful, and faith-filled activities.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/free-adventure"
              style={{
                padding: "14px 32px",
                backgroundColor: "#D8B76A",
                color: "#263B5E",
                borderRadius: "32px",
                fontSize: "16px",
                fontWeight: 800,
                fontFamily: "'Nunito', sans-serif",
                textDecoration: "none",
              }}
            >
              ✨ Start Free Adventure
            </Link>
            <Link
              href="/unlock"
              style={{
                padding: "14px 32px",
                backgroundColor: "transparent",
                color: "#FFFFFF",
                borderRadius: "32px",
                fontSize: "16px",
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                textDecoration: "none",
                border: "2px solid #FFFFFF55",
              }}
            >
              Get Full Pack — $9
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
