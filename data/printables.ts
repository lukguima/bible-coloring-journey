export interface Printable {
  id: string;
  title: string;
  description: string;
  type: "Coloring Page" | "Activity" | "Verse Card" | "Certificate" | "Lesson Pack" | "Parent Guide";
  status: "free" | "premium";
  thumbnail: string;
  downloadUrl: string;
  emoji: string;
  format?: string;
}

export const printables: Printable[] = [
  {
    id: "creation-coloring",
    title: "God Creates the World",
    description: "Beautiful line art coloring page of the creation story for kids to color and enjoy.",
    type: "Coloring Page",
    status: "free",
    thumbnail: "",
    downloadUrl: "/downloads/creation-coloring.pdf",
    emoji: "🌍",
    format: "PDF",
  },
  {
    id: "noahs-ark-coloring",
    title: "Noah's Ark",
    description: "A detailed Noah's Ark scene with animals perfect for little colorists.",
    type: "Coloring Page",
    status: "free",
    thumbnail: "",
    downloadUrl: "/downloads/noahs-ark-coloring.pdf",
    emoji: "⛵",
    format: "PDF",
  },
  {
    id: "rainbow-verse-card",
    title: "Rainbow Promise Verse Card",
    description: "Genesis 9:13 verse card with rainbow illustration — beautiful to print and display.",
    type: "Verse Card",
    status: "free",
    thumbnail: "",
    downloadUrl: "/downloads/rainbow-verse-card.pdf",
    emoji: "🌈",
    format: "PDF",
  },
  {
    id: "full-genesis-pdf",
    title: "Full Genesis Coloring Book PDF",
    description: "All 35+ coloring and activity pages for the complete Genesis story collection.",
    type: "Coloring Page",
    status: "premium",
    thumbnail: "",
    downloadUrl: "/downloads/genesis-full-book.pdf",
    emoji: "📚",
    format: "US Letter + A4",
  },
  {
    id: "bible-verse-cards",
    title: "Bible Verse Cards Set",
    description: "Beautifully designed verse cards for all Genesis stories — perfect for memorization.",
    type: "Verse Card",
    status: "premium",
    thumbnail: "",
    downloadUrl: "/downloads/verse-cards.pdf",
    emoji: "✨",
    format: "PDF",
  },
  {
    id: "sunday-school-pack",
    title: "Sunday School Mini Lesson Pack",
    description: "Ready-to-use lesson materials for Sunday school teachers — activities, questions, and guides.",
    type: "Lesson Pack",
    status: "premium",
    thumbnail: "",
    downloadUrl: "/downloads/sunday-school-pack.pdf",
    emoji: "✏️",
    format: "PDF",
  },
  {
    id: "parent-reflection",
    title: "Parent Reflection Page",
    description: "Thoughtful conversation starters and reflection prompts for parents to use with each story.",
    type: "Parent Guide",
    status: "premium",
    thumbnail: "",
    downloadUrl: "/downloads/parent-reflection.pdf",
    emoji: "💬",
    format: "PDF",
  },
  {
    id: "certificate",
    title: "Certificate of Completion",
    description: "A beautiful, printable certificate for kids who complete the Genesis Adventure!",
    type: "Certificate",
    status: "premium",
    thumbnail: "",
    downloadUrl: "/downloads/certificate.pdf",
    emoji: "🏆",
    format: "US Letter + A4",
  },
  {
    id: "a4-format",
    title: "A4 Format Collection",
    description: "All coloring pages formatted for A4 paper — perfect for international families.",
    type: "Coloring Page",
    status: "premium",
    thumbnail: "",
    downloadUrl: "/downloads/genesis-a4.pdf",
    emoji: "📄",
    format: "A4",
  },
];
