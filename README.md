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

### Phase 1 - Core Planning & Execution
- Dashboard with progress rings, velocity tracking, and critical path visualization
- Roadmap view for task completion, notes, and status tracking
- Documents repository with:
  - Multi-file drag-and-drop upload
  - Auto-tagging per uploaded file
  - Master file directory grouped by section and artifact
- Focus mode for blocked, active, and pinned work
- Settings for export/import/reset and launch date controls

### Phase 2 - Operational Excellence
- **Turnover Queue Management** - Operations task tracking with status workflow (queued → in_progress → completed)
- **Dynamic Pricing Grid** - Calendar-based pricing with strategies, bulk editing, and pricing rules
- **Revenue & Performance Reports** - Multi-tab reporting (overview, revenue, occupancy, channels) with CSV export
- **Issue Logging & Maintenance Tracker** - Maintenance issue tracking with priority levels and cost tracking
- **Guest Profile Management** - Guest directory with flags (VIP, repeat, problematic), preferences, and history

### Phase 3 - Intelligent Operations
- **Market Snapshot Dashboard** - Competitive intelligence, event tracking, market metrics, and automated insights
- **Morning Briefing System** - Daily personalized briefing with action items, today's schedule, and performance metrics
- **Automation & Smart Triggers** - Configurable automation rules with trigger/action workflow and execution logs
- **Mobile Optimization** - Touch-optimized UI, swipe gestures, pull-to-refresh, mobile navigation with operational pages
- **Property Settings & Configuration** - Comprehensive property management with access codes, house rules, and vendor contacts

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

## Pages & Routes

### Core Pages
- `/` - Dashboard with progress, metrics, and critical path
- `/roadmap` - Full task list with filtering and editing
- `/documents` - Document repository with file uploads
- `/focus` - Blocked, in-progress, and pinned task view
- `/pipeline` - Task pipeline visualization
- `/settings` - Configuration, import/export, launch date

### Operations Pages (Phase 2+)
- `/operations` - Turnover queue and operations task management
- `/pricing` - Dynamic pricing calendar with bulk editing and rules
- `/reports` - Revenue and performance analytics with CSV export
- `/issues` - Maintenance issue tracking and status workflow
- `/reservations` - Guest reservations and booking management
- `/guests` - Guest profiles with history and communication
- `/inbox` - Message threads and guest communications
- `/calendar` - Calendar view of reservations and events

### Intelligence Pages (Phase 3+)
- `/market` - Market snapshot with competitor tracking and events
- `/briefing` - Daily morning briefing with action items
- `/automation` - Automation rules management and logs
- `/properties` - Property settings and configuration

## Project Structure

```text
.
├── public/
├── scripts/
├── src/
│   ├── app/
│   │   ├── automation/         # Automation rules management
│   │   ├── briefing/           # Daily briefing system
│   │   ├── calendar/           # Calendar view
│   │   ├── documents/          # Document repository
│   │   ├── focus/              # Focus mode
│   │   ├── guests/             # Guest management
│   │   ├── inbox/              # Messaging
│   │   ├── issues/             # Maintenance tracking
│   │   ├── market/             # Market intelligence
│   │   ├── operations/         # Operations tasks
│   │   ├── pipeline/           # Pipeline view
│   │   ├── pricing/            # Dynamic pricing
│   │   ├── properties/         # Property settings
│   │   ├── reports/            # Analytics & reports
│   │   ├── reservations/       # Booking management
│   │   ├── roadmap/            # Task roadmap
│   │   ├── settings/           # App settings
│   │   ├── globals.css         # Global styles + mobile utilities
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── briefing/           # Briefing components
│   │   ├── layout/             # Navigation & layout
│   │   ├── market/             # Market components
│   │   ├── mobile/             # Mobile-specific components
│   │   ├── operations/         # Operations components
│   │   ├── tasks/              # Task components
│   │   └── ...
│   ├── data/                   # Static data
│   │   ├── properties.ts       # Property definitions
│   │   ├── roadmap.ts          # Task roadmap
│   │   └── documents.ts        # Document artifacts
│   ├── lib/
│   │   ├── briefing-utils.ts   # Briefing calculations
│   │   ├── context.tsx         # Global state management
│   │   ├── file-storage.ts     # IndexedDB storage
│   │   ├── mobile-hooks.ts     # Mobile gestures & detection
│   │   ├── report-utils.ts     # Analytics calculations
│   │   ├── selectors.ts        # Computed state
│   │   ├── storage.ts          # localStorage persistence
│   │   ├── supabase.ts         # Cloud sync
│   │   └── utils.ts            # Utilities
│   └── types/
│       └── index.ts            # Centralized type definitions
├── .env.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── CLAUDE.md                   # AI agent instructions
└── vercel.json
```

