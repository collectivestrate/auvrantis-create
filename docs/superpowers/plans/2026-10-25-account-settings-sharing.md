# Auvrantis Account, Settings, and Sharing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add polished account, settings, cloud-sync, sharing, and customization foundations to Auvrantis Create and Auvrantis Check without weakening local-first behavior or tenant isolation.

**Architecture:** Extend the existing server-only Supabase cloud boundary with account/session UI and narrow resource adapters. Keep settings and share presentation separate from project editing. Share links are immutable safe snapshots addressed by cryptographically random opaque tokens whose digests are stored server-side. The first implementation slice ships auth/settings and local migration; later slices add sync, sharing, and customization behind tested interfaces.

**Tech Stack:** Next.js 16, React 19, TypeScript, existing Supabase REST/Auth transport, Vitest, Node test runner, Web Crypto/Node crypto.

**Spec:** `docs/superpowers/specs/2026-10-25-account-settings-sharing-design.md`

## Global Constraints

- Separate products remain $15.99/month each; no billing or entitlement changes.
- Signed-out local creation/export continues to work.
- Local drafts are never uploaded silently; migration is explicit.
- Owner reads are authenticated and owner-filtered; server routes perform writes.
- Share tokens are random, digest-only, scoped, expiring/revocable, and expose safe snapshots only.
- Never expose service credentials, private notes, emails, raw database rows, or query/fragment-bearing URLs.
- Do not modify Siteforge tables or legacy billing.
- Preserve Auvrantis visual language and “By Auvrantis Group” attribution.

## Review Focus

- A signed-out user must keep working when cloud/session calls fail — Task 1 tests local fallback and honest status labels.
- Migrating a browser draft must be explicit and idempotent — Task 1 tests cancel, retry, and duplicate prevention.
- A share token must not reveal the underlying resource or remain usable after revoke/expiry — Task 3 tests digest lookup and invalidation.
- A conflict must never silently overwrite either side — Task 2 tests cloud/device choice preservation.
- Settings must not leak private fields into exports or analytics — Task 1 tests export redaction.

### Task 1: Account center and settings shell

**Files:**
- Create: `outputs/auvrantis-create/src/lib/account-settings.ts`
- Create: `outputs/auvrantis-create/src/lib/account-settings.test.ts`
- Create: `outputs/auvrantis-create/src/components/account-panel.tsx`
- Create: `outputs/auvrantis-create/src/components/settings-panel.tsx`
- Modify: `outputs/auvrantis-create/src/components/studio.tsx`
- Modify: `outputs/auvrantis-create/src/app/layout.tsx`
- Modify: `outputs/auvrantis-check/src/app/dashboard/page.tsx`

**Interfaces:**
- Produces `SyncStatus`, `WorkspaceSettings`, `sanitizeWorkspaceSettings(input)`, and `exportSettingsBundle(settings, projects)`.
- Produces account UI states: signed-out, signing-in, authenticated, offline, and conflict.

- [ ] Write failing tests for settings bounds, export redaction, local fallback, and explicit migration state.
- [ ] Run focused tests and observe expected failures.
- [ ] Implement pure settings/serialization helpers and account panel states using existing cloud session routes.
- [ ] Add a visible Settings tab and sync badge to both product workspaces.
- [ ] Run both product suites and builds.
- [ ] Commit `feat: add account center and settings shell`.

### Task 2: Cloud project/report sync and conflict handling

**Files:**
- Create: `outputs/auvrantis-create/src/lib/cloud-project-sync.ts`
- Create: `outputs/auvrantis-create/src/lib/cloud-project-sync.test.ts`
- Create: `outputs/auvrantis-check/src/lib/report-sync.mjs`
- Create: `outputs/auvrantis-check/src/lib/report-sync.test.mjs`
- Modify: existing cloud API route and CloudPanel components

**Interfaces:**
- Produces `syncProject(local, remote)`, `resolveConflict(choice, local, remote)`, and `syncReportHistory(local, remote)`.
- All writes use existing authenticated owner routes and optimistic timestamps.

- [ ] Write failing tests for no-op sync, newer-remote selection, explicit keep-device/keep-cloud, and offline queue behavior.
- [ ] Run tests to observe failures.
- [ ] Implement adapters with bounded payloads and no silent overwrite.
- [ ] Add migration prompt with Import, Skip, and Review choices.
- [ ] Run full suites and integration checks.
- [ ] Commit `feat: add cloud sync and conflict handling`.

### Task 3: Secure sharing and reviewer access

**Files:**
- Modify: `outputs/auvrantis-create/migrations/001_auvrantis.sql`
- Create: `outputs/auvrantis-create/src/lib/share-tokens.ts`
- Create: `outputs/auvrantis-create/src/lib/share-tokens.test.ts`
- Create: Create share API and read-only page
- Create: Check report share API and read-only page
- Modify: product share panels

**Interfaces:**
- Produces `createShareToken()`, `digestShareToken(token)`, `isShareActive(record, now)`, and safe snapshot serializers.
- Share APIs support create, revoke, and resolve without returning digest/token internals.

- [ ] Write failing tests for random token entropy, digest-only persistence, expiry, revoke, resource scoping, URL redaction, and reviewer read-only behavior.
- [ ] Run focused tests and observe failures.
- [ ] Implement token helpers and server routes with owner checks and no-store safe snapshots.
- [ ] Add copy link, native share, expiration selector, revoke list, comments, and approval controls.
- [ ] Run full suites, cloud integration tests, and browser QA.
- [ ] Commit `feat: add secure review sharing`.

### Task 4: Create and Check professional customization

**Files:**
- Modify: Create brand/page/section editor components and styles
- Create: Create customization tests
- Modify: Check dashboard/report components and styles
- Create: Check customization tests

- [ ] Write failing tests for theme role validation, page ordering, report branding, severity filters, and threshold bounds.
- [ ] Run focused tests and observe failures.
- [ ] Implement Create brand kit/page manager controls and Check report preference/threshold controls.
- [ ] Ensure exports, preview cards, and share pages use the same brand settings.
- [ ] Run both suites and production builds.
- [ ] Commit `feat: add professional customization controls`.

### Task 5: Release verification and deployment

- [ ] Run both full test suites, both production builds, diff checks, and cloud integration tests.
- [ ] Browser-test sign-up states, settings, explicit migration, offline fallback, share creation/revocation, and customization on desktop and phone layouts.
- [ ] Update READMEs and START_HERE with shipped behavior and remaining prerequisites.
- [ ] Deploy both production aliases and verify READY plus public response.
- [ ] Commit release documentation as `docs: record account settings and sharing release`.

