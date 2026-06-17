"use client";

import { useState, useEffect } from "react";
import { Sparkles, Copy, Check, RefreshCw, Download, Upload, ChevronRight, Plus, X, Edit2, Save, SendHorizontal } from "lucide-react";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useContentEngine } from "@/hooks/useContentEngine";
import { useImageQueue } from "@/hooks/useImageQueue";
import { generateAssetsFromBrief } from "@/lib/content-engine/generators";
import type { StoryBrief, GeneratedAsset, ContentEngineProject } from "@/types/content-engine";

// ─── Sample data ────────────────────────────────────────────────────────────
const SAMPLE_BRIEFS: Partial<StoryBrief>[] = [
  {
    collectionId: "genesis",
    bookName: "Genesis",
    storyTitle: "God Creates the World",
    bibleReference: "Genesis 1:1",
    targetAgeRange: "Ages 4–9",
    difficulty: "easy",
    accessLevel: "free",
    storySummary: "In the beginning, God created the heavens and the earth. He made light, sky, land, plants, stars, animals, and people.",
    lesson: "God made everything with love.",
    reflectionQuestion: "What is your favorite thing God created?",
    keyCharacters: ["God"],
    keyObjects: ["sun", "moon", "stars", "clouds", "mountains", "trees", "flowers", "birds", "fish"],
    themes: ["creation", "love", "wonder"],
    visualTone: "joyful",
    activityTypes: ["Coloring Page", "Verse Card", "Quiz", "Parent Guide"],
  },
  {
    collectionId: "genesis",
    bookName: "Genesis",
    storyTitle: "Noah Builds the Ark",
    bibleReference: "Genesis 6:22",
    targetAgeRange: "Ages 4–9",
    difficulty: "easy",
    accessLevel: "free",
    storySummary: "Noah listened to God and built a big ark. He trusted God and obeyed Him, even when the task was very big.",
    lesson: "Noah obeyed God.",
    reflectionQuestion: "How can you obey God today?",
    keyCharacters: ["Noah"],
    keyObjects: ["ark", "animals", "tools", "clouds", "water"],
    themes: ["obedience", "trust", "faith"],
    visualTone: "adventurous",
    activityTypes: ["Coloring Page", "Matching Game", "Teacher Guide"],
  },
  {
    collectionId: "genesis",
    bookName: "Genesis",
    storyTitle: "The Rainbow Promise",
    bibleReference: "Genesis 9:13",
    targetAgeRange: "Ages 4–9",
    difficulty: "easy",
    accessLevel: "free",
    storySummary: "After the flood, God placed a rainbow in the sky as a promise. The rainbow reminds us that God keeps His promises.",
    lesson: "God keeps His promises.",
    reflectionQuestion: "What promise makes you feel happy?",
    keyCharacters: ["Noah"],
    keyObjects: ["rainbow", "clouds", "ark", "birds", "trees"],
    themes: ["promise", "hope", "faithfulness"],
    visualTone: "peaceful",
    activityTypes: ["Coloring Page", "Verse Card", "Find Object Game", "Parent Guide"],
  },
];

const EMPTY_BRIEF: Partial<StoryBrief> = {
  collectionId: "genesis",
  bookName: "",
  storyTitle: "",
  bibleReference: "",
  targetAgeRange: "Ages 4–9",
  difficulty: "easy",
  accessLevel: "free",
  storySummary: "",
  lesson: "",
  reflectionQuestion: "",
  keyCharacters: [],
  keyObjects: [],
  themes: [],
  visualTone: "joyful",
  activityTypes: [],
};

const ACTIVITY_OPTIONS = [
  "Coloring Page", "Verse Card", "Quiz", "Matching Game",
  "Find Object Game", "Maze", "Trace the Word", "Parent Guide",
  "Teacher Guide", "Sales Copy", "Social Media Copy",
];

const ASSET_TABS = [
  { id: "story", label: "Story" },
  { id: "images", label: "Image Prompts" },
  { id: "games", label: "Games" },
  { id: "guides", label: "Guides" },
  { id: "product", label: "Product" },
  { id: "marketing", label: "Marketing" },
  { id: "export", label: "Export" },
  { id: "publish", label: "Publish" },
];

