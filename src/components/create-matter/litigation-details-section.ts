// src/components/create-matter/litigation-details-section.ts

import { Page, expect } from "@playwright/test";
import { ComponentFactory } from "../factory";

import { SectionBase } from "../bases/section-base";
import { LabelBase } from "../bases/label-base";
import { ElementBase } from "../bases/element-base";
import { DropdownBase } from "../bases/dropdown-base";
import { InputBase } from "../bases/input-base";
import { RadioBase } from "../bases/radio-base";

import {
  LITIGATION_DETAILS_SELECTORS,
  LITIGATION_DETAILS_LABELS,
  LITIGATION_DETAILS_FIELD_NAMES,
  LITIGATION_DETAILS_ERROR_MESSAGES,
  LITIGATION_DETAILS_COURT_TYPE_OPTIONS,
  LITIGATION_DETAILS_METHOD_SERVED_OPTIONS,
  LITIGATION_DETAILS_EXTENSION_OPTIONS,
  LITIGATION_DETAILS_JURISDICTION_STATE_EXAMPLES,
  LITIGATION_DETAILS_JURISDICTION_COUNTY_OPTIONS,
} from "../../constants/components/create-matter/litigation-details-section-constants";

import type { LitigationDetailsData } from "../../types/create-matter/litigation-details-section.schema";

/**
 * Semantic wrapper for the "Litigation details" card on the Create Matter page.
 *
 * Like MatterDetailsSection / ReferralDetailsSection, this:
 *  - Exposes sub-elements as strongly-typed base components
 *  - Provides high-level structure validation
 *  - Provides a data-driven fillFromData(data) API
 */
export class LitigationDetailsSection {
  /** Card/section container. */
  private readonly section: SectionBase;

  constructor(
    private readonly page: Page,
    private readonly ui: ComponentFactory
  ) {
    this.section = new SectionBase(page, LITIGATION_DETAILS_SELECTORS.ROOT);
  }

  // ─────────────────────────
  // Headings / labels
  // ─────────────────────────

  /** Card heading "Litigation details". */
  get heading(): LabelBase {
    return this.section.getHeadingByText(LITIGATION_DETAILS_LABELS.HEADING);
  }

