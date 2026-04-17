# STR Command Center

Private short-term rental operations dashboard for tracking launch readiness, task execution, and documentation in one place.

## Overview

STR Command Center is a Next.js app used to manage:

- Roadmap execution across sections and categories
- Document completion and file attachments
- Blocked/in-progress task visibility
- Focused review of critical items before launch
- Optional cloud sync (Supabase) with local-first fallback

## Key Features

- Dashboard with progress and priority signals
- Roadmap view for task completion, notes, and status tracking
- Documents repository with:
  - Multi-file drag-and-drop upload
  - Auto-tagging per uploaded file
  - Master file directory grouped by section and artifact
- Focus mode for blocked, active, and pinned work
- Settings for export/import/reset and launch date controls

## Tech Stack

- Next.js `16.2.4` (App Router)
- React `19`
- TypeScript
- Tailwind CSS
- IndexedDB for local file blobs
- localStorage for app state
- Supabase (optional cloud sync)

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run lint checks
- `npm run extract-data` - Run data extraction script

## Environment Variables

Copy `.env.example` to `.env.local` and fill values only if cloud sync is needed.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_STATE_KEY=family
```

If not configured, the app still works locally with offline-first persistence.

## Vercel Deployment

Use repository root as the project root.

### Recommended Vercel Settings

- Root Directory: `.` (repo root)
- Install Command: `npm install`
- Build Command: `npm run build`
- Framework Preset: `Next.js`

### Deploy

1. Push to `master`
2. Import/connect repo in Vercel
3. Redeploy latest commit

## Project Structure

```text
.
├── public/
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── .env.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

## Notes

- `node_modules`, `.next`, local env files, and local research/archive folders should not be committed.
- This repository is private and intended for internal/family operations.

## License

Private use only.
