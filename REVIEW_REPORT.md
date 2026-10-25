# Auvrantis Create — independent first-build review

Reviewed commit: `942ebb1` (`feat/first-build`). Review scope: Task 1 first milestone and its committed source, without rerunning tests/build or starting a server. Existing test/build results and parent browser checks were taken from `BUILD_REPORT.md` and parent-provided verification.

## Verdict

The first build has a polished marketing and editor experience, an honest browser-only storage and no-payment story, editable sections, undo/redo, responsive preview, and an export path with good baseline escaping and URL-scheme restrictions. The review found export duplication, silent draft replacement, weak recovery from structurally corrupt saved data, misleading save-failure status, and unreadable CTA text for several supplied palettes. Address the findings below before treating this milestone as complete.

## Findings

### High — Export repeats the hero content

[src/lib/site-document.ts](/Users/alphafilmcreative/Documents/Codex/2026-10-25/okay-i-have-an-idea-you/outputs/auvrantis-create/src/lib/site-document.ts:49) serializes every visible section, including `hero`, into the sections markup. The same hero title and body are then separately emitted as the page `<h1>` and lede at line 77. Each default export therefore repeats the hero copy. Reordering the hero in the editor also does not match the exported layout because the headline remains pinned before all sections. Exclude the hero from the repeated section list or represent it once in the output, and preserve the editor's order.

### High — Changing a design silently replaces the current draft

In [src/components/studio.tsx](/Users/alphafilmcreative/Documents/Codex/2026-10-25/okay-i-have-an-idea-you/outputs/auvrantis-create/src/components/studio.tsx:99), `beginQuestionnaire` resets the draft to a fresh template. `finishQuestionnaire` then creates another new draft at line 103. The editor's “Design” and “Change template” controls route through this flow, so a user changing the design can lose edited copy, visibility, order, and colors without a confirmation. Preserve the current draft while changing its template, or clearly confirm a reset before replacing it.

### High — Corrupt structured browser data can crash the editor

The restore check at [src/components/studio.tsx](/Users/alphafilmcreative/Documents/Codex/2026-10-25/okay-i-have-an-idea-you/outputs/auvrantis-create/src/components/studio.tsx:37) checks only the version, sections array, and truthiness of `business`. A version-1 value with `business: {}` passes, then the editor calls `draft.business.name.toUpperCase()` at line 154. A `sections` array containing `null` also passes and fails when sections are rendered. Validate the full saved-document shape (or normalize from known defaults) before restoring; malformed data should produce a recoverable message and a usable fresh draft.

### Medium — Save failure is reported as success

If `localStorage.setItem` fails, [src/components/studio.tsx](/Users/alphafilmcreative/Documents/Codex/2026-10-25/okay-i-have-an-idea-you/outputs/auvrantis-create/src/components/studio.tsx:56) sets `saveState` to `saved`. The toolbar then displays “Saved locally” even though the draft was not saved. Use a distinct failed state and make that state visible until a later save succeeds.

### Medium — Several template CTA colors fail text contrast

The exported `.button` hard-codes white text on the user-selected accent at [src/lib/site-document.ts](/Users/alphafilmcreative/Documents/Codex/2026-10-25/okay-i-have-an-idea-you/outputs/auvrantis-create/src/lib/site-document.ts:76), and the in-app preview also sets white CTA text at [src/components/studio.tsx](/Users/alphafilmcreative/Documents/Codex/2026-10-25/okay-i-have-an-idea-you/outputs/auvrantis-create/src/components/studio.tsx:178). Several provided accents (lime, coral, mint, lavender, and yellow) do not provide sufficient contrast with white text. Use an ink foreground or a contrast-aware foreground in both preview and export, including after custom color changes.

### Low — Tone answer does not affect the draft

The questionnaire collects `tone`, but [src/lib/templates.ts](/Users/alphafilmcreative/Documents/Codex/2026-10-25/okay-i-have-an-idea-you/outputs/auvrantis-create/src/lib/templates.ts:47) uses only the name, service, audience, location, and email to personalize the draft. Either use tone to select appropriate starter copy or explain that it is stored for later and does not currently change the text.

## Scope notes

The README correctly states that storage is local to the current browser, export is not publishing, remote image URLs are not uploads, and contact is only a `mailto:` link. The UI and pricing copy do not claim that a payment was taken or a customer site was published. Escaping and URL handling have useful tests. Parent browser checks reported successful save/reload/download and no phone-width overflow.

## Focused re-review — fix commit `219497a`

Reviewed only the requested fixes against `942ebb1`; no tests/build were rerun.

- **Resolved:** Export now renders each visible section in its saved order, renders the hero only once, and omits hidden sections.
- **Resolved:** Browser restore validates the nested schema and falls back to a fresh draft for malformed values; it no longer accepts incomplete business or section records.
- **Resolved:** The save status has an explicit unavailable state, and the UI exposes a backup message when local storage writes fail.
- **Resolved:** Changing the starting design uses `switchDraftTemplate` and keeps the current content and ordering.
- **Resolved:** The selected tone now changes deterministic starter copy.
- **Resolved:** Preview and export choose the better contrasting ink or white CTA foreground for the current accent.
- **Resolved:** The 404 screen has branded navigation and a separate editor link; an Auvrantis icon was added.

**Verdict at re-review:** The original high-severity findings are resolved in `219497a`. The one remaining status-cleanup issue is resolved below.

### Residual note

The stale local-save error is cleared after a later successful write. Other error messages are preserved. This review finding is resolved.
