# Create cloud foundation handoff

**Status: migration applied and live integration verified on October 25, 2026.** The isolated Auvrantis tables and RPCs were applied in the owner-controlled Supabase project. A 13-check disposable-identity test passed. The pre-existing sign-up trigger also received a duplicate-safe, schema-qualified compatibility repair so new accounts can be created.

## Included

- `migrations/001_auvrantis.sql`: one transactional, additive migration for Create projects, owner-only publication rows, separate future product subscriptions, privacy-preserving request budgets, schema readiness, atomic rate limiting, and the three-active-publication beta cap. It does not alter SiteForge tables or policies.
- `src/lib/cloud/server.ts`: server-side Supabase Auth/PostgREST transport, cookie/session helpers, exact-origin checks, strict draft validation, HMAC subject hashing, and fail-closed readiness/rate calls.
- `src/app/api/cloud/[...path]/route.ts`: signup/login/email confirmation callback/session refresh, local-only logout, owner-filtered project list/create/load/save/delete, and gated publish/unpublish APIs.
- `src/app/p/[slug]/route.ts`: active publication lookup and safe HTML serialization with restrictive CSP and no-store caching.
- `src/components/cloud-panel.tsx` and stylesheet: explicit account, save, load, publish, and unpublish controls. No background cloud autosave is implied.
- `src/lib/cloud/server.test.ts`: focused tests for request origin, body cap, strict/corrupt draft validation, Vercel IP extraction, and cookie parsing.

## Required server environment names

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUVRANTIS_BETA_PUBLISH` (must equal `true` to enable beta publication; otherwise publishing fails closed)

Never expose the service-role key to client code. Supabase Auth must allow the exact deployed Create callback URL `/api/cloud/callback` as a redirect URL, and email confirmation settings must support PKCE email sign-up. Test/staging and production origins need explicit configuration.

## Release gates

1. Add the exact deployed Create Auth callback URL (`/api/cloud/callback`) to Supabase Auth and verify confirmation email behavior with a controlled account.
2. Set the production server environment names listed above; keep the service-role key server-only.
3. Repeat the 13-check flow against the deployed URL before opening beta publication to customers.
4. Stripe checkout, paid entitlements, and durable Check scan limits remain separate release gates; no customer billing was exercised.

The new subscription table is only a future storage boundary. No Stripe checkout, webhook, or paid entitlement is implemented here. Create and Check remain separate product keys; no legacy `profiles.plan` or SiteForge entitlement is consulted.
