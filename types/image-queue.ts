export type ImageJobStatus =
  | "pending"
  | "sent_to_flow"
  | "generating"
  | "generated"
  | "uploaded"
  | "approved"
  | "rejected"
  | "published"
  | "failed";

export interface ImageGenerationJob {
  id: string;
  source: "content_engine" | "drawings" | "manual";
  sourceId?: string;
  collectionId?: string;
  storyId?: string;
  drawingId?: string;
  title: string;
  prompt: string;
  negativePrompt?: string;
  imageType:
    | "coloring_page"
    | "cover"
    | "verse_card"
    | "activity_page"
    | "mockup"
    | "ad_creative"
    | "thumbnail";
  /** PORTRAIT for coloring pages / verse cards / activity pages (print vertical).
   *  LANDSCAPE for covers, thumbnails, ads. */
  orientation: "PORTRAIT" | "LANDSCAPE";
  status: ImageJobStatus;
  priority: "low" | "normal" | "high";
  productId?: string;
  book?: string;
  chapter?: number;
  verse?: string;
  pageOrder?: number;
  flowProjectName?: string;
  generatedImageUrl?: string;
  localFileName?: string;
  notes?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  generatedAt?: string;
  approvedAt?: string;
  publishedAt?: string;
}

/** Format exported for the Flow Image Worker Chrome extension */
export interface FlowQueueExport {
  project: string;
  targetTool: "Google Flow";
  exportedAt: string;
  jobs: FlowJobExport[];
}

export interface FlowJobExport {
  jobId: string;
  title: string;
  imageType: ImageGenerationJob["imageType"];
  /** PORTRAIT for print-friendly vertical format (coloring pages, verse cards).
   *  LANDSCAPE for 16:9 covers and ads. */
  orientation: "PORTRAIT" | "LANDSCAPE";
  prompt: string;
  negativePrompt: string;
  priority: ImageGenerationJob["priority"];
  metadata: {
    collectionId?: string;
    storyId?: string;
    drawingId?: string;
    sourceId?: string;
  };
}

/** Format imported back from the extension */
export interface FlowResultsImport {
  results: {
    jobId: string;
    status: "generated" | "uploaded" | "failed";
    generatedImageUrl?: string;
    localFileName?: string;
    notes?: string;
    errorMessage?: string;
  }[];
}
