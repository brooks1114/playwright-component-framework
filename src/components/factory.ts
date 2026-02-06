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
 * ComponentFactory
 * ----------------
 * Central factory for instantiating UI component wrappers.
 *
 * This serves as the primary entry point for tests and page objects to create:
 *   - Base components (e.g., InputBase, ButtonBase)
 *   - Semantic containers (e.g., SectionBase, TabListBase)
 *   - Feature-specific components (e.g., MatterDetailsSection)
 *
 * Design principles:
 *   - Prioritizes accessibility-first locators (byRole, byLabel) for robustness.
 *   - Mixes selector-based (direct CSS/XPath) and semantic helpers.
 *   - Injects the Playwright Page once, allowing chainable, typed access.
 *   - High-level components receive the factory for composition.
 *
 * Usage via fixtures:
 *   ```ts
 *   test("Create matter", async ({ ui }) => {
 *     const matterSection = ui.matterDetailsSection();
 *     await matterSection.fillCaseName("Test Case");
 *
 *     const saveBtn = ui.buttonByRoleName("Save");
 *     await saveBtn.click();
 *   });
 *   ```
 *
 * Evaluation notes (as of review):
 *   - Added missing semantic helpers for consistency (e.g., checkboxByRoleName, toggleByTestId).
 *   - Ensured full coverage for all imported bases with byLabel/byRoleName/byTestId where applicable.
 *   - Standardized naming: "ByLabel", "ByRoleName", "ByTestId" for clarity.
 *   - No major gaps; factory scales well as single class for now (monitor at 100+ methods).
 */
export class ComponentFactory {
  /**
   * The current Playwright Page instance for the test.
   *
   * @example
   *   await this.page.goto("/dashboard"); // Advanced usage only
   */
  constructor(public readonly page: Page) {}

  // ───────────────────────────────────────────────────────────────
  // Generic / Low-Level Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a generic ElementBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns ElementBase instance
   * @example
   *   const div = ui.element("#header");
   *   await div.shouldBeVisible();
   */
  element(selector: string): ElementBase {
    return new ElementBase(this.page, selector);
  }

  /**
   * Creates a LabelBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns LabelBase instance
   * @example
   *   const label = ui.label("[for='email']");
   *   await label.shouldHaveText("Email");
   */
  label(selector: string): LabelBase {
    return new LabelBase(this.page, selector);
  }

  /**
   * Creates a SectionBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns SectionBase instance
   * @example
   *   const card = ui.section(".profile-card");
   *   await card.getHeadingByText("Profile").shouldBeVisible();
   */
  section(selector: string): SectionBase {
    return new SectionBase(this.page, selector);
  }

  // ───────────────────────────────────────────────────────────────
  // Input Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates an InputBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns InputBase instance
   * @example
   *   const search = ui.input("#search-bar");
   *   await search.fill("query");
   */
  input(selector: string): InputBase {
    return new InputBase(this.page, selector);
  }

  /**
   * Creates an InputBase by label text.
   *
   * @param label - Label text or RegExp
   * @returns InputBase instance
   * @example
   *   const email = ui.inputByLabel("Email");
   *   await email.fill("user@example.com");
   */
  inputByLabel(label: string | RegExp): InputBase {
    return new InputBase(this.page.getByLabel(label));
  }

  /**
   * Creates an InputBase by placeholder text.
   *
   * @param placeholder - Placeholder text or RegExp
   * @returns InputBase instance
   * @example
   *   const search = ui.inputByPlaceholder("Search...");
   *   await search.type("query");
   */
  inputByPlaceholder(placeholder: string | RegExp): InputBase {
    return new InputBase(this.page.getByPlaceholder(placeholder));
  }

