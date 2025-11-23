/* ============================================================================
 * FILE: src/components/create-matter/matter-details-section.ts
 * Semantic wrapper for the "Matter details" card on the Create Matter page.
 *
 * Responsibilities:
 *  - Encapsulate locators for the Matter Details section.
 *  - Provide high-level structure/regression checks (validateStructure).
 *  - Provide a data-driven fill API (fillFromData) powered by Zod schema types.
 *
 * This class NEVER calls Playwright's expect() directly.
 * All assertions/actions go through base classes:
 *   SectionBase, LabelBase, ElementBase, InputBase, DropdownBase.
 * ============================================================================
 */

import { Page } from "@playwright/test";
import { ComponentFactory } from "../factory";
import { InputBase } from "../bases/input-base";
import { DropdownBase } from "../bases/dropdown-base";
import { SectionBase } from "../bases/section-base";
import { LabelBase } from "../bases/label-base";
import { ElementBase } from "../bases/element-base";
import {
  MATTER_DETAILS_SELECTORS,
  MATTER_DETAILS_LABELS,
  MATTER_DETAILS_FIELD_NAMES,
  MATTER_DETAILS_ERROR_MESSAGES,
  MATTER_TYPE_OPTIONS,
  MATTER_SUBTYPE_OPTIONS,
} from "../../constants/components/create-matter/matter-details-section-constants";

// Zod-backed data contract type (single source of truth lives in the schema).
import type { MatterDetailsData } from "../../types/create-matter/matter-details-section.schema";

/**
 * High-level, semantic wrapper around the "Matter details" section/card.
 *
 * Tests should prefer using this class instead of touching locators or labels:
 *
 *   const section = new MatterDetailsSection(page, factory);
 *
 *   await section.validateStructure();
 *   await section.fillFromData(testData);
 */
export class MatterDetailsSection {
  /** Section/card container. All other locators are scoped within this. */
  private readonly section: SectionBase;

  constructor(
    page: Page,
    private readonly factory: ComponentFactory
  ) {
    this.section = new SectionBase(page, MATTER_DETAILS_SELECTORS.ROOT);
  }

  // ─────────────────────────
  // Headings / labels as LabelBase
  // ─────────────────────────

  /** Top-level section heading (e.g. "Matter details"). */
  get heading(): LabelBase {
    return this.section.getHeadingByText(MATTER_DETAILS_LABELS.HEADING);
  }

