import { LEGAL_PARTIES_ROLE_VALUES } from "../../../constants/components/create-matter/legal-parties-section-constants";
import type { LegalPartiesData } from "../../../types/create-matter/legal-parties-section.schema";

// Example data object with 3 entries:
//  - 1 primary row (1st Insured defendant)
//  - 2 additional rows (Defendant + Plaintiff)
export const exampleLegalPartiesData: LegalPartiesData = {
  primary: {
    role: LEGAL_PARTIES_ROLE_VALUES.FIRST_INSURED_DEFENDANT,
    contact: "Salah Test",
    comment: "legal parties comment 1st insured defendant",
  },
  additional: [
    {
      role: LEGAL_PARTIES_ROLE_VALUES.DEFENDANT,
      contact: "Trent-Alexander Test",
      comment: "legal parties comment defendant",
    },
    {
      role: LEGAL_PARTIES_ROLE_VALUES.PLAINTIFF,
      contact: "Law Firm Test",
      comment: "legal parties comment plaintiff",
    },
  ],
};

// ============================================================================
// How this plugs into LegalPartiesSection.fillFromData
// (example test snippet)
// ============================================================================
//
// import { test } from "@playwright/test";
// import { exampleLegalPartiesData } from "../fixtures/create-matter/legal-parties.mock";
// import { uiTest } from "../fixtures/fixtures"; // whatever your fixture file is
//
// test("can fill legal parties from data object", async ({ ui }) => {
//   const section = ui.legalPartiesSection();
//
//   // Navigate to Create Matter page first...
//   // await page.goto("https://.../create-matter");
//
//   await section.fillFromData(exampleLegalPartiesData);
//
//   // Optional: assert some things after data is filled
//   const additionalRows = await section.getAdditionalPartyRows();
//   await additionalRows[0].shouldBeVisible();
//   await additionalRows[1].shouldBeVisible();
// });
