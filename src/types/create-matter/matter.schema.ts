// src/types/matter/matter.schema.ts
import { z } from "zod";
import { resolveDateLike, DateLike } from "../../utils/date-utils";
import { resolveDynamicString } from "../../utils/dynamic-values";

// ─────────────────────────────────────────────────────────────
// Section-level resolved types (what components use today)
// ─────────────────────────────────────────────────────────────

// Matter details
export const matterDetailsSchema = z.object({
  caseName: z.string().optional(),
  docketNumber: z.string().optional(),
  matterType: z.string().optional(),
  matterSubtype: z.string().optional(),
});
export type MatterDetailsData = z.infer<typeof matterDetailsSchema>;

// Referral details
export const referralDetailsSchema = z.object({
  referralDate: z.string().optional(), // MM/DD/YYYY
  referralType: z.string().optional(),
  referralReason: z.string().optional(),
  assignedTo: z.string().optional(),
  group: z.string().optional(),
  triageCompletedDate: z.string().optional(), // MM/DD/YYYY
});
export type ReferralDetailsData = z.infer<typeof referralDetailsSchema>;

// Litigation details
export const litigationDetailsSchema = z.object({
  courtType: z.string().optional(),
  jurisdictionState: z.string().optional(),
  jurisdictionCounty: z.string().optional(),
  serviceDate: z.string().optional(), // MM/DD/YYYY
  methodServed: z.string().optional(),
  filingDate: z.string().optional(), // MM/DD/YYYY
  extensionIndicator: z.boolean().optional(),
  barrierToResolution: z.string().optional(),
});
export type LitigationDetailsData = z.infer<typeof litigationDetailsSchema>;

// Legal parties
export interface LegalPartyRowData {
  role: "firstinsureddefendant" | "defendant" | "plaintiff";
  contactName: string;
  comment?: string;
}

export interface LegalPartiesData {
  parties: LegalPartyRowData[];
}

// ─────────────────────────────────────────────────────────────
// RAW record types – what your per-component JSON files look like
// (arrays of these, each with an id)
// ─────────────────────────────────────────────────────────────

export interface RawMatterDetailsRecord {
  id: number;
  caseName?: string;
  docketNumber?: string; // allows RNG tokens, e.g. "RNG15"
  matterType?: string;
  matterSubtype?: string;
}

export interface RawReferralDetailsRecord {
  id: number;
  referralDate?: DateLike; // string or offset
  referralType?: string;
  referralReason?: string;
  assignedTo?: string;
  group?: string;
  triageCompletedDate?: DateLike; // string or offset
}

export interface RawLitigationDetailsRecord {
  id: number;
  courtType?: string;
  jurisdictionState?: string;
  jurisdictionCounty?: string;
  serviceDate?: DateLike; // string or offset
  methodServed?: string;
  filingDate?: DateLike; // string or offset
  extensionIndicator?: boolean;
  barrierToResolution?: string;
}

export interface RawLegalPartiesRecord {
  id: number;
  parties: {
    role: "firstinsureddefendant" | "defendant" | "plaintiff";
    contactName: string;
    comment?: string;
  }[];
}

// ─────────────────────────────────────────────────────────────
// Aggregated Matter types
// ─────────────────────────────────────────────────────────────

export const matterSchema = z.object({
  matterDetails: matterDetailsSchema.optional(),
  referralDetails: referralDetailsSchema.optional(),
  litigationDetails: litigationDetailsSchema.optional(),
  legalParties: z
    .object({
      parties: z.array(
        z.object({
          role: z.enum(["firstinsureddefendant", "defendant", "plaintiff"]),
          contactName: z.string(),
          comment: z.string().optional(),
        })
      ),
    })
    .optional(),
});

export type MatterData = z.infer<typeof matterSchema>;

export class Matter {
  constructor(public readonly data: MatterData) {}

  get matterDetails() {
    return this.data.matterDetails;
  }
  get referralDetails() {
    return this.data.referralDetails;
  }
  get litigationDetails() {
    return this.data.litigationDetails;
  }
  get legalParties() {
    return this.data.legalParties;
  }
}

// ─────────────────────────────────────────────────────────────
// Builder: from per-component RAW fragments -> Matter
// You choose which ids to use in the test and pass the records in.
// ─────────────────────────────────────────────────────────────

export interface RawMatterFragments {
  matterDetails?: RawMatterDetailsRecord;
  referralDetails?: RawReferralDetailsRecord;
  litigationDetails?: RawLitigationDetailsRecord;
  legalParties?: RawLegalPartiesRecord;
}

/**
 * Build a Matter from individually selected section records.
 *
 * This does:
 * - RNG expansion on string fields (e.g. "RNG15" -> "123456789012345")
 * - Date offset resolution for DateLike fields (e.g. -200 -> "MM/DD/YYYY")
 * - Zod validation via matterSchema
 */
export function buildMatterFromFragments(raw: RawMatterFragments): Matter {
  const matterDetails: MatterDetailsData | undefined = raw.matterDetails && {
    caseName: resolveDynamicString(raw.matterDetails.caseName),
    docketNumber: resolveDynamicString(raw.matterDetails.docketNumber),
    matterType: resolveDynamicString(raw.matterDetails.matterType),
    matterSubtype: resolveDynamicString(raw.matterDetails.matterSubtype),
  };

  const referralDetails: ReferralDetailsData | undefined =
    raw.referralDetails && {
      referralDate: resolveDateLike(raw.referralDetails.referralDate),
      referralType: resolveDynamicString(raw.referralDetails.referralType),
      referralReason: resolveDynamicString(raw.referralDetails.referralReason),
      assignedTo: resolveDynamicString(raw.referralDetails.assignedTo),
      group: resolveDynamicString(raw.referralDetails.group),
      triageCompletedDate: resolveDateLike(
        raw.referralDetails.triageCompletedDate
      ),
    };

  const litigationDetails: LitigationDetailsData | undefined =
    raw.litigationDetails && {
      courtType: resolveDynamicString(raw.litigationDetails.courtType),
      jurisdictionState: resolveDynamicString(
        raw.litigationDetails.jurisdictionState
      ),
      jurisdictionCounty: resolveDynamicString(
        raw.litigationDetails.jurisdictionCounty
      ),
      serviceDate: resolveDateLike(raw.litigationDetails.serviceDate),
      methodServed: resolveDynamicString(raw.litigationDetails.methodServed),
      filingDate: resolveDateLike(raw.litigationDetails.filingDate),
      extensionIndicator: raw.litigationDetails.extensionIndicator,
      barrierToResolution: resolveDynamicString(
        raw.litigationDetails.barrierToResolution
      ),
    };

  const legalParties: LegalPartiesData | undefined = raw.legalParties && {
    parties: raw.legalParties.parties.map((p) => ({
      role: p.role,
      contactName: resolveDynamicString(p.contactName) ?? "",
      comment: resolveDynamicString(p.comment ?? ""),
    })),
  };

  const resolved: MatterData = {
    matterDetails,
    referralDetails,
    litigationDetails,
    legalParties,
  };

  const validated = matterSchema.parse(resolved);
  return new Matter(validated);
}