const PUBLISH_OPTIONS = [
  { id: "story", label: "Create Story", description: "Save to bcj_ce_stories" },
  { id: "drawing", label: "Create Drawing", description: "Save to bcj_drawings with coloring prompt" },
  { id: "product", label: "Create Product Draft", description: "Save to bcj_products" },
  { id: "announcement", label: "Create Announcement", description: "Save to bcj_announcements" },
  { id: "launch", label: "Create Launch Draft", description: "Save to bcj_launches" },
];

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }: { message: string; type: "success" | "error"; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
      backgroundColor: type === "success" ? "#263B5E" : "#EF4444",
      color: "#FFFFFF", padding: "12px 20px", borderRadius: "12px",
      fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif",
      boxShadow: "0 8px 30px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: "8px",
    }}>
      {type === "success" ? <Check size={14} /> : <X size={14} />}
      {message}
    </div>
  );
}

// ─── Asset Card ──────────────────────────────────────────────────────────────
function AssetCard({
  asset,
  onCopy,
  onEdit,
  onRegenerate,
  onSendToQueue,
}: {
  asset: GeneratedAsset;
  onCopy: (content: string) => void;
  onEdit: (id: string, content: string) => void;
  onRegenerate?: () => void;
  onSendToQueue?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(asset.content);
  const [copied, setCopied] = useState(false);
  const [queued, setQueued] = useState(false);

  const isJson = asset.format === "json";

  const handleCopy = () => {
    navigator.clipboard.writeText(asset.content).catch(() => {});
    onCopy(asset.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = () => {
    onEdit(asset.id, draft);
    setEditing(false);
  };

  const statusColor = asset.status === "published" ? "#22C55E" : asset.status === "edited" ? "#F59E0B" : "#A9C8D8";

  return (
    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #F3F4F6", backgroundColor: "#F9FAFB" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif" }}>{asset.title}</span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: statusColor, backgroundColor: `${statusColor}22`, padding: "2px 8px", borderRadius: "20px", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase" }}>
            {asset.status}
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={handleCopy} title="Copy" style={{ padding: "5px 10px", border: "1px solid #E5E7EB", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: copied ? "#22C55E" : "#6B7280", fontSize: "11px", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
            {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? "Copied!" : "Copy"}
          </button>
          {!editing ? (
            <button onClick={() => { setDraft(asset.content); setEditing(true); }} title="Edit" style={{ padding: "5px 10px", border: "1px solid #E5E7EB", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#6B7280", fontSize: "11px", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
              <Edit2 size={11} /> Edit
            </button>
          ) : (
            <button onClick={handleSave} style={{ padding: "5px 10px", border: "none", borderRadius: "6px", backgroundColor: "#263B5E", cursor: "pointer", color: "#FFFFFF", fontSize: "11px", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700 }}>
              <Save size={11} /> Save
            </button>
          )}
          {onRegenerate && (
            <button onClick={onRegenerate} title="Regenerate" style={{ padding: "5px 8px", border: "1px solid #E5E7EB", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#6B7280" }}>
              <RefreshCw size={11} />
            </button>
          )}
          {onSendToQueue && (
            <button onClick={() => { onSendToQueue(); setQueued(true); setTimeout(() => setQueued(false), 2000); }} title="Send to Image Queue" style={{ padding: "5px 10px", border: "none", borderRadius: "6px", backgroundColor: queued ? "#16A34A" : "#7C3AED", cursor: "pointer", color: "#FFFFFF", fontSize: "11px", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700 }}>
              {queued ? <Check size={11} /> : <SendHorizontal size={11} />} {queued ? "Queued!" : "→ Queue"}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "0" }}>
        {editing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{ width: "100%", minHeight: "220px", padding: "16px", border: "none", outline: "none", fontSize: "12px", fontFamily: isJson ? "monospace" : "'Nunito', sans-serif", lineHeight: 1.6, color: "#1F2937", resize: "vertical", boxSizing: "border-box" }}
          />
        ) : isJson ? (
          <pre style={{ margin: 0, padding: "16px", fontSize: "11px", fontFamily: "monospace", lineHeight: 1.6, color: "#374151", backgroundColor: "#F8FAFC", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {asset.content}
          </pre>
        ) : (
          <div style={{ padding: "16px", fontSize: "13px", fontFamily: "'Nunito', sans-serif", lineHeight: 1.7, color: "#374151", whiteSpace: "pre-wrap", maxHeight: "300px", overflowY: "auto" }}>
            {asset.content}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ContentEnginePage() {
  const { projects, generateAssets, updateAsset, publishAssets, exportProjectAsJson, exportProjectAsMarkdown, resetEngine } = useContentEngine();
  const { createJobsFromAssets } = useImageQueue();
  const [brief, setBrief] = useState<Partial<StoryBrief>>(EMPTY_BRIEF);
  const [currentProject, setCurrentProject] = useState<ContentEngineProject | null>(null);
  const [activeTab, setActiveTab] = useState("story");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [publishSelected, setPublishSelected] = useState<Record<string, boolean>>({ story: true, drawing: true, product: false, announcement: false, launch: false });
  const [showProjects, setShowProjects] = useState(false);
  const [mobileTab, setMobileTab] = useState<"brief" | "assets" | "publish">("brief");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const handleGenerate = async () => {
    if (!brief.storyTitle || !brief.bibleReference || !brief.storySummary) {
      showToast("Please fill in Story Title, Bible Reference, and Story Summary.", "error");
      return;
    }
    setIsGenerating(true);
    const fullBrief: StoryBrief = {
      id: `brief-${Date.now()}`,
      collectionId: brief.collectionId || "genesis",
      bookName: brief.bookName || "",
      storyTitle: brief.storyTitle || "",
      bibleReference: brief.bibleReference || "",
      targetAgeRange: brief.targetAgeRange || "Ages 4–9",
      difficulty: (brief.difficulty as StoryBrief["difficulty"]) || "easy",
      accessLevel: (brief.accessLevel as StoryBrief["accessLevel"]) || "free",
      storySummary: brief.storySummary || "",
      lesson: brief.lesson || "",
      reflectionQuestion: brief.reflectionQuestion || "",
      keyCharacters: brief.keyCharacters || [],
      keyObjects: brief.keyObjects || [],
      themes: brief.themes || [],
      visualTone: (brief.visualTone as StoryBrief["visualTone"]) || "joyful",
      activityTypes: brief.activityTypes || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await new Promise((r) => setTimeout(r, 600));
    const project = generateAssets(fullBrief);
    setCurrentProject(project);
    setActiveTab("story");
    setIsGenerating(false);
    setMobileTab("assets");
    showToast(`✨ ${project.assets.length} assets generated for "${fullBrief.storyTitle}"!`);
  };

  const handleUpdateAsset = (assetId: string, content: string) => {
    if (!currentProject) return;
    updateAsset(currentProject.id, assetId, content);
    setCurrentProject((p) => p ? ({
      ...p,
      assets: p.assets.map((a) => a.id === assetId ? { ...a, content, status: "edited" } : a),
    }) : null);
    showToast("Asset saved.");
  };

  const handlePublish = () => {
    if (!currentProject) return;
    const selected = Object.entries(publishSelected).filter(([, v]) => v).map(([k]) => k);
    if (selected.length === 0) { showToast("Select at least one module to publish to.", "error"); return; }
    publishAssets(currentProject, selected);
    showToast(`Published to ${selected.length} module(s) successfully!`);
  };

  const handleExportJson = () => {
    if (!currentProject) return;
    const json = exportProjectAsJson(currentProject);
    download(`${currentProject.brief.storyTitle.replace(/\s+/g, "-").toLowerCase()}-content.json`, json, "application/json");
    showToast("Exported as JSON.");
  };

  const handleExportMd = () => {
    if (!currentProject) return;
    const md = exportProjectAsMarkdown(currentProject);
    download(`${currentProject.brief.storyTitle.replace(/\s+/g, "-").toLowerCase()}-content.md`, md, "text/markdown");
    showToast("Exported as Markdown.");
  };

  const download = (name: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = () => {
    if (!currentProject) return;
    const all = currentProject.assets.map((a) => `## ${a.title}\n\n${a.content}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(all).catch(() => {});
    showToast("All content copied!");
  };

  const getAssets = (types: GeneratedAsset["type"][]) =>
    (currentProject?.assets || []).filter((a) => types.includes(a.type));

  const tagsFromString = (val: string) => val.split(",").map((s) => s.trim()).filter(Boolean);

  const loadSample = (sample: Partial<StoryBrief>) => {
    setBrief({ ...EMPTY_BRIEF, ...sample });
    setCurrentProject(null);
  };

  // ── Render ──
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <DashboardHeader
        title="Content Engine"
        newLabel="New Brief"
        onNew={() => { setBrief(EMPTY_BRIEF); setCurrentProject(null); }}
      />

      {/* Top bar */}
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", backgroundColor: "#FAFAFA" }}>
        <button onClick={() => setShowProjects(!showProjects)} style={{ padding: "6px 14px", border: "1px solid #E5E7EB", borderRadius: "8px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", color: "#374151", display: "flex", alignItems: "center", gap: "6px" }}>
          <ChevronRight size={13} style={{ transform: showProjects ? "rotate(90deg)" : "none", transition: "0.2s" }} />
          Saved Projects ({projects.length})
        </button>
        {currentProject && (
          <>
            <button onClick={handleExportJson} style={{ padding: "6px 14px", border: "1px solid #E5E7EB", borderRadius: "8px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "'Nunito', sans-serif", color: "#374151", display: "flex", alignItems: "center", gap: "5px" }}>
              <Download size={12} /> Export JSON
            </button>
            <button onClick={handleExportMd} style={{ padding: "6px 14px", border: "1px solid #E5E7EB", borderRadius: "8px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "'Nunito', sans-serif", color: "#374151", display: "flex", alignItems: "center", gap: "5px" }}>
              <Download size={12} /> Export Markdown
            </button>
          </>
        )}
        <button onClick={() => { if (confirm("Reset the entire Content Engine? This clears all saved projects.")) { resetEngine(); setCurrentProject(null); setBrief(EMPTY_BRIEF); showToast("Engine reset."); } }} style={{ padding: "6px 14px", border: "1px solid #FEE2E2", borderRadius: "8px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "'Nunito', sans-serif", color: "#EF4444" }}>
          Reset Engine
        </button>
      </div>

      {/* Saved projects drawer */}
      {showProjects && (
        <div style={{ padding: "12px 24px", borderBottom: "1px solid #E5E7EB", backgroundColor: "#F8F9FB", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {projects.length === 0 ? (
            <span style={{ fontSize: "12px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>No saved projects yet. Generate assets to create one.</span>
          ) : projects.map((p) => (
            <button key={p.id} onClick={() => { setCurrentProject(p); setBrief(p.brief); setMobileTab("assets"); }} style={{ padding: "6px 14px", border: "1px solid #D8B76A", borderRadius: "8px", backgroundColor: currentProject?.id === p.id ? "#D8B76A22" : "#FFFFFF", cursor: "pointer", fontSize: "12px", fontFamily: "'Nunito', sans-serif", color: "#263B5E", fontWeight: 600 }}>
              {p.brief.storyTitle} <span style={{ color: "#9CA3AF", fontWeight: 400 }}>({p.assets.length} assets)</span>
            </button>
          ))}
        </div>
      )}

      {/* Sample briefs */}
      <div style={{ padding: "10px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#FFFBEB", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#92400E", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>Try a sample:</span>
        {SAMPLE_BRIEFS.map((s) => (
          <button key={s.storyTitle} onClick={() => loadSample(s)} style={{ padding: "4px 12px", border: "1px solid #D8B76A", borderRadius: "20px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "11px", fontFamily: "'Nunito', sans-serif", color: "#7A4E2D", fontWeight: 600 }}>
            {s.storyTitle}
          </button>
        ))}
      </div>

      {/* Mobile tab switcher */}
      <div className="md:hidden" style={{ display: "flex", borderBottom: "1px solid #E5E7EB" }}>
        {(["brief", "assets", "publish"] as const).map((t) => (
          <button key={t} onClick={() => setMobileTab(t)} style={{ flex: 1, padding: "10px", border: "none", borderBottom: mobileTab === t ? "2px solid #263B5E" : "2px solid transparent", backgroundColor: "transparent", cursor: "pointer", fontSize: "12px", fontWeight: mobileTab === t ? 700 : 400, fontFamily: "'Nunito', sans-serif", color: mobileTab === t ? "#263B5E" : "#9CA3AF", textTransform: "capitalize" }}>
            {t === "brief" ? "Brief" : t === "assets" ? "Assets" : "Publish"}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* ── LEFT: Story Brief Form ── */}
        <div className={mobileTab === "brief" ? "" : "hidden md:block"} style={{ width: "380px", minWidth: "340px", borderRight: "1px solid #E5E7EB", overflowY: "auto", flexShrink: 0, padding: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "#263B5E", fontWeight: 700, marginBottom: "4px" }}>Story Brief</h2>
            <p style={{ fontSize: "12px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>Fill in the story details to generate all assets.</p>
          </div>

          <Field label="Collection" required>
            <select value={brief.collectionId || "genesis"} onChange={(e) => setBrief({ ...brief, collectionId: e.target.value })} style={selectStyle}>
              {["genesis", "exodus", "psalms", "proverbs", "life-of-jesus", "bible-heroes"].map((c) => (
                <option key={c} value={c}>{c.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} Collection</option>
              ))}
            </select>
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Bible Book" required>
              <input value={brief.bookName || ""} onChange={(e) => setBrief({ ...brief, bookName: e.target.value })} placeholder="Genesis" style={inputStyle} />
            </Field>
            <Field label="Age Range">
              <select value={brief.targetAgeRange || "Ages 4–9"} onChange={(e) => setBrief({ ...brief, targetAgeRange: e.target.value })} style={selectStyle}>
                {["Ages 3–5", "Ages 4–9", "Ages 6–10", "Ages 8–12"].map((a) => <option key={a}>{a}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Story Title" required>
            <input value={brief.storyTitle || ""} onChange={(e) => setBrief({ ...brief, storyTitle: e.target.value })} placeholder="Abraham Looks at the Stars" style={inputStyle} />
          </Field>

          <Field label="Bible Reference" required>
            <input value={brief.bibleReference || ""} onChange={(e) => setBrief({ ...brief, bibleReference: e.target.value })} placeholder="Genesis 15:5" style={inputStyle} />
          </Field>

          <Field label="Story Summary" required>
            <textarea value={brief.storySummary || ""} onChange={(e) => setBrief({ ...brief, storySummary: e.target.value })} placeholder="God told Abraham to look at the stars..." style={{ ...inputStyle, height: "80px", resize: "vertical" }} />
          </Field>

          <Field label="Main Lesson" required>
            <input value={brief.lesson || ""} onChange={(e) => setBrief({ ...brief, lesson: e.target.value })} placeholder="God has good promises." style={inputStyle} />
          </Field>

          <Field label="Reflection Question">
            <input value={brief.reflectionQuestion || ""} onChange={(e) => setBrief({ ...brief, reflectionQuestion: e.target.value })} placeholder="What do you see when you look at the stars?" style={inputStyle} />
          </Field>

          <Field label="Key Characters (comma-separated)">
            <input value={(brief.keyCharacters || []).join(", ")} onChange={(e) => setBrief({ ...brief, keyCharacters: tagsFromString(e.target.value) })} placeholder="Abraham, God" style={inputStyle} />
          </Field>

          <Field label="Key Objects (comma-separated)">
            <input value={(brief.keyObjects || []).join(", ")} onChange={(e) => setBrief({ ...brief, keyObjects: tagsFromString(e.target.value) })} placeholder="stars, tent, night sky" style={inputStyle} />
          </Field>

          <Field label="Themes (comma-separated)">
            <input value={(brief.themes || []).join(", ")} onChange={(e) => setBrief({ ...brief, themes: tagsFromString(e.target.value) })} placeholder="promise, faith, trust" style={inputStyle} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Visual Tone">
              <select value={brief.visualTone || "joyful"} onChange={(e) => setBrief({ ...brief, visualTone: e.target.value as StoryBrief["visualTone"] })} style={selectStyle}>
                {["joyful", "peaceful", "adventurous", "gentle", "celebratory"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Difficulty">
              <select value={brief.difficulty || "easy"} onChange={(e) => setBrief({ ...brief, difficulty: e.target.value as StoryBrief["difficulty"] })} style={selectStyle}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
              </select>
            </Field>
          </div>

          <Field label="Access Level">
            <select value={brief.accessLevel || "free"} onChange={(e) => setBrief({ ...brief, accessLevel: e.target.value as StoryBrief["accessLevel"] })} style={selectStyle}>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </Field>

          <Field label="Activity Types">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
              {ACTIVITY_OPTIONS.map((opt) => {
                const checked = (brief.activityTypes || []).includes(opt);
                return (
                  <button key={opt} onClick={() => setBrief({ ...brief, activityTypes: checked ? (brief.activityTypes || []).filter((a) => a !== opt) : [...(brief.activityTypes || []), opt] })} style={{ padding: "4px 10px", borderRadius: "20px", border: `1px solid ${checked ? "#263B5E" : "#E5E7EB"}`, backgroundColor: checked ? "#263B5E" : "#FFFFFF", color: checked ? "#FFFFFF" : "#6B7280", fontSize: "11px", fontWeight: checked ? 700 : 400, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </Field>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button onClick={() => { setBrief(EMPTY_BRIEF); setCurrentProject(null); }} style={{ flex: 1, padding: "10px", border: "1px solid #E5E7EB", borderRadius: "10px", backgroundColor: "#FFFFFF", fontSize: "13px", fontFamily: "'Nunito', sans-serif", cursor: "pointer", color: "#6B7280" }}>
              Clear Brief
            </button>
            <button onClick={handleGenerate} disabled={isGenerating} style={{ flex: 2, padding: "10px 16px", border: "none", borderRadius: "10px", backgroundColor: isGenerating ? "#9CA3AF" : "#263B5E", color: "#FFFFFF", fontSize: "13px", fontWeight: 800, fontFamily: "'Nunito', sans-serif", cursor: isGenerating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <Sparkles size={15} />
              {isGenerating ? "Generating…" : "Generate Assets"}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Generated Assets ── */}
        <div className={mobileTab !== "brief" ? "" : "hidden md:flex"} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!currentProject ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>✨</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", color: "#263B5E", marginBottom: "8px" }}>Ready to Generate</h3>
              <p style={{ fontSize: "14px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", maxWidth: "360px", lineHeight: 1.6 }}>
                Fill in the Story Brief on the left and click <strong>Generate Assets</strong> to create your complete content package.
              </p>
              <p style={{ marginTop: "16px", fontSize: "12px", color: "#D8B76A", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                Or pick a sample brief above to try it instantly →
              </p>
            </div>
          ) : (
            <>
              {/* Asset tabs */}
              <div style={{ borderBottom: "1px solid #E5E7EB", backgroundColor: "#FAFAFA", overflowX: "auto" }}>
                <div style={{ display: "flex", padding: "0 16px", minWidth: "max-content" }}>
                  {ASSET_TABS.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "10px 16px", border: "none", borderBottom: activeTab === tab.id ? "2px solid #263B5E" : "2px solid transparent", backgroundColor: "transparent", cursor: "pointer", fontSize: "12px", fontWeight: activeTab === tab.id ? 700 : 400, fontFamily: "'Nunito', sans-serif", color: activeTab === tab.id ? "#263B5E" : "#6B7280", whiteSpace: "nowrap" }}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                {/* Story */}
                {activeTab === "story" && getAssets(["story_text"]).map((a) => (
                  <AssetCard key={a.id} asset={a} onCopy={() => showToast("Copied!")} onEdit={handleUpdateAsset} />
                ))}

                {/* Image Prompts */}
                {activeTab === "images" && (
                  <>
                    <div style={{ marginBottom: "12px", padding: "10px 14px", backgroundColor: "#F5F3FF", borderRadius: "10px", fontSize: "12px", color: "#6D28D9", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: "8px" }}>
                      <SendHorizontal size={13} /> Use <strong>→ Queue</strong> to send prompts to the Image Queue for processing with the Flow extension. Coloring pages will automatically use <strong>Portrait</strong> format.
                    </div>
                    {getAssets(["coloring_prompt", "verse_card_prompt", "activity_prompt"]).map((a) => (
                      <AssetCard
                        key={a.id}
                        asset={a}
                        onCopy={() => showToast("Copied!")}
                        onEdit={handleUpdateAsset}
                        onSendToQueue={() => {
                          createJobsFromAssets([a], { collectionId: currentProject?.brief.collectionId, storyId: currentProject?.id });
                          showToast(`"${a.title}" sent to Image Queue!`);
                        }}
                      />
                    ))}
                  </>
                )}

                {/* Games */}
                {activeTab === "games" && getAssets(["quiz_config", "matching_game_config", "find_object_game_config"]).map((a) => (
                  <AssetCard key={a.id} asset={a} onCopy={() => showToast("Copied!")} onEdit={handleUpdateAsset} />
                ))}

                {/* Guides */}
                {activeTab === "guides" && getAssets(["parent_guide", "teacher_guide"]).map((a) => (
                  <AssetCard key={a.id} asset={a} onCopy={() => showToast("Copied!")} onEdit={handleUpdateAsset} />
                ))}

                {/* Product */}
                {activeTab === "product" && getAssets(["printable_description", "product_description", "sales_page_copy"]).map((a) => (
                  <AssetCard key={a.id} asset={a} onCopy={() => showToast("Copied!")} onEdit={handleUpdateAsset} />
                ))}

                {/* Marketing */}
                {activeTab === "marketing" && getAssets(["pinterest_copy", "facebook_ad_copy", "instagram_caption", "email_launch_copy"]).map((a) => (
                  <AssetCard key={a.id} asset={a} onCopy={() => showToast("Copied!")} onEdit={handleUpdateAsset} />
                ))}

                {/* Export */}
                {activeTab === "export" && (
                  <div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#263B5E", marginBottom: "16px" }}>Export Assets</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "24px" }}>
                      {[
                        { label: "Copy All", icon: <Copy size={16} />, action: copyAll },
                        { label: "Download JSON", icon: <Download size={16} />, action: handleExportJson },
                        { label: "Download Markdown", icon: <Download size={16} />, action: handleExportMd },
                      ].map(({ label, icon, action }) => (
                        <button key={label} onClick={action} style={{ padding: "14px 16px", border: "1px solid #E5E7EB", borderRadius: "12px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", color: "#263B5E", display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                    <div style={{ backgroundColor: "#F8FAFC", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", fontFamily: "'Nunito', sans-serif", marginBottom: "8px" }}>JSON Preview</div>
                      <pre style={{ fontSize: "10px", fontFamily: "monospace", color: "#6B7280", maxHeight: "300px", overflowY: "auto", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {exportProjectAsJson(currentProject).slice(0, 2000)}…
                      </pre>
                    </div>
                  </div>
                )}

                {/* Publish */}
                {activeTab === "publish" && (
                  <div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#263B5E", marginBottom: "6px" }}>Publish to Dashboard Modules</h3>
                    <p style={{ fontSize: "13px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", marginBottom: "20px" }}>Select which modules to publish assets to, then click Publish.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                      {PUBLISH_OPTIONS.map(({ id: optId, label, description }) => (
                        <label key={optId} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", border: `1px solid ${publishSelected[optId] ? "#263B5E" : "#E5E7EB"}`, borderRadius: "12px", cursor: "pointer", backgroundColor: publishSelected[optId] ? "#263B5E08" : "#FFFFFF" }}>
                          <input type="checkbox" checked={!!publishSelected[optId]} onChange={(e) => setPublishSelected({ ...publishSelected, [optId]: e.target.checked })} style={{ width: "16px", height: "16px", accentColor: "#263B5E" }} />
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif" }}>{label}</div>
                            <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>{description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <button onClick={handlePublish} style={{ width: "100%", padding: "14px", border: "none", borderRadius: "12px", backgroundColor: "#263B5E", color: "#FFFFFF", fontSize: "15px", fontWeight: 800, fontFamily: "'Nunito', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <Upload size={16} /> Publish Selected Assets
                    </button>
                    {currentProject.status === "published" && (
                      <div style={{ marginTop: "16px", padding: "12px 16px", backgroundColor: "#F0FDF4", borderRadius: "10px", fontSize: "13px", color: "#166534", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Check size={14} /> Published! Check the respective dashboard modules.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#374151", fontFamily: "'Nunito', sans-serif", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: "2px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", border: "1px solid #E5E7EB", borderRadius: "8px",
  fontSize: "13px", fontFamily: "'Nunito', sans-serif", color: "#1F2937",
  outline: "none", boxSizing: "border-box", backgroundColor: "#FFFFFF",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle, cursor: "pointer",
};
