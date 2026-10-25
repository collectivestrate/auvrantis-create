# Auvrantis AI Site Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a safe, preview-first AI planner that converts a user prompt into a validated editable Auvrantis site plan.

**Architecture:** A server-only provider route owns model calls, moderation, safety identifiers, limits, and schema validation. A pure client-compatible validator and mapper turns an `AiSitePlan` into existing Create templates only after explicit user approval. The editor remains usable without the provider configured.

**Tech Stack:** Next.js 16 route handlers, TypeScript, existing Create templates/project model, OpenAI Responses API with Structured Outputs when configured, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-25-ai-site-planner-design.md`

## Global Constraints

- The model never writes arbitrary application code for the primary builder.
- API keys are server-only and never sent to the browser.
- Validate and bound prompt, response, page count, section types, strings, and colors.
- No invented testimonials, credentials, statistics, guarantees, or legal claims.
- Apply is explicit, preview-first, undoable, and never publishes.
- Local-only creation remains functional when AI is unavailable.
- Preserve light/dark workspace preference unless the user explicitly requests another mode.

## Review Focus

- Malformed or schema-invalid provider output must not change the current draft — Task 1 tests rejection and immutability.
- Prompt injection asking the model to output code or secrets must be treated as untrusted content — Task 2 tests bounded prompt policy.
- Provider refusal, timeout, or missing configuration must produce an honest recoverable state — Task 2 tests route errors.
- Applying a plan with unknown sections or unsafe colors must fall back safely — Task 3 tests allowlist mapping.
- Regeneration must not overwrite an existing plan until the user applies it — Task 4 tests preview state transitions.

### Task 1: AI plan schema and safe mapper

**Files:**
- Create: `outputs/auvrantis-create/src/lib/ai-plan.ts`
- Create: `outputs/auvrantis-create/src/lib/ai-plan.test.ts`
- Modify: `outputs/auvrantis-create/src/lib/launch-loop/create-project.ts`

- [ ] Write failing tests for valid plans, bounded page/section counts, unsafe colors, unknown section types, missing required fields, and immutable apply mapping.
- [ ] Run focused tests and observe expected failures.
- [ ] Implement `AiSitePlan`, `validateAiSitePlan(input)`, and `applyAiSitePlan(plan, existing?)` using the allowlisted template/section registry.
- [ ] Run focused tests and the full Create suite.
- [ ] Commit `feat: add validated AI site plan model`.

### Task 2: Server-only AI planner route

**Files:**
- Create: `outputs/auvrantis-create/src/app/api/ai/plan/route.ts`
- Create: `outputs/auvrantis-create/src/lib/ai-provider.ts`
- Create: `outputs/auvrantis-create/src/lib/ai-provider.test.ts`
- Modify: `outputs/auvrantis-create/package.json`

- [ ] Write failing tests for missing provider configuration, oversized prompt, unsafe/injection-like prompt, provider refusal, invalid structured output, and successful validated response.
- [ ] Run focused tests and observe expected failures.
- [ ] Implement provider adapter with Structured Outputs, moderation gate, hashed safety identifier, bounded tokens, timeout, and no raw-prompt analytics.
- [ ] Implement route responses with stable error codes and no secret leakage.
- [ ] Run full tests and production build.
- [ ] Commit `feat: add server AI planner route`.

### Task 3: Planner UI and explicit apply workflow

**Files:**
- Create: `outputs/auvrantis-create/src/components/ai-planner.tsx`
- Modify: `outputs/auvrantis-create/src/components/studio.tsx`
- Modify: `outputs/auvrantis-create/src/app/globals.css`

- [ ] Write UI-adjacent tests for idle, loading, unavailable, refusal, preview, apply, and undo states where the current test setup permits.
- [ ] Add a prompt panel with optional structured fields, example prompts, loading state, retry, and clear unavailable messaging.
- [ ] Render plan preview cards for pages, theme, SEO suggestions, missing information, and warnings.
- [ ] Apply only after user action; preserve the previous draft in undo history.
- [ ] Run full tests and production build.
- [ ] Commit `feat: add preview-first AI planner UI`.

### Task 4: Launch-loop and Check integration

**Files:**
- Modify: Create Launch Loop handoff helpers
- Modify: Check dashboard/report components
- Create: integration tests for planner→Check handoff

- [ ] Add “Check this plan” and “Fix with Create” actions that pass structured evidence, not raw prompts.
- [ ] Keep generated warnings visible in Check reports and require approval before changes.
- [ ] Run both suites, both builds, and browser QA for prompt → preview → apply → Check.
- [ ] Commit `feat: connect AI planner to Launch Loop`.

### Task 5: Release verification and deployment

- [ ] Run all tests, builds, diff checks, and configured/unconfigured provider smoke tests.
- [ ] Verify no API key or raw prompt appears in client bundles, analytics, or error messages.
- [ ] Update documentation with AI availability, limits, and provider configuration.
- [ ] Deploy Create and Check and verify production responses.
- [ ] Commit `docs: record AI planner release`.

