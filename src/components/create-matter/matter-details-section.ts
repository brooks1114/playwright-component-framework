/* ============================================================================
 * FILE: src/components/create-matter/matter-details-section.ts
 * - Your original class, updated to import the type instead of defining it
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

// 🔁 NEW: import the type from the schema file instead of defining it here
import type { MatterDetailsData } from "../../types/create-matter/matter-details-section.schema";

/**
 * Semantic wrapper for the "Matter details" card on the Create Matter page.
 *
 * NOTE:
 *  - This class does NOT call Playwright's expect/locators directly.
 *  - All assertions/actions go through base classes:
 *      SectionBase, LabelBase, ElementBase, InputBase, DropdownBase.
 */
export class MatterDetailsSection {
  /** Card/section container. */
  private readonly section: SectionBase;

  constructor(
    private readonly page: Page, // kept for future if needed, but not used directly
    private readonly factory: ComponentFactory
  ) {
    this.section = new SectionBase(page, MATTER_DETAILS_SELECTORS.ROOT);
  }

  // ─────────────────────────
  // Headings / labels as LabelBase
  // ─────────────────────────

  get heading(): LabelBase {
    return this.section.getHeadingByText(MATTER_DETAILS_LABELS.HEADING);
  }

  get caseNameLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: MATTER_DETAILS_LABELS.CASE_NAME,
      })
    );
  }

  get docketNumberLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: MATTER_DETAILS_LABELS.DOCKET_NUMBER,
      })
    );
  }

  get matterNameLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: MATTER_DETAILS_LABELS.MATTER_NAME,
      })
    );
  }

  get matterTypeLabel(): LabelBase {
    return new LabelBase(
      this.section.locator.getByRole("heading", {
        name: MATTER_DETAILS_LABELS.MATTER_TYPE,
      })
    );
  }

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

  get caseNameInput(): InputBase {
    return this.factory.inputByLabel(MATTER_DETAILS_LABELS.CASE_NAME);
  }

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

  get matterTypeDropdown(): DropdownBase {
    return this.factory.dropdownByLabel(MATTER_DETAILS_LABELS.MATTER_TYPE);
  }

  get matterSubtypeDropdown(): DropdownBase {
    return this.factory.dropdownByLabel(MATTER_DETAILS_LABELS.MATTER_SUBTYPE);
  }

  // ─────────────────────────
  // High-level regression / structure validation
  // ─────────────────────────

  async validateStructure(): Promise<this> {
    await this.section.shouldBeVisible();

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

    const caseNameInput = this.caseNameInput;
    await caseNameInput.shouldBeVisible();
    await caseNameInput.shouldBeRequired();
    await caseNameInput.shouldHaveAccessibleName(
      new RegExp(MATTER_DETAILS_LABELS.CASE_NAME, "i")
    );

    const docketInput = this.docketNumberInput;
    await docketInput.shouldBeVisible();
    await docketInput.shouldBeRequired();
    await docketInput.shouldHaveAccessibleName(
      new RegExp(MATTER_DETAILS_LABELS.DOCKET_NUMBER, "i")
    );

    const matterNameDisplay = this.matterNameDisplay;
    await matterNameDisplay.shouldBeVisible();
    if (!(await matterNameDisplay.getText())) {
      throw new Error(MATTER_DETAILS_ERROR_MESSAGES.EMPTY_MATTER_NAME_DISPLAY);
    }

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

    const subtypeDropdown = this.matterSubtypeDropdown;
    await subtypeDropdown.shouldBeVisible();
    await subtypeDropdown.shouldBeEnabled();
    await subtypeDropdown.shouldHaveAccessibleName(
      new RegExp(MATTER_DETAILS_LABELS.MATTER_SUBTYPE, "i")
    );
    await subtypeDropdown.shouldHaveName(
      MATTER_DETAILS_FIELD_NAMES.MATTER_SUBTYPE
    );

    await subtypeDropdown.selectByText(MATTER_SUBTYPE_OPTIONS.REGULAR);
    await subtypeDropdown.shouldContainOption(MATTER_SUBTYPE_OPTIONS.BAD_FAITH);
    await subtypeDropdown.shouldContainOption(
      MATTER_SUBTYPE_OPTIONS.CLASS_ACTION
    );
    await subtypeDropdown.shouldContainOption(
      MATTER_SUBTYPE_OPTIONS.SUBROGATION
    );
    await subtypeDropdown.shouldContainOption(MATTER_SUBTYPE_OPTIONS.DEFENSE);

    return this;
  }

  // ─────────────────────────
  // Data-driven fill (JSON → form)
  // ─────────────────────────

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
