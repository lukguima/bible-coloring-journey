"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { ImagePlus, Download, Upload, Trash2, Copy, Check, ExternalLink, RefreshCw, AlertCircle, Clock, CheckCircle2, XCircle, Filter, Layers, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useImageQueue, compressImage } from "@/hooks/useImageQueue";
import type { ImageGenerationJob, ImageJobStatus } from "@/types/image-queue";

const STATUS_META: Record<ImageJobStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ size?: number }> }> = {
  pending:      { label: "Pending",       color: "#6B7280", bg: "#F3F4F6", icon: Clock },
  sent_to_flow: { label: "Sent to Flow",  color: "#3B82F6", bg: "#EFF6FF", icon: RefreshCw },
  generating:   { label: "Generating",    color: "#8B5CF6", bg: "#F5F3FF", icon: RefreshCw },
  generated:    { label: "Generated",     color: "#059669", bg: "#ECFDF5", icon: CheckCircle2 },
  uploaded:     { label: "Uploaded",      color: "#0EA5E9", bg: "#F0F9FF", icon: Upload },
  approved:     { label: "Approved",      color: "#16A34A", bg: "#F0FDF4", icon: CheckCircle2 },
  rejected:     { label: "Rejected",      color: "#DC2626", bg: "#FEF2F2", icon: XCircle },
  published:    { label: "Published",     color: "#7C3AED", bg: "#F5F3FF", icon: CheckCircle2 },
  failed:       { label: "Failed",        color: "#EF4444", bg: "#FEF2F2", icon: AlertCircle },
};

const IMAGE_TYPES = [
  { value: "coloring_page",  label: "Coloring Page",   orientation: "PORTRAIT" },
  { value: "cover",          label: "Cover",           orientation: "LANDSCAPE" },
  { value: "verse_card",     label: "Verse Card",      orientation: "PORTRAIT" },
  { value: "activity_page",  label: "Activity Page",   orientation: "PORTRAIT" },
  { value: "mockup",         label: "Mockup",          orientation: "LANDSCAPE" },
  { value: "ad_creative",    label: "Ad Creative",     orientation: "LANDSCAPE" },
  { value: "thumbnail",      label: "Thumbnail",       orientation: "LANDSCAPE" },
];

const BLANK_JOB: Partial<ImageGenerationJob> = {
  source: "manual",
  title: "",
  prompt: "",
  negativePrompt: "text, words, letters, numbers, watermark, signature",
  imageType: "coloring_page",
  orientation: "PORTRAIT",
  priority: "normal",
  status: "pending",
};

function StatusBadge({ status }: { status: ImageJobStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", color: meta.color, backgroundColor: meta.bg, textTransform: "uppercase" }}>
      <Icon size={9} /> {meta.label}
    </span>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "14px 16px", minWidth: "100px", flex: 1 }}>
      <div style={{ fontSize: "24px", fontWeight: 800, color, fontFamily: "'Nunito', sans-serif" }}>{value}</div>
      <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "'Nunito', sans-serif", marginTop: "2px" }}>{label}</div>
    </div>
  );
}

const BOOKS = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "Psalms", "Proverbs", "Isaiah", "Matthew", "Mark", "Luke", "John", "Acts", "Revelation"];

