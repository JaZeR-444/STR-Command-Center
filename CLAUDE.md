# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

STR Command Center is a Next.js 16 (App Router) operational CRM for managing short-term rental operations. It manages reservations, guests, communications, pricing, and property performance with local-first architecture and optional cloud sync. This is a private, single-operator tool optimized for owner-operators running their STR business day-to-day.

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server at http://localhost:3000
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

### Data Extraction
```bash
npm run extract-data # Run data extraction script (uses ts-node)
```

## Architecture

### State Management

The application uses a **local-first architecture** with an optional cloud sync layer:

1. **Primary Store**: `localStorage` (via `src/lib/storage.ts`)
   - All state changes save to localStorage immediately
   - State keys prefixed with `str_cc_`
   - Validates all IDs against static data sources on load/import

2. **Binary Storage**: IndexedDB (via `src/lib/file-storage.ts`)
   - Stores file blobs for document attachments
   - Database: `str_cc_files`, Store: `files`

3. **Cloud Sync**: Optional Supabase integration (via `src/lib/supabase.ts`)
   - Only active if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured
   - Uses "last-write-wins" conflict resolution based on `updated_at` timestamp
   - Syncs on bootstrap and after every state mutation
   - Table: `app_state`, State key: configurable via `NEXT_PUBLIC_SUPABASE_STATE_KEY` (default: "family")

4. **Global Context**: React Context API (via `src/lib/context.tsx`)
   - `AppProvider` wraps the entire app in `src/app/layout.tsx`
   - Provides `useApp()` hook for accessing state and actions
   - All mutations go through context methods (never directly mutate state)

### Key State Shape (AppState)

```typescript
{
  completedIds: number[]           // Completed task IDs
  completedDocIds: string[]        // Completed document IDs
  taskMeta: Record<number, TaskMeta>  // Task metadata (notes, status, checklists, etc.)
  docMeta: Record<string, DocMeta>    // Document metadata (notes, attachments, etc.)
  pinnedIds: number[]              // Pinned task IDs
  launchDate: string               // Target launch date
  collapsedCategories: string[]    // UI state for collapsed categories
  activityLog: ActivityEntry[]     // Global activity log (last 200 entries)
  preferences: UserPreferences     // User settings (theme, auto-collapse, etc.)
  fileRegistry: Record<string, FileRegistryRecord>  // File deduplication registry
}
```

### Data Sources

**Operational data** is stored in state and managed through the context API:
- Reservations, guests, messages, operations tasks, maintenance issues
- Pricing calendar, market data, automation rules
- Property profiles and settings

**Legacy static data** (deprecated, for reference only):
- `src/data/roadmap.ts` - Deprecated launch readiness tasks (archived)
- `src/data/documents.ts` - Deprecated document artifacts (archived)

### Computed State (Selectors)

All derived/computed values are in `src/lib/selectors.ts`:
- Progress calculations
- Section summaries
- Filtering and grouping
- Critical path identification

**Always use selectors** instead of computing values inline.

### File Storage Architecture

The app has a sophisticated file deduplication system:

1. **File Registry** (`state.fileRegistry`): Content-addressed file metadata
   - Each file is hashed (SHA-256) to create a unique ID
   - Multiple documents can link to the same file blob via hash
   - Registry tracks: hash, storage location (local/cloud/hybrid), linked document IDs

2. **IndexedDB**: Stores actual file blobs locally (key = file hash)

3. **Supabase Storage** (optional): Cloud file storage bucket
   - Bucket name: configurable via `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` (default: "str-files")
   - Files stored by hash for deduplication

4. **Document Attachments** (`docMeta[docId].attachments`): Per-document attachment references
   - Each attachment links to a file registry entry via hash
   - Tracks source: 'local' | 'cloud' | 'hybrid'

## Page Structure

The app has 18 pages organized by capability (all using App Router):

