# The Drip — Specialty Coffee Discovery & Ranking

A polished mobile-first web app for discovering and ranking specialty coffee shops. Built as a startup MVP.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Start at the landing page or go directly to `/home` for the app.

---

## Product Decisions

### Navigation
Bottom tab nav (Home, Rank, Explore, Saved, Profile) for mobile-first UX. Desktop auto-centers with `max-w-lg mx-auto`. The landing page (`/`) is separate from the app shell and has no nav.

### Scoring Systems

#### Community Rank — Elo
- Each shop starts at Elo 1500 (`ELO_BASE` in `lib/scoring.ts`)
- Head-to-head votes update both shops using the standard Elo formula (K=32)
- Scores normalized to 0–100 by mapping Elo range ~1200–1850 linearly
- Skips and ties leave Elo unchanged

#### Pro Coffee Score — Weighted Criteria
- 10 criteria, each rated 1–5 by premium reviewers
- Weights: Bean Quality 15%, Brew Quality 15%, Specialty Focus 12%, Pour Over 10%, Espresso 10%, Brewing Methods 8%, Coffee Variety 8%, Atmosphere 8%, Service 8%, Location 6%
- Null criteria (shop doesn't offer espresso/pour over) are excluded; remaining weights are renormalized
- Formula: `(weightedAverage / 5) * 100` → 0–100

### Component Structure
```
components/
  ui/       — ScoreRing, ScoreBadge, Tag, PremiumBadge
  shop/     — ShopCard (list / grid / featured variants)
  scoring/  — CriteriaBreakdown
  nav/      — BottomNav
```

### Premium Logic
Zustand-persisted state. In the demo, "Upgrade to Pro" on `/premium` immediately grants access. Premium users can submit 10-criteria Pro reviews and see full breakdowns.

### Data
24 seed shops — 20 NYC, 4 LA. Archetypes include minimalist espresso bars, roastery cafés, multi-roasters, vibe-led spaces, and work-friendly cafés. Designed so community and pro scores tell different stories (e.g. high-vibe shops rank high in community, lower technically).

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/onboarding` | 3-step preference setup |
| `/home` | Discovery feed |
| `/rank` | Head-to-head pairwise ranking |
| `/explore` | Search + filter all shops |
| `/shop/[slug]` | Shop profile with dual scores |
| `/shop/[slug]/review` | Pro review form (premium only) |
| `/saved` | Saved + visited lists |
| `/profile` | User stats + premium status |
| `/premium` | Paywall + upgrade |

---

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Zustand** (client state + persistence)
- **Lucide React** (icons)
- **Next/Image** (Unsplash images)
