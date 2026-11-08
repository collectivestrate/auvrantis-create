import { readJson, isObject } from '@/lib/cloud/server';
import { rewriteSection, validateBrief, validatePrompt, validateSections, type BriefInput, type SectionInput } from '@/lib/ai-provider';
import { aiError, runMetered } from '@/lib/ai-metered';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Rewrites one section following a short instruction ("make it warmer", "mention weekend hours"). */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!isObject(body)) return aiError('prompt_invalid');
  let brief: BriefInput; let section: SectionInput; let instruction: string;
  try {
    brief = validateBrief(body.brief);
    [section] = validateSections([body.section]);
    instruction = validatePrompt(body.instruction, 300);
  } catch { return aiError('prompt_invalid'); }
  const quoted = JSON.stringify({ brief, section, instruction });
  return runMetered(req, 'rewrite', quoted, (safetyId) => rewriteSection(brief, section, instruction, safetyId));
}
