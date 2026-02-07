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
- **Theming**: User-configurable light/dark/system modes and 6 accent color presets (Classic Navy & Gold, Emerald & Gold, Sapphire & Silver, Rose & Champagne, Amethyst & Copper, Ocean Teal & Sand), persisted via localStorage. ThemeProvider context wraps entire app. Toggle in navbar + full settings in Profile page.

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
- **Demo Mode**: Local-only sandbox sessions for clinicians to explore tools without data persistence.
- **Guided Tours**: Interactive, spotlight-based onboarding tours for new users.

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with `drizzle-zod` for schema validation.
- **Schema**: Shared `shared/schema.ts` defining 10 tables including `users`, `therapy_sessions`, `participants`, `sandtrayItems`, `waitlist_entries`, and tables for other therapeutic tools (e.g., `feeling_wheel_selections`).

### Project Structure Highlights
- **`client/`**: Frontend React application.
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