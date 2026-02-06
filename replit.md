# ClinicalPlay.app

## Overview

ClinicalPlay is a premium telehealth SaaS platform for interactive therapy games. It provides clinicians with a real-time, collaborative "Playroom" environment where they can conduct therapeutic sessions with clients using tools like a Digital Sandtray. The platform emphasizes a luxury, glassmorphic UI aesthetic with mobile-first responsive design. Clients join sessions anonymously via 6-character invite codes, while clinicians manage sessions from a dashboard.

Key features include:
- **Real-time collaboration** via WebSockets for synchronized canvas/game state
- **Digital Sandtray** — a shared canvas where participants drag-and-drop emoji-based therapeutic assets
- **Calm Breathing Guide** — a synchronized breathing bubble (SVG with Soft Sage → Deep Navy gradient, 4-phase: inhale 4s, hold 4s, exhale 6s, rest 2s) that clinicians control and syncs to all participants
- **Tool Selector** — modal for switching between clinical tools (Sandtray, Breathing active; CBT, Feeling Wheel coming soon)
- **Clinical Insights** — private clinician-only panel with contextual therapeutic prompts per active tool
- **Session management** — clinicians create sessions, generate invite codes, and moderate (lock canvas, toggle anonymity, clear items)
- **Moderator controls** — clinician-only tools for managing the session experience
- **Presence system** — activity pulse animations on participants when interacting with the canvas
- **Mobile-first design** with bottom navigation bar on mobile, bottom dock asset library, glassmorphism throughout

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript (not Next.js despite early design docs — uses Vite)
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS v4 (using `@tailwindcss/vite` plugin), with CSS variables for theming
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives — extensive component library in `client/src/components/ui/`
- **Custom Components**: GlassCard (glassmorphic cards), ZenCanvas (sandtray), AssetLibrary (drag-and-drop assets), ModeratorBar (clinician controls), BreathingGuide (SVG breathing bubble), ToolSelector (clinical tool modal), ClinicalInsights (private clinician prompts)
- **Animations**: Framer Motion for page transitions and UI interactions
- **Typography**: Lora (serif headings), Inter (sans-serif body), Playfair Display (display text) — loaded via Google Fonts
- **Color Palette**: Deep Navy primary, Champagne Gold accent, Soft Sage background — defined as CSS custom properties

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript, transpiled with tsx (dev) and esbuild (production)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Real-time**: WebSocket server (ws library) on `/ws` path, with room-based broadcasting for session collaboration
- **Build**: Vite for client bundle, esbuild for server bundle; production output in `dist/`

### Key API Routes
- `POST /api/sessions` — create a new session
- `GET /api/sessions/:id` — get session by ID
- `GET /api/sessions/invite/:code` — lookup session by invite code
- `PATCH /api/sessions/:id` — update session settings
- `GET /api/sessions/clinician/all` — list all sessions
- Participant and sandtray item CRUD routes also exist

### WebSocket Protocol
- Clients connect to `/ws` and send a `join` message with sessionId, participantId, displayName
- Messages include: `join`, `item-placed`, `item-moved`, `item-removed`, `clear-canvas`, `cursor-move`, `session-update`, `tool-change`, `breathing-toggle`, `activity-pulse`
- Room-based broadcasting ensures only participants in the same session receive updates
- Server maintains per-room state (activeTool, breathingActive, breathingStartTime) for late-joiner synchronization
- Init payload includes room state so new participants sync to current tool and breathing exercise status

### Data Storage
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with drizzle-zod for validation schema generation
- **Schema location**: `shared/schema.ts` — shared between client and server
- **Migrations**: Generated via `drizzle-kit push` (stored in `migrations/`)
- **Connection**: node-postgres (`pg`) Pool

### Database Schema (4 tables)
1. **users** — id, username, password, displayName, role (clinician/client)
2. **sessions** — id, name, clinicianId (FK to users), inviteCode (unique), status, isCanvasLocked, isAnonymous, activeTool, createdAt
3. **participants** — id, sessionId (FK), userId (FK, optional), displayName, role, color
4. **sandtrayItems** — id, sessionId (FK), placedBy, icon, category, x, y, scale, rotation

### Authentication
- **Replit Auth** integration via `@replit/express-auth` — supports Google, GitHub, Apple, and email/password sign-in
- Auth routes: `GET /api/login` (redirect to Replit auth), `GET /api/logout`, `GET /api/auth/user` (returns authenticated user info)
- Protected routes use `isAuthenticated` middleware to restrict session creation/management to authenticated clinicians
- Session table (`sessions`) is managed by Replit Auth; app uses `therapy_sessions` table to avoid naming conflict
- Auth state managed client-side via `useAuth` hook (`client/src/hooks/use-auth.ts`)

### Project Structure
```
├── client/              # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui + GlassCard
│   │   │   ├── layout/          # Navbar
│   │   │   ├── sandtray/        # ZenCanvas, AssetLibrary, ModeratorBar
│   │   │   └── tools/           # BreathingGuide, ToolSelector, ClinicalInsights
│   │   ├── hooks/               # useSessionSocket, useAuth, useMobile, useToast
│   │   ├── lib/                 # Utilities, query client, sandtray assets
│   │   └── pages/               # landing-page, dashboard, playroom, join-session
│   └── index.html
├── server/              # Backend (Express)
│   ├── index.ts         # Entry point, middleware setup
│   ├── routes.ts        # API route registration
│   ├── storage.ts       # Database storage layer (IStorage interface + DatabaseStorage)
│   ├── websocket.ts     # WebSocket server for real-time sync + room state
│   ├── db.ts            # Drizzle + pg pool setup
│   ├── vite.ts          # Vite dev server middleware
│   ├── static.ts        # Production static file serving
│   └── replit_integrations/     # Replit Auth integration
├── shared/              # Shared between client and server
│   └── schema.ts        # Drizzle schema + Zod validation schemas
├── script/
│   └── build.ts         # Production build script
└── migrations/          # Drizzle migration files
```

### Development vs Production
- **Dev**: `tsx server/index.ts` runs the Express server with Vite middleware for HMR
- **Production**: `script/build.ts` builds client with Vite and server with esbuild into `dist/`, served with `node dist/index.cjs`
- Schema changes: `npm run db:push` uses drizzle-kit to push schema to PostgreSQL

## External Dependencies

### Required Services
- **PostgreSQL Database** — Required. Connection via `DATABASE_URL` environment variable. Used for all persistent data (users, sessions, participants, sandtray items).

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit** + **drizzle-zod** — ORM, migrations, and schema validation
- **express** v5 — HTTP server
- **ws** — WebSocket server for real-time collaboration
- **pg** + **connect-pg-simple** — PostgreSQL client and session store
- **@tanstack/react-query** — Server state management
- **framer-motion** — Animations
- **wouter** — Client-side routing
- **zod** — Runtime validation
- **nanoid** — Unique ID generation
- Full shadcn/ui component library (Radix UI primitives, cmdk, vaul, embla-carousel, react-day-picker, input-otp, recharts)

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal** — Runtime error overlay in dev
- **@replit/vite-plugin-cartographer** — Dev tooling (conditional, dev only)
- **@replit/vite-plugin-dev-banner** — Dev banner (conditional, dev only)
- **vite-plugin-meta-images** — Custom plugin for OpenGraph meta tag management in deployments