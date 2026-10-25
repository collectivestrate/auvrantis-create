# Auvrantis Create

**Website Builder** · planned hosting subscription: **$15.99/month**. Auvrantis Check is a separate planned **$15.99/month** product; both subscriptions would total $31.98/month before applicable taxes.

Auvrantis Create is a local-first website builder with six hand-built designs, a named project library, a structured editor, safe JSON backups, and a self-contained HTML export. Starter layouts and text are deterministic, not AI-generated.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open [http://localhost:3101](http://localhost:3101). Run checks with `npm test` and `npm run build`. `npm start` serves the production build on port 3101.

## Working features

- Six visibly distinct template presets and an industry-aware questionnaire with deterministic tone variations.
- Project dashboard to create, open, rename, duplicate, and explicitly confirm deletion of local projects.
- Existing `auvrantis-create:draft:v1` browser drafts migrate losslessly into the project library. Malformed project data is rejected with a recoverable fresh library; prior v1 data is left in browser storage.
- Structured section editing for title, copy, visibility, order, colors, contact email, and page metadata. Add, duplicate, and delete section instances with unique IDs; at least one section must remain.
- Undo/redo buttons and keyboard shortcuts (`⌘/Ctrl+Z`, `⌘/Ctrl+Shift+Z`).
- Desktop and mobile previews, plus a readiness checklist with visible-section counts, evidence, and focus actions.
- Export the website as a standalone HTML file, or export/import an editable `.json` backup capped at 1 MB. Import validates a strict allowlisted schema; no HTML or executable code is accepted.
- User-initiated PNG share image and launch-copy actions. They describe a draft and do not claim that it is live or include invented customer proof.
- Optional Create→Check handoff through `NEXT_PUBLIC_AUVRANTIS_CHECK_URL`. It opens the Check dashboard with the public URL the user entered. If the Check URL is not configured, the action reports that honestly.
- Browser-local autosave is labeled on-screen. Product pages and the editor include **By Auvrantis Group** attribution. Customer websites have no Auvrantis watermark.

## Privacy and technical limits

- Projects use this browser's `localStorage` only. They are not uploaded, synced to an account, or backed up on another device. Clearing browser data can remove them. Use JSON backup to keep a portable copy. Avoid entering sensitive information.
- HTML export escapes owner-entered text, validates colors and email, and rejects unsafe image URL schemes. It creates a file for the owner to host elsewhere; it does not publish or host a website.
- There is no contact form or message-delivery service. Contact links use `mailto:` when a valid email was supplied.
- The readiness checklist inspects the structured local draft only. It is not a hosted-site check, legal/compliance assessment, accessibility conformance audit, performance measurement, ranking predictor, or sales forecast.
- Auvrantis Create hosting, account sign-in, cloud sync, paid entitlement, custom domains, uploads, and subscription checkout are not connected. The displayed $15.99/month is planned; no payment is collected. Auvrantis Check has a separate planned $15.99/month subscription.
- An optional gallery image is a remote HTTP(S) reference. It is not uploaded, copied into the export, or optimized.
- No AI provider or API key is used. No credential is needed to run this local app.

See `/guide` for the customer-facing privacy and methodology explanation.
