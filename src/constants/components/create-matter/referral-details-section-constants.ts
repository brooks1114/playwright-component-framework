// ──────────────────────────────────────────────────────────────
// Referral Details – constants
// ──────────────────────────────────────────────────────────────

// DOM selectors that identify the section + key controls.
export const REFERRAL_DETAILS_SELECTORS = {
  ROOT: "#referral-details",
  BODY: "#referral-details-body",

  REFERRAL_DATE_TEST_ID: "createMatterReferralDate",
} as const;

// High-level, user-facing labels/headings as rendered in the UI.
export const REFERRAL_DETAILS_LABELS = {
  HEADING: "Referral details",

  REFERRAL_DATE: "Referral date",
  REFERRAL_TYPE: "Referral type",
  REFERRAL_REASON: "Referral reason",
  ASSIGNED_TO: "Assigned to",
  GROUP: "Group",
  TRIAGE_COMPLETE: "Triage complete",
} as const;

// Inner <label> texts that are bound to inputs (accessible names).
// These don’t always match the heading text, so we keep them separate.
export const REFERRAL_DETAILS_INPUT_LABELS = {
  REFERRAL_DATE_FORMAT: "MM/DD/YYYY",
  TRIAGE_COMPLETE_DATE_FORMAT: "MM/DD/YYYY",

  REFERRAL_TYPE: "Type",
  REFERRAL_REASON: "Reason",
  ASSIGNED_TO: "Adjuster",
  GROUP: "Available groups",
} as const;

// Underlying form field names (name="" attributes) used by the app.
export const REFERRAL_DETAILS_FIELD_NAMES = {
  REFERRAL_DATE_TIME: "referralDetails.referralDateTime",
  REFERRAL_TYPE_CODE: "referralDetails.referralTypeCode",
  REFERRAL_REASON_CODE: "referralDetails.referralReasonCode",
  ASSIGNED_TO_EMPLOYEE_ID: "referralDetails.employee.id",
  GROUP_ID: "referralDetails.groupId",
  TRIAGE_COMPLETED_DATE: "referralDetails.triageCompletedDate",
} as const;

// Error messages for regression checks (extend as needed).
export const REFERRAL_DETAILS_ERROR_MESSAGES = {
  EMPTY_REFERRAL_DATE: "Referral date should not be empty.",
  EMPTY_TRIAGE_DATE: "Triage completed date should not be empty.",
} as const;
