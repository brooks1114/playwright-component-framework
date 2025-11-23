// src/types/create-matter/referral-details-section.schema.ts
import { z } from "zod";

/**
 * Zod schema for the Referral Details section.
 *
 * This is the single source of truth for test data shape.
 * - All fields are optional to allow partial fills in tests.
 * - You can tighten validation rules over time (e.g. date format).
 */
export const referralDetailsSchema = z.object({
  /** Referral date in UI format, e.g. "07/07/2025". */
  referralDate: z.string().min(1, "Referral date is required").optional(),

  /** Referral type, e.g. "New". */
  referralType: z.string().min(1).optional(),

  /** Referral reason, e.g. "Conflict". */
  referralReason: z.string().min(1).optional(),

  /** Assigned to / adjuster name, e.g. "Test John". */
  assignedTo: z.string().min(1).optional(),

  /** Group label, e.g. "0359 Somerset - APD". */
  group: z.string().min(1).optional(),

  /** Triage completed date in UI format, e.g. "08/30/2025". */
  triageCompletedDate: z.string().min(1).optional(),
});

export type ReferralDetailsData = z.infer<typeof referralDetailsSchema>;
