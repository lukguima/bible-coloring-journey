# Bible Coloring Journey 📖🎨

A premium interactive Bible coloring experience for Christian families, homeschool, and Sunday school. Built with Next.js 16 and Tailwind v4.

## Features

### Public Site
- **Landing page** — Full sales funnel with hero, features, pricing, and FAQ
- **12 Interactive Bible Stories** — Genesis collection with free (3) and premium (9) stories
- **5 Bible Mini-Games** — Match the Animals, Creation Order, Bible Verse Puzzle, Rainbow Promise Quiz, Find the Stars
- **Interactive Coloring Studio** — SVG-based click-to-fill coloring with 15-color palette, save/download
- **Progress Tracking** — localStorage-based badges, certificate of completion, overall progress
- **35+ Printable Resources** — Coloring pages, verse cards, activity sheets, certificate, parent guide
- **Parent & Teacher Guide** — Suggested weekly plan, conversation starters, usage tips
- **Pricing Page** — Free, $9 personal, $29 classroom license
- **Waitlist Page** — Captures leads for upcoming collections (Exodus, Psalms, etc.)

### Admin Dashboard (`/dashboard`)
- **Overview** — Metrics: leads, story/game completions, unlock clicks, printable downloads
- **Collections** — Full CRUD for Bible story collections
- **Products** — Manage pricing, access levels, and checkout URLs per product
- **Drawings** — Manage coloring page metadata and PDF links
- **Stories / Games / Printables** — Read-only views of content (edit via code)
- **Customers Info** — Customer-facing info blocks by placement
- **Announcements** — Promotional banners for public pages
- **Launches** — Plan upcoming book launches with dates and waitlist settings
- **Coupons** — Discount code management (% or fixed)
- **Leads** — View and export waitlist leads as CSV
- **Media Library** — URL-based media asset management
- **Analytics** — Local event tracking with conversion funnel visualization
- **Settings** — Site name, checkout URL, currency, feature flags

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + Inline styles |
| Icons | Lucide React |
| State | localStorage via custom hooks |
| Deployment | Docker + Coolify |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — admin dashboard at [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CHECKOUT_URL` | Payment link (Hotmart, Stripe, Gumroad, etc.) |
| `NEXT_PUBLIC_SITE_URL` | Your production domain |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics (optional) |

**Quick checkout setup:** Dashboard → Settings → Default Checkout URL. Or set per-product URLs in Dashboard → Products.

## localStorage Architecture

| Key | Contents |
|-----|----------|
| `bcj-progress` | User progress (stories, games, badges, coloring) |
| `bcj_collections` | Collections |
| `bcj_products` | Products + checkout URLs |
| `bcj_leads` | Waitlist leads |
| `bcj_settings` | Platform settings |
| `bcj_analytics_events` | Tracked events (last 500) |

## Deployment (Coolify)

1. Push this repo to GitHub
2. Create a new app in Coolify → connect GitHub repo
3. Set build pack to **Dockerfile**
4. Add env vars from `.env.example`
5. Set port to `3000` → Deploy

```bash
# Local Docker test
docker build -t bible-coloring-journey .
docker run -p 3000:3000 bible-coloring-journey
```

## Adding Content

- **New stories** — Edit `data/stories.ts`
- **New games** — Add to `data/games.ts` + create `components/games/` + `app/games/[slug]/page.tsx`
- **New collections** — Dashboard → Collections (or `data/collections.ts`)

## Upcoming Collections

- 📜 Exodus Coloring Book
- 🎵 Psalms Coloring Book
- 💎 Proverbs Coloring Book
- ✝️ Life of Jesus Coloring Book

---

Built with ❤️ for Christian families everywhere.
