/**
 * In-memory store for the Flow Image Worker extension API.
 * Jobs are seeded from the BCJ dashboard and consumed by the Chrome extension.
 * State resets on server restart — designed for single-session workflows.
 */

export interface FlowWorkerJob {
  id: string;
  title: string;
  imageType: string;
  orientation: "PORTRAIT" | "LANDSCAPE";
  prompt: string;
  negativePrompt: string;
  priority: "low" | "normal" | "high";
  batchId: string;
  metadata?: Record<string, string | undefined>;
  status: "pending" | "processing" | "completed" | "failed" | "blocked";
  resultDataUrl?: string;
  localFileName?: string;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
}

interface Store {
  batchId: string | null;
  jobs: FlowWorkerJob[];
  done: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __flowWorkerStore: Store | undefined;
}

function getStore(): Store {
  if (!global.__flowWorkerStore) {
    global.__flowWorkerStore = { batchId: null, jobs: [], done: 0 };
  }
  return global.__flowWorkerStore;
}

export function seedBatch(jobs: Omit<FlowWorkerJob, "status">[]): string {
  const store = getStore();
  const batchId = `batch-bcj-${Date.now()}`;
  store.batchId = batchId;
  store.done = 0;
  store.jobs = jobs.map((j) => ({ ...j, status: "pending" as const, batchId }));
  return batchId;
}

export function getNextJob(batchId?: string): { job: FlowWorkerJob | null; reason?: string; batchId?: string | null; progress: { total: number; done: number } } {
  const store = getStore();
  const total = store.jobs.length;
  const done = store.jobs.filter((j) => j.status === "completed" || j.status === "failed" || j.status === "blocked").length;

  if (!store.batchId || total === 0) {
    return { job: null, reason: "no_active_batch", batchId: null, progress: { total: 0, done: 0 } };
  }

  if (done === total) {
    return { job: null, reason: "batch_complete", batchId: store.batchId, progress: { total, done } };
  }

  const next = store.jobs.find((j) => j.status === "pending");
  if (!next) {
    return { job: null, reason: "no_job", batchId: store.batchId, progress: { total, done } };
  }

  next.status = "processing";
  next.startedAt = new Date().toISOString();
  return { job: next, batchId: store.batchId, progress: { total, done } };
}

export function updateJobStatus(jobId: string, status: FlowWorkerJob["status"], extra: Partial<FlowWorkerJob> = {}) {
  const store = getStore();
  const job = store.jobs.find((j) => j.id === jobId);
  if (!job) return false;
  Object.assign(job, { status, ...extra });
  return true;
}

export function submitJobResult(jobId: string, dataUrl: string, filename: string, completedAt: string) {
  const store = getStore();
  const job = store.jobs.find((j) => j.id === jobId);
  if (!job) return false;
  job.status = "completed";
  job.resultDataUrl = dataUrl;
  job.localFileName = filename;
  job.completedAt = completedAt;
  store.done++;
  return true;
}

export function completeBatch(batchId: string) {
  const store = getStore();
  if (store.batchId === batchId) {
    store.batchId = null;
  }
}

export function getResults(): FlowWorkerJob[] {
  return getStore().jobs.filter((j) => j.status === "completed" || j.status === "failed");
}

export function getStore_() {
  return getStore();
}

export function resetStore() {
  global.__flowWorkerStore = { batchId: null, jobs: [], done: 0 };
}
