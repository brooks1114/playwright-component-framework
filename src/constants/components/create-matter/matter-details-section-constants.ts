// ──────────────────────────────────────────────────────────────
// constants/components/create-matter/matter-details-section-constants.ts
// ──────────────────────────────────────────────────────────────

/**
 * Selectors specific to the Matter Details section.
 */
export const MATTER_DETAILS_SELECTORS = {
  ROOT: "#matter-details",
  MATTER_NAME_TEST_ID: "MatterName",
} as const;

/**
 * Visible labels/headings in the Matter Details section.
 */
export const MATTER_DETAILS_LABELS = {
  HEADING: "Matter details",
  CASE_NAME: "Case name",
  DOCKET_NUMBER: "Case/Docket number",
  MATTER_NAME: "Matter name",
  MATTER_TYPE: "Matter type",
  MATTER_SUBTYPE: "Matter subtype",
} as const;

/**
 * Underlying HTML name attributes for inputs/selects
 * in the Matter Details section.
 */
export const MATTER_DETAILS_FIELD_NAMES = {
  CASE_NAME: "name",
  DOCKET_NUMBER: "additionalDetails.docketNumber",
  MATTER_TYPE: "typeCode",
  MATTER_SUBTYPE: "subTypeCode",
} as const;

/**
 * Error messages specific to the Matter Details section.
 */
export const MATTER_DETAILS_ERROR_MESSAGES = {
  EMPTY_MATTER_NAME_DISPLAY: "Matter name display should not be empty",
} as const;

export const MATTER_TYPE_OPTIONS = {
  SUITS: "Suits",
  NON_DOCKET_LEGAL: "Non-Docket Legal Actions",
  NON_LITIGATED: "Non-Litigated Matter",
} as const;

export type MatterTypeLabel =
  (typeof MATTER_TYPE_OPTIONS)[keyof typeof MATTER_TYPE_OPTIONS];

// ──────────────────────────────────────────────────────────────
// Matter subtype options BY matter type
//  - Each subtype has { value, label }
//  - Shared labels (e.g. "Bad Faith", "Appeal", "Subrogation") are
//    correctly mapped to distinct DOM values per matter type.
// ──────────────────────────────────────────────────────────────

