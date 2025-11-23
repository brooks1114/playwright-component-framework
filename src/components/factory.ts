// src/components/factory.ts
import { Page, Locator } from "@playwright/test";

import { ButtonBase } from "./bases/button-base";
import { InputBase } from "./bases/input-base";
import { DropdownBase } from "./bases/dropdown-base";
import { LinkBase } from "./bases/link-base";
import { CheckboxBase } from "./bases/checkbox-base";
import { RadioBase } from "./bases/radio-base";
import { ListBoxBase } from "./bases/listbox-base";
import { ModalBase } from "./bases/modal-base";
import { DatePickerBase } from "./bases/date-picker-base";
import { AlertBase } from "./bases/alert-base";
import { ToggleBase } from "./bases/toggle-base";
import { TableBase } from "./bases/table-base";
import { DataGridBase } from "./bases/data-grid-base";
import { TabListBase } from "./bases/tab-list-base";
import { ElementBase } from "./bases/element-base";
import { LabelBase } from "./bases/label-base";
import { SectionBase } from "./bases/section-base";

import { MatterDetailsSection } from "./create-matter/matter-details-section";
import { ReferralDetailsSection } from "./create-matter/referral-details-section";
import { LitigationDetailsSection } from "./create-matter/litigation-details-section";
import { LegalPartiesSection } from "./create-matter/legal-parties-section";

/**
 * Central factory for creating UI component instances.
 *
 * This is the single entry-point your tests and page objects use
 * to build:
 *   - Low-level base components (InputBase, DropdownBase, ButtonBase, etc.)
 *   - Semantic containers (SectionBase, TabListBase, AlertBase, TableBase, DataGridBase, …)
 *   - High-level feature components (MatterDetailsSection, ReferralDetailsSection, …)
 *
 * Usage in tests (via fixtures):
 *
 *   test("example", async ({ ui }) => {
 *     await ui
 *       .matterDetailsSection()
 *       .validateStructure();
 *
 *     await ui
 *       .litigationDetailsSection()
 *       .fillFromData({...});
 *
 *     await ui
 *       .inputByLabel("Case name")
 *       .fill("Foo vs Bar")
 *       .shouldHaveValue("Foo vs Bar");
 *   });
 */
export class ComponentFactory {
  /**
   * The current Playwright Page for the test.
   *
   * Kept public+readonly so advanced callers can still reach `page`
   * when absolutely necessary, but the *default* is to go through
   * the typed helpers below.
   */
  constructor(public readonly page: Page) {}

  // ---------------------------------------------------------------------------
  // SELECTOR-BASED CONSTRUCTORS (low-level, direct CSS/xpath)
  // ---------------------------------------------------------------------------

  /** Generic non-interactive element wrapper (headings, chips, tags, etc.). */
  element(selector: string): ElementBase {
    return new ElementBase(this.page, selector);
  }

  /** Label/text wrapper; semantically clearer than ElementBase for headings/text. */
  label(selector: string): LabelBase {
    return new LabelBase(this.page, selector);
  }

  /** Section/card container wrapper. */
  section(selector: string): SectionBase {
    return new SectionBase(this.page, selector);
  }

  /** Create a DropdownBase for <select> elements. */
  dropdown(selector: string): DropdownBase {
    return new DropdownBase(this.page, selector);
  }

  /** Create an InputBase for <input>, <textarea>, or contenteditable elements. */
  input(selector: string): InputBase {
    return new InputBase(this.page, selector);
  }

  /** Create a ButtonBase for <button>, input[type="submit"], or role="button". */
  button(selector: string): ButtonBase {
    return new ButtonBase(this.page, selector);
  }

  /** Create a LinkBase for <a> or role="link" elements. */
  link(selector: string): LinkBase {
    return new LinkBase(this.page, selector);
  }

  /** Create a CheckboxBase for <input type="checkbox"> or role="checkbox". */
  checkbox(selector: string): CheckboxBase {
    return new CheckboxBase(this.page, selector);
  }

  /** Create a RadioBase for <input type="radio"> or role="radio". */
  radio(selector: string): RadioBase {
    return new RadioBase(this.page, selector);
  }

  /** Create a ListBoxBase for ARIA listbox components (role="listbox"). */
  listbox(selector: string): ListBoxBase {
    return new ListBoxBase(this.page, selector);
  }

  /**
   * Create a ModalBase for modal dialogs (typically role="dialog"/"alertdialog").
   *
   * Selector should point at the modal container element.
   */
  modal(selector: string): ModalBase {
    return new ModalBase(this.page, selector);
  }

  /**
   * Create a DatePickerBase for date inputs (e.g., <input type="date"> or
   * text inputs that hold dates).
   */
  datePicker(selector: string): DatePickerBase {
    return new DatePickerBase(this.page, selector);
  }

