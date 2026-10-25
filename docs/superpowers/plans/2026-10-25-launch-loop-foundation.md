# Auvrantis Launch Loop Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship the first substantial Launch Loop slice: shared project contracts, Create brief/brand/page foundations, Check multi-page findings, and a tested Create↔Check handoff.

**Architecture:** Add small, pure TypeScript contract modules shared by serialization rather than importing UI code across the products. Create owns the editable project document and local migration; Check owns audit projects and finding lifecycle. The first slice remains browser-local and exportable, with cloud adapters deferred to the next plan so users can use the workflow immediately without new credentials.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest (Create), Node test runner (Check), existing local-storage and audit modules.

**Spec:** `docs/superpowers/specs/2026-10-25-auvrantis-launch-loop-design.md`

## Global Constraints

- Separate products remain $15.99/month each; no billing or entitlement changes in this slice.
- Assisted copy may transform or suggest user content, but never invent testimonials, statistics, credentials, or customer proof.
- Every automated result has evidence or is labeled unavailable.
- New data stays isolated from Siteforge tables and legacy billing.
- No service-role credentials in client code, raw IP persistence, or analytics URLs with query strings/fragments.
- Existing CSP, static-HTML transport protections, backup validation, and project limits remain in force.
- Preserve the bright, bold Auvrantis visual language and “By Auvrantis Group” footer.

## Review Focus

- Corrupt or oversized handoff JSON must be rejected without mutating local projects — Task 1 tests bounded parsing and no-write behavior.
- A project with duplicate page/section IDs must normalize deterministically — Task 1 tests stable IDs and collision repair.
- A finding must retain evidence and method when moved between open/fixed/verified — Task 3 tests lifecycle round trips.
- A Check finding from another project must not appear in the current Create queue — Task 4 tests project scoping.
- Existing v1 drafts must load unchanged after adding pages and brand data — Task 2 tests migration compatibility.

### Task 1: Shared Launch Loop contracts and safe handoff

**Files:**
- Create: `outputs/auvrantis-create/src/lib/launch-loop/contracts.ts`
- Create: `outputs/auvrantis-create/src/lib/launch-loop/contracts.test.ts`
- Create: `outputs/auvrantis-check/src/lib/launch-loop-contracts.mjs`
- Create: `outputs/auvrantis-check/src/lib/launch-loop-contracts.test.mjs`

**Interfaces:**
- Produces `LaunchProject`, `LaunchPage`, `LaunchFinding`, `LaunchEvidence`, `LaunchHandoff`, `FindingStatus`.
- Produces `serializeHandoff(handoff: LaunchHandoff): string` and `parseHandoff(raw: unknown): LaunchHandoff`.
- Produces `normalizeProject(input: unknown): LaunchProject` with bounded strings, arrays, IDs, and timestamps.

- [ ] **Step 1: Write failing contract tests** for valid round trips, unknown status rejection, 140KB handoff cap, duplicate ID normalization, missing evidence rejection, and cross-project handoff mismatch.
- [ ] **Step 2: Run the focused tests** and verify they fail because the contract functions do not exist.
- [ ] **Step 3: Implement the Create contract module** with strict runtime guards, stable ID repair, ISO timestamp validation, and JSON serialization.
- [ ] **Step 4: Implement the Check-compatible contract mirror** with identical field names and validation behavior; do not import from the other app at runtime.
- [ ] **Step 5: Run both focused suites** and verify all contract tests pass.
- [ ] **Step 6: Commit** as `feat: add Launch Loop contracts and handoff validation`.

### Task 2: Create project brief, brand kit, and page model

**Files:**
- Modify: `outputs/auvrantis-create/src/lib/draft-storage.ts`
- Modify: `outputs/auvrantis-create/src/lib/templates.ts`
- Create: `outputs/auvrantis-create/src/lib/launch-loop/create-project.ts`
- Create: `outputs/auvrantis-create/src/lib/launch-loop/create-project.test.ts`
- Modify: `outputs/auvrantis-create/src/components/studio.tsx`
- Modify: `outputs/auvrantis-create/src/app/studio/page.tsx`

**Interfaces:**
- Produces `createLaunchProject(brief: LaunchBrief, templateId: string): LaunchProject`.
- Produces `updateBrandKit(project, patch): LaunchProject` and `addPage(project, page): LaunchProject`.
- Produces `migrateDraftToLaunchProject(draft): LaunchProject` without changing legacy draft output.