### Core Pages (Phase 1)
1. **Dashboard** (`src/app/page.tsx`) - Overview with progress rings, velocity tracking, critical tasks
2. **Roadmap** (`src/app/roadmap/page.tsx`) - Full task list grouped by section/category
3. **Documents** (`src/app/documents/page.tsx`) - Document tracking with file upload, master directory
4. **Focus** (`src/app/focus/page.tsx`) - Blocked, in-progress, and pinned tasks
5. **Pipeline** (`src/app/pipeline/page.tsx`) - Task pipeline view
6. **Settings** (`src/app/settings/page.tsx`) - Import/export, launch date, preferences

### Operations Pages (Phase 2)
7. **Operations** (`src/app/operations/page.tsx`) - Turnover queue management with status workflow
8. **Pricing** (`src/app/pricing/page.tsx`) - Dynamic pricing calendar with strategies and rules
9. **Reports** (`src/app/reports/page.tsx`) - Multi-tab analytics (revenue, occupancy, channels) with CSV export
10. **Issues** (`src/app/issues/page.tsx`) - Maintenance tracking with priority and status management
11. **Reservations** (`src/app/reservations/page.tsx`) - Guest bookings and reservation management
12. **Guests** (`src/app/guests/page.tsx`) - Guest directory with profiles and communication history
13. **Inbox** (`src/app/inbox/page.tsx`) - Message threads and guest communications
14. **Calendar** (`src/app/calendar/page.tsx`) - Calendar view of reservations and events

### Intelligence Pages (Phase 3)
15. **Market** (`src/app/market/page.tsx`) - Competitive intelligence with event tracking and insights
16. **Briefing** (`src/app/briefing/page.tsx`) - Daily morning briefing with action items and metrics
17. **Automation** (`src/app/automation/page.tsx`) - Automation rules management and execution logs
18. **Properties** (`src/app/properties/page.tsx`) - Property settings and configuration

## Component Patterns

### Drawers/Modals

Task and document detail views use drawer components:
- `src/components/tasks/roadmap-edit-drawer.tsx` - Full task editing (status, notes, checklists, files)
- `src/components/tasks/task-detail-drawer.tsx` - Task detail view
- `src/components/documents/document-viewer-pane.tsx` - Document viewer with attachments

### Mobile Responsiveness

The app is mobile-first with desktop sidebar:
- Desktop: Fixed sidebar (`src/components/layout/sidebar.tsx`)
- Mobile: Bottom navigation (`src/components/layout/mobile-nav.tsx`)
- Swipeable task cards (`src/components/tasks/swipeable-task.tsx`)

### Search/Command Palette

Global search accessible via Cmd+K / Ctrl+K:
- `src/components/search/command-palette.tsx`
- Searches tasks, documents, and notes
- Uses Fuse.js for fuzzy searching

### Mobile Interactions (Phase 3)

Mobile-specific hooks and components in `src/lib/mobile-hooks.ts`:
- `useIsMobile()` - Detect touch-enabled mobile devices
- `useSwipe()` - Swipe gesture detection (left, right, up, down)
- `usePullToRefresh()` - Pull-to-refresh with configurable threshold
- `useLongPress()` - Long press detection with haptic feedback
- `useHaptic()` - Vibration feedback (light, medium, heavy, success, error)
- `useOrientation()` - Device orientation tracking (portrait/landscape)
- `useSafeArea()` - Safe area insets for notches and home indicators

Mobile components:
- `FloatingActionButton` - Contextual action menu for mobile
- `BottomSheet` - Swipeable bottom drawer with snap points

## Styling

- **Framework**: Tailwind CSS 3.4
- **Theme**: Dark mode by default, light mode toggle in settings
- Theme preference stored in `state.preferences.theme`
- Light theme applied via `.light-theme` class on `<html>`
- Custom CSS variables in `src/app/globals.css`

### Fonts
- Body: DM Sans (400-700)
- Headings: Plus Jakarta Sans (500-800)
- Mono: JetBrains Mono (400-600)

## TypeScript

All types are centralized in `src/types/index.ts`. Key types include:

### Core Types
- `Task`, `TaskMeta`, `TaskStatus`, `TaskPriority`
- `DocumentArtifact`, `DocMeta`, `DocumentStatus`
- `AppState`, `UserPreferences`
- `ChecklistItem`, `AttachedFile`, `FileRegistryRecord`
- `Property`, `PropertyStatus`, `PropertyChannel`

