/* ============================================================================
 * FILE: src/components/create-matter/referral-details-section.ts
 *
 * Semantic wrapper for the "Referral details" card on the Create Matter page.
 *
 * Responsibilities:
 *  - Encapsulate locators for the Referral Details section.
 *  - Provide high-level structure/regression checks (validateStructure).
 *  - Provide a data-driven fill API (fillFromData) powered by Zod schema types.
 *
 * This class NEVER calls Playwright's expect() directly.
 * All assertions/actions go through base classes:
 *   SectionBase, LabelBase, ElementBase, InputBase, DatePickerBase.
 * ============================================================================
 */

import { Page } from "@playwright/test";
import { ComponentFactory } from "../factory";

import { SectionBase } from "../bases/section-base";
import { LabelBase } from "../bases/label-base";
import { ElementBase } from "../bases/element-base";
import { InputBase } from "../bases/input-base";
import { DatePickerBase } from "../bases/date-picker-base";

import {
  REFERRAL_DETAILS_SELECTORS,
  REFERRAL_DETAILS_LABELS,
  REFERRAL_DETAILS_INPUT_LABELS,
  REFERRAL_DETAILS_FIELD_NAMES,
  REFERRAL_DETAILS_ERROR_MESSAGES,
} from "../../constants/components/create-matter/referral-details-section-constants";

import type { ReferralDetailsData } from "../../types/create-matter/referral-details-section.schema";

/**
 * High-level, semantic wrapper around the "Referral details" section/card.
 *
 * Tests should prefer using this class instead of touching locators or labels.
 *
 * Example:
 *   const referralDetails = new ReferralDetailsSection(page, factory);
 *
 *   await referralDetails.validateStructure();
 *   await referralDetails.fillFromData({
 *     referralDate: "07/07/2025",
 *     referralType: "New",
 *   });
 */
export class ReferralDetailsSection {
  /** Section/card container. All locators are scoped within this. */
  private readonly section: SectionBase;

  constructor(
    page: Page,
    private readonly factory: ComponentFactory
  ) {
    this.section = new SectionBase(page, REFERRAL_DETAILS_SELECTORS.ROOT);
  }

  // ─────────────────────────
  // Headings / labels as LabelBase
  // ─────────────────────────

  /** Top-level section heading ("Referral details"). */
  get heading(): LabelBase {
    return this.section.getHeadingByText(REFERRAL_DETAILS_LABELS.HEADING);
  }