- [ ] **Step 1: Write failing tests** for brief-to-blueprint defaults, brand kit patching, page creation, and v1 draft migration preserving business copy.
- [ ] **Step 2: Run focused Create tests** and verify the new tests fail.
- [ ] **Step 3: Implement the pure project model** with bounded fields and deterministic starter pages for Home, About, Services, FAQ, and Contact.
- [ ] **Step 4: Add the brief/brand/page controls to the studio** using existing visual primitives; include phone/desktop preview labels and undo boundaries.
- [ ] **Step 5: Run Create tests and build**; verify existing project-library tests remain green.
- [ ] **Step 6: Commit** as `feat: add Create launch brief brand kit and pages`.

### Task 3: Check multi-page projects and finding lifecycle

**Files:**
- Create: `outputs/auvrantis-check/src/lib/launch-loop-project.mjs`
- Create: `outputs/auvrantis-check/src/lib/launch-loop-project.test.mjs`
- Modify: `outputs/auvrantis-check/src/lib/history.mjs`
- Modify: `outputs/auvrantis-check/src/app/dashboard/page.tsx`

**Interfaces:**
- Produces `createAuditProject(input): AuditProject`.
- Produces `addAuditPage(project, page): AuditProject` and `applyFindingStatus(project, findingId, status): AuditProject`.
- Produces `compareAuditRuns(previous, current): AuditDiff` with `newFindings`, `fixedFindings`, `unchangedFindings`, and `unavailableFindings`.

- [ ] **Step 1: Write failing tests** for same-origin page membership, finding evidence retention, lifecycle transitions, bounded page count, and regression comparison.
- [ ] **Step 2: Run the focused Check tests** and verify they fail.
- [ ] **Step 3: Implement the pure project/lifecycle module** with explicit methods and evidence-preserving immutable updates.
- [ ] **Step 4: Add the dashboard project view** with page list, status chips, evidence drawer, fix queue, and comparison summary.
- [ ] **Step 5: Run the full Check test suite and production build**.
- [ ] **Step 6: Commit** as `feat: add Check multi-page projects and fix queue`.

### Task 4: Create↔Check handoff and branded export

**Files:**
- Modify: `outputs/auvrantis-create/src/components/studio.tsx`
- Modify: `outputs/auvrantis-create/src/lib/site-document.ts`
- Modify: `outputs/auvrantis-check/src/app/dashboard/page.tsx`
- Create: `outputs/auvrantis-check/src/lib/launch-loop-export.mjs`
- Create: `outputs/auvrantis-check/src/lib/launch-loop-export.test.mjs`

**Interfaces:**
- Produces `createCheckHandoff(project, url): string` using Task 1 contracts.
- Produces `exportAuditBundle(project): {json: string; csv: string; summary: string}` with redacted URLs and evidence timestamps.
- Consumes `parseHandoff` and `normalizeProject` from the local contract mirrors.

- [ ] **Step 1: Write failing tests** for round-trip handoff, URL query/fragment redaction, project scoping, CSV escaping, and summary labels for unavailable checks.
- [ ] **Step 2: Run focused tests** and verify failure.
- [ ] **Step 3: Implement handoff creation/import and export helpers** with byte caps and safe filename generation.
- [ ] **Step 4: Add Create “Send to Check” and Check “Open in Create” actions** with clear confirmation copy and no silent mutations.
- [ ] **Step 5: Run both full suites and builds**, then browser-test one brief → page → handoff → finding → export path.
- [ ] **Step 6: Commit** as `feat: connect Create and Check Launch Loop handoff`.

### Task 5: Slice verification and release packaging

**Files:**
- Modify: `outputs/auvrantis-create/README.md`
- Modify: `outputs/auvrantis-check/README.md`
- Modify: `outputs/auvrantis-create/CLOUD_IMPLEMENTATION_REPORT.md`
- Modify: `outputs/START_HERE.md`

- [ ] **Step 1: Run Create tests, Check tests, both production builds, and `git diff --check`.**
- [ ] **Step 2: Browser-test responsive Create editor and Check dashboard flows.**
- [ ] **Step 3: Update documentation with shipped features and deferred cloud/monitoring items.**
- [ ] **Step 4: Commit documentation and release notes** as `docs: record Launch Loop foundation release`.
- [ ] **Step 5: Deploy only after all checks pass and verify both production aliases return the new UI.**

