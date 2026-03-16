# Backend Endpoint/Auth Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace frontend direct database access and temporary shared-password auth with backend API endpoints and bearer-token auth stored in an `httpOnly` cookie.

**Architecture:** Add a small server-only backend client that reads the auth token from cookies and calls the backend over HTTP. Replace the dashboard/messages server actions with backend-backed fetchers, remove unsupported direct-DB features and AI-quality UI, and keep sparkline components alive with placeholder trend data until the backend exposes a dedicated KPI trend endpoint.

**Tech Stack:** Next.js 14 app router, server actions, `fetch`, `httpOnly` cookies, TypeScript

---

## Chunk 1: Backend Client and Auth

### Task 1: Create server-side backend API helpers

**Files:**
- Create: `src/lib/backend-auth.ts`
- Create: `src/lib/backend-api.ts`
- Modify: `src/middleware.ts`

- [ ] Add cookie constants/helpers for reading and clearing the backend bearer token.
- [ ] Add a server-side backend fetch helper that:
  - uses `process.env.AIVA_BACKEND_URL || "http://127.0.0.1:8002"`
  - attaches `Authorization: Bearer <token>` when required
  - disables caching
  - normalizes 401 handling for protected requests
- [ ] Update middleware to require the token cookie and validate it against `/api/v1/auth/me`.

### Task 2: Replace temporary login with backend login

**Files:**
- Modify: `src/app/auth/actions.ts`
- Modify: `src/app/auth/page.tsx`
- Modify: `src/components/sidebar.tsx`

- [ ] Replace username/shared-password login with backend email/password login via `/api/v1/auth/login`.
- [ ] Store the returned access token in an `httpOnly` cookie.
- [ ] Update the auth page copy and fields for real backend credentials.
- [ ] Add a visible logout path in the sidebar.

## Chunk 2: Dashboard Endpoint Migration

### Task 3: Replace dashboard SQL actions with backend-backed actions

**Files:**
- Modify: `src/app/actions/dashboard.ts`
- Modify: `src/app/page.tsx`

- [ ] Replace summary fetch with `/api/v1/analytics/summary`.
- [ ] Replace message volume trend with `/api/v1/analytics/message-volume-trend`.
- [ ] Replace top intents with `/api/v1/analytics/top-intents`.
- [ ] Replace peak hours with `/api/v1/analytics/peak-hours`.
- [ ] Replace lead conversion trend with `/api/v1/analytics/lead-conversion-trend`.
- [ ] Remove unsupported direct-DB features:
  - message types chart
  - system events/notifications
- [ ] Keep KPI sparkline components but feed them placeholder date-bucket data shaped like the existing component contract.

### Task 4: Remove AI-quality dashboard UI

**Files:**
- Modify: `src/app/page.tsx`
- Delete: `src/components/dashboard/quality-scoring.tsx`
- Delete: `src/components/dashboard/ai-insights.tsx`

- [ ] Remove AI health/header badges, AI quality index, and the strategic AI-quality section.
- [ ] Keep the remaining operational analytics cards/charts aligned with backend data.

## Chunk 3: Messages Endpoint Migration and Cleanup

### Task 5: Replace messages SQL actions with backend conversation endpoints

**Files:**
- Modify: `src/app/actions/messages.ts`
- Modify: `src/app/messages/page.tsx`
- Modify: `src/components/messages/chat-interface.tsx`

- [ ] Replace the conversation list query with `/api/v1/conversations`.
- [ ] Replace message history query with `/api/v1/conversations/{conversation_key}/messages`.
- [ ] Remove free-text search UI because the backend does not expose that capability yet.
- [ ] Update message UI state to use `conversation_key` instead of raw phone numbers.

### Task 6: Remove obsolete direct-DB and AI-analysis code

**Files:**
- Delete: `src/app/actions/ai-analysis.ts`
- Delete: `src/app/actions/notifications.ts`
- Delete: `src/lib/db.ts`
- Delete: `src/lib/simple-auth.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.env`
- Modify: `docker-compose.yml`

- [ ] Remove unused server actions and dependencies (`pg`, `openai`, `@types/pg`).
- [ ] Replace frontend env config with backend URL config.

## Chunk 4: Verification

### Task 7: Verify the migrated app

**Files:**
- Modify as needed based on verification results

- [ ] Run `npm run build`.
- [ ] Run `npm run lint` if the project supports it without extra configuration.
- [ ] Search for any remaining raw SQL, `pg`, OpenAI, and temporary auth references.
- [ ] Fix any build/runtime type issues revealed by verification.
