// pages/create-matter-page.ts

import { Page } from "@playwright/test";
import { ComponentFactory } from "../../src/components/factory";
import { MatterDetailsSection } from "../../src/components/create-matter/matter-details-section";

export class CreateMatterPage {
  readonly factory: ComponentFactory;
  readonly matterDetails: MatterDetailsSection;
  // later: disputesSection, partiesSection, etc.

  constructor(public readonly page: Page) {
    this.factory = new ComponentFactory(page);
    this.matterDetails = new MatterDetailsSection(page, this.factory);
  }
}