export const MATTER_SUBTYPE_OPTIONS = {
  NON_LITIGATED: {
    COVERAGE_OPINION: { value: "nlm_01", label: "Coverage Opinion" },
    EXAM_UNDER_OATH: { value: "nlm_02", label: "Exam Under Oath" },
    INVESTIGATION: { value: "nlm_03", label: "Investigation" },
    SETTLED_STRUCTURED: { value: "nlm_04", label: "Settled - Structured" },
    DEPT_CONSULT_RESEARCH: { value: "nlm_05", label: "Dept. Consult/Research" },
    APPEAL: { value: "nlm_06", label: "Appeal" },
    BAD_FAITH: { value: "nlm_07", label: "Bad Faith" },
    SETTLEMENT_DOCUMENTS: { value: "nlm_08", label: "Settlement Documents" },
    SUBPOENA_DUCES_TECUM: {
      value: "nlm_09",
      label: "Subpoena/Subpoena Duces Tecum",
    },
    COMPLAINT_NON_RENEW: { value: "nlm_10", label: "Complaint, Non-Renew" },
    CONTRACT_AGREEMENT_REVIEW: {
      value: "nlm_11",
      label: "Contract, Agrmt Review",
    },
    PENALTY_ISSUES: { value: "nlm_12", label: "Penalty Issues" },
    PRODUCTION_INSPECTIONS: {
      value: "nlm_13",
      label: "Production Inspections",
    },
    SITE_INSPECTIONS: { value: "nlm_14", label: "Site Inspections" },
    SUBROGATION: { value: "nlm_15", label: "Subrogation" },
    NO_FAULT_PRE_SUIT_DEMAND: {
      value: "nlm_16",
      label: "No Fault Pre-Suit Demand",
    },
    NO_FAULT_INTERNAL_APPEAL: {
      value: "nlm_17",
      label: "No Fault Internal Appeal",
    },
    APPLICANT_ARB: { value: "nlm_18", label: "Applicant Arb" },
    RESPONDENT_ARB: { value: "nlm_19", label: "Respondent Arb" },
    DEPT_SEMINARS_PRESENTATIONS: {
      value: "nlm_20",
      label: "Dept Seminars/Presentations",
    },
    LEGISLATIVE_MATTERS: { value: "nlm_21", label: "Legistlative Matters" },
  },

  SUITS: {
    REGULAR: { value: "suit_01", label: "Regular" },
    BAD_FAITH: { value: "suit_02", label: "Bad Faith" },
    CLASS_ACTION: { value: "suit_03", label: "Class Action" },
    COLLECTION: { value: "suit_04", label: "Collection" },
    COURT_APPROVED: { value: "suit_05", label: "Court Approved" },
    DECLARATORY_JUDGMENT: { value: "suit_06", label: "Declaratory Judgment" },
    RECOVERY: { value: "suit_09", label: "Recovery" },
    APPEAL: { value: "suit_10", label: "Appeal" },
    ARBITRATION: { value: "suit_11", label: "Arbitration" },
    ATTORNEY_FEES: { value: "suit_13", label: "Attorney Fees" },
    CONSTRUCTION_DEFECT: { value: "suit_15", label: "Construction Defect" },
    INS_MTR_VEH_HEARING: { value: "suit_17", label: "Ins/Mtr Veh Hearing" },
    MEDIATION: { value: "suit_18", label: "Mediation" },
    PERS_INJ_PROTECTION: { value: "suit_21", label: "Pers Inj Protection" },
    SUBROGATION: { value: "suit_24", label: "Subrogation" },
    UNINSURED_MOTORIST: { value: "suit_25", label: "Uninsured Motorist" },
    UNDERINSURED_MOTORIST: { value: "suit_28", label: "Underinsured Motorist" },
    DEFENSE: { value: "suit_29", label: "Defense" },
    COMPLEX_LITIGATION: { value: "suit_30", label: "Complex Litigation" },
    MULTI: { value: "suit_31", label: "Multi" },
    DEC_ACTIONS: { value: "suit_32", label: "Dec Actions" },
  },

  NON_DOCKET_LEGAL: {
    ARBITRATION: { value: "ndla_01", label: "Arbitration" },
    COLLECTION: { value: "ndla_02", label: "Collection" },
    INS_MOTOR_VEH_HEARING: { value: "ndla_03", label: "Ins/Motor Veh Hearing" },
    APPEAL: { value: "ndla_04", label: "Appeal" },
    MEDIATION: { value: "ndla_05", label: "Mediation" },
    RECOVERY: { value: "ndla_06", label: "Recovery" },
    UNSATISFIED_JUDGMENT: { value: "ndla_07", label: "Unsatisfied Judgment" },
    SIU: { value: "ndla_78", label: "SIU" },
  },
} as const;

// Union of all *labels* (useful for schemas / test data, e.g. Zod)
export type MatterSubtypeLabel =
  (typeof MATTER_SUBTYPE_OPTIONS)[keyof typeof MATTER_SUBTYPE_OPTIONS][keyof (typeof MATTER_SUBTYPE_OPTIONS)[keyof typeof MATTER_SUBTYPE_OPTIONS]]["label"];

// Convenience: get the subtypes object for a given matter type label
export function getSubtypesForMatterType(type: MatterTypeLabel) {
  switch (type) {
    case MATTER_TYPE_OPTIONS.NON_LITIGATED:
      return MATTER_SUBTYPE_OPTIONS.NON_LITIGATED;
    case MATTER_TYPE_OPTIONS.SUITS:
      return MATTER_SUBTYPE_OPTIONS.SUITS;
    case MATTER_TYPE_OPTIONS.NON_DOCKET_LEGAL:
      return MATTER_SUBTYPE_OPTIONS.NON_DOCKET_LEGAL;
    default:
      return {};
  }
}
