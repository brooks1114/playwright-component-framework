// src/components/create-matter/legal-parties-section.ts

import { Page, Locator, expect } from "@playwright/test";
import { ComponentFactory } from "../factory";
import { SectionBase } from "../bases/section-base";
import { LabelBase } from "../bases/label-base";

/**
 * Domain type for a legal party role as represented in the DOM.
 * These map directly to the underlying <input value="..."> attributes.
 */
export type LegalPartyRole =
  | "firstinsureddefendant"
  | "defendant"
  | "plaintiff";

export interface LegalPartyRowData {
  role?: LegalPartyRole;
  contact?: string;
  comment?: string;
}

export interface LegalPartiesData {
  /**
   * The primary party row (the first card on the page).
   * On first load, this is the "1st Insured defendant" row.
   */
  primary?: LegalPartyRowData;

  /**
   * Additional parties (accordion rows).
   * Order should match the visual order in the UI.
   */
  additional?: LegalPartyRowData[];
}

/**
 * Internal helper representing a single "legal party" row (card).
 *
 * This is used for:
 *  - the primary "1st Insured defendant" card
 *  - each additional accordion "Legal party" card
 *
 * NOTE: This class is *generic* and does NOT encode the special rule
 * about which roles should be enabled/disabled. That logic lives in
 * LegalPartiesSection.validateStructure().
 */
export class LegalPartyRow {
  constructor(public readonly root: Locator) {}

  // ─────────────────────────
  // Role radios
  // ─────────────────────────

  private roleInput(role: LegalPartyRole): Locator {
    return this.root.locator(`input.lmig-FieldOption-input[value="${role}"]`);
  }

  /** Clicks/selects a role radio by its underlying value. */
  async setRole(role: LegalPartyRole): Promise<this> {
    await this.roleInput(role).check();
    return this;
  }

  async isRoleEnabled(role: LegalPartyRole): Promise<boolean> {
    return this.roleInput(role).isEnabled();
  }

  async isRoleChecked(role: LegalPartyRole): Promise<boolean> {
    return this.roleInput(role).isChecked();
  }

  // ─────────────────────────
  // Contact field
  // ─────────────────────────

  /** Locator for the "Contact" combobox input within this row. */
  private get contactInput(): Locator {
    // Scoped label lookup keeps this robust even with multiple rows.
    return this.root.getByLabel("Contact");
  }

  async setContact(value: string): Promise<this> {
    await this.contactInput.fill(value);
    return this;
  }

  async getContact(): Promise<string> {
    return this.contactInput.inputValue();
  }

  // ─────────────────────────
  // Comment textarea
  // ─────────────────────────

  private get commentTextarea(): Locator {
    // All row comment textareas follow name="legalParties.<index>.description"
    return this.root.locator(
      'textarea[name^="legalParties."][name$=".description"]'
    );
  }

  async setComment(value: string): Promise<this> {
    await this.commentTextarea.fill(value);
    return this;
  }

  async getComment(): Promise<string> {
    return (await this.commentTextarea.inputValue()) ?? "";
  }

  // ─────────────────────────
  // Generic row-level helpers
  // ─────────────────────────

  async fill(data: LegalPartyRowData): Promise<this> {
    if (data.role) {
      await this.setRole(data.role);
    }
    if (data.contact !== undefined) {
      await this.setContact(data.contact);
    }
    if (data.comment !== undefined) {
      await this.setComment(data.comment);
    }
    return this;
  }

  /** Simple sanity check that the row is rendered and contact field is visible. */
  async shouldBeVisible(): Promise<this> {
    await expect(this.contactInput).toBeVisible();
    return this;
  }
}

/**
 * Semantic wrapper for the "Legal parties" card on the Create Matter page.
 *
 * Encapsulates:
 *  - The primary "1st Insured defendant" card
 *  - Any additional accordion "Legal party" rows
 *  - The "Add legal party" button
 *
 * Special business rule:
 *  - Primary row: shows "1st Insured defendant" (enabled+checked),
 *    and “Defendant” / “Plaintiff” radios are disabled.
 *  - Additional rows: show only “Defendant” + “Plaintiff” roles,
 *    both enabled; “1st Insured defendant” should not appear again.
 *
 * That rule is validated in `validateStructure` but the row-level API
 * stays generic for normal test flows and data-driven filling.
 */
export class LegalPartiesSection {
  private readonly section: SectionBase;

  constructor(
    private readonly page: Page,
    private readonly ui: ComponentFactory // kept for symmetry / future use
  ) {
    this.section = new SectionBase(page, "#legal-parties");
  }

  // ─────────────────────────
  // Basic heading / structure
  // ─────────────────────────

  get heading(): LabelBase {
    return this.section.getHeadingByText(/Legal parties/i);
  }

