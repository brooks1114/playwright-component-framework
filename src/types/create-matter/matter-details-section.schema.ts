/* ============================================================================
 * FILE: src/types/create-matter/matter-details-section.schema.ts
 * - Zod schema + TS type for MatterDetailsSection
 * - This replaces the interface that currently lives in the class file
 * ============================================================================
 */

import { z } from "zod";
import {
  MATTER_TYPE_OPTIONS,
  MATTER_SUBTYPE_OPTIONS,
} from "../../constants/components/create-matter/matter-details-section-constants";

// Use the same option labels your dropdown uses.
// This way, test data is validated against the *actual* visible labels.

const MATTER_TYPE_VALUES = Object.values(MATTER_TYPE_OPTIONS) as [
  string,
  ...string[],
];

const MATTER_SUBTYPE_VALUES = Object.values(MATTER_SUBTYPE_OPTIONS) as [
  string,
  ...string[],
];

export const MatterDetailsSchema = z.object({
  // Required, non-empty – matches how your UI really behaves
  caseName: z.string().min(1, "caseName is required"),

  // Docket number is allowed to be empty string (your sample JSON does this),
  // so we don't enforce min length here.
  docketNumber: z.string().optional(),

  // These are optional at the data-contract level;
  // if present, they must be one of the known dropdown labels.
  matterType: z.enum(MATTER_TYPE_VALUES).optional(),
  matterSubtype: z.enum(MATTER_SUBTYPE_VALUES).optional(),
});

// This is now your single source-of-truth TS type.
export type MatterDetailsData = z.infer<typeof MatterDetailsSchema>;
