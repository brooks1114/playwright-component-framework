// constants/matter-details-options.ts

export const MATTER_TYPE_OPTIONS = {
  SUITS: "Suits",
  NON_DOCKET_LEGAL: "Non-Docket Legal Actions",
  NON_LITIGATED: "Non-Litigated Matter",
} as const;

export const MATTER_SUBTYPE_OPTIONS = {
  REGULAR: "Regular",
  BAD_FAITH: "Bad Faith",
  CLASS_ACTION: "Class Action",
  SUBROGATION: "Subrogation",
  DEFENSE: "Defense",
} as const;