## Recent Updates

### Phase 2 - Operational Excellence (Tasks #6-10) ✅
**2026-04-23**

1. **Task #6: Turnover Queue Management**
   - Types: `OperationsTask`, task statuses (queued, in_progress, completed)
   - Components: TaskCard, TaskDetailModal
   - Page: `/operations` with status grouping and filtering
   - Features: Priority badges, checklist tracking, cost estimation

2. **Task #7: Dynamic Pricing Grid**
   - Types: `DailyPricing`, `PricingRule`, pricing strategies
   - Components: PricingCalendar, BulkEditModal, PricingRules
   - Page: `/pricing` with month navigation and property selector
   - Features: Color-coded strategies, bulk editing, pricing rules manager

3. **Task #8: Revenue & Performance Reports**
   - Utils: RevenueReport, OccupancyReport calculations
   - Components: RevenueChart, ChannelBreakdown
   - Page: `/reports` with multi-tab interface (overview, revenue, occupancy, channels)
   - Features: CSV export, period selectors, key metrics (ADR, RevPAN, occupancy)

4. **Task #9: Issue Logging & Maintenance Tracker**
   - Types: `MaintenanceIssue`, priority/status enums
   - Components: IssueCard, IssueDetailModal
   - Page: `/issues` with status workflow and filtering
   - Features: Priority badges, cost tracking, issue categories, status progression

5. **Task #10: Guest Profile Enhancement**
   - Types: `GuestProfile` with flags, preferences, spending
   - Components: GuestCard, GuestProfileModal
   - Page: `/guests` with filtering, sorting, and lifetime value metrics
   - Features: VIP/repeat/problematic flags, preference tracking, communication history

### Phase 3 - Intelligent Operations (Tasks #11-15) ✅
**2026-04-23**

1. **Task #11: Market Snapshot Dashboard**
   - Types: `MarketCompetitor`, `LocalEvent`, `MarketMetrics`
   - Components: CompetitorCard, EventCard, MarketMetricsDisplay
   - Page: `/market` with 3 view modes (overview, competitors, events)
   - Features: Price trend tracking, event impact assessment, market insights generation

2. **Task #12: Morning Briefing System**
   - Utils: `generateDailyBriefing()` with smart action items
   - Components: ActionItems, TodaySchedule
   - Page: `/briefing` with personalized daily summary
   - Features: Action priorities, check-in/check-out scheduling, performance metrics

3. **Task #13: Automation & Smart Triggers**
   - Types: `AutomationRule`, `AutomationLog`, trigger/action types
   - Pre-configured rules: Task creation, price adjustments, notifications, guest messages
   - Page: `/automation` with rule management and statistics
   - Features: Conditional triggers, action chains, execution logging, cooldown support

4. **Task #14: Mobile Optimization**
   - Utils: `mobile-hooks.ts` with swipe, pull-to-refresh, long-press, haptic feedback
   - Components: FloatingActionButton, BottomSheet
   - Updated: MobileNav with operational pages (Today, Tasks, Stays, Inbox)
   - Features: Touch-friendly tap targets, safe area support, gesture detection, pull-to-refresh

5. **Task #15: Property Settings & Configuration**
   - Types: `PropertySettings` with access codes, house rules, contacts
   - Page: `/properties` with 5 configuration tabs
   - Features: Access information (WiFi, door codes), guest instructions, house rules, emergency/vendor contacts
   - Stats: Revenue tracking, booking metrics, occupancy data

### Data & Type System Enhancements
- **17 new types** added to centralized `src/types/index.ts`
- **6 sample automation rules** with realistic business logic
- **5 mock market competitors** with price history and occupancy data
- **6 local events** with pricing recommendations and impact levels
- **Extended AppState** with 8 new data collections for operations

### Storage & Persistence
- All new data structures integrated into localStorage persistence
- New collections: `automationRules`, `automationLogs`, `marketCompetitors`, `localEvents`, `marketMetrics`, `propertySettings`
- Maintained localStorage prefix convention: `str_cc_*`

### Component Library Expansions
- **12 new feature components** across market, briefing, operations, and mobile
- **Mobile-specific utilities**: `useSwipe()`, `usePullToRefresh()`, `useLongPress()`, `useHaptic()`
- **Mobile components**: FloatingActionButton, BottomSheet with snap points
- **Enhanced CSS**: Mobile optimizations, safe area insets, haptic feedback animations

## Notes

- `node_modules`, `.next`, local env files, and local research/archive folders should not be committed.
- This repository is private and intended for internal/family operations.
- All changes are backward compatible with existing Phase 1 features.
- Mobile optimizations enhance existing pages without breaking desktop layouts.

## License

Private use only.
