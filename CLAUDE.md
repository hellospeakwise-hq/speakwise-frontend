# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SpeakWise is a "GitHub for speakers" — a platform connecting speakers, event organizers, and attendees. Built with Next.js 15 (App Router) + React 19, TypeScript, Tailwind CSS, and Radix UI.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # ESLint (max 50 warnings enforced in CI via lint:ci)
```

No test suite is configured yet.

## Environment Variables

```
NEXT_PUBLIC_API_URL          # Backend base URL (default: http://127.0.0.1:8000)
NEXT_PUBLIC_API_TIMEOUT_MS   # Request timeout (default: 30000)
NEXT_PUBLIC_UMAMI_WEBSITE_ID # Analytics tracking ID
```

## Architecture

### Routing (`/app`)

Next.js App Router with role-based dashboard routes:
- `/auth/*` — signin, signup, forgot/reset password
- `/dashboard/speaker`, `/dashboard/organizer`, `/dashboard/attendee` — role-gated dashboards
- `/events`, `/speakers`, `/profile`, `/organizations`, `/review` — core feature pages
- `/discover`, `/blog`, `/about`, `/pricing`, `/contact` — public/marketing pages

### Authentication (`/contexts/auth-context.tsx`)

JWT with refresh token rotation. Tokens and user data stored in `localStorage`. Token refresh is proactive (at 12 min, before 15-min expiration). Failed refresh triggers automatic logout. Role-based redirects after login route users to their respective dashboards.

`ProtectedRoute` component enforces authentication and role checks. Pre-login redirect destination is saved in `sessionStorage.redirectAfterLogin`.

User roles: `attendee | speaker | organizer | admin`

### API Layer (`/lib/api/`)

Axios-based with a central instance in `base.ts`. Request interceptors inject the access token; response interceptors handle 401s with a queued token-refresh mechanism (prevents duplicate refresh calls). Service modules: `auth.ts`, `events.ts`, `speakerApi.ts`, `feedbackApi.ts`, `attendeeApi.ts`, `talksApi.ts`, `experiencesApi.ts`, `organizationApi.ts`, `speakerRequestApi.ts`, `sessionsApi.ts`, `userApi.ts`.

### State Management

React Context (`/contexts/`) for auth. All other state lives in custom hooks under `/hooks/` (e.g., `use-events.ts`, `use-organizer-events.ts`, `use-permissions.tsx`, `use-onboarding.ts`). Hooks compose `useState` + `useEffect` with loading/error states and a `refetch` capability.

### Caching (`/lib/utils/cache.ts`)

localStorage-based with TTL presets — SHORT (10s), MEDIUM (30s), LONG (1m), VERY_LONG (2m). Used for API responses to reduce redundant requests.

### Styling

Tailwind CSS with a CSS-variable HSL theme (`globals.css` defines `--primary`, `--background`, etc.). Dark mode via `next-themes`. Radix UI primitives in `/components/ui/`. Utility: `cn()` (clsx + tailwind-merge). Animations via Framer Motion.

### Forms

React Hook Form + Zod for all form validation. Errors are shown inline at the field level.

### Components (`/components/`)

Organized by feature domain (auth, dashboard, events, speakers, etc.). Dashboards use a tab-based navigation pattern with heavy composition — e.g., `SpeakerDashboardView` assembles `SpeakerStats`, `UpcomingEvents`, `RecentFeedback`, and similar sub-components.

## Key Conventions

- `cn()` for all conditional Tailwind class composition
- Avatar fallbacks use the DiceBear API seeded by user ID/email
- PWA is configured but intentionally disabled (`@ducanh2912/next-pwa`) due to a CI/workbox-build issue
- Umami analytics script is injected in the root layout
- ESLint CI gate allows max 50 warnings (`lint:ci`)
