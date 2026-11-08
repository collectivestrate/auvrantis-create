import { readJson, isObject } from '@/lib/cloud/server';
import { validateBrief, validateSections, writeSite, type BriefInput, type SectionInput } from '@/lib/ai-provider';
import { aiError, runMetered } from '@/lib/ai-metered';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const DESIGN = /^[a-z]{2,20}$/;

/** Writes real copy for every section of the visitor's current draft. */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!isObject(body)) return aiError('prompt_invalid');
  let brief: BriefInput; let sections: SectionInput[];
  try { brief = validateBrief(body.brief); sections = validateSections(body.sections); } catch { return aiError('prompt_invalid'); }
  const design = typeof body.design === 'string' && DESIGN.test(body.design) ? body.design : 'atelier';
  const quoted = JSON.stringify({ brief, sections });
  return runMetered(req, 'write', quoted, (safetyId) => writeSite(brief, sections, design, safetyId));
}
