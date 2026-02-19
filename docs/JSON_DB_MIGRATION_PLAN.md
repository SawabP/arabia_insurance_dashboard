# JSON File Data Migration Plan

## Objective
Replace PostgreSQL/raw SQL usage with a JSON-file-backed data layer, using the existing `data/chats.json` file as the primary source of truth.

This plan is for a single mode only (JSON). No dual-mode runtime toggle is included.

## Current State
- SQL client is centralized in `src/lib/db.ts`.
- SQL-backed server actions are in:
  - `src/app/actions/dashboard.ts`
  - `src/app/actions/messages.ts`
  - `src/app/actions/notifications.ts`
- UI pages/components consume those actions and should remain unchanged if return shapes are preserved.

## Data Inputs
- Existing file: `data/chats.json`
- Additional notification input needed to keep all current UI behavior:
  - Recommended: `data/usage-notifications.json`
  - Alternative: derive notification rows from chats (reduced fidelity)

## Scope
- In scope:
  - Read-only JSON data source for dashboard, messages, and notifications.
  - Replace SQL query logic with in-memory filtering/grouping/sorting.
  - Remove `pg` runtime dependency and SQL client usage.
- Out of scope:
  - Editing/writing to JSON data files from the app.
  - Rebuilding UI components.

## Technical Approach
1. Add a JSON data access module that loads files from `data/`.
2. Normalize chat records once per request (or with safe in-process cache) for:
   - Date parsing (`created_at`)
   - Case-insensitive channel matching
   - Identifier resolution: `customer_phone || customer_email_address || session_id`
   - Escalation normalization (`true`, `yes`, `1`, case-insensitive)
3. Replace each SQL-backed action with array operations while keeping existing return contracts.
4. Remove SQL client and package dependencies.

## File-Level Change Plan
1. Create `src/lib/json-db.ts`
- Add typed loaders:
  - `loadChats(): Promise<ChatRecord[]>`
  - `loadUsageNotifications(): Promise<UsageNotification[]>`
- Use `fs/promises` + `path`.
- Add validation guardrails (empty array fallback, malformed file handling).

2. Refactor `src/app/actions/dashboard.ts`
- Remove `pool` import and all SQL strings.
- Reimplement functions using loaded chats + notifications:
  - `getDashboardStats`
  - `getPeakActivityData`
  - `getMessageTypeDistribution`
  - `getKpiTrends`
  - `getAIQualityMetrics` (already composes other functions)
  - `getQualityTrends`
  - `getLeadTrends`
  - `getChatVolumeData`
  - `getIntentDistribution`
  - `getRecentInteractions`
- Preserve response property names and types used by UI.

3. Refactor `src/app/actions/messages.ts`
- Remove `pool` usage.
- Implement:
  - `getConversations(query?, page?, limit?)` using grouped latest message per phone + pagination.
  - `getCustomerMessages(phone)` sorted ascending by `created_at`.

4. Refactor `src/app/actions/notifications.ts`
- Remove SQL query.
- Return data from `loadUsageNotifications()` sorted descending by `notified_at` and limited to 100.

5. Remove SQL infrastructure
- Delete `src/lib/db.ts`.
- Update imports that referenced it.
- Update `package.json`:
  - Remove `pg`
  - Remove `@types/pg`
- Run install to refresh lockfile.

6. Optional UI text cleanup
- `src/app/page.tsx` currently shows `DB: Connected`.
- Change label to something accurate for file-based data (for example, `Data Source: JSON`).

## Query-to-Logic Mapping Checklist
Use this checklist while replacing SQL logic:

- Date range filter:
  - Include records where `created_at` is between `startDate` and `endDate` (inclusive).
- Channel filter:
  - Apply case-insensitive compare when `channel !== 'all'`.
- Distinct customer counting:
  - Use resolved identifier (`phone/email/session`).
- Escalated customer counting:
  - Distinct identifiers where escalated flag is true-like.
- Grouping:
  - By date for trends and volume.
  - By hour for peak activity.
  - By `message_type` for distribution (default `text`).
  - By `intent` for top intents.
- Recent interactions:
  - Latest message per identifier, then top 5 by time descending.

## Validation and Testing Plan
1. Static checks
- `npm run lint`
- TypeScript compile via `npm run build`

2. Functional checks
- Dashboard renders with non-empty stats/charts.
- Date range and channel filters still affect output.
- Messages page:
  - Search works
  - Pagination works
  - Conversation details load correctly
- Notifications page renders with expected fields.

3. Data edge-case checks
- Null/empty `channel`, `intent`, `message_type`, `escalated`.
- Missing `customer_phone` (fallback identifier still works).
- Invalid/missing dates do not crash requests.

## Risks and Mitigations
- Risk: Notifications data absent.
  - Mitigation: add `data/usage-notifications.json` or return an empty array safely.
- Risk: Large chat file impacts response latency.
  - Mitigation: optional in-memory cache with file mtime invalidation.
- Risk: Behavior drift from SQL semantics.
  - Mitigation: compare old/new outputs for a fixed date range before removing SQL deps.

## Done Criteria
- No imports of `src/lib/db.ts` remain.
- No SQL statements remain in `src/app/actions/*`.
- App runs fully from JSON files in `data/`.
- Dashboard, messages, and notifications pages function without runtime errors.
- `pg` dependencies removed.

## Estimated Effort
- Implementation + verification: 0.5 to 1 day.
- Additional time only if notification data modeling is undecided.