function JobModal({ job, onClose, onUpdate, onDelete, onDuplicate, onUpdateStatus, onApprove, products }: {
  job: ImageGenerationJob;
  onClose: () => void;
  onUpdate: (id: string, payload: Partial<ImageGenerationJob>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdateStatus: (id: string, status: ImageJobStatus, extra?: Partial<ImageGenerationJob>) => void;
  onApprove: (id: string) => void;
  products: { id: string; name: string }[];
}) {
  const [draft, setDraft] = useState({ ...job });
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate(job.id, draft);
    onClose();
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(job.prompt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      setDraft((prev) => ({ ...prev, generatedImageUrl: dataUrl, status: "uploaded" }));
      onUpdate(job.id, { generatedImageUrl: dataUrl, status: "uploaded" });
    } catch {
      alert("Erro ao processar imagem. Tente outro arquivo.");
    } finally {
      setUploading(false);
    }
  }, [job.id, onUpdate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDownloadImage = () => {
    if (!draft.generatedImageUrl) return;
    const a = document.createElement("a");
    a.href = draft.generatedImageUrl;
    a.download = `${job.title.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#263B5E" }}>{job.title}</h3>
          <StatusBadge status={draft.status} />
        </div>

        {/* Upload area — always visible */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            marginBottom: "16px",
            border: `2px dashed ${dragOver ? "#263B5E" : "#E5E7EB"}`,
            borderRadius: "12px",
            backgroundColor: dragOver ? "#F0F4FF" : "#FAFAFA",
            cursor: "pointer",
            transition: "all 0.15s",
            overflow: "hidden",
            minHeight: draft.generatedImageUrl ? "auto" : "110px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {draft.generatedImageUrl ? (
            <div style={{ width: "100%", position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={draft.generatedImageUrl}
                alt="Uploaded"
                style={{ width: "100%", maxHeight: "280px", objectFit: "contain", display: "block", borderRadius: "10px" }}
              />
              <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "6px" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownloadImage(); }}
                  style={{ padding: "6px 10px", border: "none", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.6)", color: "#FFFFFF", fontSize: "11px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Download size={11} /> Download
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDraft({ ...draft, generatedImageUrl: "" }); onUpdate(job.id, { generatedImageUrl: "" }); }}
                  style={{ padding: "6px 10px", border: "none", borderRadius: "8px", backgroundColor: "rgba(220,38,38,0.85)", color: "#FFFFFF", fontSize: "11px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
              <div style={{ padding: "6px 10px", fontSize: "11px", color: "#6B7280", fontFamily: "'Nunito', sans-serif", textAlign: "center" }}>
                Clique para trocar a imagem
              </div>
            </div>
          ) : (
            <div style={{ padding: "20px", textAlign: "center" }}>
              {uploading ? (
                <div style={{ fontSize: "13px", color: "#6B7280", fontFamily: "'Nunito', sans-serif" }}>Carregando...</div>
              ) : (
                <>
                  <ImageIcon size={28} color="#D1D5DB" style={{ marginBottom: "8px" }} />
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", fontFamily: "'Nunito', sans-serif" }}>Upload manual de imagem</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", marginTop: "4px" }}>Arraste e solte ou clique para selecionar · PNG, JPG, WebP</div>
                </>
              )}
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

        {/* Product / ordering section */}
        <div style={{ backgroundColor: "#F8F9FB", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#263B5E", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>📚 Ordenação do Produto</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <FieldGroup label="Produto">
              <select value={draft.productId || ""} onChange={(e) => setDraft({ ...draft, productId: e.target.value || undefined })} style={inputSt}>
                <option value="">— Sem produto —</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Livro">
              <select value={draft.book || ""} onChange={(e) => setDraft({ ...draft, book: e.target.value || undefined })} style={inputSt}>
                <option value="">— Selecionar —</option>
                {BOOKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Capítulo">
              <input type="number" min={1} max={200} value={draft.chapter ?? ""} onChange={(e) => setDraft({ ...draft, chapter: e.target.value ? Number(e.target.value) : undefined })} placeholder="Ex: 1" style={inputSt} />
            </FieldGroup>
            <FieldGroup label="Versículo(s)">
              <input value={draft.verse || ""} onChange={(e) => setDraft({ ...draft, verse: e.target.value || undefined })} placeholder="Ex: 1 ou 1-5" style={inputSt} />
            </FieldGroup>
          </div>
          <FieldGroup label="Ordem na sequência">
            <input type="number" min={0} value={draft.pageOrder ?? 0} onChange={(e) => setDraft({ ...draft, pageOrder: Number(e.target.value) })} placeholder="0" style={inputSt} />
          </FieldGroup>
        </div>

        <FieldGroup label="Title">
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} style={inputSt} />
        </FieldGroup>
        <FieldGroup label="Image Type">
          <select value={draft.imageType} onChange={(e) => {
            const t = IMAGE_TYPES.find((x) => x.value === e.target.value);
            setDraft({ ...draft, imageType: e.target.value as ImageGenerationJob["imageType"], orientation: (t?.orientation || "LANDSCAPE") as "PORTRAIT" | "LANDSCAPE" });
          }} style={inputSt}>
            {IMAGE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label} ({t.orientation})</option>)}
          </select>
        </FieldGroup>
        <FieldGroup label={`Prompt (${draft.orientation})`}>
          <textarea value={draft.prompt} onChange={(e) => setDraft({ ...draft, prompt: e.target.value })} style={{ ...inputSt, height: "100px", resize: "vertical" }} />
        </FieldGroup>
        <FieldGroup label="Negative Prompt">
          <textarea value={draft.negativePrompt || ""} onChange={(e) => setDraft({ ...draft, negativePrompt: e.target.value })} style={{ ...inputSt, height: "60px", resize: "vertical" }} />
        </FieldGroup>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FieldGroup label="Priority">
            <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as "low" | "normal" | "high" })} style={inputSt}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </FieldGroup>
          <FieldGroup label="Status">
            <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as ImageJobStatus })} style={inputSt}>
              {(Object.keys(STATUS_META) as ImageJobStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
          </FieldGroup>
        </div>
        <FieldGroup label="Notes">
          <textarea value={draft.notes || ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} style={{ ...inputSt, height: "60px", resize: "vertical" }} placeholder="Optional notes..." />
        </FieldGroup>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
          <button onClick={handleSave} style={{ flex: 2, padding: "10px", border: "none", borderRadius: "10px", backgroundColor: "#263B5E", color: "#FFFFFF", fontWeight: 800, fontSize: "13px", fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>
            Save Changes
          </button>
          <button onClick={handleCopyPrompt} style={{ padding: "10px 14px", border: "1px solid #E5E7EB", borderRadius: "10px", backgroundColor: "#FFFFFF", cursor: "pointer", color: copied ? "#16A34A" : "#6B7280", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontFamily: "'Nunito', sans-serif" }}>
            {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied!" : "Copy Prompt"}
          </button>
          <button onClick={() => { onDuplicate(job.id); onClose(); }} style={{ padding: "10px 14px", border: "1px solid #E5E7EB", borderRadius: "10px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#6B7280", fontSize: "12px", fontFamily: "'Nunito', sans-serif" }}>
            Duplicate
          </button>
          <button onClick={() => { if (confirm("Delete this job?")) { onDelete(job.id); onClose(); } }} style={{ padding: "10px 14px", border: "1px solid #FEE2E2", borderRadius: "10px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#EF4444", fontSize: "12px", fontFamily: "'Nunito', sans-serif" }}>
            <Trash2 size={13} />
          </button>
        </div>

        {job.status === "pending" && (
          <button onClick={() => { onUpdateStatus(job.id, "sent_to_flow"); onClose(); }} style={{ width: "100%", marginTop: "10px", padding: "10px", border: "none", borderRadius: "10px", backgroundColor: "#3B82F6", color: "#FFFFFF", fontWeight: 700, fontSize: "13px", fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>
            Mark as Sent to Flow
          </button>
        )}
        {(draft.status === "generated" || draft.status === "uploaded") && (
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <button onClick={() => { onApprove(job.id); onClose(); }} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", backgroundColor: "#16A34A", color: "#FFFFFF", fontWeight: 700, fontSize: "13px", fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>
              ✓ Approve & Publish
            </button>
            <button onClick={() => { const r = prompt("Rejection reason (optional):"); onUpdateStatus(job.id, "rejected", { errorMessage: r || "Rejected" }); onClose(); }} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", backgroundColor: "#EF4444", color: "#FFFFFF", fontWeight: 700, fontSize: "13px", fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>
              ✕ Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickUploadButton({ jobId, onUpload }: { jobId: string; onUpload: (id: string, dataUrl: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const dataUrl = await compressImage(file);
      onUpload(jobId, dataUrl);
    } catch { /* ignore */ }
  };
  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); ref.current?.click(); }}
        title="Upload imagem manualmente"
        style={{ padding: "4px 8px", border: "1px solid #E5E7EB", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", color: "#6B7280", display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
      >
        <Upload size={11} /> Upload
      </button>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handleChange} />
    </>
  );
}

export default function ImageQueuePage() {
  const { jobs, isLoaded, createJob, updateJob, deleteJob, duplicateJob, updateStatus, approveJob, exportQueueAsJson, clearCompleted, resetQueue, getMetrics } = useImageQueue();
  const [filterStatus, setFilterStatus] = useState<ImageJobStatus | "all">("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<ImageGenerationJob | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newJob, setNewJob] = useState<Partial<ImageGenerationJob>>(BLANK_JOB);
  const [toast, setToast] = useState<string | null>(null);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bcj_products");
      if (raw) {
        const parsed = JSON.parse(raw) as { id: string; name?: string; title?: string }[];
        setProducts(parsed.map((p) => ({ id: p.id, name: p.name ?? p.title ?? p.id })));
      }
    } catch { /* ignore */ }
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleQuickUpload = useCallback((jobId: string, dataUrl: string) => {
    updateJob(jobId, { generatedImageUrl: dataUrl, status: "uploaded" });
    showToast("Imagem carregada! Status → Uploaded.");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateJob]);

  const metrics = getMetrics();

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (filterStatus !== "all" && j.status !== filterStatus) return false;
      if (filterType !== "all" && j.imageType !== filterType) return false;
      return true;
    });
  }, [jobs, filterStatus, filterType]);

  const handleCreateJob = () => {
    if (!newJob.title || !newJob.prompt) { showToast("Title and Prompt are required."); return; }
    createJob(newJob as Omit<ImageGenerationJob, "id" | "createdAt" | "updatedAt" | "orientation">);
    setNewJob(BLANK_JOB);
    setShowNew(false);
    showToast("Job added to queue!");
  };

  const handleExport = () => {
    const json = exportQueueAsJson({ status: "pending" });
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "bcj-image-queue.json"; a.click();
    URL.revokeObjectURL(url);
    showToast("Queue exported for Flow extension.");
  };

  if (!isLoaded) return <div style={{ padding: "24px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif" }}>Loading...</div>;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, backgroundColor: "#F8F9FB" }}>
      <DashboardHeader
        title="Image Queue"
        newLabel="Add Job"
        onNew={() => setShowNew(!showNew)}
      />

      {/* Metrics */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <MetricCard label="Pending"    value={metrics.pending}    color="#6B7280" />
          <MetricCard label="In Flow"    value={metrics.sentToFlow} color="#3B82F6" />
          <MetricCard label="Generated"  value={metrics.generated}  color="#059669" />
          <MetricCard label="Approved"   value={metrics.approved}   color="#16A34A" />
          <MetricCard label="Failed"     value={metrics.failed}     color="#EF4444" />
          <MetricCard label="Total Jobs" value={metrics.total}      color="#263B5E" />
        </div>
      </div>

      {/* Actions bar */}
      <div style={{ padding: "10px 24px", borderBottom: "1px solid #E5E7EB", backgroundColor: "#FAFAFA", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Link href="/dashboard/image-queue/extension" style={{ padding: "7px 14px", border: "1px solid #263B5E", borderRadius: "8px", backgroundColor: "#263B5E", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
          <ExternalLink size={12} /> Extension Bridge
        </Link>
        <button onClick={handleExport} style={{ padding: "7px 14px", border: "1px solid #E5E7EB", borderRadius: "8px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "'Nunito', sans-serif", color: "#374151", display: "flex", alignItems: "center", gap: "5px" }}>
          <Download size={12} /> Export Pending JSON
        </button>
        <button onClick={clearCompleted} style={{ padding: "7px 14px", border: "1px solid #E5E7EB", borderRadius: "8px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "12px", fontFamily: "'Nunito', sans-serif", color: "#6B7280" }}>
          Clear Completed
        </button>
        <button onClick={() => { if (confirm("Reset the entire queue?")) { resetQueue(); showToast("Queue cleared."); } }} style={{ padding: "7px 14px", border: "1px solid #FEE2E2", borderRadius: "8px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "12px", fontFamily: "'Nunito', sans-serif", color: "#EF4444" }}>
          Reset Queue
        </button>
      </div>

      {/* New job form */}
      {showNew && (
        <div style={{ margin: "16px 24px", backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "#263B5E", marginBottom: "14px" }}>New Image Job</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FieldGroup label="Title *">
              <input value={newJob.title || ""} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} placeholder="Noah's Ark Coloring Page" style={inputSt} />
            </FieldGroup>
            <FieldGroup label="Image Type">
              <select value={newJob.imageType} onChange={(e) => {
                const t = IMAGE_TYPES.find((x) => x.value === e.target.value);
                setNewJob({ ...newJob, imageType: e.target.value as ImageGenerationJob["imageType"], orientation: (t?.orientation || "LANDSCAPE") as "PORTRAIT" | "LANDSCAPE" });
              }} style={inputSt}>
                {IMAGE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label} ({t.orientation})</option>)}
              </select>
            </FieldGroup>
          </div>
          <FieldGroup label={`Prompt * (orientation: ${newJob.orientation})`}>
            <textarea value={newJob.prompt || ""} onChange={(e) => setNewJob({ ...newJob, prompt: e.target.value })} placeholder="Detailed prompt for image generation..." style={{ ...inputSt, height: "80px", resize: "vertical" }} />
          </FieldGroup>
          <FieldGroup label="Negative Prompt">
            <input value={newJob.negativePrompt || ""} onChange={(e) => setNewJob({ ...newJob, negativePrompt: e.target.value })} style={inputSt} />
          </FieldGroup>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
            <FieldGroup label="Produto">
              <select value={newJob.productId || ""} onChange={(e) => setNewJob({ ...newJob, productId: e.target.value || undefined })} style={inputSt}>
                <option value="">—</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Livro">
              <select value={newJob.book || ""} onChange={(e) => setNewJob({ ...newJob, book: e.target.value || undefined })} style={inputSt}>
                <option value="">—</option>
                {BOOKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Cap.">
              <input type="number" min={1} value={newJob.chapter ?? ""} onChange={(e) => setNewJob({ ...newJob, chapter: e.target.value ? Number(e.target.value) : undefined })} placeholder="1" style={inputSt} />
            </FieldGroup>
            <FieldGroup label="Vers.">
              <input value={newJob.verse || ""} onChange={(e) => setNewJob({ ...newJob, verse: e.target.value || undefined })} placeholder="1-5" style={inputSt} />
            </FieldGroup>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button onClick={() => setShowNew(false)} style={{ padding: "10px 16px", border: "1px solid #E5E7EB", borderRadius: "10px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "13px", fontFamily: "'Nunito', sans-serif", color: "#6B7280" }}>Cancel</button>
            <button onClick={handleCreateJob} style={{ padding: "10px 16px", border: "none", borderRadius: "10px", backgroundColor: "#263B5E", color: "#FFFFFF", fontWeight: 700, fontSize: "13px", fontFamily: "'Nunito', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <ImagePlus size={14} /> Add to Queue
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <Filter size={13} color="#9CA3AF" />
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {(["all", ...Object.keys(STATUS_META)] as (ImageJobStatus | "all")[]).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "4px 10px", border: `1px solid ${filterStatus === s ? "#263B5E" : "#E5E7EB"}`, borderRadius: "20px", backgroundColor: filterStatus === s ? "#263B5E" : "#FFFFFF", color: filterStatus === s ? "#FFFFFF" : "#6B7280", fontSize: "11px", fontFamily: "'Nunito', sans-serif", fontWeight: filterStatus === s ? 700 : 400, cursor: "pointer" }}>
              {s === "all" ? "All" : STATUS_META[s]?.label}
            </button>
          ))}
        </div>
        <div style={{ width: "1px", height: "20px", backgroundColor: "#E5E7EB" }} />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ ...inputSt, width: "auto", padding: "4px 8px", fontSize: "11px" }}>
          <option value="all">All types</option>
          {IMAGE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Jobs list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", color: "#9CA3AF" }}>
            <Layers size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#263B5E", marginBottom: "8px" }}>No jobs yet</div>
            <div style={{ fontSize: "13px", fontFamily: "'Nunito', sans-serif" }}>
              Add a job manually or send image prompts from the <Link href="/dashboard/content-engine" style={{ color: "#263B5E", fontWeight: 700 }}>Content Engine</Link>.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((job) => (
              <div key={job.id} onClick={() => setSelectedJob(job)} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "border-color 0.15s" }} onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#263B5E"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E7EB"; }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: STATUS_META[job.status].color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937", fontFamily: "'Nunito', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.prompt.slice(0, 80)}{job.prompt.length > 80 ? "…" : ""}</div>
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                  {job.generatedImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={job.generatedImageUrl} alt="" style={{ width: "32px", height: "32px", objectFit: "cover", borderRadius: "4px", border: "1px solid #E5E7EB" }} />
                  )}
                  <span style={{ fontSize: "10px", color: "#6B7280", fontFamily: "'Nunito', sans-serif", backgroundColor: "#F3F4F6", padding: "2px 8px", borderRadius: "20px" }}>
                    {job.orientation === "PORTRAIT" ? "↕ Portrait" : "↔ Landscape"}
                  </span>
                  <QuickUploadButton jobId={job.id} onUpload={handleQuickUpload} />
                  <StatusBadge status={job.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job modal */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={(id, payload) => { updateJob(id, payload); showToast("Job updated."); setSelectedJob(null); }}
          onDelete={(id) => { deleteJob(id); showToast("Job deleted."); }}
          onDuplicate={(id) => { duplicateJob(id); showToast("Job duplicated."); }}
          onUpdateStatus={(id, status, extra) => { updateStatus(id, status, extra); showToast(`Status → ${STATUS_META[status].label}`); }}
          onApprove={(id) => { approveJob(id); showToast("✓ Publicado! Disponível para clientes PREMIUM."); }}
          products={products}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999, backgroundColor: "#263B5E", color: "#FFFFFF", padding: "12px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#374151", fontFamily: "'Nunito', sans-serif", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>
      {children}
    </div>
  );
}

const inputSt: React.CSSProperties = {
  width: "100%", padding: "8px 10px", border: "1px solid #E5E7EB", borderRadius: "8px",
  fontSize: "13px", fontFamily: "'Nunito', sans-serif", color: "#1F2937",
  outline: "none", boxSizing: "border-box", backgroundColor: "#FFFFFF",
};
