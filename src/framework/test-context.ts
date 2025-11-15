// test-context.ts
import { Page } from "@playwright/test";
import { ComponentFactory } from "../components/factory";
import { VehicleDetailsComponent } from "../components/vehicle-details.component";

export class TestContext {
  readonly $: ComponentFactory;

  // Example higher-level component groups
  readonly vehicleDetails: VehicleDetailsComponent;

  constructor(page: Page) {
    // Base Playwright wrappers: dropdown(), input(), button(), etc.
    this.$ = new ComponentFactory(page);

    // Higher-level (page/feature) components
    this.vehicleDetails = new VehicleDetailsComponent(page);
  }
}
