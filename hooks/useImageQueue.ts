"use client";

import { useState, useEffect, useCallback } from "react";
import type { ImageGenerationJob, ImageJobStatus, FlowQueueExport, FlowResultsImport } from "@/types/image-queue";

const JOBS_KEY = "bcj_image_queue_jobs";

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function writeLocal(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/** Coloring-page-style types use portrait (print vertical). Everything else landscape. */
function deriveOrientation(imageType: ImageGenerationJob["imageType"]): "PORTRAIT" | "LANDSCAPE" {
  return ["coloring_page", "verse_card", "activity_page"].includes(imageType)
    ? "PORTRAIT"
    : "LANDSCAPE";
}

export function useImageQueue() {
  const [jobs, setJobs] = useState<ImageGenerationJob[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setJobs(readLocal<ImageGenerationJob[]>(JOBS_KEY, []));
    setIsLoaded(true);
  }, []);

  const persist = (updated: ImageGenerationJob[]) => {
    setJobs(updated);
    writeLocal(JOBS_KEY, updated);
  };

  const createJob = useCallback((payload: Omit<ImageGenerationJob, "id" | "createdAt" | "updatedAt" | "orientation"> & { orientation?: "PORTRAIT" | "LANDSCAPE" }): ImageGenerationJob => {
    const now = new Date().toISOString();
    const job: ImageGenerationJob = {
      ...payload,
      orientation: payload.orientation ?? deriveOrientation(payload.imageType),
      id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    persist([job, ...jobs]);
    return job;
  }, [jobs]);

  const createJobsFromAssets = useCallback((
    assets: { id: string; title: string; content: string; type: string }[],
    meta: { collectionId?: string; storyId?: string }
  ) => {
    const now = new Date().toISOString();
    const typeMap: Record<string, ImageGenerationJob["imageType"]> = {
      coloring_prompt: "coloring_page",
      verse_card_prompt: "verse_card",
      activity_prompt: "activity_page",
    };
    const newJobs: ImageGenerationJob[] = assets
      .filter((a) => typeMap[a.type])
      .map((a) => {
        const imageType = typeMap[a.type];
        return {
          id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          source: "content_engine" as const,
          sourceId: a.id,
          collectionId: meta.collectionId,
          storyId: meta.storyId,
          title: a.title,
          prompt: a.content,
          negativePrompt: "text, words, letters, numbers, captions, watermark, signature, color fills, grayscale, shading",
          imageType,
          orientation: deriveOrientation(imageType),
          status: "pending" as const,
          priority: "normal" as const,
          createdAt: now,
          updatedAt: now,
        };
      });
    persist([...newJobs, ...jobs]);
    return newJobs;
  }, [jobs]);

  const updateJob = useCallback((jobId: string, payload: Partial<ImageGenerationJob>) => {
    const updated = jobs.map((j) =>
      j.id === jobId ? { ...j, ...payload, updatedAt: new Date().toISOString() } : j
    );
    persist(updated);
  }, [jobs]);

  const deleteJob = useCallback((jobId: string) => {
    persist(jobs.filter((j) => j.id !== jobId));
  }, [jobs]);

  const duplicateJob = useCallback((jobId: string) => {
    const src = jobs.find((j) => j.id === jobId);
    if (!src) return;
    const now = new Date().toISOString();
    const dup: ImageGenerationJob = {
      ...src,
      id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: "pending",
      generatedImageUrl: undefined,
      localFileName: undefined,
      sentAt: undefined,
      generatedAt: undefined,
      approvedAt: undefined,
      publishedAt: undefined,
      errorMessage: undefined,
      createdAt: now,
      updatedAt: now,
    };
    persist([dup, ...jobs]);
  }, [jobs]);

  const updateStatus = useCallback((jobId: string, status: ImageJobStatus, extra: Partial<ImageGenerationJob> = {}) => {
    const now = new Date().toISOString();
    const timestamps: Partial<ImageGenerationJob> = {};
    if (status === "sent_to_flow") timestamps.sentAt = now;
    if (status === "generated" || status === "uploaded") timestamps.generatedAt = now;
    if (status === "approved") timestamps.approvedAt = now;
    if (status === "published") timestamps.publishedAt = now;
    updateJob(jobId, { status, ...timestamps, ...extra });
  }, [updateJob]);

  const approveJob = useCallback((jobId: string) => updateStatus(jobId, "approved"), [updateStatus]);

  const rejectJob = useCallback((jobId: string, reason: string) =>
    updateStatus(jobId, "rejected", { errorMessage: reason }), [updateStatus]);

  const publishJob = useCallback((jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job || !job.generatedImageUrl) return;

    if (job.drawingId) {
      const drawings = readLocal<unknown[]>("bcj_drawings", []);
      const updated = drawings.map((d: unknown) => {
        const drawing = d as Record<string, unknown>;
        if (drawing.id === job.drawingId) {
          return { ...drawing, imageUrl: job.generatedImageUrl, status: "active", updatedAt: new Date().toISOString() };
        }
        return d;
      });
      writeLocal("bcj_drawings", updated);
    } else {
      const media = readLocal<unknown[]>("bcj_media", []);
      writeLocal("bcj_media", [{
        id: `media-${Date.now()}`,
        title: job.title,
        url: job.generatedImageUrl,
        type: "image",
        tags: [job.imageType],
        createdAt: new Date().toISOString(),
      }, ...media]);
    }
    updateStatus(jobId, "published");
  }, [jobs, updateStatus]);

  const exportQueueAsJson = useCallback((filter: Partial<{ status: ImageJobStatus }> = {}): string => {
    const filtered = filter.status ? jobs.filter((j) => j.status === filter.status) : jobs;
    const payload: FlowQueueExport = {
      project: "Bible Coloring Journey",
      targetTool: "Google Flow",
      exportedAt: new Date().toISOString(),
      jobs: filtered.map((j) => ({
        jobId: j.id,
        title: j.title,
        imageType: j.imageType,
        orientation: j.orientation,
        prompt: j.prompt,
        negativePrompt: j.negativePrompt || "",
        priority: j.priority,
        metadata: {
          collectionId: j.collectionId,
          storyId: j.storyId,
          drawingId: j.drawingId,
          sourceId: j.sourceId,
        },
      })),
    };
    return JSON.stringify(payload, null, 2);
  }, [jobs]);

  const importResultsFromJson = useCallback((json: string): { updated: number; errors: string[] } => {
    let parsed: FlowResultsImport;
    try { parsed = JSON.parse(json); } catch { return { updated: 0, errors: ["Invalid JSON"] }; }

    const errors: string[] = [];
    let updated = 0;
    const now = new Date().toISOString();

    const updatedJobs = jobs.map((j) => {
      const result = parsed.results?.find((r) => r.jobId === j.id);
      if (!result) return j;
      updated++;
      return {
        ...j,
        status: result.status as ImageJobStatus,
        generatedImageUrl: result.generatedImageUrl,
        localFileName: result.localFileName,
        notes: result.notes || j.notes,
        errorMessage: result.errorMessage,
        generatedAt: now,
        updatedAt: now,
      };
    });

    const foundIds = new Set(updatedJobs.map((j) => j.id));
    parsed.results?.forEach((r) => {
      if (!foundIds.has(r.jobId)) errors.push(`Job not found: ${r.jobId}`);
    });

    persist(updatedJobs);
    return { updated, errors };
  }, [jobs]);

  const clearCompleted = useCallback(() => {
    persist(jobs.filter((j) => !["published", "rejected", "failed"].includes(j.status)));
  }, [jobs]);

  const resetQueue = useCallback(() => persist([]), []);

  const getMetrics = () => ({
    pending: jobs.filter((j) => j.status === "pending").length,
    sentToFlow: jobs.filter((j) => j.status === "sent_to_flow" || j.status === "generating").length,
    generated: jobs.filter((j) => j.status === "generated" || j.status === "uploaded").length,
    approved: jobs.filter((j) => j.status === "approved").length,
    failed: jobs.filter((j) => j.status === "failed" || j.status === "rejected").length,
    total: jobs.length,
  });

  return {
    jobs,
    isLoaded,
    createJob,
    createJobsFromAssets,
    updateJob,
    deleteJob,
    duplicateJob,
    updateStatus,
    approveJob,
    rejectJob,
    publishJob,
    exportQueueAsJson,
    importResultsFromJson,
    clearCompleted,
    resetQueue,
    getMetrics,
  };
}