  get courtTypeLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: LITIGATION_DETAILS_LABELS.COURT_TYPE,
      })
    );
  }

  get jurisdictionStateLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: LITIGATION_DETAILS_LABELS.JURISDICTION_STATE,
      })
    );
  }

  get jurisdictionCountyLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: LITIGATION_DETAILS_LABELS.JURISDICTION_COUNTY,
      })
    );
  }

  get serviceDateHeading(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: LITIGATION_DETAILS_LABELS.SERVICE_DATE_HEADING,
      })
    );
  }

  get methodServedLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: LITIGATION_DETAILS_LABELS.METHOD_SERVED,
      })
    );
  }

  get filingDateHeading(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: LITIGATION_DETAILS_LABELS.FILING_DATE_HEADING,
      })
    );
  }

  get extensionLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: LITIGATION_DETAILS_LABELS.EXTENSION,
      })
    );
  }

  get barrierToResolutionLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: LITIGATION_DETAILS_LABELS.BARRIER_TO_RESOLUTION,
      })
    );
  }

  /** Optional: inner content wrapper under the card body. */
  get content(): ElementBase {
    return new ElementBase(
      this.section.locator.locator(LITIGATION_DETAILS_SELECTORS.CONTENT)
    );
  }

  // ─────────────────────────
  // Inputs / selects / radios
  // ─────────────────────────

  get courtTypeDropdown(): DropdownBase {
    return this.ui.dropdownByLabel(LITIGATION_DETAILS_LABELS.COURT_TYPE);
  }

  get jurisdictionStateDropdown(): DropdownBase {
    return this.ui.dropdownByLabel(
      LITIGATION_DETAILS_LABELS.JURISDICTION_STATE
    );
  }

  get jurisdictionCountyDropdown(): DropdownBase {
    return this.ui.dropdownByLabel(
      LITIGATION_DETAILS_LABELS.JURISDICTION_COUNTY
    );
  }

  /**
   * Service date input.
   *
   * Label text: "Service date (MM/DD/YYYY)"
   */
  get serviceDateInput(): InputBase {
    return this.ui.inputByLabel(
      LITIGATION_DETAILS_LABELS.SERVICE_DATE_INPUT_LABEL
    );
  }

  get methodServedDropdown(): DropdownBase {
    return this.ui.dropdownByLabel(LITIGATION_DETAILS_LABELS.METHOD_SERVED);
  }

  /**
   * Filing date input.
   *
   * Label text: "Date (MM/DD/YYYY)" under heading "Filing date".
   */
  get filingDateInput(): InputBase {
    return this.ui.inputByLabel(
      LITIGATION_DETAILS_LABELS.FILING_DATE_INPUT_LABEL
    );
  }

  /**
   * Extension tile radios ("Yes" / "No").
   *
   * We expose dedicated getters to make tests explicit and readable.
   */
  get extensionYesRadio(): RadioBase {
    return this.ui.radioByLabel(LITIGATION_DETAILS_EXTENSION_OPTIONS.YES);
  }

  get extensionNoRadio(): RadioBase {
    return this.ui.radioByLabel(LITIGATION_DETAILS_EXTENSION_OPTIONS.NO);
  }

  get barrierToResolutionInput(): InputBase {
    return this.ui.inputByLabel(
      LITIGATION_DETAILS_LABELS.BARRIER_TO_RESOLUTION
    );
  }

  // ─────────────────────────
  // High-level regression / structure validation
  // ─────────────────────────

  /**
   * Sanity check: card is rendered, headings exist, and key fields are usable.
   *
   * This is meant for smoke / regression tests, not exhaustive accessibility.
   */
  async validateStructure(): Promise<this> {
    await this.section.shouldBeVisible();
    await this.content.shouldBeVisible();

    // Heading + key labels
    await this.heading.shouldBeVisible();
    await this.heading.shouldHaveText(LITIGATION_DETAILS_LABELS.HEADING);

    await this.courtTypeLabel.shouldBeVisible();
    await this.courtTypeLabel.shouldHaveText(
      LITIGATION_DETAILS_LABELS.COURT_TYPE
    );

    await this.jurisdictionStateLabel.shouldBeVisible();
    await this.jurisdictionStateLabel.shouldHaveText(
      LITIGATION_DETAILS_LABELS.JURISDICTION_STATE
    );

    await this.jurisdictionCountyLabel.shouldBeVisible();
    await this.jurisdictionCountyLabel.shouldHaveText(
      LITIGATION_DETAILS_LABELS.JURISDICTION_COUNTY
    );

    await this.serviceDateHeading.shouldBeVisible();
    await this.methodServedLabel.shouldBeVisible();
    await this.filingDateHeading.shouldBeVisible();
    await this.extensionLabel.shouldBeVisible();
    await this.barrierToResolutionLabel.shouldBeVisible();

    // Court type dropdown
    const courtTypeDropdown = this.courtTypeDropdown;
    await courtTypeDropdown.shouldBeVisible();
    await courtTypeDropdown.shouldBeEnabled();
    await courtTypeDropdown.shouldHaveName(
      LITIGATION_DETAILS_FIELD_NAMES.COURT_TYPE
    );
    await courtTypeDropdown.shouldContainOption(
      LITIGATION_DETAILS_COURT_TYPE_OPTIONS.CIRCUIT
    );
    await courtTypeDropdown.shouldContainOption(
      LITIGATION_DETAILS_COURT_TYPE_OPTIONS.SUPREME
    );

    // Jurisdiction state (required)
    const jurisdictionStateDropdown = this.jurisdictionStateDropdown;
    await jurisdictionStateDropdown.shouldBeVisible();
    await jurisdictionStateDropdown.shouldBeEnabled();
    await jurisdictionStateDropdown.shouldHaveName(
      LITIGATION_DETAILS_FIELD_NAMES.JURISDICTION_STATE
    );
    await jurisdictionStateDropdown.shouldContainOption(
      LITIGATION_DETAILS_JURISDICTION_STATE_EXAMPLES.NEW_HAMPSHIRE
    );

    await expect(jurisdictionStateDropdown.locator).toHaveAttribute(
      "aria-required",
      "true"
    );

    // Jurisdiction county (required)
    const jurisdictionCountyDropdown = this.jurisdictionCountyDropdown;
    await jurisdictionCountyDropdown.shouldBeVisible();
    await jurisdictionCountyDropdown.shouldBeEnabled();
    await jurisdictionCountyDropdown.shouldHaveName(
      LITIGATION_DETAILS_FIELD_NAMES.JURISDICTION_COUNTY
    );
    await jurisdictionCountyDropdown.shouldContainOption(
      LITIGATION_DETAILS_JURISDICTION_COUNTY_OPTIONS.SOMERSET
    );
    await expect(jurisdictionCountyDropdown.locator).toHaveAttribute(
      "aria-required",
      "true"
    );

    // Service date input
    const serviceDateInput = this.serviceDateInput;
    await serviceDateInput.shouldBeVisible();
    await serviceDateInput.shouldHaveAccessibleName(
      new RegExp(
        LITIGATION_DETAILS_LABELS.SERVICE_DATE_INPUT_LABEL.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        ),
        "i"
      )
    );

    // Method served dropdown
    const methodDropdown = this.methodServedDropdown;
    await methodDropdown.shouldBeVisible();
    await methodDropdown.shouldBeEnabled();
    await methodDropdown.shouldHaveName(
      LITIGATION_DETAILS_FIELD_NAMES.METHOD_SERVED
    );
    await methodDropdown.shouldContainOption(
      LITIGATION_DETAILS_METHOD_SERVED_OPTIONS.MAIL
    );

    // Filing date input
    const filingDateInput = this.filingDateInput;
    await filingDateInput.shouldBeVisible();
    await filingDateInput.shouldHaveAccessibleName(
      new RegExp(
        LITIGATION_DETAILS_LABELS.FILING_DATE_INPUT_LABEL.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        ),
        "i"
      )
    );

    // Extension radios
    const yesRadio = this.extensionYesRadio;
    const noRadio = this.extensionNoRadio;
    await yesRadio.shouldBeVisible();
    await noRadio.shouldBeVisible();

    // Barrier to resolution
    const barrierInput = this.barrierToResolutionInput;
    await barrierInput.shouldBeVisible();
    const barrierText = await barrierInput.getValue();
    if (!barrierText) {
      throw new Error(
        LITIGATION_DETAILS_ERROR_MESSAGES.EMPTY_BARRIER_TO_RESOLUTION
      );
    }

    return this;
  }

  // ─────────────────────────
  // Data-driven fill (JSON → form)
  // ─────────────────────────

  /**
   * Fill the Litigation details card from a strongly-typed test data object.
   *
   * All fields are optional here at the callsite — only provided keys are set.
   * Validation of "what's required" is handled via Zod or separate tests.
   */
  async fillFromData(data: Partial<LitigationDetailsData>): Promise<this> {
    if (data.courtType !== undefined) {
      await this.courtTypeDropdown.selectByText(data.courtType);
    }

    if (data.jurisdictionState !== undefined) {
      await this.jurisdictionStateDropdown.selectByText(data.jurisdictionState);
    }

    if (data.jurisdictionCounty !== undefined) {
      await this.jurisdictionCountyDropdown.selectByText(
        data.jurisdictionCounty
      );
    }

    if (data.serviceDate !== undefined) {
      await this.serviceDateInput.fill(data.serviceDate);
    }

    if (data.methodServed !== undefined) {
      await this.methodServedDropdown.selectByText(data.methodServed);
    }

    if (data.filingDate !== undefined) {
      await this.filingDateInput.fill(data.filingDate);
    }

    if (data.extension !== undefined) {
      if (data.extension) {
        await this.extensionYesRadio.check();
      } else {
        await this.extensionNoRadio.check();
      }
    }

    if (data.barrierToResolution !== undefined) {
      await this.barrierToResolutionInput.fill(data.barrierToResolution);
    }

    return this;
  }
}
