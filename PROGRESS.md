# PROGRESS.md

## Phase 0: Recon and safety

- [x] Create branch `overnight-redesign` and the snapshot commit
  - Branch created from feat/competitive-launch with WIP commit d2b08aa, snapshot e516610
- [ ] Create PROGRESS.md (with a Decisions section) and `.overnight/` (gitignored)
  - PROGRESS.md created now, .overnight/ exists and gitignored
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

- [ ] Section library
- [ ] Multi-page sites
- [ ] Six new designs
- [ ] Image upload with alt text
- [ ] Multi-page ZIP export
- [ ] Launch checklist upgrade
- [ ] Build passes; push the branch

## Phase 6: Quality pass

- [ ] Build, lint and typecheck clean
- [ ] Screenshot every page at 390px and 1440px wide (and the Studio at 1440px) into `.overnight/after/`; look at each one and fix what's off
- [ ] Keyboard-only run through the Studio; reduced-motion check; no console errors; every link works
- [ ] Lighthouse on Home, Designs and Pricing if available (targets: performance 90+ on mobile; accessibility, best practices and SEO 95+)
- [ ] Have a subagent review the full diff against this brief and report real gaps (not style nitpicks); fix them

## Phase 7: Morning report

- [ ] Write MORNING_REPORT.md (section 7), commit, push
- [ ] Print PROGRESS.md and the final build output in the conversation

## Decisions

*Will record decisions here as they are made.*