  get referralDateLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: REFERRAL_DETAILS_LABELS.REFERRAL_DATE,
      })
    );
  }

  get referralTypeLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: REFERRAL_DETAILS_LABELS.REFERRAL_TYPE,
      })
    );
  }

  get referralReasonLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: REFERRAL_DETAILS_LABELS.REFERRAL_REASON,
      })
    );
  }

  get assignedToLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: REFERRAL_DETAILS_LABELS.ASSIGNED_TO,
      })
    );
  }

  get groupLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: REFERRAL_DETAILS_LABELS.GROUP,
      })
    );
  }

  get triageCompleteLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: REFERRAL_DETAILS_LABELS.TRIAGE_COMPLETE,
      })
    );
  }

  // ─────────────────────────
  // Inputs / date pickers via factory
  // ─────────────────────────

  /** "Referral date" date picker (uses data-testid). */
  get referralDatePicker(): DatePickerBase {
    return this.factory.datePickerByTestId(
      REFERRAL_DETAILS_SELECTORS.REFERRAL_DATE_TEST_ID
    );
  }

  /** "Referral type" autocomplete input (combobox). */
  get referralTypeInput(): InputBase {
    // Uses test ID from DOM: data-testid="createMatterReferralType"
    return this.factory.inputByTestId("createMatterReferralType");
  }

  /** "Referral reason" autocomplete input (combobox). */
  get referralReasonInput(): InputBase {
    // Label text: "Reason"
    return this.factory.inputByLabel(
      REFERRAL_DETAILS_INPUT_LABELS.REFERRAL_REASON
    );
  }

  /** "Assigned to" (Adjuster) autocomplete input. */
  get assignedToInput(): InputBase {
    // Label text: "Adjuster"
    return this.factory.inputByLabel(REFERRAL_DETAILS_INPUT_LABELS.ASSIGNED_TO);
  }

  /** "Group" autocomplete input. */
  get groupInput(): InputBase {
    // Label text: "Available groups"
    return this.factory.inputByLabel(REFERRAL_DETAILS_INPUT_LABELS.GROUP);
  }

  /** "Triage complete" date picker (selected by name). */
  get triageCompletedDatePicker(): DatePickerBase {
    // There is no test ID; we key by name attribute.
    return this.factory.datePicker(
      `[name="${REFERRAL_DETAILS_FIELD_NAMES.TRIAGE_COMPLETED_DATE}"]`
    );
  }

  // For convenience, if you ever want the entire section body as ElementBase:
  get body(): ElementBase {
    return new ElementBase(
      this.section.locator.locator("#referral-details-body")
    );
  }

  // ─────────────────────────
  // High-level regression / structure validation
  // ─────────────────────────

  /**
   * Smoke/regression validation of the Referral Details section.
   *
   * Focused on:
   *  - headings/labels
   *  - core field visibility
   *  - basic accessible names
   *
   * It’s safe to call in multiple tests as a quick health check.
   */
  async validateStructure(): Promise<this> {
    // Section container visible
    await this.section.shouldBeVisible();

    // Heading
    const heading = this.heading;
    await heading.shouldBeVisible();
    await heading.shouldHaveText(REFERRAL_DETAILS_LABELS.HEADING);

    // Field headings
    await this.referralDateLabel.shouldBeVisible();
    await this.referralDateLabel.shouldHaveText(
      REFERRAL_DETAILS_LABELS.REFERRAL_DATE
    );

    await this.referralTypeLabel.shouldBeVisible();
    await this.referralTypeLabel.shouldHaveText(
      REFERRAL_DETAILS_LABELS.REFERRAL_TYPE
    );

    await this.referralReasonLabel.shouldBeVisible();
    await this.referralReasonLabel.shouldHaveText(
      REFERRAL_DETAILS_LABELS.REFERRAL_REASON
    );

    await this.assignedToLabel.shouldBeVisible();
    await this.assignedToLabel.shouldHaveText(
      REFERRAL_DETAILS_LABELS.ASSIGNED_TO
    );

    await this.groupLabel.shouldBeVisible();
    await this.groupLabel.shouldHaveText(REFERRAL_DETAILS_LABELS.GROUP);

    await this.triageCompleteLabel.shouldBeVisible();
    await this.triageCompleteLabel.shouldHaveText(
      REFERRAL_DETAILS_LABELS.TRIAGE_COMPLETE
    );

    // Referral date picker: visible, non-empty
    const referralDate = this.referralDatePicker;
    await referralDate.shouldBeVisible();
    const referralRaw = await referralDate.getRawValue();
    if (!referralRaw) {
      throw new Error(REFERRAL_DETAILS_ERROR_MESSAGES.EMPTY_REFERRAL_DATE);
    }

    // Referral type: visible, has correct accessible name (label "Type")
    const referralTypeInput = this.referralTypeInput;
    await referralTypeInput.shouldBeVisible();
    await referralTypeInput.shouldHaveAccessibleName(
      new RegExp(REFERRAL_DETAILS_INPUT_LABELS.REFERRAL_TYPE, "i")
    );

    // Referral reason
    const referralReasonInput = this.referralReasonInput;
    await referralReasonInput.shouldBeVisible();
    await referralReasonInput.shouldHaveAccessibleName(
      new RegExp(REFERRAL_DETAILS_INPUT_LABELS.REFERRAL_REASON, "i")
    );

    // Assigned to
    const assignedToInput = this.assignedToInput;
    await assignedToInput.shouldBeVisible();
    await assignedToInput.shouldHaveAccessibleName(
      new RegExp(REFERRAL_DETAILS_INPUT_LABELS.ASSIGNED_TO, "i")
    );

    // Group
    const groupInput = this.groupInput;
    await groupInput.shouldBeVisible();
    await groupInput.shouldHaveAccessibleName(
      new RegExp(REFERRAL_DETAILS_INPUT_LABELS.GROUP, "i")
    );

    // Triage complete date: visible, non-empty
    const triageDate = this.triageCompletedDatePicker;
    await triageDate.shouldBeVisible();
    const triageRaw = await triageDate.getRawValue();
    if (!triageRaw) {
      throw new Error(REFERRAL_DETAILS_ERROR_MESSAGES.EMPTY_TRIAGE_DATE);
    }

    return this;
  }

  // ─────────────────────────
  // Data-driven fill (JSON → form)
  // ─────────────────────────

  /**
   * Fill the section from a Zod-validated data object.
   *
   * - `ReferralDetailsData` comes from the Zod schema.
   * - All keys are optional so tests can do partial fills.
   *
   * Example:
   *   await referralDetails.fillFromData({
   *     referralDate: "07/07/2025",
   *     referralType: "New",
   *     referralReason: "Conflict",
   *   });
   */
  async fillFromData(data: ReferralDetailsData): Promise<this> {
    if (data.referralDate !== undefined) {
      await this.referralDatePicker.setRawValue(data.referralDate);
    }

    if (data.referralType !== undefined) {
      await this.referralTypeInput.fill(data.referralType);
    }

    if (data.referralReason !== undefined) {
      await this.referralReasonInput.fill(data.referralReason);
    }

    if (data.assignedTo !== undefined) {
      await this.assignedToInput.fill(data.assignedTo);
    }

    if (data.group !== undefined) {
      await this.groupInput.fill(data.group);
    }

    if (data.triageCompletedDate !== undefined) {
      await this.triageCompletedDatePicker.setRawValue(
        data.triageCompletedDate
      );
    }

    return this;
  }
}
