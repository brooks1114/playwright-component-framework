// pages/profile.page.ts
import { Page } from "@playwright/test";
import { ComponentFactory } from "../components/factory";
import { VehicleDetailsComponent } from "../components/vehicle-details.component";
import { LOCATORS } from "../constants/locators/profile.locators";
import { DROPDOWN } from "../constants/dropdown-values";
import type { VehicleData } from "../../types/vehicle-schema";

export class ProfilePage {
  private $: ComponentFactory;
  readonly vehicleDetails: VehicleDetailsComponent;

  constructor(page: Page) {
    this.$ = new ComponentFactory(page);
    this.vehicleDetails = new VehicleDetailsComponent(page);
  }

  // NAVIGATION
  async goto(): Promise<this> {
    await this.$.page.goto("/profile");
    return this;
  }

  // DROPDOWNS
  role() {
    return this.$.dropdown(LOCATORS.PROFILE.ROLE_DROPDOWN);
  }

  async setRoleToAdmin(): Promise<this> {
    const role = this.role();
    await role.selectByText("Admin");
    await role.shouldHaveValue(DROPDOWN.ROLE.ADMIN);
    return this;
  }

  // VEHICLE
  async verifyVehicle(data: VehicleData): Promise<this> {
    await this.vehicleDetails.verifyVehicle(data);
    return this;
  }

  // LINKS
  editLink() {
    return this.$.link(LOCATORS.PROFILE.EDIT_LINK);
  }

  async goToEdit(): Promise<this> {
    await this.editLink().clickAndNavigate();
    return this;
  }

  // BUTTONS
  saveButton() {
    return this.$.button(LOCATORS.PROFILE.SAVE_BUTTON);
  }

  async clickSave(): Promise<this> {
    await this.saveButton().clickAndNavigate();
    return this;
  }

  async waitForLoad(): Promise<this> {
    await this.$.page.waitForLoadState("networkidle");
    return this;
  }
}
