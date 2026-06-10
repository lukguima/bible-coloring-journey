export interface Collection {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  coverImage: string;
  status: "draft" | "active" | "archived";
  audience: string;
  ageRange: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  collectionId: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  productType: "ebook" | "bundle" | "membership" | "license";
  status: "draft" | "active" | "hidden" | "archived";
  accessLevel: "free" | "premium";
  checkoutUrl: string;
  coverImage: string;
  mockupImage: string;
  includedItems: string[];
  bonuses: string[];
  targetAudience: string;
  ageRange: string;
  format: string;
  licenseType: "personal" | "classroom" | "church";
  releaseDate: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Drawing {
  id: string;
  collectionId: string;
  storyId: string;
  title: string;
  slug: string;
  description: string;
  bibleReference: string;
  lesson: string;
  reflectionQuestion: string;
  imageUrl: string;
  svgContent: string;
  printablePdfUrl: string;
  thumbnailUrl: string;
  status: "draft" | "active" | "hidden";
  accessLevel: "free" | "premium";
  difficulty: "easy" | "medium";
  ageRange: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  collectionId: string;
  title: string;
  slug: string;
  reference: string;
  shortDescription: string;
  storyText: string;
  lesson: string;
  reflectionQuestion: string;
  status: "draft" | "active" | "hidden";
  accessLevel: "free" | "premium";
  relatedDrawingId: string;
  relatedGameId: string | null;
  displayOrder: number;
  icon: string;
  emoji: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructions: string;
  gameType: "matching" | "order" | "puzzle" | "quiz" | "find";
  collectionId: string;
  relatedStoryId: string;
  badgeId: string;
  status: "draft" | "active" | "hidden";
  accessLevel: "free" | "premium";
  configJson: string;
  emoji: string;
  ageRange: string;
  badge: string;
  createdAt: string;
  updatedAt: string;
}

export interface Printable {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "coloring-page" | "activity" | "verse-card" | "certificate" | "parent-guide" | "teacher-guide" | "full-pdf";
  collectionId: string;
  productId: string;
  accessLevel: "free" | "premium";
  fileUrl: string;
  thumbnailUrl: string;
  format: "US Letter" | "A4" | "Both";
  status: "draft" | "active" | "hidden";
  emoji: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  requirement: string;
  color: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "promo" | "launch" | "update";
  placement: "home" | "topbar" | "dashboard" | "printables" | "unlock" | "all";
  ctaLabel: string;
  ctaUrl: string;
  backgroundColor: string;
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "scheduled" | "expired";
  createdAt: string;
  updatedAt: string;
}

export interface Launch {
  id: string;
  title: string;
  slug: string;
  description: string;
  productId: string;
  launchDate: string;
  preLaunchStartDate: string;
  status: "planning" | "prelaunch" | "live" | "closed";
  waitlistEnabled: boolean;
  bannerImage: string;
  ctaLabel: string;
  ctaUrl: string;
  emailSequenceNotes: string;
  offerDetails: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  productIds: string[];
  startDate: string;
  endDate: string;
  maxUses: number;
  currentUses: number;
  status: "active" | "inactive" | "expired";
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: "waitlist" | "free-adventure" | "lead-magnet";
  interestedBook: string;
  tags: string[];
  createdAt: string;
}

export interface MediaItem {
  id: string;
  title: string;
  fileType: "image" | "pdf" | "svg" | "other";
  url: string;
  altText: string;
  tags: string[];
  createdAt: string;
}

export interface CustomerInfo {
  id: string;
  title: string;
  content: string;
  placement: "home" | "unlock" | "printables" | "guide" | "global";
  status: "active" | "inactive";
  updatedAt: string;
}

export interface PlatformSettings {
  siteName: string;
  brandSlogan: string;
  supportEmail: string;
  checkoutUrl: string;
  currency: string;
  primaryProduct: string;
  freeAccessEnabled: boolean;
  maintenanceMode: boolean;
  announcementBarEnabled: boolean;
  defaultLanguage: string;
  licenseText: string;
}

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ProgressState {
  completedStories: string[];
  completedGames: string[];
  earnedBadges: string[];
  lastActivity: string | null;
  coloringProgress: Record<string, Record<string, string>>;
}
