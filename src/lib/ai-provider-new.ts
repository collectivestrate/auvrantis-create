import { createHash } from 'node:crypto';
import { validateAiSitePlan, type AiSitePlan } from './ai-plan';
export function validatePrompt(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 8000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) {
    throw new Error('prompt_invalid');
  }
  return value.trim();
}
export function hashSafetyId(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
export async function generateAiSitePlan(prompt: string, safetyId: string): Promise<AiSitePlan> {
  const input = validatePrompt(prompt);
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error('ai_unavailable');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.AUVRANTIS_AI_MODEL || 'gpt-6-astra',
        safety_identifier: hashSafetyId(safetyId),
        input: [
          {
            role: 'system',
            content:
              'Create an editable website plan. Never invent testimonials, credentials, statistics, guarantees, or legal claims. Return only the requested JSON schema.',
          },
          {
            role: 'user',
            content: input,
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'auvrantis_site_plan',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                version: { type: 'number' },
                brief: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    name: { type: 'string' },
                    service: { type: 'string' },
                    audience: { type: 'string' },
                    location: { type: 'string' },
                    tone: { type: 'string' },
                    primaryCta: { type: 'string' },
                  },
                  required: ['name', 'service', 'audience', 'location', 'tone', 'primaryCta'],
                },
                pages: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      id: { type: 'string' },
                      title: { type: 'string' },
                      path: { type: 'string' },
                      goal: { type: 'string' },
                      sectionTypes: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                    required: ['id', 'title', 'path', 'goal', 'sectionTypes'],
                  },
                },
                theme: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    mode: { type: 'string' },
                    accent: { type: 'string' },
                    ink: { type: 'string' },
                    paper: { type: 'string' },
                    typeScale: { type: 'string' },
                    density: { type: 'string' },
                  },
                  required: ['mode', 'accent', 'ink', 'paper', 'typeScale', 'density'],
                },
                contentPrompts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      sectionId: { type: 'string' },
                      factsNeeded: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                    required: ['sectionId', 'factsNeeded'],
                  },
                },
                seo: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    keywords: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                  required: ['title', 'description', 'keywords'],
                },
                missingInformation: {
                  type: 'array',
                  items: { type: 'string' },
                },
                warnings: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: [
                'version',
                'brief',
                'pages',
                'theme',
                'contentPrompts',
                'seo',
                'missingInformation',
                'warnings',
              ],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(response.status === 429 ? 'ai_rate_limited' : 'ai_provider_error');
    }

    const payload = await response.json() as { output_text?: string };
    if (!payload.output_text) {
      throw new Error('ai_incomplete');
    }

    return validateAiSitePlan(JSON.parse(payload.output_text));
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('ai_')) {
      throw error;
    }
    throw new Error('ai_provider_error');
  } finally {
    clearTimeout(timeout);
  }
}