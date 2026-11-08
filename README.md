# Auvrantis Create

**Website Builder** · planned hosting subscription: **$15.99/month**. Auvrantis Check is a separate planned **$15.99/month** product; both subscriptions would total $31.98/month before applicable taxes.

Auvrantis Create is a local-first website builder with twelve hand-built designs, a named project library, a structured editor, safe JSON backups, and a self-contained HTML export. Starter layouts and text are deterministic, not AI-generated.

## Pay-per-token AI

AI in the Studio is sold by usage, not by subscription. 1 credit = 1¢.

- **Write my site** writes headlines and text for every section; **Rewrite section** follows an instruction; **Plan from an idea** suggests pages, sections and a palette.
- Every run is quoted first (typical and maximum price). The server reserves the maximum, calls the model, then settles at the provider's real token usage × `AI_MARKUP`. Failed runs and output that fails validation are settled at zero.
- Price per run = (input tokens × input rate + output tokens × output rate) × markup, rounded up to the millicredit, never below `AI_MIN_CHARGE_CREDITS`.
- Credit packs (Spark $10 / 1,000, Studio $25 / 2,750, Agency $60 / 7,200) are one-time Stripe Checkout payments. Credits are added only by the signed webhook, once per Checkout Session, and only when the paid amount matches the pack.
- New accounts get `AI_SIGNUP_CREDITS` (default 25) once.

### Turning it on

1. Run `migrations/003_ai_credits.sql` in the Supabase SQL editor (after 001 and 002).
2. In Vercel, set server-only variables:
   - `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY` with `AI_PROVIDER=anthropic`) and `AUVRANTIS_AI_MODEL`
   - `AI_PRICE_INPUT_PER_MTOK` and `AI_PRICE_OUTPUT_PER_MTOK`: your provider's USD price per million tokens for that model. AI stays closed until both are set, so it can never run unpriced.
   - Optional: `AI_MARKUP` (default 4, minimum 1.5), `AI_MIN_CHARGE_CREDITS` (default 1), `AI_SIGNUP_CREDITS` (default 25)
   - `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` for credit packs
3. Point a Stripe webhook at `/api/learn/webhook` with `checkout.session.completed` and `checkout.session.async_payment_succeeded` (plus the subscription events if Learning Center Pro is on).
4. Redeploy. `/api/ai/status` reports `configured: true` when everything is in place.

At the default 4× markup, gross margin on AI after card fees is about 67–69% on every pack (see `packMargin` in `src/lib/ai-billing.ts`).

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open [http://localhost:3101](http://localhost:3101). Run checks with `npm test` and `npm run build`. `npm start` serves the production build on port 3101.

## Working features

- Twelve visibly distinct template presets and an industry-aware questionnaire with deterministic tone variations.
- Project dashboard to create, open, rename, duplicate, and explicitly confirm deletion of local projects.
- Existing `auvrantis-create:draft:v1` browser drafts migrate losslessly into the project library. Malformed project data is rejected with a recoverable fresh library; prior v1 data is left in browser storage.
- Structured section editing for title, copy, visibility, order, colors, contact email, and page metadata. Add, duplicate, and delete section instances with unique IDs; at least one section must remain.
- Undo/redo buttons and keyboard shortcuts (`⌘/Ctrl+Z`, `⌘/Ctrl+Shift+Z`).
- Desktop and mobile previews, plus a readiness checklist with visible-section counts, evidence, and focus actions.
- Export the website as a standalone HTML file, or export/import an editable `.json` backup capped at 1 MB. Import validates a strict allowlisted schema; no HTML or executable code is accepted.
- User-initiated PNG share image and launch-copy actions. They describe a draft and do not claim that it is live or include invented customer proof.
- Optional Create→Check handoff through `NEXT_PUBLIC_AUVRANTIS_CHECK_URL`. It opens the Check dashboard with the public URL the user entered. If the Check URL is not configured, the action reports that honestly.
- Preview-first AI Site Planner: describe a business in plain language, review a bounded structured plan (pages, sections, colors, missing information, and warnings), then explicitly apply it as an editable draft. The model never writes arbitrary application code and Apply is undoable.
- Launch Loop foundation: onboarding now previews a five-page blueprint and the project model carries a bounded brief, brand kit, pages, and portable handoff contract.
- Browser-local autosave is labeled on-screen. Product pages and the editor include **By Auvrantis Group** attribution. Customer websites have no Auvrantis watermark.

## Privacy and technical limits

- Projects use this browser's `localStorage` only. They are not uploaded, synced to an account, or backed up on another device. Clearing browser data can remove them. Use JSON backup to keep a portable copy. Avoid entering sensitive information.
- HTML export escapes owner-entered text, validates colors and email, and rejects unsafe image URL schemes. It creates a file for the owner to host elsewhere; it does not publish or host a website.
- There is no contact form or message-delivery service. Contact links use `mailto:` when a valid email was supplied.
- The readiness checklist inspects the structured local draft only. It is not a hosted-site check, legal/compliance assessment, accessibility conformance audit, performance measurement, ranking predictor, or sales forecast.
- Auvrantis Create hosting, account sign-in, cloud sync, paid entitlement, custom domains, uploads, and subscription checkout are not connected. The displayed $15.99/month is planned; no payment is collected. Auvrantis Check has a separate planned $15.99/month subscription.
- Cloud sync remains the next adapter for Launch Loop records; the current foundation is local-first and exportable.
- An optional gallery image is a remote HTTP(S) reference. It is not uploaded, copied into the export, or optimized.
- The AI planner is optional. Without `OPENAI_API_KEY`, the editor remains fully usable and the planner reports that AI is unavailable. To enable it in a deployment, configure the server-only `OPENAI_API_KEY` and optional `AUVRANTIS_AI_MODEL` environment variables in Vercel; never expose the key as a `NEXT_PUBLIC_` variable. Prompts and provider responses are bounded, schema-validated, and rejected on unsafe or malformed output.

See `/guide` for the customer-facing privacy and methodology explanation.
