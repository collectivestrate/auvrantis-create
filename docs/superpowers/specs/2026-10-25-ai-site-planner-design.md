# Auvrantis AI Site Planner Design

## Goal

Let a user describe a website in plain language and receive a structured, editable Auvrantis project plan: business brief, sitemap, page goals, section choices, visual direction, content prompts, SEO starter metadata, and missing-information questions.

## Core rule

The model never writes arbitrary application code for the primary builder. It selects from an allowlisted Auvrantis page/section/component registry and returns a validated document. The user reviews a preview and explicitly applies it to the editor.

## User flow

1. User enters a bounded prompt and optionally chooses industry, audience, tone, location, and desired pages.
2. Server validates length, rate limit, authenticated/session identity, and content policy.
3. Model returns structured output with `brief`, `pages`, `theme`, `contentPrompts`, `seo`, `missingInformation`, and `warnings`.
4. Client renders a plan preview with page cards and theme swatches.
5. User can revise the prompt, regenerate, or apply the plan.
6. Applying creates a normal editable local project; it does not publish, send messages, or invent proof.

## Structured output

- `brief`: name, service, audience, location, tone, primary CTA
- `pages`: id, title, path, goal, allowed section types
- `theme`: mode (`light`/`dark`), accent, ink, paper, type scale, density
- `contentPrompts`: section id plus the facts the user must supply
- `seo`: title, description, keywords as suggestions only
- `missingInformation`: explicit questions blocking trustworthy copy
- `warnings`: claims, testimonials, statistics, legal or factual details requiring user review

## Safety and quality

- Use Structured Outputs / JSON Schema and validate again on the server.
- Moderate user prompts and generated text before display.
- Add a privacy-preserving safety identifier per authenticated/session user.
- Limit prompt size, output size, requests per user/session, and regeneration frequency.
- Never generate customer testimonials, credentials, statistics, guarantees, or legal claims without user-supplied facts.
- Show generated text as a suggestion with apply/undo, never silently overwrite an existing project.
- If the model refuses or returns incomplete data, show a recoverable error and keep the user’s current draft.

## Architecture

- `POST /api/ai/plan` is a server-only route. The API key is never client-visible.
- A provider adapter returns a validated `AiSitePlan` and records no raw prompt in analytics.
- The client owns preview and apply. Applying maps allowlisted section types to existing Create templates.
- Local-only mode remains available when the AI provider is not configured.

## Acceptance criteria

- A normal prompt produces a valid plan preview or an honest unavailable/error state.
- Invalid, oversized, unsafe, or schema-invalid output is rejected without changing the draft.
- Apply creates an editable project with five or fewer bounded pages and no invented proof.
- Light/dark theme output respects the existing workspace preference unless the user explicitly requests a different mode.
- Tests cover schema validation, size limits, refusal/incomplete output, prompt redaction, and apply/undo behavior.
