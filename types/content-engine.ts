export type AccessLevel = "free" | "premium";
export type Difficulty = "easy" | "medium";
export type VisualTone = "joyful" | "peaceful" | "adventurous" | "gentle" | "celebratory";

export interface StoryBrief {
  id: string;
  collectionId: string;
  bookName: string;
  storyTitle: string;
  bibleReference: string;
  targetAgeRange: string;
  difficulty: Difficulty;
  accessLevel: AccessLevel;
  storySummary: string;
  lesson: string;
  reflectionQuestion: string;
  keyCharacters: string[];
  keyObjects: string[];
  themes: string[];
  visualTone: VisualTone;
  activityTypes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedAsset {
  id: string;
  briefId: string;
  type:
    | "story_text"
    | "coloring_prompt"
    | "verse_card_prompt"
    | "activity_prompt"
    | "quiz_config"
    | "matching_game_config"
    | "find_object_game_config"
    | "parent_guide"
    | "teacher_guide"
    | "printable_description"
    | "product_description"
    | "sales_page_copy"
    | "pinterest_copy"
    | "facebook_ad_copy"
    | "instagram_caption"
    | "email_launch_copy";
  title: string;
  content: string;
  format: "text" | "json" | "markdown";
  status: "generated" | "edited" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface ContentEngineProject {
  id: string;
  brief: StoryBrief;
  assets: GeneratedAsset[];
  status: "draft" | "generated" | "published";
  createdAt: string;
  updatedAt: string;
}
