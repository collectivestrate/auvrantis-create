// The only place the app talks to an AI provider. Every call returns the provider's
// own token usage so it can be billed exactly. Supports OpenAI (Responses API) and
// Anthropic (Messages API); pick one with AI_PROVIDER and set its key server-side.

import { createHash } from 'node:crypto';
import { validateAiSitePlan, type AiSitePlan } from './ai-plan';
import { ACTIONS, type AiAction, type Usage } from './ai-billing';

export function validatePrompt(value: unknown, max = 8000): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) throw new Error('prompt_invalid');
  return value.trim();
}

export function hashSafetyId(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export type Provider = 'openai' | 'anthropic';

export function providerConfig(env: Record<string, string | undefined> = process.env): { provider: Provider; key: string; model: string } | null {
  const wanted = (env.AI_PROVIDER || (env.ANTHROPIC_API_KEY && !env.OPENAI_API_KEY ? 'anthropic' : 'openai')).toLowerCase();
  if (wanted === 'anthropic') {
    return env.ANTHROPIC_API_KEY ? { provider: 'anthropic', key: env.ANTHROPIC_API_KEY, model: env.AUVRANTIS_AI_MODEL || 'claude-haiku-5-5' } : null;
  }
  return env.OPENAI_API_KEY ? { provider: 'openai', key: env.OPENAI_API_KEY, model: env.AUVRANTIS_AI_MODEL || 'gpt-6-astra' } : null;
}

export type ModelResult = { data: unknown; usage: Usage; model: string };

/** Thrown after the provider was called, so the caller still knows what it cost. */
export class ModelError extends Error {
  usage: Usage | null;
  constructor(code: string, usage: Usage | null = null) { super(code); this.usage = usage; }
}

const GUARDRAILS = 'You write for small local businesses. Never invent testimonials, reviews, credentials, awards, statistics, prices, guarantees, years in business, or legal claims. When a fact is unknown, write around it or use a short bracketed placeholder such as [your hours]. Plain text only: no HTML, no markdown, no emoji.';

async function callModel(action: AiAction, system: string, user: string, schemaName: string, schema: Record<string, unknown>, safetyId: string): Promise<ModelResult> {
  const config = providerConfig();
  if (!config) throw new ModelError('ai_unavailable');
  const maxTokens = ACTIONS[action].maxOutputTokens;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    let response: Response;
    if (config.provider === 'anthropic') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'x-api-key': config.key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          max_tokens: maxTokens,
          system: `${GUARDRAILS}\n\n${system}`,
          messages: [{ role: 'user', content: user }],
          tools: [{ name: schemaName, description: 'Return the result in this exact shape.', input_schema: schema }],
          tool_choice: { type: 'tool', name: schemaName },
          metadata: { user_id: hashSafetyId(safetyId) },
        }),
      });
    } else {
      response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        signal: controller.signal,
        headers: { authorization: `Bearer ${config.key}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          max_output_tokens: maxTokens,
          safety_identifier: hashSafetyId(safetyId),
          input: [{ role: 'system', content: `${GUARDRAILS}\n\n${system}` }, { role: 'user', content: user }],
          text: { format: { type: 'json_schema', name: schemaName, strict: true, schema } },
        }),
      });
    }
    if (!response.ok) throw new ModelError(response.status === 429 ? 'ai_rate_limited' : 'ai_provider_error');
    const payload = await response.json() as Record<string, any>;
    const usage = readUsage(config.provider, payload);
    let data: unknown;
    try { data = readOutput(config.provider, payload); } catch { throw new ModelError('ai_incomplete', usage); }
    return { data, usage, model: typeof payload.model === 'string' ? payload.model : config.model };
  } catch (error) {
    if (error instanceof ModelError) throw error;
    throw new ModelError('ai_provider_error');
  } finally {
    clearTimeout(timeout);
  }
}

function readUsage(provider: Provider, payload: Record<string, any>): Usage {
  const u = payload?.usage ?? {};
  if (provider === 'anthropic') {
    const input = (Number(u.input_tokens) || 0) + (Number(u.cache_creation_input_tokens) || 0) + (Number(u.cache_read_input_tokens) || 0);
    return { inputTokens: input, outputTokens: Number(u.output_tokens) || 0 };
  }
  return { inputTokens: Number(u.input_tokens) || 0, outputTokens: Number(u.output_tokens) || 0 };
}

function readOutput(provider: Provider, payload: Record<string, any>): unknown {
  if (provider === 'anthropic') {
    const block = Array.isArray(payload.content) ? payload.content.find((item: any) => item?.type === 'tool_use') : null;
    if (!block || typeof block.input !== 'object') throw new Error('no output');
    return block.input;
  }
  if (payload.status && payload.status !== 'completed') throw new Error('incomplete');
  if (typeof payload.output_text === 'string') return JSON.parse(payload.output_text);
  const text = (Array.isArray(payload.output) ? payload.output : [])
    .flatMap((item: any) => (Array.isArray(item?.content) ? item.content : []))
    .filter((part: any) => part?.type === 'output_text' && typeof part.text === 'string')
    .map((part: any) => part.text)
    .join('');
  if (!text) throw new Error('no output');
  return JSON.parse(text);
}

/** Runs a model call and validates its output. Validation failures keep the usage for billing decisions. */
async function run<T>(action: AiAction, system: string, user: string, schemaName: string, schema: Record<string, unknown>, safetyId: string, validate: (data: unknown) => T) {
  const result = await callModel(action, system, user, schemaName, schema, safetyId);
  try {
    return { value: validate(result.data), usage: result.usage, model: result.model };
  } catch {
    throw new ModelError('ai_invalid_output', result.usage);
  }
}

// ---------------------------------------------------------------------------
// Plan a site

const planSchema = { type: 'object', additionalProperties: false, properties: { version: { type: 'number' }, brief: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, service: { type: 'string' }, audience: { type: 'string' }, location: { type: 'string' }, tone: { type: 'string' }, primaryCta: { type: 'string' } }, required: ['name', 'service', 'audience', 'location', 'tone', 'primaryCta'] }, pages: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { id: { type: 'string' }, title: { type: 'string' }, path: { type: 'string' }, goal: { type: 'string' }, sectionTypes: { type: 'array', items: { type: 'string', enum: ['hero', 'services', 'about', 'gallery', 'faq', 'contact', 'testimonials'] } } }, required: ['id', 'title', 'path', 'goal', 'sectionTypes'] } }, theme: { type: 'object', additionalProperties: false, properties: { mode: { type: 'string', enum: ['light', 'dark'] }, accent: { type: 'string' }, ink: { type: 'string' }, paper: { type: 'string' }, typeScale: { type: 'string', enum: ['compact', 'balanced', 'expressive'] }, density: { type: 'string', enum: ['compact', 'balanced', 'expressive'] } }, required: ['mode', 'accent', 'ink', 'paper', 'typeScale', 'density'] }, contentPrompts: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { sectionId: { type: 'string' }, factsNeeded: { type: 'array', items: { type: 'string' } } }, required: ['sectionId', 'factsNeeded'] } }, seo: { type: 'object', additionalProperties: false, properties: { title: { type: 'string' }, description: { type: 'string' }, keywords: { type: 'array', items: { type: 'string' } } }, required: ['title', 'description', 'keywords'] }, missingInformation: { type: 'array', items: { type: 'string' } }, warnings: { type: 'array', items: { type: 'string' } } }, required: ['version', 'brief', 'pages', 'theme', 'contentPrompts', 'seo', 'missingInformation', 'warnings'] };

export function generateAiSitePlan(prompt: string, safetyId: string) {
  const input = validatePrompt(prompt);
  return run<AiSitePlan>('plan', 'Create an editable website plan: up to 5 pages, sections from the allowed list, a palette as 6-digit hex colors with readable contrast between ink and paper, and SEO basics. version must be 1. Page ids are lowercase words joined by hyphens.', input, 'auvrantis_site_plan', planSchema, safetyId, validateAiSitePlan);
}

// ---------------------------------------------------------------------------
// Write a whole site: real copy for every section of the current draft.

export type BriefInput = { name: string; service: string; audience: string; location: string; tone: string };
export type SectionInput = { id: string; type: string; title: string; body: string };
export type WrittenSite = { title: string; description: string; sections: Array<{ id: string; title: string; body: string }> };

const SECTION_ID = /^[a-z0-9-]{1,60}$/i;
const SECTION_TYPE = /^[a-z-]{1,24}$/;
const clean = (value: unknown, max: number) => {
  if (typeof value !== 'string') throw new Error('not text');
  const text = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').replace(/<[^>]*>/g, '').trim();
  if (!text || text.length > max) throw new Error('bad length');
  return text;
};

export function validateBrief(value: unknown): BriefInput {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const field = (key: string, max: number) => (typeof raw[key] === 'string' ? validatePromptOptional(raw[key] as string, max) : '');
  const brief = { name: field('name', 120), service: field('service', 300), audience: field('audience', 300), location: field('location', 120), tone: field('tone', 120) };
  if (!brief.name && !brief.service) throw new Error('prompt_invalid');
  return brief;
}

function validatePromptOptional(value: string, max: number) {
  if (!value.trim()) return '';
  return validatePrompt(value, max);
}

export function validateSections(value: unknown): SectionInput[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 16) throw new Error('prompt_invalid');
  return value.map((item) => {
    const raw = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    if (typeof raw.id !== 'string' || !SECTION_ID.test(raw.id) || typeof raw.type !== 'string' || !SECTION_TYPE.test(raw.type)) throw new Error('prompt_invalid');
    return { id: raw.id, type: raw.type, title: typeof raw.title === 'string' ? raw.title.slice(0, 200) : '', body: typeof raw.body === 'string' ? raw.body.slice(0, 1200) : '' };
  });
}

export function validateWrittenSite(input: unknown, sections: SectionInput[]): WrittenSite {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  if (!Array.isArray(raw.sections)) throw new Error('bad shape');
  const wanted = new Set(sections.map((section) => section.id));
  const written = new Map<string, { id: string; title: string; body: string }>();
  for (const item of raw.sections) {
    const section = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    if (typeof section.id !== 'string' || !wanted.has(section.id) || written.has(section.id)) continue;
    written.set(section.id, { id: section.id, title: clean(section.title, 140), body: clean(section.body, 900) });
  }
  // Every requested section must come back, or the visitor would get a half-written site.
  if (written.size !== wanted.size) throw new Error('missing sections');
  return { title: clean(raw.title, 70), description: clean(raw.description, 170), sections: sections.map((section) => written.get(section.id)!) };
}

const writeSchema = { type: 'object', additionalProperties: false, properties: { title: { type: 'string' }, description: { type: 'string' }, sections: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { id: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' } }, required: ['id', 'title', 'body'] } } }, required: ['title', 'description', 'sections'] };

export function writeSite(brief: BriefInput, sections: SectionInput[], design: string, safetyId: string) {
  const system = [
    'Write the words for a small business website, one entry per section, using each section id exactly as given.',
    'Headlines: specific to this business, 3 to 9 words, no clichés such as "Welcome to", "Your trusted partner", "Elevate", or "Unlock".',
    'Body: 1 to 3 short sentences a real owner would say out loud. Concrete beats clever. Mention the location naturally where it helps local search.',
    'Contact sections invite the visitor to get in touch; do not invent phone numbers, addresses or emails.',
    'title is the browser tab title (under 60 characters, includes the business name and town). description is a search snippet (under 155 characters).',
  ].join(' ');
  const user = JSON.stringify({ business: brief, design, sections: sections.map(({ id, type, title, body }) => ({ id, type, currentTitle: title, currentBody: body })) });
  return run<WrittenSite>('write', system, user, 'auvrantis_site_copy', writeSchema, safetyId, (data) => validateWrittenSite(data, sections));
}

// ---------------------------------------------------------------------------
// Rewrite one section following an instruction.

export type RewrittenSection = { title: string; body: string };
const rewriteSchema = { type: 'object', additionalProperties: false, properties: { title: { type: 'string' }, body: { type: 'string' } }, required: ['title', 'body'] };

export function validateRewrite(input: unknown): RewrittenSection {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  return { title: clean(raw.title, 140), body: clean(raw.body, 900) };
}

export function rewriteSection(brief: BriefInput, section: SectionInput, instruction: string, safetyId: string) {
  const system = 'Rewrite one website section following the owner\'s instruction. Keep facts the owner already wrote. Headline 3 to 9 words; body 1 to 3 short sentences.';
  const user = JSON.stringify({ business: brief, section: { type: section.type, title: section.title, body: section.body }, instruction });
  return run<RewrittenSection>('rewrite', system, user, 'auvrantis_section_rewrite', rewriteSchema, safetyId, validateRewrite);
}