  /** Create an AlertBase for ARIA alerts/status messages. */
  alert(selector: string): AlertBase {
    return new AlertBase(this.page, selector);
  }

  /**
   * Create a ToggleBase for switch-style controls
   * (e.g. role="switch", or inputs styled as toggles).
   */
  toggle(selector: string): ToggleBase {
    return new ToggleBase(this.page, selector);
  }

  /**
   * Create a TableBase for simple HTML tables.
   *
   * The TableBase class will use sensible defaults for rows/cells
   * (tbody > tr, etc.), so you generally only need a table root selector.
   */
  table(selector: string): TableBase {
    return new TableBase(this.page, selector);
  }

  /**
   * Create a DataGridBase for complex data tables (sortable, filterable, etc.).
   *
   * Like TableBase, this assumes reasonable defaults for row/cell locators;
   * if you later extend DataGridBase with custom row/cell selectors, you
   * can add extra factory helpers as needed.
   */
  dataGrid(selector: string): DataGridBase {
    return new DataGridBase(this.page, selector);
  }

  /**
   * Create a TabListBase for ARIA tab interfaces (role="tablist").
   */
  tabList(selector: string): TabListBase {
    return new TabListBase(this.page, selector);
  }

  // ---------------------------------------------------------------------------
  // SEMANTIC / ACCESSIBILITY-BASED HELPERS (preferred for robustness)
  // ---------------------------------------------------------------------------

  // ----- Input helpers -----

  /** Input located by its accessible label text. */
  inputByLabel(label: string | RegExp): InputBase {
    return new InputBase(this.page.getByLabel(label));
  }

  /** Input located by its placeholder text. */
  inputByPlaceholder(placeholder: string | RegExp): InputBase {
    return new InputBase(this.page.getByPlaceholder(placeholder));
  }

  /** Input located by test ID. */
  inputByTestId(testId: string): InputBase {
    return new InputBase(this.page.getByTestId(testId));
  }

  // ----- Dropdown helpers -----

  /** Dropdown/select located by its accessible label text. */
  dropdownByLabel(label: string | RegExp): DropdownBase {
    return new DropdownBase(this.page.getByLabel(label));
  }

  /** Dropdown/select located by test ID. */
  dropdownByTestId(testId: string): DropdownBase {
    return new DropdownBase(this.page.getByTestId(testId));
  }

  // ----- Button helpers -----

