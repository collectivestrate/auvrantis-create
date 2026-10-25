# Auvrantis Launch Loop Design

Date: 2026-10-25
Products: Auvrantis Create and Auvrantis Check

## Goal

Turn Create and Check into one workflow: define a business, build a polished site, publish a safe version, test the real site, and turn findings into a prioritized improvement queue. The products remain separate subscriptions at $15.99/month each, but share a project identity and handoff language.

## Scope

Create Slice A adds an onboarding brief, brand kit, multi-page/section library, SEO/accessibility command center, named versions, and Check handoff. Check Slice A adds multi-page projects, evidence-backed finding lifecycle, fix-it queue, comparison history, and branded JSON/CSV/print exports. Shared contracts provide project IDs, timestamps, statuses, and handoff records, with local browser storage as fallback and isolated Auvrantis cloud storage when configured.

## Expanded competitive feature map

The product should feel meaningfully deeper than a template picker. Features are grouped into a coherent workspace so the interface stays fast and legible.

### Create workspace

- **Brief-to-blueprint wizard:** convert business answers into a sitemap, page goals, CTA plan, and content checklist before styling begins.
- **Visual canvas modes:** desktop, tablet, phone, reduced-motion preview, and keyboard outline preview.
- **Command palette:** search actions such as “add FAQ,” “duplicate section,” “check contrast,” “make this shorter,” or “preview mobile.”
- **Section marketplace:** curated starter sections with filters by business goal, not just industry.
- **Page templates:** Home, About, Services, Pricing, FAQ, Contact, Blog/Updates, Portfolio, Events, and landing pages.
- **Design system controls:** color roles, type scale, spacing rhythm, radii, borders, shadows, buttons, forms, and reusable components.
- **Content assistant:** transform-only actions for clarity, tone, length, translation, SEO metadata, and calls to action; every suggestion is reviewable and undoable.
- **Media workspace:** safe image URL validation, focal-point cropping, alt-text editor, social preview, and image-weight warnings.
- **Forms and leads:** contact, quote request, newsletter, booking-interest, and custom fields with spam-safe validation and an owner-only inbox.
- **Publishing center:** draft, preview, publish, rollback, unpublish, release notes, and shareable review links.
- **Version control:** named snapshots, side-by-side changed-field view, restore, and “what changed” release notes.
- **SEO/AEO center:** title, description, canonical, robots, sitemap, Open Graph, Twitter card, JSON-LD, headings, internal links, and answer-style content hints.
- **Accessibility center:** contrast, labels, alt text, focus order, keyboard reachability, reduced motion, and readable error states.
- **Localization foundation:** language variants, translated metadata, locale-aware URLs, and a visible untranslated-content queue.
- **Collaboration:** comments anchored to sections, client approval status, reviewer roles, and an activity timeline.

### Check workspace

- **Project dashboard:** URLs, pages, last scan, trend, open findings, and release status.
- **Bounded crawler:** same-origin discovery with explicit page limits, exclusions, canonical normalization, and crawl evidence.
- **Audit families:** HTML quality, SEO, accessibility signals, performance transport, security headers, links, images, forms, structured data, and content clarity.
- **Evidence drawer:** show the exact URL/path, observed value, expected value, rule, timestamp, and method for every finding.
- **Prioritized fix queue:** impact × effort × confidence ranking, owner/status assignment, due date, and bulk triage.
- **Regression diff:** compare runs by page and rule; separate new failures, fixed findings, unchanged findings, and unavailable checks.
- **Release gates:** configurable “must pass” checks before a Create publication is marked ready.
- **Mobile/desktop matrix:** compare viewport-specific findings without pretending static HTML is a full browser simulation.
- **Resource intelligence:** request count, transfer size, image/font/script weight, redirect chain, and transport timing where safely observable.
- **Monitoring:** scheduled checks, threshold alerts, quiet hours, alert suppression, and weekly digest after durable cloud configuration.
- **Client reporting:** branded reports, share links, print/PDF, JSON/CSV, executive summary, and technical appendix.
- **Fix verification:** rerun only the relevant rule set after a change and close findings with new evidence.

### Shared Auvrantis layer

- **Launch score:** a transparent readiness index composed only of passed/attention/unavailable checks, with drill-down evidence.
- **Build → Check → Fix → Verify timeline:** one activity stream across both products.
- **Project health cards:** content readiness, accessibility readiness, search readiness, speed readiness, and publish readiness.
- **One-click handoff:** send a Check finding into a Create checklist without changing the user’s site automatically.
- **Safe share links:** expiring, read-only review links with redacted URLs and no account exposure.
- **Workspace roles:** owner, editor, reviewer, and client with least-privilege access.
- **Export portability:** full project backup, audit archive, and migration-safe restore.
- **Usage transparency:** scan count, pages checked, storage, and future subscription entitlements shown plainly.

### Differentiators to make the brand memorable

- **No fake scores:** unavailable data is visible and explained.
- **Fix-first reports:** every issue ends with a practical next action, not a wall of metrics.
- **Opinionated design:** high-quality starting points instead of endless generic templates.
- **Proof mode:** every publish or audit action can show what changed and why.
- **Auvrantis footer and visual language:** consistent identity across exports, reports, share links, and published pages.
- **Beginner-to-progressive disclosure:** simple defaults first; advanced controls appear only when useful.

## Guardrails

- Assisted copy can transform or suggest user-provided content, but never invent testimonials, statistics, credentials, or customer proof.
- Every automated result has evidence or is labeled unavailable.
- New data stays isolated from Siteforge tables and legacy billing.
- No service-role credentials in client code, no raw IP persistence, and no analytics URLs with query strings or fragments.
- Existing safe-publication CSP, static-HTML transport protections, backup validation, and project limits remain in force.

## Architecture

Shared pure data contracts live in dependency-light modules with round-trip tests. Create owns editing and preview; Check owns audit execution and finding lifecycle. Server routes validate size, origin, ownership, and method before reading or writing. A handoff creates a checklist item rather than silently changing content.

## Release sequence

1. **Foundation:** contracts, IDs, brief, brand kit, page/section library, finding model, handoff serialization, migration-safe local storage, command palette, and responsive preview modes.
2. **Professional workflow:** SEO/accessibility command center, media workspace, named versions, multi-page UI, fix-it queue, comparison history, branded export, and release gates.
3. **Conversion layer:** forms, lead inbox, share/review links, comments, client approvals, project health cards, and launch timeline.
4. **Cloud/growth:** sync, workspace roles, custom-domain readiness, monitoring, alerts, localization, usage limits, and entitlements.
5. **Advanced platform:** resource intelligence, structured-data helpers, controlled content assistant, integrations, and public section/template library.

Each slice requires product tests, production builds, and browser QA before deployment. Paid checkout remains disabled until identity, entitlement, and production configuration are verified.

## Success criteria

- A new user can go from brief to coherent multi-page draft without code.
- A user can identify a Check issue, send it to Create, mark it fixed, and verify it.
- Projects can be backed up, restored, versioned, and safely migrated.
- Both products feel like one Auvrantis Group system while remaining independently deployable and billable.
