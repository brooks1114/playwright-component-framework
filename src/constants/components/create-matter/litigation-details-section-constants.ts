// src/constants/components/create-matter/litigation-details-section-constants.ts

// Root selectors for the Litigation details card.
export const LITIGATION_DETAILS_SELECTORS = {
  ROOT: "#litigation-details",
  BODY: "#litigation-details-body",
  CONTENT: '[data-testid="create-litigation-content"]',
} as const;

// Human-facing labels / headings used for locators and assertions.
export const LITIGATION_DETAILS_LABELS = {
  HEADING: "Litigation details",

  COURT_TYPE: "Court type",
  JURISDICTION_STATE: "Jurisdiction state",
  JURISDICTION_COUNTY: "Jurisdiction county",

  SERVICE_DATE_HEADING: "Service date",
  SERVICE_DATE_INPUT_LABEL: "Service date (MM/DD/YYYY)",

  METHOD_SERVED: "Method served",

  FILING_DATE_HEADING: "Filing date",
  FILING_DATE_INPUT_LABEL: "Date (MM/DD/YYYY)",

  EXTENSION: "Extension",

  BARRIER_TO_RESOLUTION: "Barrier to resolution",
} as const;

// Underlying field names (from name="" attributes) for mapping to API / schemas.
export const LITIGATION_DETAILS_FIELD_NAMES = {
  COURT_TYPE: "litigationDetails.courtTypeCode",
  JURISDICTION_STATE: "litigationDetails.courtJurisdiction",
  JURISDICTION_COUNTY: "litigationDetails.courtCounty",

  SERVICE_DATE: "additionalDetails.serviceDate",
  METHOD_SERVED: "additionalDetails.servedMethodTypeCode",
  FILING_DATE: "additionalDetails.filingDate",

  EXTENSION: "litigationDetails.extensionIndicator",

  BARRIER_TO_RESOLUTION: "resolutionDetails.lmBarrierToResolution1",
} as const;

// User-facing error messages you may want to re-use across tests.
export const LITIGATION_DETAILS_ERROR_MESSAGES = {
  EMPTY_JURISDICTION_STATE: "Jurisdiction state is required.",
  EMPTY_JURISDICTION_COUNTY: "Jurisdiction county is required.",
  EMPTY_BARRIER_TO_RESOLUTION: "Barrier to resolution is required.",
} as const;

// Option labels for Court type.
export const LITIGATION_DETAILS_COURT_TYPE_OPTIONS = {
  CIRCUIT: "Circuit",
  CIVIL: "Civil",
  DISTRICT: "District",
  JUSTICE_OF_THE_PEACE: "Justice of the Peace",
  MUNICIPAL: "Municipal",
  SMALL_CLAIMS: "Small Claims",
  SUPERIOR: "Superior",
  SUPREME: "Supreme",
} as const;

// Option labels for Method served.
export const LITIGATION_DETAILS_METHOD_SERVED_OPTIONS = {
  ELECTRONIC: "Electronic",
  IN_PERSON: "In Person",
  MAIL: "Mail",
} as const;

// Option labels for Extension tile radios.
export const LITIGATION_DETAILS_EXTENSION_OPTIONS = {
  YES: "Yes",
  NO: "No",
} as const;

// Some example jurisdiction states you may want to assert on.
// (You can extend this as your tests need more.)
export const LITIGATION_DETAILS_JURISDICTION_STATE_EXAMPLES = {
  NEW_HAMPSHIRE: "New Hampshire",
  NEW_JERSEY: "New Jersey",
  MAINE: "Maine",
} as const;

// Some example jurisdiction counties (all are NJ in your HTML).
export const LITIGATION_DETAILS_JURISDICTION_COUNTY_OPTIONS = {
  ATLANTIC: "Atlantic",
  BERGEN: "Bergen",
  BURLINGTON: "Burlington",
  CAMDEN: "Camden",
  CAPE_MAY: "Cape May",
  CUMBERLAND: "Cumberland",
  ESSEX: "Essex",
  GLOUCESTER: "Gloucester",
  HUDSON: "Hudson",
  HUNTERDON: "Hunterdon",
  MERCER: "Mercer",
  MIDDLESEX: "Middlesex",
  MONMOUTH: "Monmouth",
  MORRIS: "Morris",
  OCEAN: "Ocean",
  PASSAIC: "Passaic",
  SALEM: "Salem",
  SOMERSET: "Somerset",
  SUSSEX: "Sussex",
  UNION: "Union",
  WARREN: "Warren",
} as const;
