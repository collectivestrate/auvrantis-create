# Auvrantis Create frontend upgrade review

Reviewed frontend changes in `310fa6f..4d28296`. This review excludes concurrent cloud/backend namespace and analytics work. No tests or builds were rerun, and no source files were modified.

## Findings

### [P1] A corrupt v2 library prevents recovery of a valid v1 draft

In [project-library.ts](src/lib/project-library.ts#L42), any present but malformed v2 value returns an empty project list without checking the legacy draft. The studio then writes that empty list back to the v2 key after its save delay ([studio.tsx](src/components/studio.tsx#L45), [studio.tsx](src/components/studio.tsx#L55)). The v1 key is not deleted, but the next load still prefers the now-valid empty v2 library, leaving the old draft inaccessible through the app. When v2 restoration fails, attempt a validated legacy migration before persisting an empty library; preserve the corrupt value or report recovery clearly.

### [P2] Backup import accepts dangerous image URL schemes

`validDraftShape` only checks that `imageUrl` is a string, and `parseProjectBackup` accepts the restored draft on that basis ([project-library.ts](src/lib/project-library.ts#L20), [project-library.ts](src/lib/project-library.ts#L69)). A JSON backup with `javascript:...` or another non-HTTP scheme is therefore accepted and stored. HTML export later rejects that URL via `safeUrl`, but import should reject it at the trust boundary and explain which field needs correction.

### [P2] Restored project metadata and section identifiers have no bounds

`validProject` accepts arbitrary-length IDs and names and arbitrary timestamp strings; section IDs and text fields likewise have no explicit length bounds ([project-library.ts](src/lib/project-library.ts#L20), [project-library.ts](src/lib/project-library.ts#L31)). Backup project names are capped, but a backup can still carry oversized draft fields within the 1 MB file limit. Enforce finite limits and validate timestamps/ID uniqueness before restoring library data, so corrupted or hand-edited local storage cannot create huge labels, invalid dates, or colliding project keys.

## Spec and quality verdict

The frontend upgrade substantially meets the requested first-milestone behaviors. The v1-to-v2 migration preserves draft content on the ordinary migration path; backup import is size-limited, JSON-only, strict about unexpected fields, and renders imported values as text; save failures are surfaced; and section creation, duplication, deletion, reordering, and HTML export are implemented. Readiness checks use concrete draft evidence and do not claim hosted-site, legal, accessibility-conformance, or search-ranking results.

The corrupt-library fallback and imported-URL validation should be fixed before treating recovery/import as safe for general use. Project/date/ID and draft-field bounds are a robustness gap. No blocking issue was found in the requested section editing or readiness paths from source inspection.