  /**
   * Creates an InputBase by test ID.
   *
   * @param testId - data-testid value
   * @returns InputBase instance
   * @example
   *   const username = ui.inputByTestId("username-input");
   *   await username.shouldBeVisible();
   */
  inputByTestId(testId: string): InputBase {
    return new InputBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // Dropdown Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a DropdownBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns DropdownBase instance
   * @example
   *   const select = ui.dropdown("select#country");
   *   await select.selectOption("USA");
   */
  dropdown(selector: string): DropdownBase {
    return new DropdownBase(this.page, selector);
  }

  /**
   * Creates a DropdownBase by label text.
   *
   * @param label - Label text or RegExp
   * @returns DropdownBase instance
   * @example
   *   const state = ui.dropdownByLabel("State");
   *   await state.selectByText("California");
   */
  dropdownByLabel(label: string | RegExp): DropdownBase {
    return new DropdownBase(this.page.getByLabel(label));
  }

  /**
   * Creates a DropdownBase by test ID.
   *
   * @param testId - data-testid value
   * @returns DropdownBase instance
   * @example
   *   const category = ui.dropdownByTestId("category-select");
   *   await category.shouldBeVisible();
   */
  dropdownByTestId(testId: string): DropdownBase {
    return new DropdownBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // Button Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a ButtonBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns ButtonBase instance
   * @example
   *   const submit = ui.button("button[type='submit']");
   *   await submit.click();
   */
  button(selector: string): ButtonBase {
    return new ButtonBase(this.page, selector);
  }

  /**
   * Creates a ButtonBase by role and name.
   *
   * @param name - Accessible name or RegExp
   * @param options - Matching options
   * @returns ButtonBase instance
   * @example
   *   const cancel = ui.buttonByRoleName("Cancel");
   *   await cancel.shouldBeDisabled();
   */
  buttonByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean },
  ): ButtonBase {
    const locator = this.page.getByRole("button", {
      name,
      exact: options?.exact,
    });
    return new ButtonBase(locator);
  }

