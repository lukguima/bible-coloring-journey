export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  badge: string;
  badgeId: string;
  status: "free" | "premium";
  emoji: string;
  ageRange: string;
}

export const games: Game[] = [
  {
    id: "match-the-animals",
    slug: "match-the-animals",
    title: "Match the Animals",
    description: "Help the animals find their pairs to enter Noah's Ark! Match each animal with its partner.",
    badge: "Ark Helper",
    badgeId: "ark-helper",
    status: "free",
    emoji: "🦁",
    ageRange: "Ages 4–7",
  },
  {
    id: "creation-order",
    slug: "creation-order",
    title: "Creation Order",
    description: "Can you put the days of creation in the right order? Arrange them correctly!",
    badge: "Creation Explorer",
    badgeId: "creation-explorer",
    status: "free",
    emoji: "🌍",
    ageRange: "Ages 5–9",
  },
  {
    id: "verse-puzzle",
    slug: "verse-puzzle",
    title: "Bible Verse Puzzle",
    description: "Put the words of a Bible verse in the right order to build a verse from memory!",
    badge: "Verse Builder",
    badgeId: "verse-builder",
    status: "free",
    emoji: "📖",
    ageRange: "Ages 6–9",
  },
  {
    id: "rainbow-quiz",
    slug: "rainbow-quiz",
    title: "Rainbow Promise Quiz",
    description: "Answer questions about Noah and God's rainbow promise. How many can you get right?",
    badge: "Promise Keeper",
    badgeId: "promise-keeper",
    status: "free",
    emoji: "🌈",
    ageRange: "Ages 4–9",
  },
  {
    id: "find-the-stars",
    slug: "find-the-stars",
    title: "Find the Stars",
    description: "Search the night sky to find hidden stars — just like Abraham counting God's promises!",
    badge: "Star Finder",
    badgeId: "star-finder",
    status: "free",
    emoji: "⭐",
    ageRange: "Ages 4–7",
  },
];
