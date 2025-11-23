// tests/e2e/create-matter-mixed.spec.ts
import { test } from "../fixtures";
import matterDetailsData from "../../src/test-data/components/create-matter/matter-details-section.json";
import referralDetailsData from "../../src/test-data/components/create-matter/matter-details-section.json";
import litigationDetailsData from "../../src/test-data/components/create-matter/matter-details-section.json";
import legalPartiesData from "../../src/test-data/components/create-matter/matter-details-section.json";

import {
  buildMatterFromFragments,
  RawMatterFragments,
} from "../../src/types/create-matter/matter.schema";

test("create matter with mixed data sets", async ({ ui }) => {
  const matterDetails = matterDetailsData.find((r) => r.id === 2);
  const referralDetails = referralDetailsData.find((r) => r.id === 10);
  const litigationDetails = litigationDetailsData.find((r) => r.id === 3);
  const legalParties = legalPartiesData.find((r) => r.id === 1);

  if (
    !matterDetails ||
    !referralDetails ||
    !litigationDetails ||
    !legalParties
  ) {
    throw new Error("Test data not found for one of the sections");
  }

  const fragments: RawMatterFragments = {
    matterDetails,
    referralDetails,
    litigationDetails,
    legalParties,
  };

  const matter = buildMatterFromFragments(fragments);

  // Drive the UI from the Matter object
  await ui.matterDetailsSection().fillFromData(matter.matterDetails!);
  await ui.referralDetailsSection().fillFromData(matter.referralDetails!);
  await ui.litigationDetailsSection().fillFromData(matter.litigationDetails!);
  await ui.legalPartiesSection().fillFromData(matter.legalParties!);

  // ...assertions...
});
