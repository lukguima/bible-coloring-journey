# Chrome Flow Extension Integration

## Overview

The **Flow Image Worker** Chrome extension (`D:\Roteirista\chrome-extension\flow-image-worker`) automates image generation in **Google Flow** (AI Test Kitchen). The Bible Coloring Journey dashboard integrates with it via a REST API protocol.

## Architecture

```
BCJ Dashboard (browser)
  → useImageQueue (localStorage jobs)
  → Extension Bridge page
  → POST /api/flow-worker/batch (seed jobs to server store)

Flow Image Worker (Chrome extension)
  → polls GET /api/flow-worker/next-job
  → generates images in Google Flow
  → submits result POST /api/flow-worker/job/{id}/result

BCJ Dashboard (browser)
  → GET /api/flow-worker/batch (fetch results)
  → importResultsFromJson (updates localStorage job statuses)
```

## Image Orientation

Coloring pages, verse cards, and activity pages must be **PORTRAIT (9:16 vertical)** for printing. Covers, ads, and thumbnails use **LANDSCAPE (16:9)**.

The `orientation` field is automatically set by `deriveOrientation()` in `hooks/useImageQueue.ts`:

```ts
"coloring_page" | "verse_card" | "activity_page" → "PORTRAIT"
"cover" | "mockup" | "ad_creative" | "thumbnail" → "LANDSCAPE"
```

The extension reads `job.orientation` at `background.js:722` and passes it to `executeGenerationFlow()`. Google Flow then auto-selects the 9:16 or 16:9 canvas.

## Setup

### 1. Extension Configuration

Open the **Flow Image Worker** popup → Settings:

| Field | Value |
|-------|-------|
| Studio URL | `https://bibliecolor.crya.app.br` (production) or `http://localhost:3000` (dev) |
| Token | Any non-empty string, e.g. `bcj-token` |
| Min/Max Delay | 3000/8000 ms (default) |

### 2. Workflow

1. Create prompts in the **Content Engine** (`/dashboard/content-engine`)
2. Click **→ Queue** on image prompt cards (or use Drawings → purple send button)
3. Go to **Image Queue** (`/dashboard/image-queue`) to review pending jobs
4. Go to **Extension Bridge** (`/dashboard/image-queue/extension`)
5. Click **"Seed API"** — uploads all pending jobs to the server queue
6. Open Chrome extension → click **Start Worker**
7. The extension will process each job with correct orientation
8. When done, click **"Fetch Results"** in the Extension Bridge page
9. Jobs status updates to `generated` in the queue
10. In Image Queue, approve/reject each result

## API Endpoints

All endpoints at `/api/flow-worker/`:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/batch` | Seed jobs from BCJ dashboard JSON |
| GET | `/batch` | Get completed results |
| DELETE | `/batch` | Reset server store |
| GET | `/next-job` | Extension polls for next pending job |
| POST | `/job/{id}/status` | Extension updates job status |
| POST | `/job/{id}/result` | Extension uploads generated image (FormData) |
| POST | `/job/{id}/error` | Extension reports error |
| POST | `/job/{id}/request-safe-rewrite` | Extension requests simplified prompt on policy block |
| POST | `/batch/{batchId}/complete` | Extension signals batch completion |

### next-job Response Format

```json
{
  "job": {
    "id": "job-1234-abcd",
    "prompt": "Detailed illustration prompt...",
    "orientation": "PORTRAIT",
    "batchId": "batch-bcj-1749157200000"
  },
  "progress": { "total": 5, "done": 2 },
  "batchId": "batch-bcj-1749157200000"
}
```

When no jobs remain: `{ "job": null, "reason": "batch_complete", "batchId": "..." }`

### batch POST Body (from exportQueueAsJson)

```json
{
  "project": "Bible Coloring Journey",
  "targetTool": "Google Flow",
  "exportedAt": "2026-06-17T...",
  "jobs": [
    {
      "jobId": "job-1234-abcd",
      "title": "Noah's Ark Coloring Page",
      "imageType": "coloring_page",
      "orientation": "PORTRAIT",
      "prompt": "Children's coloring page...",
      "negativePrompt": "text, words, letters, ...",
      "priority": "normal",
      "metadata": { "collectionId": "genesis", "storyId": "ce-...", "drawingId": "drw-..." }
    }
  ]
}
```

## Server Store Notes

- `lib/flow-worker-store.ts` uses a **module-level global** (`global.__flowWorkerStore`)
- Data persists only for the lifetime of the Node.js process (resets on server restart/redeploy)
- This is by design: each generation session is self-contained
- For persistence across restarts, replace `global.__flowWorkerStore` with a SQLite/Redis store

## Troubleshooting

**Extension says "no active batch"**: Click "Seed API" in the Extension Bridge page before starting the extension worker.

**Jobs generating in LANDSCAPE instead of PORTRAIT**: Verify the job's `orientation` field is `"PORTRAIT"` in the extension bridge JSON preview. Re-seed the API after confirming.

**Extension policy block**: The extension calls `/api/flow-worker/job/{id}/request-safe-rewrite` automatically. BCJ returns a cleaned prompt. If still blocked, edit the prompt manually in Image Queue.

**Results not appearing after "Fetch Results"**: Check that the extension's Studio URL matches exactly (no trailing slash). The extension uses `Authorization: Bearer <token>` header — the token field must be non-empty in extension settings.
