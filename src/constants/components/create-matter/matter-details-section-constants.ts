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

/**
 * Human-friendly option labels for Matter Type dropdown.
 */
export const MATTER_TYPE_OPTIONS = {
  SUITS: "Suits",
  NON_DOCKET_LEGAL: "Non-Docket Legal Actions",
  NON_LITIGATED: "Non-Litigated Matter",
} as const;

/**
 * Human-friendly option labels for Matter Subtype dropdown.
 */
export const MATTER_SUBTYPE_OPTIONS = {
  REGULAR: "Regular",
  BAD_FAITH: "Bad Faith",
  CLASS_ACTION: "Class Action",
  COLLECTION: "Collection",
  COURT_APPROVED: "Court Approved",
  DECLARATORY_JUDGMENT: "Declaratory Judgment",
  RECOVERY: "Recovery",
  APPEAL: "Appeal",
  ARBITRATION: "Arbitration",
  ATTORNEY_FEES: "Attorney Fees",
  CONSTRUCTION_DEFECT: "Construction Defect",
  INS_MTR_VEH_HEARING: "Ins/Mtr Veh Hearing",
  MEDIATION: "Mediation",
  PERS_INJ_PROTECTION: "Pers Inj Protection",
  SUBROGATION: "Subrogation",
  UNINSURED_MOTORIST: "Uninsured Motorist",
  UNDERINSURED_MOTORIST: "Underinsured Motorist",
  DEFENSE: "Defense",
  COMPLEX_LITIGATION: "Complex Litigation",
  MULTI: "Multi",
  DEC_ACTIONS: "Dec Actions",
} as const;

/**
 * Type unions derived from the option label constants.
 * These stay in sync automatically if you ever add/remove options.
 */
export type MatterTypeLabel =
  (typeof MATTER_TYPE_OPTIONS)[keyof typeof MATTER_TYPE_OPTIONS];

export type MatterSubtypeLabel =
  (typeof MATTER_SUBTYPE_OPTIONS)[keyof typeof MATTER_SUBTYPE_OPTIONS];
