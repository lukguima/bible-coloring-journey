"use client";

import { useState, useEffect, useCallback } from "react";
import type { StoryBrief, GeneratedAsset, ContentEngineProject } from "@/types/content-engine";
import { generateAssetsFromBrief } from "@/lib/content-engine/generators";

const PROJECTS_KEY = "bcj_content_engine_projects";
const CURRENT_KEY = "bcj_content_engine_current_project";

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function useContentEngine() {
  const [projects, setProjects] = useState<ContentEngineProject[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProjects(readLocal<ContentEngineProject[]>(PROJECTS_KEY, []));
    setIsLoaded(true);
  }, []);

  const persist = (updated: ContentEngineProject[]) => {
    setProjects(updated);
    writeLocal(PROJECTS_KEY, updated);
  };

  const createProject = useCallback((brief: StoryBrief): ContentEngineProject => {
    const now = new Date().toISOString();
    const project: ContentEngineProject = {
      id: `ce-${Date.now()}`,
      brief,
      assets: [],
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    const updated = [project, ...projects];
    persist(updated);
    writeLocal(CURRENT_KEY, project.id);
    return project;
  }, [projects]);

  const generateAssets = useCallback((brief: StoryBrief): ContentEngineProject => {
    const assets = generateAssetsFromBrief(brief);
    const now = new Date().toISOString();
    const project: ContentEngineProject = {
      id: `ce-${Date.now()}`,
      brief: { ...brief, updatedAt: now },
      assets,
      status: "generated",
      createdAt: now,
      updatedAt: now,
    };
    const existing = projects.filter((p) => p.brief.storyTitle !== brief.storyTitle);
    persist([project, ...existing]);
    writeLocal(CURRENT_KEY, project.id);
    return project;
  }, [projects]);

  const updateProject = useCallback((projectId: string, payload: Partial<ContentEngineProject>) => {
    const updated = projects.map((p) =>
      p.id === projectId ? { ...p, ...payload, updatedAt: new Date().toISOString() } : p
    );
    persist(updated);
  }, [projects]);

  const deleteProject = useCallback((projectId: string) => {
    persist(projects.filter((p) => p.id !== projectId));
  }, [projects]);

  const updateAsset = useCallback((projectId: string, assetId: string, content: string) => {
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        assets: p.assets.map((a) =>
          a.id === assetId ? { ...a, content, status: "edited" as const, updatedAt: new Date().toISOString() } : a
        ),
        updatedAt: new Date().toISOString(),
      };
    });
    persist(updated);
  }, [projects]);

  const publishAssets = useCallback((project: ContentEngineProject, selectedTypes: string[]) => {
    const { brief, assets } = project;
    const now = new Date().toISOString();
    const slug = brief.storyTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const get = (type: GeneratedAsset["type"]) =>
      assets.find((a) => a.type === type)?.content || "";

    if (selectedTypes.includes("story")) {
      const stories = readLocal<unknown[]>("bcj_ce_stories", []);
      const story = {
        id: `story-ce-${Date.now()}`,
        slug,
        title: brief.storyTitle,
        bibleReference: brief.bibleReference,
        collection: brief.collectionId,
        summary: brief.storySummary,
        lesson: brief.lesson,
        reflectionQuestion: brief.reflectionQuestion,
        content: get("story_text"),
        status: "active",
        accessLevel: brief.accessLevel,
        difficulty: brief.difficulty,
        ageRange: brief.targetAgeRange,
        themes: brief.themes,
        characters: brief.keyCharacters,
        createdAt: now,
      };
      writeLocal("bcj_ce_stories", [story, ...stories]);
    }

    if (selectedTypes.includes("drawing")) {
      const drawings = readLocal<unknown[]>("bcj_drawings", []);
      const drawing = {
        id: `drw-ce-${Date.now()}`,
        title: `${brief.storyTitle} Coloring Page`,
        slug: `${slug}-coloring`,
        bibleReference: brief.bibleReference,
        lesson: brief.lesson,
        reflectionQuestion: brief.reflectionQuestion,
        description: get("printable_description"),
        coloringPrompt: get("coloring_prompt"),
        svgContent: "",
        imageUrl: "",
        printablePdfUrl: "",
        thumbnailUrl: "",
        accessLevel: brief.accessLevel,
        difficulty: brief.difficulty,
        ageRange: brief.targetAgeRange,
        collectionId: brief.collectionId,
        status: "active",
        tags: brief.themes,
        createdAt: now,
        updatedAt: now,
      };
      writeLocal("bcj_drawings", [drawing, ...drawings]);
    }

    if (selectedTypes.includes("product")) {
      const products = readLocal<unknown[]>("bcj_products", []);
      const product = {
        id: `prod-ce-${Date.now()}`,
        name: `${brief.storyTitle} Printable Activity Pack`,
        description: get("product_description"),
        price: 9,
        currency: "USD",
        accessLevel: "premium",
        status: "draft",
        checkoutUrl: "",
        createdAt: now,
        updatedAt: now,
      };
      writeLocal("bcj_products", [product, ...products]);
    }

    if (selectedTypes.includes("announcement")) {
      const announcements = readLocal<unknown[]>("bcj_announcements", []);
      const ann = {
        id: `ann-ce-${Date.now()}`,
        title: `New Activity: ${brief.storyTitle} is here!`,
        message: `Discover the story of ${brief.storyTitle} (${brief.bibleReference}) with our new printable activity pack.`,
        type: "info",
        color: "#263B5E",
        placement: "homepage",
        active: true,
        createdAt: now,
        updatedAt: now,
      };
      writeLocal("bcj_announcements", [ann, ...announcements]);
    }

    if (selectedTypes.includes("launch")) {
      const launches = readLocal<unknown[]>("bcj_launches", []);
      const launch = {
        id: `launch-ce-${Date.now()}`,
        title: `${brief.storyTitle} Activity Launch`,
        description: `Launch campaign for the ${brief.storyTitle} activity pack.`,
        status: "planned",
        waitlistEnabled: true,
        emailNotes: get("email_launch_copy"),
        createdAt: now,
        updatedAt: now,
      };
      writeLocal("bcj_launches", [launch, ...launches]);
    }

    updateProject(project.id, { status: "published" });
  }, [projects, updateProject]);

  const exportProjectAsJson = (project: ContentEngineProject): string =>
    JSON.stringify(project, null, 2);

  const exportProjectAsMarkdown = (project: ContentEngineProject): string => {
    const { brief, assets } = project;
    const get = (type: GeneratedAsset["type"]) =>
      assets.find((a) => a.type === type)?.content || "_Not generated_";

    return `# ${brief.storyTitle}
*${brief.bibleReference} | ${brief.bookName} | ${brief.targetAgeRange}*

---

## Story Brief

- **Collection:** ${brief.collectionId}
- **Lesson:** ${brief.lesson}
- **Reflection:** ${brief.reflectionQuestion}
- **Characters:** ${brief.keyCharacters.join(", ")}
- **Objects:** ${brief.keyObjects.join(", ")}
- **Themes:** ${brief.themes.join(", ")}
- **Visual Tone:** ${brief.visualTone}

---

## Story Text

${get("story_text")}

---

## Coloring Page Prompt

${get("coloring_prompt")}

---

## Verse Card Prompt

${get("verse_card_prompt")}

---

## Activity Page Prompt

${get("activity_prompt")}

---

## Quiz Config

\`\`\`json
${get("quiz_config")}
\`\`\`

---

## Matching Game Config

\`\`\`json
${get("matching_game_config")}
\`\`\`

---

## Find Object Game Config

\`\`\`json
${get("find_object_game_config")}
\`\`\`

---

## Parent Guide

${get("parent_guide")}

---

## Teacher Guide

${get("teacher_guide")}

---

## Printable Description

${get("printable_description")}

---

## Product Description

${get("product_description")}

---

## Sales Page Copy

${get("sales_page_copy")}

---

## Pinterest Copy

${get("pinterest_copy")}

---

## Facebook Ad Copy

${get("facebook_ad_copy")}

---

## Instagram Caption

${get("instagram_caption")}

---

## Email Launch Copy

${get("email_launch_copy")}
`;
  };

  const resetEngine = () => {
    persist([]);
    try { localStorage.removeItem(CURRENT_KEY); } catch {}
  };

  return {
    projects,
    isLoaded,
    generateAssets,
    createProject,
    updateProject,
    deleteProject,
    updateAsset,
    publishAssets,
    exportProjectAsJson,
    exportProjectAsMarkdown,
    resetEngine,
  };
}
