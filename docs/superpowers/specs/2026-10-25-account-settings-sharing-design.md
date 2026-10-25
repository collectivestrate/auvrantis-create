# Auvrantis Account, Settings, and Sharing Design

Date: 2026-10-25
Products: Auvrantis Create and Auvrantis Check

## Goal

Make both products feel like a polished professional workspace: customers can create an account, keep projects across devices, customize their workspace and sites, and share review-ready links with the right people.

## Experience

### Account center

- Sign up, sign in, sign out, password recovery, and email-confirmation states.
- A clear migration step offers to import the current browser drafts into the signed-in account; it never silently uploads local data.
- Sync status is visible: saved, syncing, offline, or conflict.
- Conflicts offer keep-cloud, keep-device, or download-both rather than overwriting silently.

### Settings tab

- Profile: display name, email state, and sign-out.
- Workspace: workspace name, default project, reviewer defaults, and brand identity.
- Appearance: theme preset, reduced motion, density, and preview defaults.
- Privacy: analytics preference, share-link defaults, and active-link list.
- Data: export all projects/reports and account deletion request.
- Notifications: email preference controls, kept separate from product-critical security messages.

### Sharing

- Create generates read-only preview links with expiration and revocation.
- Check generates branded report links with redacted URLs and evidence timestamps.
- Links use opaque, hashed tokens; raw tokens are never stored or returned in database reads.
- Reviewers can view, comment, and approve when explicitly invited; they cannot edit or publish.
- Copy link, native share, and QR-friendly presentation are available without forcing an account for the viewer.
- Every share page names the owner’s product and “By Auvrantis Group.”

### Create customization

- Theme presets plus custom color roles, type scale, spacing density, button style, header/footer variation, and social preview.
- Page manager for adding, renaming, reordering, hiding, and duplicating pages.
- Reusable sections and contact/quote forms with explicit owner-controlled fields.
- Brand kit values feed previews, exports, social cards, and share pages consistently.

### Check customization

- Saved projects with multiple same-origin URLs and scan history.
- Report branding, severity filters, custom thresholds, client notes, and export preferences.
- Recheck and fix-verification actions preserve evidence and comparison history.

## Security and data boundaries

- Continue using isolated Auvrantis Supabase tables; do not modify Siteforge tables or legacy billing entitlements.
- Owner reads are filtered by authenticated owner; server routes perform all writes.
- Share tokens are generated with cryptographic randomness, stored only as a digest, scoped to one resource, and expire or revoke.
- Viewer links expose only a safe snapshot. They never expose raw database rows, service credentials, private notes, email addresses, or unredacted URL queries/fragments.
- Account deletion is an explicit, recoverable workflow where possible and requires confirmation before permanent purge.
- Local storage remains usable offline; signed-out users can continue creating and exporting.

## Release sequence

1. **Account/settings foundation:** auth screens, session state, settings shell, local-draft migration prompt, sync status, and data export.
2. **Cloud project sync:** Create/Check project adapters, conflict-safe saves, report history, and account-scoped reads.
3. **Sharing:** tokenized read-only snapshots, revocation/expiration, reviewer comments/approval, and branded share pages.
4. **Customization:** full Create brand/page controls, Check report preferences/thresholds, and consistent export branding.

## Success criteria

- A user can sign up, migrate a browser project intentionally, open it on another device, and see an honest sync state.
- A user can share a review link that works without exposing private data and can revoke it.
- A reviewer can comment or approve without gaining edit/publish access.
- Settings visibly control the experience and do not silently change project content.
- Offline/local-first behavior remains functional when cloud services are unavailable.
