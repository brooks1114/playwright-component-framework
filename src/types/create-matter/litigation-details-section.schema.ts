// src/types/create-matter/litigation-details-section.schema.ts
import { z } from "zod";

/**
 * Canonical test data shape for the Litigation details card.
 *
 * This is intentionally *test-centric* (not necessarily 1:1 with the backend),
 * and is kept flat so it's easy to construct in fixtures and tests.
 */
export const litigationDetailsSchema = z.object({
  courtType: z.string().min(1, "Court type is required"),
  jurisdictionState: z.string().min(1, "Jurisdiction state is required"),
  jurisdictionCounty: z.string().min(1, "Jurisdiction county is required"),

  // Dates are kept as plain strings in "MM/DD/YYYY" for now.
  serviceDate: z.string().min(1, "Service date is required"),
  methodServed: z.string().min(1, "Method served is required"),
  filingDate: z.string().min(1, "Filing date is required"),

  // UI uses radios with value="true"/"false"; tests see a boolean.
  extension: z.boolean(),

  barrierToResolution: z.string().min(1, "Barrier to resolution is required"),
});

export type LitigationDetailsData = z.infer<typeof litigationDetailsSchema>;
