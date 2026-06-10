import Link from "next/link";

const SECTIONS = [
  {
    title: "How to Use at Home",
    emoji: "🏠",
    content: [
      "Set aside 15–20 minutes, 2–3 times a week for Bible Coloring Journey.",
      "Read the story together with your child and discuss the lesson.",
      "Let your child color the page while you review the memory verse.",
      "Ask the reflection question and listen to their answer — there's no wrong answer!",
      "Celebrate their progress and completed badges.",
    ],
  },
  {
    title: "How to Use in Sunday School",
    emoji: "⛪",
    content: [
      "Print the week's coloring page for each child before class.",
      "Read the story aloud or have older children take turns reading.",
      "Give children time to color while you discuss the lesson.",
      "Use the reflection questions for group discussion.",
      "Reward completed games and stories with badges or stickers.",
    ],
  },
  {
    title: "How to Use for Homeschool",
    emoji: "📚",
    content: [
      "Use Bible Coloring Journey as part of your morning Bible time.",
      "Pair each story with related crafts, songs, or activities.",
      "Use the verse cards for daily scripture memorization.",
      "Track progress using the digital progress tracker.",
      "Use the parent guide to spark deeper conversations.",
    ],
  },
  {
    title: "Printing Tips",
    emoji: "🖨️",
    content: [
      "Print in black and white to save ink — the pages are designed for this.",
      "Use regular copy paper or cardstock for better durability.",
      "For best results, print at 100% scale — do not scale to fit.",
      "US Letter (8.5×11) and A4 formats are both included.",
      "Laminate completed pages for a keepsake your child will treasure.",
    ],
  },
];

const WEEK_PLAN = [
  { week: "Week 1", title: "Creation", story: "God Creates the World", verse: "Genesis 1:1", activity: "Creation Order game" },
  { week: "Week 2", title: "Noah and the Ark", story: "Noah Builds the Ark", verse: "Genesis 6:22", activity: "Match the Animals game" },
  { week: "Week 3", title: "Rainbow Promise", story: "The Rainbow Promise", verse: "Genesis 9:13", activity: "Rainbow Promise Quiz" },
  { week: "Week 4", title: "Abraham and the Stars", story: "Abraham Looks at the Stars", verse: "Genesis 15:5", activity: "Find the Stars game" },
  { week: "Week 5", title: "Joseph and Forgiveness", story: "Joseph Forgives His Brothers", verse: "Genesis 50:20", activity: "Bible Verse Puzzle" },
];

const STARTERS = [
  "What is your favorite thing God made? Why?",
  "How did Noah show that he trusted God?",
  "Have you ever seen a rainbow? What did you think about?",
  "If God made a promise to you, what do you think it would be?",
  "Why is it important to forgive someone who hurt you?",
  "What is something you can do to show God you love Him today?",
];

export default function GuidePage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F1E7" }}>
      <div style={{ background: "linear-gradient(135deg, #8E967222, #A9C8D822)", padding: "48px 16px", textAlign: "center", borderBottom: "1px solid #EFE4D0" }}>
        <div style={{ fontSize: "13px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          📖 Parent & Teacher Guide
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 48px)", color: "#263B5E", marginBottom: "10px", fontWeight: 700 }}>
          How to Use Bible Coloring Journey
        </h1>
        <p style={{ fontSize: "15px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", maxWidth: "500px", margin: "0 auto" }}>
          A simple guide for parents, homeschool families, and Sunday school teachers.
        </p>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 16px 80px" }}>
        {/* Sections */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px", marginBottom: "56px" }}>
          {SECTIONS.map((section) => (
            <div key={section.title} style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "28px", border: "1px solid #EFE4D0", boxShadow: "0 1px 4px rgba(122,78,45,0.06)" }}>
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>{section.emoji}</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", color: "#263B5E", marginBottom: "16px", fontWeight: 700 }}>
                {section.title}
              </h2>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {section.content.map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                    <span style={{ color: "#C76F4A", fontSize: "14px", fontFamily: "'Nunito', sans-serif", marginTop: "2px", flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", lineHeight: 1.5 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Weekly Plan */}
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", color: "#263B5E", marginBottom: "24px", fontWeight: 700 }}>
          Suggested Weekly Plan
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "48px" }}>
          {WEEK_PLAN.map((w, i) => (
            <div key={w.week} style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", border: "1px solid #EFE4D0", display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ minWidth: "70px", padding: "6px 12px", backgroundColor: i % 2 === 0 ? "#A9C8D8" : "#D8B76A", borderRadius: "20px", textAlign: "center", fontSize: "12px", fontWeight: 800, fontFamily: "'Nunito', sans-serif", color: "#263B5E" }}>
                {w.week}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 700, color: "#263B5E", marginBottom: "4px" }}>{w.title}</div>
                <div style={{ fontSize: "13px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif" }}>
                  📖 {w.story} · <span style={{ color: "#C76F4A", fontWeight: 600 }}>{w.verse}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#8E9672", fontFamily: "'Nunito', sans-serif", marginTop: "2px" }}>
                  🎮 Activity: {w.activity}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Conversation starters */}
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", color: "#263B5E", marginBottom: "16px", fontWeight: 700 }}>
          Conversation Starters
        </h2>
        <p style={{ fontSize: "14px", color: "#7A4E2D", fontFamily: "'Nunito', sans-serif", marginBottom: "20px" }}>
          Use these questions after reading each story to spark meaningful family conversations.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px", marginBottom: "48px" }}>
          {STARTERS.map((q, i) => (
            <div key={i} style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", padding: "16px 18px", border: "1px solid #EFE4D0", display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "18px", flexShrink: 0 }}>💬</span>
              <p style={{ fontSize: "14px", color: "#263B5E", fontFamily: "'Nunito', sans-serif", lineHeight: 1.5, margin: 0 }}>{q}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "linear-gradient(135deg, #263B5E, #1a2940)", borderRadius: "24px", padding: "40px 32px", textAlign: "center" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#D8B76A", marginBottom: "8px" }}>
            Ready to Start?
          </h3>
          <p style={{ fontSize: "15px", color: "#A9C8D8", fontFamily: "'Nunito', sans-serif", marginBottom: "24px" }}>
            Jump into your first free story and see how much your child loves it!
          </p>
          <Link href="/free-adventure" style={{ display: "inline-block", padding: "14px 32px", backgroundColor: "#D8B76A", color: "#263B5E", borderRadius: "32px", fontSize: "16px", fontWeight: 800, fontFamily: "'Nunito', sans-serif", textDecoration: "none" }}>
            Start Free Adventure
          </Link>
        </div>
      </div>
    </div>
  );
}
