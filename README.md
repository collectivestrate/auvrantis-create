# Auvrantis Create

**Website Builder** · planned hosting subscription: **$15.99/month**

Auvrantis Create is a guided website starter and manual section editor. The six hand-built templates are deterministic layouts; the app does not generate text with AI. It is an early local-first build, not a hosted customer website service.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open [http://localhost:3101](http://localhost:3101). Run the checks with:

```sh
npm test
npm run build
```

`npm start` serves a production build on port 3101.

## What works

- Marketing page with a clear product and planned subscription price.
- Six visually distinct starting designs and a short business questionnaire.
- Manual editing for section headings, copy, visibility, order, palette, and an optional gallery image URL.
- Desktop and phone previews, undo/redo buttons, and keyboard shortcuts (`⌘/Ctrl+Z`, `⌘/Ctrl+Shift+Z`). Text fields keep their normal native undo behavior.
- Automatic browser-local draft saving and restoration for the same browser profile and site origin.
- Download of a self-contained HTML page. Customer text is escaped, palette values are restricted to hex colors, template names are allowlisted, image URLs must use HTTP(S) or a root-relative path, and an email link is included only when the owner supplied a valid address.

## Current limits

- **Draft storage is this browser only.** The draft uses `localStorage`; it is not uploaded, shared, backed up, or available on another device. Clearing browser data can remove it. Avoid entering sensitive data.
- The template copy is starter text, not AI output. Review and edit it before use. The app does not invent testimonials or business credentials.
- Gallery images are referenced by URL. Images are not uploaded, copied into the exported file, or optimized; the visitor's browser loads the remote image.
- An optional contact email creates a `mailto:` link. There is no contact form or message-delivery service, so the app does not report fake form success.
- HTML export creates a file for the owner to use elsewhere; it does not publish or host a site.
- There is no account system, cloud storage, subscription checkout, paid entitlement, production hosting, domain setup, or customer-site publishing. The $15.99/month subscription checkout opens at launch.
- No AI provider or API key is used in this app. No server credentials are needed for this local build.

Every Auvrantis Create product screen includes the “By Auvrantis Group” attribution. Customer websites do not get an Auvrantis watermark.