  /** Root locator for the entire "Legal parties" content region. */
  private get root(): Locator {
    // #legal-parties is the outer card
    return this.section.locator;
  }

  // ─────────────────────────
  // Row locators
  // ─────────────────────────

  /** Primary "1st Insured defendant" row wrapper. */
  private get primaryRowRoot(): Locator {
    return this.root.locator(
      ".CreateLegalPartiesContent-FirstInsured .PartiesFormInputs-Wrapper"
    );
  }

  /** All additional legal party rows (accordion items). */
  private get additionalRowRoots(): Locator {
    return this.root.locator(
      ".CreateLegalPartiesContent-AccordionListWrapper .PartiesFormInputs-Wrapper"
    );
  }

  get primaryPartyRow(): LegalPartyRow {
    return new LegalPartyRow(this.primaryRowRoot);
  }

  async getAdditionalPartyRows(): Promise<LegalPartyRow[]> {
    const roots = this.additionalRowRoots;
    const count = await roots.count();
    const rows: LegalPartyRow[] = [];
    for (let i = 0; i < count; i++) {
      rows.push(new LegalPartyRow(roots.nth(i)));
    }
    return rows;
  }

  /** "Add legal party" button at the bottom of the card. */
  private get addLegalPartyButton(): Locator {
    return this.root.getByRole("button", { name: "Add legal party" });
  }

  // ─────────────────────────
  // High-level validation (structure + special business rule)
  // ─────────────────────────

  /**
   * Regression-style structural validation:
   *  - Card & heading present
   *  - Primary row exists and has correct role behavior:
   *      * 1st Insured defendant: enabled + checked
   *      * Defendant / Plaintiff: rendered but disabled
   *  - Additional rows:
   *      * do NOT contain "1st Insured defendant"
   *      * "Defendant" + "Plaintiff" radios are enabled
   *  - "Add legal party" button is visible & enabled
   */
  async validateStructure(): Promise<this> {
    // Card visible + heading correct
    await this.section.shouldBeVisible();
    await this.heading.shouldBeVisible();
    await this.heading.shouldHaveText(/Legal parties/i);

    // Primary row
    const primary = this.primaryPartyRow;
    await primary.shouldBeVisible();

    const firstInsured = primary["roleInput"]("firstinsureddefendant");
    const defendant = primary["roleInput"]("defendant");
    const plaintiff = primary["roleInput"]("plaintiff");

    await expect(firstInsured).toBeVisible();
    await expect(firstInsured).toBeEnabled();
    await expect(firstInsured).toBeChecked();

    await expect(defendant).toBeVisible();
    await expect(defendant).toBeDisabled();

    await expect(plaintiff).toBeVisible();
    await expect(plaintiff).toBeDisabled();

    // Additional rows
    const additionalRows = await this.getAdditionalPartyRows();
    for (const row of additionalRows) {
      // Should not show "1st Insured defendant" text in these rows
      await expect(
        row.root.getByText(/1st\s+Insured\s+defendant/i)
      ).toHaveCount(0);

      const def = row["roleInput"]("defendant");
      const pl = row["roleInput"]("plaintiff");

      await expect(def).toBeVisible();
      await expect(def).toBeEnabled();

      await expect(pl).toBeVisible();
      await expect(pl).toBeEnabled();
    }

    // Add button
    await expect(this.addLegalPartyButton).toBeVisible();
    await expect(this.addLegalPartyButton).toBeEnabled();

    return this;
  }

  // ─────────────────────────
  // Data-driven helpers
  // ─────────────────────────

  /**
   * Ensure there are at least `count` additional party rows.
   * Clicks "Add legal party" as needed.
   */
  async ensureAdditionalRows(count: number): Promise<this> {
    const current = await this.additionalRowRoots.count();
    for (let i = current; i < count; i++) {
      await this.addLegalPartyButton.click();
    }
    return this;
  }

  /**
   * Fill the legal parties card from a data object.
   *
   * NOTE:
   *  - This does NOT enforce the business rule about which roles are allowed
   *    where; it assumes the caller chooses valid roles for the given row.
   *  - If `additional` contains more rows than currently exist, this method
   *    will click "Add legal party" until there are enough rows to fill.
   */
  async fillFromData(data: LegalPartiesData): Promise<this> {
    if (data.primary) {
      await this.primaryPartyRow.fill(data.primary);
    }

    if (data.additional && data.additional.length > 0) {
      await this.ensureAdditionalRows(data.additional.length);
      const additionalRows = await this.getAdditionalPartyRows();
      const rowsToFill = Math.min(
        additionalRows.length,
        data.additional.length
      );

      for (let i = 0; i < rowsToFill; i++) {
        await additionalRows[i].fill(data.additional[i]);
      }
    }

    return this;
  }
}
