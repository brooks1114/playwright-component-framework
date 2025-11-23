// test/create-matter.spec.ts
import { test } from "@playwright/test";
import { ComponentFactory } from "../components/factory";
import {
MatterDetailsSection,
MatterDetailsData,
MatterDetailsDataset,
} from "../components/create-matter/matter-details-section";

// Import the JSON array
import matterDatasetJson from "../data/matter-details.json";

const matterDataset = matterDatasetJson as MatterDetailsDataset;

test("Create Matter – scenario Matter 0002", async ({ page }) => {
const factory = new ComponentFactory(page);
const matterDetails = new MatterDetailsSection(page, factory);

// Pick the scenario you want by caseName (or any key you decide)
const scenario = matterDataset.find(
(m) => m.caseName === "Matter 0002"
) as MatterDetailsData | undefined;

if (!scenario) {
throw new Error("Scenario 'Matter 0002' not found in matter-details.json");
}

await matterDetails.validateStructure();
await matterDetails.fillFromData(scenario);

// continue the flow...
});
