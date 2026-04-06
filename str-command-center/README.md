# STR Launch Command Center v2.1

A professional-grade operations dashboard for tracking short-term rental launch progress across 756 tasks and 115 documents.

## ✨ New in v2.1

- **⌨️ Command Palette**: Press `CMD+K` (Mac) or `CTRL+K` (Windows) to instantly search and navigate
- **📌 Collapsible Sidebar**: Icon-only rail mode to maximize screen space
- **📊 Bento Dashboard**: Redesigned with circular progress, critical path, and blocked items
- **✏️ Inline Editing**: Edit tasks in slide-in drawer without losing your place
- **🎯 Critical Path**: Automatic prioritization of blocked and urgent tasks
- **📄 Required Docs**: Clear distinction between required and optional documentation
- **🎨 Enhanced Design**: Professional zinc-950 dark theme with blue-500 accents

## Features

- **Dashboard**: Global overview with key metrics, section progress, and focus items
- **Roadmap**: Section-by-section task checklist with filtering and search
- **Documents**: Artifact tracking for all documentation requirements
- **Focus Mode**: Surface blocked, in-progress, and pinned items
- **Settings**: Launch date configuration, data export/import, reset
- **Optional Cloud Sync**: Free Supabase sync with localStorage fallback

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Local Storage** for persistence
- **Supabase (optional)** for shared cloud sync

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

```bash
# Clone or copy the project
cd str-command-center

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect repository to Vercel at [vercel.com](https://vercel.com)
3. Vercel will auto-deploy on push

### Environment Variables

No environment variables are required for local-only mode.

To enable free Supabase sync across devices, create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_STATE_KEY=family
```

`NEXT_PUBLIC_SUPABASE_STATE_KEY` lets you choose which single shared state record this app uses.

### Supabase Setup (Free Tier)

1. Create a free Supabase project.
2. Open SQL Editor and run:

```sql
create table if not exists public.app_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

create policy "public_read_app_state"
on public.app_state
for select
to anon
using (true);

create policy "public_write_app_state"
on public.app_state
for insert
to anon
with check (true);

create policy "public_update_app_state"
on public.app_state
for update
to anon
using (true)
with check (true);

create policy "public_delete_app_state"
on public.app_state
for delete
to anon
using (true);
```

3. Add the env vars above and redeploy.

The app always keeps localStorage as fallback, so it still works if cloud sync is unavailable.

## Project Structure

```
str-command-center/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Dashboard
│   │   ├── roadmap/         # Roadmap page
│   │   ├── documents/       # Documents page
│   │   ├── focus/           # Focus mode page
│   │   └── settings/        # Settings page
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI primitives
│   │   ├── sidebar.tsx      # Desktop navigation
│   │   └── mobile-nav.tsx   # Mobile navigation
│   ├── data/                # Static data (roadmap, documents)
│   ├── lib/                 # Utilities and state management
│   │   ├── context.tsx      # React context for app state
│   │   ├── storage.ts       # LocalStorage persistence + timestamps
│   │   ├── supabase.ts      # Optional cloud sync adapter
│   │   ├── selectors.ts     # Computed values from state
│   │   └── utils.ts         # Helper functions
│   └── types/               # TypeScript types
├── public/                  # Static assets
├── tailwind.config.js       # Tailwind configuration
└── package.json
```

## Data Architecture

### State (Local + Optional Cloud)

```typescript
interface AppState {
  completedIds: number[];      // Completed task IDs
  completedDocIds: string[];   // Completed document IDs
  taskMeta: Record<number, {   // Task metadata
    note?: string;
    status?: 'default' | 'in-progress' | 'blocked' | 'na';
    completedAt?: string;
  }>;
  pinnedIds: number[];         // Pinned task IDs
  launchDate: string;          // Target launch date
  collapsedCategories: string[];
}
```

### Future Database Migration

The state architecture is designed to easily migrate to a database:

1. Keep local state as offline fallback
2. Sync state to `app_state.payload` in Supabase
3. Resolve startup conflicts using `updated_at`

## Preserved from Original

- ✅ All 756 roadmap tasks with section/category structure
- ✅ 115 documentation artifacts
- ✅ Pre-listing / Ongoing / Post-listing timing
- ✅ Task completion tracking
- ✅ Status flags (blocked, in-progress, N/A)
- ✅ Notes per task
- ✅ Section progress percentages
- ✅ Launch countdown
- ✅ Import/export JSON backup
- ✅ Focus mode for priority items
- ✅ Dark theme aesthetic

## What's Improved in v2.1

### Command & Navigation
- ⌨️ **CMD+K Command Palette**: Instant fuzzy search across all tasks, docs, and pages
- 📌 **Collapsible Sidebar**: Toggle between full and icon-only rail mode
- 🎯 **Smart Navigation**: Blocked task count badge, active state indicators

### Dashboard Redesign
- 📊 **Bento Grid Layout**: Action-oriented cards focused on what's at risk
- 🔴 **Blocked Items Card**: High-visibility treatment for blockers
- ⏱️ **Launch Countdown**: Urgency pulse animation when < 7 days
- 🎯 **Critical Path**: Shows next 3 highest-priority tasks automatically

### Roadmap Enhancements
- 📍 **Sticky Headers**: Category headers stay visible while scrolling
- ✏️ **Inline Editing**: Slide-in drawer for quick updates without navigation
- 🎨 **Status Colors**: Red (blocked), Amber (in-progress), strikethrough (N/A)
- 📝 **Note Indicators**: Visual badges for tasks with notes

### Documents Repository
- ⚠️ **Required/Optional**: Pre-Listing docs flagged as required for launch
- 🔔 **Missing Docs Banner**: Warning when required docs are incomplete
- 🏷️ **Type Grouping**: Documents organized by type for better scanning
- 📊 **Three Stats Cards**: Overall, Required, and Optional completion

### Design & Performance
- 🎨 **Professional Dark Theme**: Zinc-950 background with blue-500 accents
- ⚡ **Optimized for Scale**: Handles 756 tasks smoothly with sticky headers
- 💀 **Skeleton Loaders**: Match actual layout for better perceived performance
- 🎭 **Micro-interactions**: Smooth 300ms transitions, no layout jumps

### Previous v2.0 Features
- ✨ Clean, maintainable codebase (not a single 9000+ line file)
- ✨ TypeScript for type safety
- ✨ React state management instead of vanilla JS
- ✨ Component-based architecture
- ✨ Mobile-responsive design
- ✨ Proper routing with Next.js
- ✨ Simplified UI without visual clutter
- ✨ Faster navigation between views
- ✨ Better filter/search UX

## License

Private use only.
