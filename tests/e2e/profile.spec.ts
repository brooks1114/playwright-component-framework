// tests/create-matter/matter-details.spec.ts
import { test, expect } from "../fixtures";
import { MatterDetailsSection } from "../../src/components/create-matter/matter-details-section";
import { MATTER_SUBTYPE_OPTIONS } from "../../src/constants/components/create-matter/matter-details-section-constants";
import { LitigationDetailsSection } from "../../src/components/create-matter/litigation-details-section";
import {
  LITIGATION_DETAILS_COURT_TYPE_OPTIONS,
  LITIGATION_DETAILS_JURISDICTION_COUNTY_OPTIONS,
  LITIGATION_DETAILS_JURISDICTION_STATE_EXAMPLES,
  LITIGATION_DETAILS_METHOD_SERVED_OPTIONS,
} from "../../src/constants/components/create-matter/litigation-details-section-constants";

test("Matter details — structure & behavior", async ({ page, ui }) => {
  await page.goto("/create-matter");

  const matterDetails = new MatterDetailsSection(page, ui);

  await matterDetails.validateStructure();

  await matterDetails.matterTypeDropdown.selectByText("Suits");

  await matterDetails.matterSubtypeDropdown.selectByText(
    MATTER_SUBTYPE_OPTIONS.SUITS.COURT_APPROVED.value
  );
});

test("litigation details smoke", async ({ page, ui }) => {
  const litigation = new LitigationDetailsSection(page, ui);

  await litigation.validateStructure();

  await litigation.fillFromData({
    courtType: LITIGATION_DETAILS_COURT_TYPE_OPTIONS.SUPERIOR,
    jurisdictionState:
      LITIGATION_DETAILS_JURISDICTION_STATE_EXAMPLES.NEW_JERSEY,
    jurisdictionCounty: LITIGATION_DETAILS_JURISDICTION_COUNTY_OPTIONS.SOMERSET,
    serviceDate: "10/05/2025",
    methodServed: LITIGATION_DETAILS_METHOD_SERVED_OPTIONS.MAIL,
    filingDate: "09/18/2025",
    extension: false,
    barrierToResolution: "Benefits Exhausted",
  });
});

test.describe("Matter Details Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create-matter");
  });

  test("fills matter details from JSON", async ({ ui }) => {
    await ui.matterDetailsSection().fillFromData({
      caseName: "Thomas v. Metro",
      docketNumber: "A-01924",
      matterType: "Suits",
      matterSubtype: "Defense",
    });

    // Optional focused assertion using base class APIs
    await ui.inputByLabel("Case name").shouldHaveValue("Thomas v. Metro");
  });

  test("basic structure sanity check", async ({ ui }) => {
    await ui.matterDetailsSection().validateStructure();
  });
});

test.describe("Referral Details Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create-matter");
  });

  test("fills referral details minimally", async ({ ui }) => {
    const section = ui.referralDetailsSection();

    await section.fillFromData({
      assignedTo: "Jane Doe",
      referralReason: "Coverage opinion",
    });

    await ui.inputByLabel("Adjuster name").shouldHaveValue("Jane Doe");
  });

  test("should have required fields", async ({ ui }) => {
    const section = ui.referralDetailsSection();

    const assignedTo = section.assignedToInput; // InputBase

    await assignedTo.shouldBeVisible();
    await assignedTo.shouldBeRequired();
    await assignedTo.shouldHaveAccessibleName(/Adjuster/i);

    //     After shouldBeVisible() resolves, .then() receives the resolved value → the InputBase instance.

    // Then you call another async should*() on that same instance.

    // That returns another Promise<InputBase> → which allows another .then(), and so on.

    await section.assignedToInput
      .shouldBeVisible()
      .then((i) => i.shouldBeRequired())
      .then((i) => i.shouldHaveAccessibleName(/Adjuster/i));
  });
});

test.describe("Litigation Details Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create-matter");
  });

  test("fills litigation details", async ({ ui }) => {
    await ui.litigationDetailsSection().fillFromData({
      courtType: "Civil",
      jurisdictionState: "NH",
      jurisdictionCounty: "NH:Hillsborough",
      serviceDate: "10/05/2025",
      filingDate: "09/18/2025",
      extension: false,
      barrierToResolution: "Benefits Exhausted",
    });

    await ui.dropdownByLabel("Court type").shouldHaveSelectedTexts(["Civil"]);
  });

  test("validates structure", async ({ ui }) => {
    await ui.litigationDetailsSection().validateStructure();
  });
});
