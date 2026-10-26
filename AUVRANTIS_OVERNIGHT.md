# Auvrantis Create: overnight redesign and build brief

You are working alone overnight on the Auvrantis Create website (by Auvrantis Group). The owner is asleep and cannot answer questions or approve anything until morning. Work through this brief from top to bottom, make your own calls, and leave a finished, verified result plus a short morning report.

Do not edit this brief. Track everything in PROGRESS.md.

## 0. How to work tonight (re-read this section after any context compaction)

- **Never stop to ask questions or wait for approval.** When something is ambiguous, pick the option that best fits this brief, write it under "Decisions" in PROGRESS.md, and keep going. This overrides any skill, plugin or workflow step that asks the user questions or waits for plan or design approval (brainstorming, plan approval and similar): do that thinking yourself, write it to a file, and continue. Don't use plan mode.
- **PROGRESS.md is your memory.** First thing, create PROGRESS.md with every checkbox from section 6. Tick each box as you finish it and add one line of notes. After any context compaction, re-read this brief and PROGRESS.md before doing anything else.
- **Priority order matters.** Phases are listed in order of importance. A finished, polished earlier phase beats a half-built later one. Never end a phase with something half-wired.
- **Skip only when truly blocked** (a missing account, key or paid service). Mark the box `skipped: <reason>` and move on. Never skip because something is hard.
- **Don't loop.** If one problem survives three genuinely different attempts, log it, keep the last working version, and move on.
- **Prove it.** Run the real checks (build, lint, typecheck, screenshots) and show their output in the conversation. Never claim something works without evidence.
- **Commit after every finished task** with a clear message. Never leave a commit with a broken build.
- **Stay inside this project folder.** Don't read or write files anywhere else on the computer. Put scratch files and screenshots in `.overnight/` and add it to `.gitignore`.
- Use subagents for research and review in parallel if useful, but never have two agents editing the same files at once.

## 1. Hard rules (never break these)

**Git and deploys**
- Make sure `.env*` files (except `.env.example`) are in `.gitignore` before any commit.
- Work on a new branch, `overnight-redesign`. Before changing anything, commit the project's current state to that branch as "Snapshot before overnight redesign" (run `git init` first if this isn't a git repo yet).
- Never commit to or push `main`/`master`. Never deploy to production (no `vercel --prod`, no promoting deployments). Never force-push, `git reset --hard`, `git clean`, or rewrite history.
- If the repo has a remote, push `overnight-redesign` at the end of each phase so Vercel can build a preview. If pushing fails, keep committing locally and note it.
- Remove old files with `git rm` (recoverable), never `rm -rf`.

**Secrets and services**
- Don't open `.env` files. Learn variable names from `.env.example` or by searching the code for `process.env`. Never print, log or commit a secret.
- Don't sign up for, or require, new paid services or accounts. Any feature that needs a key goes behind an environment variable, degrades gracefully when the key is missing, and is listed in MORNING_REPORT.md.
- Don't download and run remote scripts. Add npm packages only when they save real work, and prefer what's already installed.

