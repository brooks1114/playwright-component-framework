// ============================================================================
// FILE: src/constants/components/create-matter/legal-parties-section-constants.ts
// ============================================================================

export const LEGAL_PARTIES_SELECTORS = {
  ROOT: "#legal-parties",
  PRIMARY_ROW:
    ".CreateLegalPartiesContent-FirstInsured .PartiesFormInputs-Wrapper",
  ADDITIONAL_ROWS:
    ".CreateLegalPartiesContent-AccordionListWrapper .PartiesFormInputs-Wrapper",
  ADD_LEGAL_PARTY_BUTTON:
    ".CreateLegalPartiesContent-AddLegalParty .lmig-Button",
} as const;

export const LEGAL_PARTIES_LABELS = {
  HEADING: "Legal parties",
  ROLE: "Role",
  CONTACT: "Contact",
  COMMENT: "Comment",
  ADD_LEGAL_PARTY: "Add legal party",
} as const;

export const LEGAL_PARTIES_ROLE_VALUES = {
  FIRST_INSURED_DEFENDANT: "firstinsureddefendant",
  DEFENDANT: "defendant",
  PLAINTIFF: "plaintiff",
} as const;

/**
 * Optional: central place for any future error messages around this card.
 * You can extend this over time.
 */
export const LEGAL_PARTIES_ERROR_MESSAGES = {
  PRIMARY_ROLE_INVALID:
    "Primary legal party must be '1st Insured defendant', with Defendant / Plaintiff disabled.",
  ADDITIONAL_ROLE_INVALID:
    "Additional legal parties must be Defendant or Plaintiff (no 1st Insured defendant).",
} as const;
