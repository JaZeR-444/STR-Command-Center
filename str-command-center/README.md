# STR Launch Command Center

A modern, lightweight web application for tracking short-term rental launch progress.

## Features

- **Dashboard**: Global overview with key metrics, section progress, and focus items
- **Roadmap**: Section-by-section task checklist with filtering and search
- **Documents**: Artifact tracking for all documentation requirements
- **Focus Mode**: Surface blocked, in-progress, and pinned items
- **Settings**: Launch date configuration, data export/import, reset

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Local Storage** for persistence (no database required)

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

No environment variables required for basic deployment.

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
│   │   ├── storage.ts       # LocalStorage persistence
│   │   ├── selectors.ts     # Computed values from state
│   │   └── utils.ts         # Helper functions
│   └── types/               # TypeScript types
├── public/                  # Static assets
├── tailwind.config.js       # Tailwind configuration
└── package.json
```

## Data Architecture

### State (LocalStorage)

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

1. Replace `storage.ts` with API calls
2. Add server actions or API routes
3. Swap `localStorage` for database queries

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

## What's Improved

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
