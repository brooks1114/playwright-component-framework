// components/vehicle-details.component.ts
import { Page, Locator, expect } from "@playwright/test";
import { LOCATORS } from "../constants/locators/vehicle-details.locators";
import type { VehicleData } from "../../types/vehicle-schema";
import { assertValidVehicle } from "../../utils/validate-data";

/**
 * Component representing the Vehicle Details section.
 * Encapsulates all 30+ fields and validation logic.
 */
export class VehicleDetailsComponent {
  private root: Locator;

  constructor(
    private page: Page,
    parent?: Locator
  ) {
    this.root = parent
      ? parent.locator(LOCATORS.ROOT)
      : page.locator(LOCATORS.ROOT);
  }

  private field(label: string): Locator {
    return this.root.locator(
      `xpath=.//label[contains(text(), '${label}')]/following-sibling::span | .//div[contains(text(), '${label}')]/following-sibling::div`
    );
  }

  async verifyVehicle(data: VehicleData): Promise<this> {
    assertValidVehicle(data);
    for (const [label, expected] of Object.entries(data)) {
      const field = this.field(label);
      await expect(
        field,
        `Field "${label}" should be "${expected}"`
      ).toHaveText(expected);
    }
    return this;
  }

  async getAllData(): Promise<Record<string, string>> {
    const labels = ["Make", "Model", "Year", "Color", "VIN", "Mileage"];
    const data: Record<string, string> = {};
    for (const label of labels) {
      data[label] = (await this.field(label).textContent()) ?? "";
    }
    return data;
  }
}