  /**
   * Button located by its accessible name (role="button").
   *
   * @param name  Visible/accessible name of the button.
   * @param exact If true, require exact match on the name.
   */
  buttonByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean }
  ): ButtonBase {
    const locator = this.page.getByRole("button", {
      name,
      exact: options?.exact,
    });
    return new ButtonBase(locator);
  }

  /** Button located by test ID. */
  buttonByTestId(testId: string): ButtonBase {
    return new ButtonBase(this.page.getByTestId(testId));
  }

  // ----- Link helpers -----

  /** Link located by its accessible name (role="link"). */
  linkByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean }
  ): LinkBase {
    const locator = this.page.getByRole("link", {
      name,
      exact: options?.exact,
    });
    return new LinkBase(locator);
  }

  /** Link located by test ID. */
  linkByTestId(testId: string): LinkBase {
    return new LinkBase(this.page.getByTestId(testId));
  }

  // ----- Checkbox helpers -----

  /** Checkbox located by label. */
  checkboxByLabel(label: string | RegExp): CheckboxBase {
    return new CheckboxBase(this.page.getByLabel(label));
  }

  /** Checkbox located by test ID. */
  checkboxByTestId(testId: string): CheckboxBase {
    return new CheckboxBase(this.page.getByTestId(testId));
  }

  // ----- Radio helpers -----

  /** Radio button located by label. */
  radioByLabel(label: string | RegExp): RadioBase {
    return new RadioBase(this.page.getByLabel(label));
  }

  /** Radio button located by its accessible name (role="radio"). */
  radioByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean }
  ): RadioBase {
    const locator = this.page.getByRole("radio", {
      name,
      exact: options?.exact,
    });
    return new RadioBase(locator);
  }

  // ----- Listbox helpers -----

  /**
   * Listbox located by its role and accessible name.
   *
   * Example: ui.listboxByRoleName("States").selectByText("Maine");
   */
  listboxByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean }
  ): ListBoxBase {
    const locator = this.page.getByRole("listbox", {
      name,
      exact: options?.exact,
    });
    return new ListBoxBase(locator);
  }

  // ----- Modal helpers -----

  /** Modal dialog located by role="dialog" and accessible name. */
  modalByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean }
  ): ModalBase {
    const locator = this.page.getByRole("dialog", {
      name,
      exact: options?.exact,
    });
    return new ModalBase(locator);
  }

  // ----- Date picker helpers -----

  /** Date picker located by its label (usually an <input> with a label). */
  datePickerByLabel(label: string | RegExp): DatePickerBase {
    return new DatePickerBase(this.page.getByLabel(label));
  }

  /** Date picker located by test ID. */
  datePickerByTestId(testId: string): DatePickerBase {
    return new DatePickerBase(this.page.getByTestId(testId));
  }

  // ----- Alert helpers -----

  /**
   * Alert/Status region located by ARIA role.
   *
   * Common roles: "alert", "status", "log", etc.
   */
  alertByRoleName(
    name: string | RegExp,
    options?: { role?: "alert" | "status" | "log" | "marquee"; exact?: boolean }
  ): AlertBase {
    const role = options?.role ?? "alert";
    const locator = this.page.getByRole(role, {
      name,
      exact: options?.exact,
    });
    return new AlertBase(locator);
  }

  // ----- Toggle helpers -----

  /** Toggle (switch) located by its accessible label. */
  toggleByLabel(label: string | RegExp): ToggleBase {
    return new ToggleBase(this.page.getByLabel(label));
  }

  /** Toggle (switch) located by role="switch" and accessible name. */
  toggleByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean }
  ): ToggleBase {
    const locator = this.page.getByRole("switch", {
      name,
      exact: options?.exact,
    });
    return new ToggleBase(locator);
  }

  // ----- Tab list helpers -----

  /** Tab list located by role="tablist" and accessible name. */
  tabListByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean }
  ): TabListBase {
    const locator = this.page.getByRole("tablist", {
      name,
      exact: options?.exact,
    });
    return new TabListBase(locator);
  }

  /** Tab list located by test ID. */
  tabListByTestId(testId: string): TabListBase {
    return new TabListBase(this.page.getByTestId(testId));
  }

  // ---------------------------------------------------------------------------
  // LOW-LEVEL "FROM LOCATOR" WRAPPERS (when you already have a Locator)
  // ---------------------------------------------------------------------------

  inputFromLocator(locator: Locator): InputBase {
    return new InputBase(locator);
  }

  dropdownFromLocator(locator: Locator): DropdownBase {
    return new DropdownBase(locator);
  }

  buttonFromLocator(locator: Locator): ButtonBase {
    return new ButtonBase(locator);
  }

  linkFromLocator(locator: Locator): LinkBase {
    return new LinkBase(locator);
  }

  checkboxFromLocator(locator: Locator): CheckboxBase {
    return new CheckboxBase(locator);
  }

  radioFromLocator(locator: Locator): RadioBase {
    return new RadioBase(locator);
  }

  listboxFromLocator(locator: Locator): ListBoxBase {
    return new ListBoxBase(locator);
  }

  modalFromLocator(locator: Locator): ModalBase {
    return new ModalBase(locator);
  }

  datePickerFromLocator(locator: Locator): DatePickerBase {
    return new DatePickerBase(locator);
  }

  alertFromLocator(locator: Locator): AlertBase {
    return new AlertBase(locator);
  }

  toggleFromLocator(locator: Locator): ToggleBase {
    return new ToggleBase(locator);
  }

  tableFromLocator(locator: Locator): TableBase {
    return new TableBase(locator);
  }

  dataGridFromLocator(locator: Locator): DataGridBase {
    return new DataGridBase(locator);
  }

  tabListFromLocator(locator: Locator): TabListBase {
    return new TabListBase(locator);
  }

  elementFromLocator(locator: Locator): ElementBase {
    return new ElementBase(locator);
  }

  labelFromLocator(locator: Locator): LabelBase {
    return new LabelBase(locator);
  }

  sectionFromLocator(locator: Locator): SectionBase {
    return new SectionBase(locator);
  }

  // ---------------------------------------------------------------------------
  // HIGH-LEVEL FEATURE COMPONENTS (Create Matter page, etc.)
  // ---------------------------------------------------------------------------

  /** "Matter details" card on the Create Matter page. */
  matterDetailsSection(): MatterDetailsSection {
    return new MatterDetailsSection(this.page, this);
  }

  /** "Referral details" card on the Create Matter page. */
  referralDetailsSection(): ReferralDetailsSection {
    return new ReferralDetailsSection(this.page, this);
  }

  /** "Litigation details" card on the Create Matter page. */
  litigationDetailsSection(): LitigationDetailsSection {
    return new LitigationDetailsSection(this.page, this);
  }
  /** "Legal Parties details" card on the Create Matter page. */
  legalPartiesSection(): LegalPartiesSection {
    return new LegalPartiesSection(this.page, this);
  }

  // Add more feature components over time:
  // resolutionDetailsSection(), claimSummarySection(), partiesSection(), etc.
}