**Honesty (this brand's promise, keep it)**
- No invented proof anywhere: no fake testimonials, reviews, star ratings, customer counts, "trusted by" logo walls, awards, press mentions or statistics. Where a design needs proof, use a clearly marked placeholder the user must replace.
- No competitor names or comparison claims on the site.
- Pricing stays exactly as it is: Auvrantis Create is $15.99/month, subscription checkout opens at launch, and no payment is collected. Auvrantis Check is a separate product at $15.99/month ($31.98/month for both, before applicable taxes). No new tiers, trials or discounts.
- Never claim a feature that doesn't work. When AI isn't configured, the interface must not say AI is doing anything.
- /guide and /privacy must describe the product as it actually behaves after your changes, especially what text is sent to an AI provider, and when.

**Keep what already works**
- Before redesigning, inventory every existing feature and route (Phase 0) and keep all of them working, including: local drafts in the browser, the questionnaire, the six designs, the readiness/quality list, JSON backup and restore, HTML export, optional cloud save and account publishing when configured, the Create to Check handoff when configured, /guide and /privacy.
- Keep existing URLs working (add redirects if you rename anything). Existing saved drafts must still load: write a migration if the data shape changes.
- Keep the existing framework, hosting setup and environment variable names. This appears to be a Next.js app on Vercel; confirm in Phase 0. Don't migrate frameworks.

**Brand**
- The product is **Auvrantis Create**. The company is **Auvrantis Group**. Use both names consistently everywhere: nav wordmark, hero, page titles (`Page name — Auvrantis Create`), metadata, Open Graph images, favicon and app icons, 404, footer (`© Auvrantis Group`), Studio chrome, and exported-site metadata (generator tag).
- Visitors shouldn't see internal status labels like "Check · not connected". Connection status belongs inside the Studio.

## 2. The goal

Make Auvrantis Create look and feel like an Apple product page and work like a top-tier AI website builder: clean, bold, sleek, quietly futuristic and powerful. Rewrite every page and all the copy so it's sharper. Then make the Studio (the builder) far more capable, with AI features that are safe, honest and optional.

## 3. Design direction

Start Phase 1 by writing DESIGN.md: a compact token system (4–6 named hex colors, type family and scale, spacing, radii, motion rules), a layout concept with ASCII wireframes for the home page, and a few principles. Then review it against the "Avoid" list below, revise anything that reads like a generic AI-generated site, note what you changed and why, and only then build.

**Feel.** An Apple product page crossed with a pro creative tool. Huge, confident headlines; generous whitespace; product first (show the real Studio and real generated sites, not illustrations); chapters that alternate white, light gray and pure black; a glassy sticky nav; crisp depth. Quietly futuristic, never neon, never cluttered.

**Starting point** (refine it in DESIGN.md, don't ignore it):
- Color: White `#FFFFFF`, Mist `#F5F5F7` for light chapters, Black `#000000` for dark chapters, Ink `#1D1D1F` for text on light, Graphite `#6E6E73` for secondary text, and one signature accent, Ultramarine `#2D45FF`, used sparingly for primary actions and links. Use a lighter tint of it on black so contrast passes WCAG AA.
- Type: one variable grotesk with a real weight range, self-hosted through the framework's font loader (next/font). For example Mona Sans or Instrument Sans; not Inter, not Geist, not system defaults. Display: weight 600–800, tracking around −0.02 to −0.04em, line-height about 1.05, fluid sizes up to about 112px. Body: 17–19px, line-height about 1.5, lines under 80 characters. Sentence case everywhere.
- Layout: full-bleed chapters, content max width about 1200px, big vertical rhythm (120–200px between chapters on desktop). Center headlines in the hero and chapter openers; left-align body text and all UI.
- Motion: spend it in one place, the hero. Elsewhere, only motion that answers the visitor (opening, switching tabs, previewing a design). No fade-up on every section. Respect `prefers-reduced-motion` everywhere.

**The signature moment: a live build demo in the home hero.** A sentence types itself into a prompt bar ("A plant shop in Chicago with weekend workshops"), then a real website assembles inside a device frame (layout, words, palette, image placeholders) and settles. Build it from the actual template engine so it costs nothing and needs no network. It must be smooth, start after first paint, add little JavaScript, and show a finished static frame for reduced motion and slow devices. This is the one bold thing; keep everything around it quiet.

**Avoid.** These read as generic or AI-made, and the current site has several of them, so remove them: ✳ and ↗ glyphs used as decoration; italicizing or coloring one word in a headline; ALL-CAPS labels above headings; "01 / 06"-style counters unless the content really is a sequence (the how-it-works steps are one); middle-dot meta strings ("A · B · C"); arrows appended to every link; scrolling marquee tickers; rows of identical rounded cards with the same soft shadow; gradient blobs as decoration; stock photos of people at laptops; emoji icons.

**The six designs (Atelier, Fieldwork, Index, Good Day, Common Ground, Form & Function) are customers' websites, not the marketing site.** Keep each one's own personality. Fix bugs and polish them, but don't Apple-ify them. Showcase them beautifully.

**Studio look.** A dark, focused pro-tool interface (think Final Cut Pro or Keynote's inspector) so the user's light websites pop on the canvas. Calm chrome, clear hierarchy, every control labeled in plain words. The Studio is desktop-first; on phones it should still open drafts, preview them, and allow simple text edits.

**Writing.** Short, plain, confident sentences from the visitor's point of view. Buttons say exactly what happens ("Start building", "Use this design", "Export site"). "Big idea. Good website." can stay as the hero line if it still fits, without the italic. Errors say what happened and how to fix it. Empty states invite action.

**Quality floor (every page).** Responsive from 360px to 1920px wide, visible keyboard focus, WCAG 2.2 AA contrast, semantic HTML, alt text, a skip link, no layout shift from fonts or images, no console errors. Pages render statically where possible and images are optimized.

## 4. Marketing site: every page

Rebuild all of these to the design direction, with fresh copy:

- **Home.** Hero with the live build demo and two actions (Start building, See the designs). A scroll chapter showing how a site goes from one sentence to finished (describe, choose a look, edit, export or publish), with the Studio canvas changing as you scroll. The designs showcase. What the Studio can do, shown with real UI rather than icon cards. "Your words stay yours": what stays in the browser, and what goes to an AI provider and when. A pricing summary. A final call to action.
- **Designs** (`/designs`). A gallery of every design with industry filters, each previewed in a browser frame, plus a detail page per design (`/designs/[slug]`) with a full live preview at desktop, tablet and phone widths and a "Use this design" button that opens the Studio with that design selected.
- **Features** (`/features`). The Studio's capabilities, organized by what the user wants to get done.
- **Pricing** (`/pricing`). One clear price, what's included today versus at launch, an FAQ, and Auvrantis Check as a separate product, worded exactly as section 1 requires.
- **Guide** (`/guide`) and **Privacy** (`/privacy`). Redesigned and updated to match real behavior.
- **404.** On brand and helpful.
- **Global.** Glassy sticky nav (wordmark on the left; Designs, Features, Pricing; a "Start building" button), an Apple-style footer with fine print.
- **SEO.** A unique title and description per page; Open Graph images carrying the Auvrantis Create name (keep or extend the existing generator); sitemap.xml; robots.txt; canonical URLs; JSON-LD for Organization (Auvrantis Group) and SoftwareApplication (15.99 USD per month), with no ratings. Keep /studio `noindex`.

## 5. Studio: from template editor to AI website builder

Keep everything that exists, redesign the interface, then add capability in this order.

**A. Editor foundation**
- Layout: a top bar (site name, desktop/tablet/phone toggle, undo and redo, preview, export or publish), a left panel (pages and sections), the canvas in the center, and an inspector on the right.
- Click anything on the canvas to select it; edit text in place or in the inspector.
- Add, duplicate, delete and drag to reorder sections, all keyboard accessible.
- Undo and redo for every change (⌘Z and ⇧⌘Z), autosave with a visible saved state, and version history with restore (snapshots in IndexedDB, with a warning before browser storage fills up).
- A command palette (⌘K) to jump to any action, section or setting.
- A theme studio: color palettes, font pairings, corner radius and spacing density, applied live.
- Migrate old drafts automatically. Never lose a user's work.

**B. AI features (server-side, optional, honest)**
- One server-side AI module behind route handlers. Reuse the project's AI provider if it already has one; otherwise make it provider-agnostic (for example with the Vercel AI SDK) and use whichever key is set: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`, with the model name from `AI_MODEL`. Add them all to `.env.example` with empty values. Keys never reach the browser.
- `GET /api/ai/status` tells the interface whether AI is configured. When it isn't, hide the AI controls and keep every non-AI path fully working.
- **Build from a description.** The user describes their business in a sentence or two (plus optional chips for industry and mood). AI returns a structured site (pages, sections, copy, theme) that is validated against a zod schema and then opened in the editor. Without a key, the same starting screen runs the existing questionnaire and template engine, labeled accurately rather than as AI.
- **Rewrite tools** on any text: rewrite, shorter, longer, friendlier, more professional, fix grammar.
- **Ask Auvrantis.** A chat panel that edits the site from plain requests ("make the hero bolder", "add an FAQ about pricing"). AI returns validated JSON changes; show what changed and offer one-click undo.
- **Suggestions** for SEO titles and descriptions, image alt text, and a palette from a mood ("calm, earthy, premium").
- **Guardrails.** Every AI prompt tells the model never to invent testimonials, reviews, statistics, awards, credentials or client logos, and to insert marked placeholders instead. Treat AI output as untrusted: validate it with schemas, render it as text, escape it in exports. Limit input size, rate-limit per IP, and cap daily requests with `AI_DAILY_LIMIT` (best effort in memory unless a KV store is already configured). Errors are friendly and specific.

**C. More building power**
- Section library: hero variants, about, services or menu, gallery, testimonials (user-supplied only, with an empty state asking for real quotes), pricing table, FAQ, team, hours and location (a map link, no map API), contact (mailto or a user-supplied form endpoint), booking link, call-to-action band, footer.
- Multi-page sites: add, rename and reorder pages, with navigation that updates automatically.
- Six new hand-built designs, for twelve in total: café and restaurant, salon and barber, personal trainer, photographer, home services and trades, real estate agent. Each genuinely distinct in type, layout rhythm and palette, not a recolor.
- Images: upload (stored in IndexedDB) with required alt text.
- Export: keep single-page HTML export, and add a multi-page ZIP of clean, accessible static HTML and CSS with each page's SEO tags.
- Launch checklist: extend the readiness list with SEO fields, alt text, unreplaced placeholders, contact details and color contrast, and keep the honest note about what it can't verify.

## 6. Phases (copy these checkboxes into PROGRESS.md)

### Phase 0: Recon and safety
- [ ] Create branch `overnight-redesign` and the snapshot commit
- [ ] Create PROGRESS.md (with a Decisions section) and `.overnight/` (gitignored)
- [ ] Read package.json, routes, components, storage and data model; write the feature inventory (every existing feature and route) into PROGRESS.md
- [ ] Install dependencies and run build, lint and typecheck to record the starting state (fix small pre-existing breakage first)
- [ ] If a browser tool is available (Playwright, Claude in Chrome or similar), screenshot every current page into `.overnight/before/`

### Phase 1: Design system
- [ ] Write DESIGN.md, review it against the Avoid list, revise
- [ ] Implement tokens, fonts and core components (nav, footer, buttons, links, chapter sections, device frame, browser frame, form controls)

### Phase 2: Marketing site
- [ ] Home with the live build demo
- [ ] Designs gallery and design detail pages
- [ ] Features
- [ ] Pricing
- [ ] Guide and Privacy, updated to real behavior
- [ ] 404, nav, footer, metadata, OG images, sitemap, robots, JSON-LD
- [ ] Build passes; push the branch

### Phase 3: Studio redesign and editor foundation
- [ ] New Studio layout with every existing feature still working
- [ ] Selection, inline editing, inspector
- [ ] Add, duplicate, delete and drag-reorder sections
- [ ] Undo and redo, autosave, version history
- [ ] Device preview, command palette, keyboard shortcuts
- [ ] Theme studio
- [ ] Draft migration verified with an old-format draft
- [ ] Build passes; push the branch

### Phase 4: AI features
- [ ] AI module, status endpoint, environment variables, guardrails
- [ ] Build from a description, with the honest non-AI fallback
- [ ] Rewrite tools
- [ ] Ask Auvrantis assistant
- [ ] SEO, alt text and palette suggestions
- [ ] Build passes with and without AI keys set; push the branch

### Phase 5: More building power
- [ ] Section library
- [ ] Multi-page sites
- [ ] Six new designs
- [ ] Image upload with alt text
- [ ] Multi-page ZIP export
- [ ] Launch checklist upgrade
- [ ] Build passes; push the branch

### Phase 6: Quality pass
- [ ] Build, lint and typecheck clean
- [ ] Screenshot every page at 390px and 1440px wide (and the Studio at 1440px) into `.overnight/after/`; look at each one and fix what's off
- [ ] Keyboard-only run through the Studio; reduced-motion check; no console errors; every link works
- [ ] Lighthouse on Home, Designs and Pricing if available (targets: performance 90+ on mobile; accessibility, best practices and SEO 95+)
- [ ] Have a subagent review the full diff against this brief and report real gaps (not style nitpicks); fix them

### Phase 7: Morning report
- [ ] Write MORNING_REPORT.md (section 7), commit, push
- [ ] Print PROGRESS.md and the final build output in the conversation

## 7. MORNING_REPORT.md

Plain English, short, written for a non-technical owner:
- What changed (5–10 bullets), and anything that didn't get done.
- How to see it: the Vercel preview link if one exists, plus the exact command to run it locally and the address to open.
- Where the before and after screenshots are.
- What you need from me: each key or setting to add (which AI key, `AI_DAILY_LIMIT` and anything else) and exactly where to add it in Vercel.
- Decisions you made that I should know about.
- Known issues.
- To ship it: one sentence I can paste into Claude Code to merge `overnight-redesign` into main and deploy.