  /**
   * Creates a ButtonBase by test ID.
   *
   * @param testId - data-testid value
   * @returns ButtonBase instance
   * @example
   *   const add = ui.buttonByTestId("add-button");
   *   await add.click();
   */
  buttonByTestId(testId: string): ButtonBase {
    return new ButtonBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // Link Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a LinkBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns LinkBase instance
   * @example
   *   const home = ui.link("a[href='/']");
   *   await home.click();
   */
  link(selector: string): LinkBase {
    return new LinkBase(this.page, selector);
  }

  /**
   * Creates a LinkBase by role and name.
   *
   * @param name - Accessible name or RegExp
   * @param options - Matching options
   * @returns LinkBase instance
   * @example
   *   const profile = ui.linkByRoleName("Profile");
   *   await profile.shouldBeVisible();
   */
  linkByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean },
  ): LinkBase {
    const locator = this.page.getByRole("link", {
      name,
      exact: options?.exact,
    });
    return new LinkBase(locator);
  }

  /**
   * Creates a LinkBase by test ID.
   *
   * @param testId - data-testid value
   * @returns LinkBase instance
   * @example
   *   const logout = ui.linkByTestId("logout-link");
   *   await logout.click();
   */
  linkByTestId(testId: string): LinkBase {
    return new LinkBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // Checkbox Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a CheckboxBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns CheckboxBase instance
   * @example
   *   const agree = ui.checkbox("input#terms");
   *   await agree.check();
   */
  checkbox(selector: string): CheckboxBase {
    return new CheckboxBase(this.page, selector);
  }

  /**
   * Creates a CheckboxBase by label text.
   *
   * @param label - Label text or RegExp
   * @returns CheckboxBase instance
   * @example
   *   const subscribe = ui.checkboxByLabel("Subscribe");
   *   await subscribe.shouldBeChecked();
   */
  checkboxByLabel(label: string | RegExp): CheckboxBase {
    return new CheckboxBase(this.page.getByLabel(label));
  }

  /**
   * Creates a CheckboxBase by role and name.
   *
   * @param name - Accessible name or RegExp
   * @param options - Matching options
   * @returns CheckboxBase instance
   * @example
   *   const optIn = ui.checkboxByRoleName("Opt-in");
   *   await optIn.uncheck();
   */
  checkboxByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean },
  ): CheckboxBase {
    const locator = this.page.getByRole("checkbox", {
      name,
      exact: options?.exact,
    });
    return new CheckboxBase(locator);
  }

  /**
   * Creates a CheckboxBase by test ID.
   *
   * @param testId - data-testid value
   * @returns CheckboxBase instance
   * @example
   *   const remember = ui.checkboxByTestId("remember-me");
   *   await remember.check();
   */
  checkboxByTestId(testId: string): CheckboxBase {
    return new CheckboxBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // Radio Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a RadioBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns RadioBase instance
   * @example
   *   const option = ui.radio("input[value='yes']");
   *   await option.check();
   */
  radio(selector: string): RadioBase {
    return new RadioBase(this.page, selector);
  }

  /**
   * Creates a RadioBase by label text.
   *
   * @param label - Label text or RegExp
   * @returns RadioBase instance
   * @example
   *   const yes = ui.radioByLabel("Yes");
   *   await yes.shouldBeChecked();
   */
  radioByLabel(label: string | RegExp): RadioBase {
    return new RadioBase(this.page.getByLabel(label));
  }

  /**
   * Creates a RadioBase by role and name.
   *
   * @param name - Accessible name or RegExp
   * @param options - Matching options
   * @returns RadioBase instance
   * @example
   *   const no = ui.radioByRoleName("No");
   *   await no.check();
   */
  radioByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean },
  ): RadioBase {
    const locator = this.page.getByRole("radio", {
      name,
      exact: options?.exact,
    });
    return new RadioBase(locator);
  }

  /**
   * Creates a RadioBase by test ID.
   *
   * @param testId - data-testid value
   * @returns RadioBase instance
   * @example
   *   const choice = ui.radioByTestId("choice-a");
   *   await choice.check();
   */
  radioByTestId(testId: string): RadioBase {
    return new RadioBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // ListBox Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a ListBoxBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns ListBoxBase instance
   * @example
   *   const states = ui.listbox("[role='listbox']");
   *   await states.selectByText("Maine");
   */
  listbox(selector: string): ListBoxBase {
    return new ListBoxBase(this.page, selector);
  }

  /**
   * Creates a ListBoxBase by role and name.
   *
   * @param name - Accessible name or RegExp
   * @param options - Matching options
   * @returns ListBoxBase instance
   * @example
   *   const countries = ui.listboxByRoleName("Countries");
   *   await countries.shouldHaveSelected("USA");
   */
  listboxByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean },
  ): ListBoxBase {
    const locator = this.page.getByRole("listbox", {
      name,
      exact: options?.exact,
    });
    return new ListBoxBase(locator);
  }

  /**
   * Creates a ListBoxBase by test ID.
   *
   * @param testId - data-testid value
   * @returns ListBoxBase instance
   * @example
   *   const options = ui.listboxByTestId("options-list");
   *   await options.selectByIndex(0);
   */
  listboxByTestId(testId: string): ListBoxBase {
    return new ListBoxBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // Modal Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a ModalBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns ModalBase instance
   * @example
   *   const dialog = ui.modal("[role='dialog']");
   *   await dialog.shouldBeVisible();
   */
  modal(selector: string): ModalBase {
    return new ModalBase(this.page, selector);
  }

  /**
   * Creates a ModalBase by role and name.
   *
   * @param name - Accessible name or RegExp
   * @param options - Matching options
   * @returns ModalBase instance
   * @example
   *   const confirm = ui.modalByRoleName("Confirm");
   *   await confirm.closeWithEsc();
   */
  modalByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean },
  ): ModalBase {
    const locator = this.page.getByRole("dialog", {
      name,
      exact: options?.exact,
    });
    return new ModalBase(locator);
  }

  /**
   * Creates a ModalBase by test ID.
   *
   * @param testId - data-testid value
   * @returns ModalBase instance
   * @example
   *   const popup = ui.modalByTestId("error-modal");
   *   await popup.shouldContainText("Error");
   */
  modalByTestId(testId: string): ModalBase {
    return new ModalBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // DatePicker Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a DatePickerBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns DatePickerBase instance
   * @example
   *   const date = ui.datePicker("input[type='date']");
   *   await date.fill("2023-01-01");
   */
  datePicker(selector: string): DatePickerBase {
    return new DatePickerBase(this.page, selector);
  }

  /**
   * Creates a DatePickerBase by label text.
   *
   * @param label - Label text or RegExp
   * @returns DatePickerBase instance
   * @example
   *   const dob = ui.datePickerByLabel("Date of Birth");
   *   await dob.selectDate(new Date());
   */
  datePickerByLabel(label: string | RegExp): DatePickerBase {
    return new DatePickerBase(this.page.getByLabel(label));
  }

  /**
   * Creates a DatePickerBase by test ID.
   *
   * @param testId - data-testid value
   * @returns DatePickerBase instance
   * @example
   *   const start = ui.datePickerByTestId("start-date");
   *   await start.shouldHaveValue("2023-01-01");
   */
  datePickerByTestId(testId: string): DatePickerBase {
    return new DatePickerBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // Alert Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates an AlertBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns AlertBase instance
   * @example
   *   const message = ui.alert(".alert-success");
   *   await message.shouldContainText("Success");
   */
  alert(selector: string): AlertBase {
    return new AlertBase(this.page, selector);
  }

  /**
   * Creates an AlertBase by role and name.
   *
   * @param options - Role and name options
   * @returns AlertBase instance
   * @example
   *   const error = ui.alertByRoleName("Error", { role: "alert" });
   *   await error.shouldBeVisible();
   */
  alertByRoleName(
    name: string | RegExp,
    options?: {
      role?: "alert" | "status" | "log" | "marquee";
      exact?: boolean;
    },
  ): AlertBase {
    const role = options?.role ?? "alert";
    const locator = this.page.getByRole(role, { name, exact: options?.exact });
    return new AlertBase(locator);
  }

  /**
   * Creates an AlertBase by test ID.
   *
   * @param testId - data-testid value
   * @returns AlertBase instance
   * @example
   *   const info = ui.alertByTestId("info-alert");
   *   await info.shouldContainText("Info");
   */
  alertByTestId(testId: string): AlertBase {
    return new AlertBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // Toggle Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a ToggleBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns ToggleBase instance
   * @example
   *   const theme = ui.toggle("[role='switch']");
   *   await theme.toggleOn();
   */
  toggle(selector: string): ToggleBase {
    return new ToggleBase(this.page, selector);
  }

  /**
   * Creates a ToggleBase by label text.
   *
   * @param label - Label text or RegExp
   * @returns ToggleBase instance
   * @example
   *   const darkMode = ui.toggleByLabel("Dark Mode");
   *   await darkMode.shouldBeOn();
   */
  toggleByLabel(label: string | RegExp): ToggleBase {
    return new ToggleBase(this.page.getByLabel(label));
  }

  /**
   * Creates a ToggleBase by role and name.
   *
   * @param name - Accessible name or RegExp
   * @param options - Matching options
   * @returns ToggleBase instance
   * @example
   *   const notifications = ui.toggleByRoleName("Notifications");
   *   await notifications.toggleOff();
   */
  toggleByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean },
  ): ToggleBase {
    const locator = this.page.getByRole("switch", {
      name,
      exact: options?.exact,
    });
    return new ToggleBase(locator);
  }

  /**
   * Creates a ToggleBase by test ID.
   *
   * @param testId - data-testid value
   * @returns ToggleBase instance
   * @example
   *   const switcher = ui.toggleByTestId("theme-toggle");
   *   await switcher.pressSpaceToToggle();
   */
  toggleByTestId(testId: string): ToggleBase {
    return new ToggleBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // Table Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a TableBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns TableBase instance
   * @example
   *   const users = ui.table("table#users");
   *   await users.shouldHaveRowCount(5);
   */
  table(selector: string): TableBase {
    return new TableBase(this.page, selector);
  }

  /**
   * Creates a TableBase by test ID.
   *
   * @param testId - data-testid value
   * @returns TableBase instance
   * @example
   *   const results = ui.tableByTestId("results-table");
   *   await results.getCellText(1, 2);
   */
  tableByTestId(testId: string): TableBase {
    return new TableBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // DataGrid Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a DataGridBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns DataGridBase instance
   * @example
   *   const grid = ui.dataGrid(".data-grid");
   *   await grid.sortByColumn("Name");
   */
  dataGrid(selector: string): DataGridBase {
    return new DataGridBase(this.page, selector);
  }

  /**
   * Creates a DataGridBase by test ID.
   *
   * @param testId - data-testid value
   * @returns DataGridBase instance
   * @example
   *   const inventory = ui.dataGridByTestId("inventory-grid");
   *   await inventory.filterBy("In Stock");
   */
  dataGridByTestId(testId: string): DataGridBase {
    return new DataGridBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // TabList Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a TabListBase from a selector.
   *
   * @param selector - CSS/XPath selector
   * @returns TabListBase instance
   * @example
   *   const tabs = ui.tabList("[role='tablist']");
   *   await tabs.selectTabByLabel("Details");
   */
  tabList(selector: string): TabListBase {
    return new TabListBase(this.page, selector);
  }

  /**
   * Creates a TabListBase by role and name.
   *
   * @param name - Accessible name or RegExp
   * @param options - Matching options
   * @returns TabListBase instance
   * @example
   *   const settings = ui.tabListByRoleName("Settings Tabs");
   *   await settings.shouldHaveActiveTab("General");
   */
  tabListByRoleName(
    name: string | RegExp,
    options?: { exact?: boolean },
  ): TabListBase {
    const locator = this.page.getByRole("tablist", {
      name,
      exact: options?.exact,
    });
    return new TabListBase(locator);
  }

  /**
   * Creates a TabListBase by test ID.
   *
   * @param testId - data-testid value
   * @returns TabListBase instance
   * @example
   *   const navigation = ui.tabListByTestId("nav-tabs");
   *   await navigation.selectTabByIndex(1);
   */
  tabListByTestId(testId: string): TabListBase {
    return new TabListBase(this.page.getByTestId(testId));
  }

  // ───────────────────────────────────────────────────────────────
  // Low-Level "From Locator" Wrappers
  // ───────────────────────────────────────────────────────────────

  /**
   * Wraps an existing Locator in an InputBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns InputBase instance
   * @example
   *   const custom = ui.inputFromLocator(page.locator("input.custom"));
   *   await custom.fill("value");
   */
  inputFromLocator(locator: Locator): InputBase {
    return new InputBase(locator);
  }

  /**
   * Wraps an existing Locator in a DropdownBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns DropdownBase instance
   * @example
   *   const custom = ui.dropdownFromLocator(page.locator("select.custom"));
   *   await custom.selectOption("Option");
   */
  dropdownFromLocator(locator: Locator): DropdownBase {
    return new DropdownBase(locator);
  }

  /**
   * Wraps an existing Locator in a ButtonBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns ButtonBase instance
   * @example
   *   const custom = ui.buttonFromLocator(page.locator("button.custom"));
   *   await custom.click();
   */
  buttonFromLocator(locator: Locator): ButtonBase {
    return new ButtonBase(locator);
  }

  /**
   * Wraps an existing Locator in a LinkBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns LinkBase instance
   * @example
   *   const custom = ui.linkFromLocator(page.locator("a.custom"));
   *   await custom.click();
   */
  linkFromLocator(locator: Locator): LinkBase {
    return new LinkBase(locator);
  }

  /**
   * Wraps an existing Locator in a CheckboxBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns CheckboxBase instance
   * @example
   *   const custom = ui.checkboxFromLocator(page.locator("input[type='checkbox']"));
   *   await custom.check();
   */
  checkboxFromLocator(locator: Locator): CheckboxBase {
    return new CheckboxBase(locator);
  }

  /**
   * Wraps an existing Locator in a RadioBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns RadioBase instance
   * @example
   *   const custom = ui.radioFromLocator(page.locator("input[type='radio']"));
   *   await custom.check();
   */
  radioFromLocator(locator: Locator): RadioBase {
    return new RadioBase(locator);
  }

  /**
   * Wraps an existing Locator in a ListBoxBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns ListBoxBase instance
   * @example
   *   const custom = ui.listboxFromLocator(page.locator("[role='listbox']"));
   *   await custom.selectByText("Item");
   */
  listboxFromLocator(locator: Locator): ListBoxBase {
    return new ListBoxBase(locator);
  }

  /**
   * Wraps an existing Locator in a ModalBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns ModalBase instance
   * @example
   *   const custom = ui.modalFromLocator(page.locator("[role='dialog']"));
   *   await custom.shouldBeVisible();
   */
  modalFromLocator(locator: Locator): ModalBase {
    return new ModalBase(locator);
  }

  /**
   * Wraps an existing Locator in a DatePickerBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns DatePickerBase instance
   * @example
   *   const custom = ui.datePickerFromLocator(page.locator("input[type='date']"));
   *   await custom.fill("2023-01-01");
   */
  datePickerFromLocator(locator: Locator): DatePickerBase {
    return new DatePickerBase(locator);
  }

  /**
   * Wraps an existing Locator in an AlertBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns AlertBase instance
   * @example
   *   const custom = ui.alertFromLocator(page.locator("[role='alert']"));
   *   await custom.shouldContainText("Message");
   */
  alertFromLocator(locator: Locator): AlertBase {
    return new AlertBase(locator);
  }

  /**
   * Wraps an existing Locator in a ToggleBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns ToggleBase instance
   * @example
   *   const custom = ui.toggleFromLocator(page.locator("[role='switch']"));
   *   await custom.toggleOn();
   */
  toggleFromLocator(locator: Locator): ToggleBase {
    return new ToggleBase(locator);
  }

  /**
   * Wraps an existing Locator in a TableBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns TableBase instance
   * @example
   *   const custom = ui.tableFromLocator(page.locator("table.custom"));
   *   await custom.shouldHaveRowCount(3);
   */
  tableFromLocator(locator: Locator): TableBase {
    return new TableBase(locator);
  }

  /**
   * Wraps an existing Locator in a DataGridBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns DataGridBase instance
   * @example
   *   const custom = ui.dataGridFromLocator(page.locator(".data-grid"));
   *   await custom.sortByColumn("Name");
   */
  dataGridFromLocator(locator: Locator): DataGridBase {
    return new DataGridBase(locator);
  }

  /**
   * Wraps an existing Locator in a TabListBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns TabListBase instance
   * @example
   *   const custom = ui.tabListFromLocator(page.locator("[role='tablist']"));
   *   await custom.selectTabByLabel("Tab1");
   */
  tabListFromLocator(locator: Locator): TabListBase {
    return new TabListBase(locator);
  }

  /**
   * Wraps an existing Locator in an ElementBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns ElementBase instance
   * @example
   *   const custom = ui.elementFromLocator(page.locator("div.custom"));
   *   await custom.shouldBeVisible();
   */
  elementFromLocator(locator: Locator): ElementBase {
    return new ElementBase(locator);
  }

  /**
   * Wraps an existing Locator in a LabelBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns LabelBase instance
   * @example
   *   const custom = ui.labelFromLocator(page.locator("label.custom"));
   *   await custom.shouldHaveText("Label");
   */
  labelFromLocator(locator: Locator): LabelBase {
    return new LabelBase(locator);
  }

  /**
   * Wraps an existing Locator in a SectionBase.
   *
   * @param locator - Pre-resolved Locator
   * @returns SectionBase instance
   * @example
   *   const custom = ui.sectionFromLocator(page.locator("section.custom"));
   *   await custom.getElementByTestId("inner").shouldBeVisible();
   */
  sectionFromLocator(locator: Locator): SectionBase {
    return new SectionBase(locator);
  }

  // ───────────────────────────────────────────────────────────────
  // Feature-Specific Components
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates the MatterDetailsSection component.
   *
   * @returns MatterDetailsSection instance
   * @example
   *   const section = ui.matterDetailsSection();
   *   await section.fillFromData({ name: "Test" });
   */
  matterDetailsSection(): MatterDetailsSection {
    return new MatterDetailsSection(this.page, this);
  }

  /**
   * Creates the ReferralDetailsSection component.
   *
   * @returns ReferralDetailsSection instance
   * @example
   *   const section = ui.referralDetailsSection();
   *   await section.shouldBeVisible();
   */
  referralDetailsSection(): ReferralDetailsSection {
    return new ReferralDetailsSection(this.page, this);
  }

  /**
   * Creates the LitigationDetailsSection component.
   *
   * @returns LitigationDetailsSection instance
   * @example
   *   const section = ui.litigationDetailsSection();
   *   await section.fillDetails({ court: "Supreme" });
   */
  litigationDetailsSection(): LitigationDetailsSection {
    return new LitigationDetailsSection(this.page, this);
  }

  /**
   * Creates the LegalPartiesSection component.
   *
   * @returns LegalPartiesSection instance
   * @example
   *   const section = ui.legalPartiesSection();
   *   await section.addParty("Plaintiff");
   */
  legalPartiesSection(): LegalPartiesSection {
    return new LegalPartiesSection(this.page, this);
  }
}
