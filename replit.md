# ClinicalPlay.app

## Overview
ClinicalPlay is a premium telehealth SaaS platform designed for interactive therapy games, targeting clinicians to facilitate therapeutic sessions. Its core offering is a real-time, collaborative "Playroom" environment featuring a Digital Sandtray. The platform prioritizes a luxury, glassmorphic UI with a mobile-first responsive design. Clients join anonymously via invite codes, while clinicians manage sessions and access private clinical insights. The project aims to provide innovative tools for mental health professionals, enhancing client engagement and therapeutic outcomes through digital interaction.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript (Vite)
- **Routing**: Wouter
- **State/Data Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS v4, utilizing CSS variables for dynamic theming, glassmorphism design system
- **UI Components**: shadcn/ui (New York style) built on Radix UI primitives, supplemented with custom components like GlassCard, ZenCanvas (Digital Sandtray), AssetLibrary, ModeratorBar, BreathingGuide, ToolSelector, ClinicalInsights, and GuidedTour.
- **Animations**: Framer Motion for interactive UI and transitions.
- **Typography**: Lora (serif headings), Inter (sans-serif body), Playfair Display (display text).
- **Theming**: 6 accent color presets (Classic Navy & Gold, Emerald & Gold, Sapphire & Silver, Rose & Champagne, Amethyst & Copper, Ocean Teal & Sand), light mode only (dark mode removed pending redesign). Persisted via localStorage. ThemeProvider context wraps entire app. Color palette settings in Profile page.

### Backend
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript
- **API Pattern**: RESTful JSON API.
- **Real-time Communication**: WebSocket server (`ws` library) for synchronized session states and participant interactions.
- **Build**: Vite for client, esbuild for server.

### Key Features & Implementations
- **Real-time Collaboration**: WebSockets synchronize canvas states, participant cursors, and tool usage across all session members.
- **Digital Sandtray**: Physics-based shared canvas with drag momentum, friction, lift shadows, soft collision, and sand particle effects. Includes interactive transform handles for scaling and rotation.
- **Calm Breathing Guide**: Synchronized SVG breathing bubble with clinician controls.
- **Clinical Insights**: Context-aware, clinician-only prompts that adapt to session activities.
- **Session Management**: Clinician dashboard for creating, managing, and moderating sessions, including lock canvas, anonymity toggles, and clearing items.
- **User Authentication**: Supabase Auth for email/password, with JWT validation for secure access.
- **Moderator Controls**: Clinician-only tools for managing the session experience.
- **Presence System**: Activity pulse animations and WebSocket heartbeat monitoring for connection status.
- **Mobile-first Design**: Responsive layouts with bottom navigation and asset library.
- **Pre-launch & Waitlist**: Restricted access, waitlist signup, and admin panel for user/waitlist management.
- **Session Lifecycle**: End session functionality with confirmation, session summary, and PHI safety warnings for new session names.
- **Snapshot Watermarking**: Exported session PNGs include metadata footer.
- **Demo Mode**: Local-only sandbox sessions for clinicians to explore tools without data persistence. End session works without API calls.
- **Guided Tours**: Interactive, spotlight-based onboarding tours for new users.
- **DBT House** (Game): Interactive skill-building game where clients construct a house layer by layer. 4 DBT layers (Foundation/Distress Tolerance, Living Room/Mindfulness, Study/Interpersonal Effectiveness, Zen Space/Wise Mind), 3 items per layer with therapeutic discussion prompts, built-in Feelings Wheel sidebar, progress tracking. Components: `client/src/components/tools/dbt-house/`. Audio: `client/public/sounds/dbt-success.mp3`, `client/public/sounds/dbt-hit.mp3`. Images: 13 PNGs in `client/public/images/`. Uses Zustand store at `client/src/lib/stores/useAudio.tsx`.
- **CBT Thought Court** (Game): Put negative thoughts on trial. Components: `client/src/components/tools/cbt-thought-court/`.
- **ACT Values Compass** (Game): Map values, spot barriers, chart a course. Components: `client/src/components/tools/act-values-compass/`.
- **IFS Inner Council** (Game): Discover inner parts and respond from Self. Components: `client/src/components/tools/ifs-inner-council/`.
- **MI Motivation Garden** (Game): Grow motivation for change. Components: `client/src/components/tools/mi-motivation-garden/`.
- **Grounding Grove** (Game): Somatic body scan with 8 body regions, tension rating (1-10), and 2-3 grounding techniques per region with discussion prompts. Components: `client/src/components/tools/somatic-grounding-grove/`. Files: GroundingGrove.tsx, BodyMap.tsx, RegionPanel.tsx, TensionRater.tsx, TechniqueCard.tsx, WelcomeScreen.tsx, grove-data.ts.
- **Miracle Bridge** (Game): SFBT tool — walk across a 7-step bridge from today to preferred future, includes miracle question, exception-finding, scaling (1-10), and journey summary. Components: `client/src/components/tools/sfbt-miracle-bridge/`. Files: MiracleBridge.tsx, BridgeVisual.tsx, StepPanel.tsx, JourneySummary.tsx, WelcomeScreen.tsx, bridge-data.ts.
- **Library Organization**: Tools and Games are separate categories. `ToolDefinition` has a `category: "tool" | "game"` field. Library page shows Tools and Games in distinct sections. Tool selector groups items by category with section headers. Future games should use `category: "game"`.
- **Adding future games**: (1) Add component files to `client/src/components/tools/[game-name]/`, (2) Add to `TOOLS` in tool-selector.tsx with `category:"game"`, (3) Add import + render in playroom.tsx, (4) Add to `ALL_TOOLS` in dashboard.tsx, (5) Add entry to TOOLS_LIBRARY in tools-library.ts with `category:"game"`, (6) Add prompts to clinical-insights.tsx TOOL_PROMPTS, (7) Add display name in playroom.tsx `toolDisplayName`.
- **Removed Tools** (component files kept on disk for future re-addition): Volume Mixer (`client/src/components/tools/volume-mixer.tsx`), Feeling Wheel (`client/src/components/tools/feeling-wheel.tsx`), Thought Bridge (`client/src/components/tools/thought-bridge.tsx`). These are unregistered from all integration points but the files remain.
- **activeTool default**: `"dbt-house"` in schema.ts and websocket.ts

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with `drizzle-zod` for schema validation.
- **Schema**: Shared `shared/schema.ts` defining 12 tables including `users`, `therapy_sessions`, `participants`, `sandtrayItems`, `waitlist_entries`, `thought_bridge_records`, `thought_bridge_evidence`, and tables for other therapeutic tools (e.g., `feeling_wheel_selections`).

