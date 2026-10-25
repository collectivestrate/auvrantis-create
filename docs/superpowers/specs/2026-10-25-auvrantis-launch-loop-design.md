# Auvrantis Launch Loop Design

Date: 2026-10-25
Products: Auvrantis Create and Auvrantis Check

## Goal

Turn Create and Check into one workflow: define a business, build a polished site, publish a safe version, test the real site, and turn findings into a prioritized improvement queue. The products remain separate subscriptions at $15.99/month each, but share a project identity and handoff language.

## Scope

Create Slice A adds an onboarding brief, brand kit, multi-page/section library, SEO/accessibility command center, named versions, and Check handoff. Check Slice A adds multi-page projects, evidence-backed finding lifecycle, fix-it queue, comparison history, and branded JSON/CSV/print exports. Shared contracts provide project IDs, timestamps, statuses, and handoff records, with local browser storage as fallback and isolated Auvrantis cloud storage when configured.

## Guardrails

- Assisted copy can transform or suggest user-provided content, but never invent testimonials, statistics, credentials, or customer proof.
- Every automated result has evidence or is labeled unavailable.
- New data stays isolated from Siteforge tables and legacy billing.
- No service-role credentials in client code, no raw IP persistence, and no analytics URLs with query strings or fragments.
- Existing safe-publication CSP, static-HTML transport protections, backup validation, and project limits remain in force.

## Architecture

Shared pure data contracts live in dependency-light modules with round-trip tests. Create owns editing and preview; Check owns audit execution and finding lifecycle. Server routes validate size, origin, ownership, and method before reading or writing. A handoff creates a checklist item rather than silently changing content.

## Release sequence

1. Foundation: contracts, IDs, brief, brand kit, page/section library, finding model, handoff serialization, migration-safe local storage.
2. Workflow: SEO/accessibility command center, named versions, multi-page UI, fix-it queue, comparison history, branded export.
3. Cloud/growth: sync, share links, lead inbox, custom-domain readiness, monitoring, alerts, and entitlements.

Each slice requires product tests, production builds, and browser QA before deployment. Paid checkout remains disabled until identity, entitlement, and production configuration are verified.

## Success criteria

- A new user can go from brief to coherent multi-page draft without code.
- A user can identify a Check issue, send it to Create, mark it fixed, and verify it.
- Projects can be backed up, restored, versioned, and safely migrated.
- Both products feel like one Auvrantis Group system while remaining independently deployable and billable.