  /** "Case name" heading/label. */
  get caseNameLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: MATTER_DETAILS_LABELS.CASE_NAME,
      })
    );
  }

  /** "Docket number" heading/label. */
  get docketNumberLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: MATTER_DETAILS_LABELS.DOCKET_NUMBER,
      })
    );
  }

  /** "Matter name" heading/label. */
  get matterNameLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: MATTER_DETAILS_LABELS.MATTER_NAME,
      })
    );
  }

  /** "Matter type" heading/label. */
  get matterTypeLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: MATTER_DETAILS_LABELS.MATTER_TYPE,
      })
    );
  }

  /** "Matter subtype" heading/label. */
  get matterSubtypeLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: MATTER_DETAILS_LABELS.MATTER_SUBTYPE,
      })
    );
  }

  // ─────────────────────────
  // Inputs / selects via factory
  // ─────────────────────────

  /** Editable "Case name" input. */
  get caseNameInput(): InputBase {
    return this.factory.inputByLabel(MATTER_DETAILS_LABELS.CASE_NAME);
  }

  /** Editable "Docket number" input. */
  get docketNumberInput(): InputBase {
    return this.factory.inputByLabel(MATTER_DETAILS_LABELS.DOCKET_NUMBER);
  }

  /** Display-only matter name text as ElementBase. */
  get matterNameDisplay(): ElementBase {
    return new ElementBase(
      this.section.locator.getByTestId(
        MATTER_DETAILS_SELECTORS.MATTER_NAME_TEST_ID
      )
    );
  }

  /** "Matter type" dropdown/select. */
  get matterTypeDropdown(): DropdownBase {
    return this.factory.dropdownByLabel(MATTER_DETAILS_LABELS.MATTER_TYPE);
  }

  /** "Matter subtype" dropdown/select. */
  get matterSubtypeDropdown(): DropdownBase {
    return this.factory.dropdownByLabel(MATTER_DETAILS_LABELS.MATTER_SUBTYPE);
  }

  // ─────────────────────────
  // High-level regression / structure validation
  // ─────────────────────────

  /**
   * Smoke/regression validation of the Matter Details section.
   *
   * This is intentionally *structure-focused*:
   *  - verifies headings/labels
   *  - verifies required fields and accessible names
   *  - verifies dropdown wiring and key options
   *
   * It is safe to call in multiple tests as a quick health check.
   */
  async validateStructure(): Promise<this> {
    // Section container visible
    await this.section.shouldBeVisible();

    // Headings
    const heading = this.heading;
    await heading.shouldBeVisible();
    await heading.shouldHaveText(MATTER_DETAILS_LABELS.HEADING);

    const caseNameLabel = this.caseNameLabel;
    await caseNameLabel.shouldBeVisible();
    await caseNameLabel.shouldHaveText(MATTER_DETAILS_LABELS.CASE_NAME);

    const docketNumberLabel = this.docketNumberLabel;
    await docketNumberLabel.shouldBeVisible();
    await docketNumberLabel.shouldHaveText(MATTER_DETAILS_LABELS.DOCKET_NUMBER);

    const matterNameLabel = this.matterNameLabel;
    await matterNameLabel.shouldBeVisible();
    await matterNameLabel.shouldHaveText(MATTER_DETAILS_LABELS.MATTER_NAME);

    const matterTypeLabel = this.matterTypeLabel;
    await matterTypeLabel.shouldBeVisible();
    await matterTypeLabel.shouldHaveText(MATTER_DETAILS_LABELS.MATTER_TYPE);

    const matterSubtypeLabel = this.matterSubtypeLabel;
    await matterSubtypeLabel.shouldBeVisible();
    await matterSubtypeLabel.shouldHaveText(
      MATTER_DETAILS_LABELS.MATTER_SUBTYPE
    );

    // Case Name input
    const caseNameInput = this.caseNameInput;
    await caseNameInput.shouldBeVisible();
    await caseNameInput.shouldBeRequired();
    await caseNameInput.shouldHaveAccessibleName(
      new RegExp(MATTER_DETAILS_LABELS.CASE_NAME, "i")
    );

    // Docket Number input
    const docketInput = this.docketNumberInput;
    await docketInput.shouldBeVisible();
    await docketInput.shouldBeRequired();
    await docketInput.shouldHaveAccessibleName(
      new RegExp(MATTER_DETAILS_LABELS.DOCKET_NUMBER, "i")
    );

    // Matter Name display (should not be blank)
    const matterNameDisplay = this.matterNameDisplay;
    await matterNameDisplay.shouldBeVisible();
    if (!(await matterNameDisplay.getText())) {
      throw new Error(MATTER_DETAILS_ERROR_MESSAGES.EMPTY_MATTER_NAME_DISPLAY);
    }

    // Matter Type dropdown – wiring + key options
    const typeDropdown = this.matterTypeDropdown;
    await typeDropdown.shouldBeVisible();
    await typeDropdown.shouldBeEnabled();
    await typeDropdown.shouldHaveAccessibleName(
      new RegExp(MATTER_DETAILS_LABELS.MATTER_TYPE, "i")
    );
    await typeDropdown.shouldHaveName(MATTER_DETAILS_FIELD_NAMES.MATTER_TYPE);

    await typeDropdown.shouldContainOption(MATTER_TYPE_OPTIONS.SUITS);
    await typeDropdown.shouldContainOption(
      MATTER_TYPE_OPTIONS.NON_DOCKET_LEGAL
    );
    await typeDropdown.shouldContainOption(MATTER_TYPE_OPTIONS.NON_LITIGATED);

    // Matter Subtype dropdown – wiring + a few cross-type regression checks
    const subtypeDropdown = this.matterSubtypeDropdown;
    await subtypeDropdown.shouldBeVisible();
    await subtypeDropdown.shouldBeEnabled();
    await subtypeDropdown.shouldHaveAccessibleName(
      new RegExp(MATTER_DETAILS_LABELS.MATTER_SUBTYPE, "i")
    );
    await subtypeDropdown.shouldHaveName(
      MATTER_DETAILS_FIELD_NAMES.MATTER_SUBTYPE
    );

    // We deliberately "touch" a few representative values across types:
    await subtypeDropdown.selectByText(
      MATTER_SUBTYPE_OPTIONS.SUITS.DECLARATORY_JUDGMENT.label
    );
    await subtypeDropdown.shouldContainOption(
      MATTER_SUBTYPE_OPTIONS.NON_DOCKET_LEGAL.SIU.label
    );
    await subtypeDropdown.shouldContainOption(
      MATTER_SUBTYPE_OPTIONS.SUITS.CLASS_ACTION.label
    );
    await subtypeDropdown.shouldContainOption(
      MATTER_SUBTYPE_OPTIONS.NON_LITIGATED.SUBROGATION.label
    );
    await subtypeDropdown.shouldContainOption(
      MATTER_SUBTYPE_OPTIONS.SUITS.DEFENSE.label
    );

    return this;
  }

  // ─────────────────────────
  // Data-driven fill (JSON → form)
  // ─────────────────────────

  /**
   * Fill the section from a Zod-validated data object.
   *
   * - `MatterDetailsData` comes from the Zod schema (single source of truth).
   * - All keys are optional so tests can do partial fills.
   * - Safe against extra keys in JSON because the Zod parser strips them.
   *
   * Typical usage:
   *   await matterDetails.fillFromData(testData.matterDetails);
   */
  async fillFromData(data: MatterDetailsData): Promise<this> {
    if (data.caseName !== undefined) {
      await this.caseNameInput.fill(data.caseName);
    }

    if (data.docketNumber !== undefined) {
      await this.docketNumberInput.fill(data.docketNumber);
    }

    if (data.matterType !== undefined) {
      await this.matterTypeDropdown.selectByText(data.matterType);
    }

    if (data.matterSubtype !== undefined) {
      await this.matterSubtypeDropdown.selectByText(data.matterSubtype);
    }

    return this;
  }
}