### Settings Architecture
- **Unified single page**: `/settings` — one scrollable page with all 8 sections, file: `client/src/pages/settings.tsx`
- **Sections**: Profile, Professional, Appearance, Session Defaults, Plan & Billing, Team, Security, Data & Privacy
- **Navigation**: Desktop sticky sidebar + mobile horizontal scrollable tabs; IntersectionObserver highlights active section on scroll; click-to-scroll-to-section
- **Wired features**: Password reset (Supabase `resetPasswordForEmail`), account deletion (`DELETE /api/account` + Supabase admin delete), theme persistence (server + localStorage), profile save (API), session defaults (API)
- **Old routes**: `/workspace`, `/account`, `/profile`, `/settings/:section` all redirect to `/settings`
- **Legacy files**: `client/src/pages/settings/` directory contains old sub-page files (no longer imported)

### Project Structure Highlights
- **`client/`**: Frontend React application.
- **`client/src/pages/settings.tsx`**: Unified settings page with all sections.
- **`server/`**: Express backend, including API routes, WebSocket handling, and database interaction.
- **`shared/`**: Common code like database schemas and validation.

## External Dependencies

### Required Services
- **PostgreSQL Database**: Essential for all persistent data storage.
- **Supabase**: Primary authentication provider.
- **Stripe**: Payment gateway for subscription management (monthly, annual, founding member plans).

### Key NPM Packages
- **drizzle-orm**, **drizzle-kit**, **drizzle-zod**: Database ORM and schema tooling.
- **express**: Backend HTTP server.
- **ws**: WebSocket server implementation.
- **pg**: PostgreSQL client.
- **@supabase/supabase-js**: Supabase client library for authentication.
- **@tanstack/react-query**: Frontend server state management.
- **framer-motion**: Animation library.
- **wouter**: Lightweight client-side router.
- **zod**: Runtime schema validation.
- **nanoid**: Unique ID generation.
- **shadcn/ui** and associated Radix UI primitives.