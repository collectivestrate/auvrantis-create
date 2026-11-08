import { readJson, isObject } from '@/lib/cloud/server';
import { generateAiSitePlan, validatePrompt } from '@/lib/ai-provider';
import { aiError, runMetered } from '@/lib/ai-metered';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await readJson(req);
  let prompt: string;
  try { prompt = validatePrompt(isObject(body) ? body.prompt : null); } catch { return aiError('prompt_invalid'); }
  return runMetered(req, 'plan', prompt, (safetyId) => generateAiSitePlan(prompt, safetyId));
}
