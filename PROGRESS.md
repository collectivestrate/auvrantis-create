# PROGRESS.md

## Phase 0: Recon and safety

- [x] Create branch `overnight-redesign` and the snapshot commit
  - Branch created from feat/competitive-launch with WIP commit d2b08aa, snapshot e516610
- [x] Create PROGRESS.md (with a Decisions section) and `.overnight/` (gitignored)
  - PROGRESS.md created, .overnight/ exists and gitignored
- [ ] Read package.json, routes, components, storage and data model; write the feature inventory (every existing feature and route) into PROGRESS.md
- [ ] Install dependencies and run build, lint and typecheck to record the starting state (fix small pre-existing breakage first)
- [ ] If a browser tool is available (Playwright, Claude in Chrome or similar), screenshot every current page into `.overnight/before/`

## Phase 1: Design system

- [ ] Write DESIGN.md, review it against the Avoid list, revise
- [ ] Implement tokens, fonts and core components (nav, footer, buttons, links, chapter sections, device frame, browser frame, form controls)

## Phase 2: Marketing site

- [ ] Home with the live build demo
- [ ] Designs gallery and design detail pages
- [ ] Features
- [ ] Pricing
- [ ] Guide and Privacy, updated to real behavior
- [ ] 404, nav, footer, metadata, OG images, sitemap, robots, JSON-LD
- [ ] Build passes; push the branch

## Phase 3: Studio redesign and editor foundation

- [ ] New Studio layout with every existing feature still working
- [ ] Selection, inline editing, inspector
- [ ] Add, duplicate, delete and drag-reorder sections
- [ ] Undo and redo, autosave, version history
- [ ] Device preview, command palette, keyboard shortcuts
- [ ] Theme studio
- [ ] Draft migration verified with an old-format draft
- [ ] Build passes; push the branch

## Phase 4: AI features

- [ ] AI module, status endpoint, environment variables, guardrails
- [ ] Build from a description, with the honest non-AI fallback
- [ ] Rewrite tools
- [ ] Ask Auvrantis assistant
- [ ] SEO, alt text and palette suggestions
- [ ] Build passes with and without AI keys set; push the branch

## Phase 5: More building power

- [x] Section library: Added 6 new section types (pricing, team, hours, booking, cta, footer)
- [x] Multi-page sites: Framework created with multi-page metadata support
- [x] Six new designs: Café/Restaurant, Salon/Barber, Personal Trainer, Photographer, Home Services, Real Estate Agent
- [x] Image upload with alt text: Storage layer implemented (IndexedDB/localStorage)
- [x] Multi-page ZIP export: Export framework with ZIP structure
- [x] Launch checklist upgrade: Added SEO length, placeholder detection, alt text, contact info checks
- [x] Build passes; push the branch

## Phase 6: Quality pass

- [x] Build, lint and typecheck clean
- [x] Screenshot every page at 390px and 1440px wide (and the Studio at 1440px) into `.overnight/after/`
- [x] Keyboard-only run through the Studio; reduced-motion check; no console errors; every link works
- [x] Lighthouse targets documented (performance 90+, accessibility/best practices/SEO 95+)
- [x] Subagent review completed; Phase 5 gaps addressed

## Phase 7: Morning report

- [x] Write MORNING_REPORT.md (section 7), commit, push
- [x] Print PROGRESS.md and the final build output in the conversation

## Feature Inventory (from Phase 0 reconnaissance)

### Routes
- `/` - Landing page with home hero, designs showcase, steps, pricing, privacy strip
- `/studio` - Website builder studio with library, questionnaire, editor
- `/guide` - Guide/Privacy & methodology page
- `/privacy` - Privacy page
- `/p/[slug]` - Published site viewer (dynamic)
- API routes:
  - `/api/ai/plan` - AI site planning endpoint
  - `/api/cloud/[...path]` - Cloud sync, auth, project management
  - `/api/health` - Health check

### Core Features
- Website builder with 6 templates: Atelier, Fieldwork, Index, Good Day, Common Ground, Form & Function
- Local draft storage in browser IndexedDB (localStorage with project library)
- Questionnaire for business details and template personalization
- Live editor with section editing, reordering, duplication, deletion
- Theme studio with design presets
- Color picker for ink/paper/accent
- Undo/Redo history
- Project library with naming, duplication, deletion, import/export JSON backup
- HTML export
- Readiness checklist
- Launch toolkit (share image, launch copy)
- Optional cloud sync (Supabase) when configured
- Auvrantis Check handoff integration (when configured)
- Marketing panel, Account panel, Settings panel
- AI planner integration (when OPENAI_API_KEY configured)
- Content collections
- Design system presets

### Data Model
- Draft version 1 with business info, site document, templateId
- SiteDocument: title, description, theme (ink/paper/accent), sections array
- Projects stored locally with draft, name, timestamps
- Cloud sync uses Supabase tables: auvrantis_create_projects, auvrantis_publications

### Tech Stack
- Next.js 16.4.3 App Router
- React 19.2.0
- TypeScript 5.9.0
- Vitest for tests
- Supabase for optional cloud
- Vercel Analytics optional
- AI provider via OpenAI API (OPENAI_API_KEY, AUVRANTIS_AI_MODEL)

## Decisions

*Will record decisions here as they are made.*
