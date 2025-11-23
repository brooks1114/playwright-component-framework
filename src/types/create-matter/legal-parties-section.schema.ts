// ============================================================================
// FILE: src/types/create-matter/legal-parties-section.schema.ts
// ============================================================================

import { z } from "zod";
import { LEGAL_PARTIES_ROLE_VALUES } from "../../constants/components/create-matter/legal-parties-section-constants";

/**
 * Zod enum that matches the underlying <input value="..."> attributes
 * for the Legal Parties role radio group.
 */
export const legalPartyRoleSchema = z.enum([
  LEGAL_PARTIES_ROLE_VALUES.FIRST_INSURED_DEFENDANT,
  LEGAL_PARTIES_ROLE_VALUES.DEFENDANT,
  LEGAL_PARTIES_ROLE_VALUES.PLAINTIFF,
]);

export type LegalPartyRole = z.infer<typeof legalPartyRoleSchema>;

/**
 * One row (card) of legal party data.
 *
 * NOTE:
 *  - All fields are optional so this schema works both for:
 *      * “blank page load” state (everything empty)
 *      * “filled-in” state coming from your test data
 *  - If you want to enforce stronger rules later (e.g. role required),
 *    you can add .min(1) / .nonempty() and refinements when you’re ready.
 */
export const legalPartyRowSchema = z.object({
  role: legalPartyRoleSchema.optional(),
  contact: z.string().optional(),
  comment: z.string().max(250).optional(),
});

export type LegalPartyRowData = z.infer<typeof legalPartyRowSchema>;

/**
 * High-level shape for the Legal Parties section.
 *
 * - `primary` is the first card (the 1st Insured defendant row).
 * - `additional` are the accordion rows (Defendant / Plaintiff).
 */
export const legalPartiesSchema = z.object({
  primary: legalPartyRowSchema.optional(),
  additional: z.array(legalPartyRowSchema).optional(),
});

export type LegalPartiesData = z.infer<typeof legalPartiesSchema>;