### Operations Types (Phase 2)
- `Reservation`, `ReservationStatus`, `ReservationSource`
- `OperationsTask`, `OperationsTaskType`, `OperationsTaskStatus`
- `MaintenanceIssue`, `IssuePriority`, `IssueStatus`
- `GuestProfile`, `GuestFlag`, `GuestSource`
- `DailyPricing`, `PricingRule`, `PricingStrategy`
- `InboxThread`, `Message`, `MessageSource`

### Intelligence Types (Phase 3)
- `MarketCompetitor` - Competitive intelligence tracking
- `LocalEvent`, `EventImpact` - Event calendar and pricing impact
- `MarketMetrics` - Market-wide statistics and trends
- `AutomationRule`, `AutomationLog` - Automation configuration
- `TriggerType`, `ActionType`, `AutomationCondition`, `AutomationAction` - Rule building blocks
- `PropertySettings` - Extended property configuration

## Important Patterns

### State Mutations

Always use context methods from `useApp()` to mutate state:
```typescript
const { toggleTask, setTaskStatus, setTaskNote, addDocAttachment } = useApp();
```

Never mutate `state` directly or bypass the context.

### Cloud Sync

Every context mutation automatically:
1. Updates local state
2. Saves to localStorage
3. Attempts cloud sync (if configured)

Cloud sync failures are non-blocking - the app continues working offline.

### File Handling

When adding file attachments:
1. Hash the file content (SHA-256)
2. Check if file already exists in registry
3. If new: save to IndexedDB and optionally upload to Supabase
4. Update document's attachments array with reference
5. Update file registry with document linkage

See `src/lib/document-file-service.ts` for implementation.

### Operational Libraries (Phase 2+)

New utility libraries for operations data processing:

1. **Report Utilities** (`src/lib/report-utils.ts`)
   - `calculateRevenueReport()` - Revenue analytics calculations
   - `calculateOccupancyReport()` - Occupancy metrics
   - `exportReportAsCSV()` - CSV export functionality
   - Channel breakdown, period filtering, metrics aggregation

2. **Briefing Utilities** (`src/lib/briefing-utils.ts`)
   - `generateDailyBriefing()` - Smart daily briefing generation
   - Action item prioritization (urgent, important, reminder)
   - Performance metrics calculation
   - `getGreeting()`, `formatDateForBriefing()` - Formatting helpers

3. **Mobile Hooks** (`src/lib/mobile-hooks.ts`)
   - Gesture detection (swipe, long-press)
   - Pull-to-refresh implementation
   - Haptic feedback integration
   - Device orientation and safe area detection

### Mock Data & Initial State

Comprehensive mock data in `src/lib/initial-operations-data.ts`:
- `initialOperationsTasks` - 5 sample operations tasks
- `initialReservations` - Guest bookings with pricing
- `initialGuests` - Guest profiles with flags and history
- `initialInboxThreads` - Message threads
- `initialDailyPricing` - 60 days of pricing with strategies
- `initialPricingRules` - 5 sample pricing rules
- `initialMaintenanceIssues` - 7 maintenance issues
- `initialMarketCompetitors` - 5 competitor properties
- `initialLocalEvents` - 6 local events with impact levels
- `initialMarketMetrics` - Market snapshot data
- `initialAutomationRules` - 6 pre-configured automation rules

## Environment Variables

Copy `.env.example` to `.env.local` for cloud sync:
```bash
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon key
NEXT_PUBLIC_SUPABASE_STATE_KEY=family  # State row identifier
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=str-files  # Storage bucket name
```

**If not configured, the app works entirely offline** with localStorage + IndexedDB.

## Deployment

Designed for Vercel deployment:
- Root directory: `.` (repo root)
- Framework preset: Next.js
- Install: `npm install`
- Build: `npm run build`

Master branch deploys trigger automatic redeployment on Vercel.

## Path Aliases

Uses `@/*` for `./src/*` imports (configured in `tsconfig.json`):
```typescript
import { useApp } from '@/lib/context';
import type { Task } from '@/types';
```
