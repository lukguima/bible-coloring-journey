export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  requirement: string;
  color: string;
}

export const badges: Badge[] = [
  {
    id: "creation-explorer",
    title: "Creation Explorer",
    description: "You learned how God made the whole world!",
    emoji: "🌍",
    requirement: "Complete the Creation Order game",
    color: "#A9C8D8",
  },
  {
    id: "ark-helper",
    title: "Ark Helper",
    description: "You helped the animals find their pairs for the ark!",
    emoji: "⛵",
    requirement: "Complete the Match the Animals game",
    color: "#8E9672",
  },
  {
    id: "promise-keeper",
    title: "Promise Keeper",
    description: "You know that God always keeps His promises!",
    emoji: "🌈",
    requirement: "Complete the Rainbow Promise Quiz",
    color: "#C76F4A",
  },
  {
    id: "verse-builder",
    title: "Verse Builder",
    description: "You can build a Bible verse from memory!",
    emoji: "📖",
    requirement: "Complete the Bible Verse Puzzle",
    color: "#D8B76A",
  },
  {
    id: "star-finder",
    title: "Star Finder",
    description: "You found all the stars in Abraham's night sky!",
    emoji: "⭐",
    requirement: "Complete the Find the Stars game",
    color: "#263B5E",
  },
  {
    id: "genesis-adventurer",
    title: "Genesis Adventurer",
    description: "You completed 3 stories and 3 games — amazing job!",
    emoji: "🏆",
    requirement: "Complete 3 stories and 3 games",
    color: "#D8B76A",
  },
];
