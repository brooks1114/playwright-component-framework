// src/types/create-matter/matter-details-section.schema.ts

import { z } from "zod";
import {
  MATTER_TYPE_OPTIONS,
  MATTER_SUBTYPE_OPTIONS,
} from "../../constants/components/create-matter/matter-details-section-constants";

// ─────────────────────────────
// Allowed Matter Type labels
// ─────────────────────────────

const MATTER_TYPE_VALUES = Object.values(MATTER_TYPE_OPTIONS) as [
  string,
  ...string[],
];

// ─────────────────────────────
// Allowed Matter Subtype labels
//   - We now flatten the nested options object:
//     { NON_LITIGATED: { BAD_FAITH: { value, label }, ...}, SUITS: { ... }, ... }
//   → array of all .label strings
// ─────────────────────────────

const MATTER_SUBTYPE_LABELS = Object.values(MATTER_SUBTYPE_OPTIONS).flatMap(
  (group) => Object.values(group).map((option) => option.label)
) as [string, ...string[]];

// ─────────────────────────────
// Schema
// ─────────────────────────────

export const MatterDetailsSchema = z.object({
  caseName: z.string().min(1, "caseName is required"),
  docketNumber: z.string().optional(),

  // Must match one of the visible Matter Type labels
  matterType: z.enum(MATTER_TYPE_VALUES).optional(),

  // Must match one of the visible Matter Subtype labels
  matterSubtype: z.enum(MATTER_SUBTYPE_LABELS).optional(),
});

export type MatterDetailsData = z.infer<typeof MatterDetailsSchema>;
