// components/factory.ts
import { Page, Locator } from "@playwright/test";

import { DropdownBase } from "./bases/dropdown-base";
import { InputBase } from "./bases/input-base";
import { LinkBase } from "./bases/link-base";
import { ButtonBase } from "./bases/button-base";
import { CheckboxBase } from "./bases/checkbox-base";
import { RadioBase } from "./bases/radio-base";
import { ListBoxBase } from "./bases/listbox-base";
import { ModalBase } from "./bases/modal-base";
import { DatePickerBase } from "./bases/date-picker-base";

/**
 * Central factory for creating UI component instances.
 *
 * All components are instantiated with the current Playwright Page
 * and either:
 *   - a selector string (CSS/xpath/etc), OR
 *   - a semantic Locator (e.g., page.getByLabel(), page.getByRole()).
 *
 * This allows you to use robust, accessibility-driven locators
 * (labels, roles, test IDs) while keeping a consistent base-component API.
 *
 * Usage:
 *   const factory = new ComponentFactory(page);
 *
 *   // Selector-based (legacy / fallback)
 *   await factory.button("#save-button").click();
 *   await factory.input('[name="email"]').fill("test@example.com");
 *
 *   // Semantic, accessibility-based
 *   await factory.inputByLabel("Case name").fill("Matter 456");
 *   await factory.dropdownByLabel("Matter type").selectByVisibleText("Suits");
 */
export class ComponentFactory {
  constructor(public readonly page: Page) {}

  // ---------------------------------------------------------------------------
  // SELECTOR-BASED CONSTRUCTORS (existing behavior, unchanged)
  // ---------------------------------------------------------------------------

  /** Create a DropdownBase for <select> elements (by selector). */
  dropdown(selector: string): DropdownBase {
    return new DropdownBase(this.page, selector);
  }

  /** Create an InputBase for <input>, <textarea>, or contenteditable elements (by selector). */
  input(selector: string): InputBase {
    return new InputBase(this.page, selector);
  }

  /** Create a ButtonBase for <button>, input[type="submit"], or role="button" elements (by selector). */
  button(selector: string): ButtonBase {
    return new ButtonBase(this.page, selector);
  }

  /** Create a LinkBase for <a> anchor elements or role="link" (by selector). */
  link(selector: string): LinkBase {
    return new LinkBase(this.page, selector);
  }

  /** Create a CheckboxBase for <input type="checkbox"> or role="checkbox" (by selector). */
  checkbox(selector: string): CheckboxBase {
    return new CheckboxBase(this.page, selector);
  }

  /** Create a RadioBase for <input type="radio"> or role="radio" (by selector). */
  radio(selector: string): RadioBase {
    return new RadioBase(this.page, selector);
  }

  /** Create a ListBoxBase for ARIA listbox components (role="listbox") (by selector). */
  listbox(selector: string): ListBoxBase {
    return new ListBoxBase(this.page, selector);
  }

  /**
   * Create a ModalBase for modal dialogs (typically role="dialog" or role="alertdialog").
   *
   * Selector should point at the modal container element.
   */
  modal(selector: string): ModalBase {
    return new ModalBase(this.page, selector);
  }

  /**
   * Create a DatePickerBase for date inputs (e.g., <input type="date">)
   * or custom date-picker inputs that still expose a textual value (by selector).
   */
  datePicker(selector: string): DatePickerBase {
    return new DatePickerBase(this.page, selector);
  }

  // ---------------------------------------------------------------------------
  // SEMANTIC / ACCESSIBILITY-BASED HELPERS (Google/Netflix-style)
  // ---------------------------------------------------------------------------
  // NOTE: For these to work, the corresponding base classes should support
  // a constructor overload like:
  //   constructor(page: Page, selector: string);
  //   constructor(locator: Locator);
  // and internally store the Locator (see updated InputBase).
  // ---------------------------------------------------------------------------

  /**
   * Input located by its accessible label text.
   *
   * Example:
   *   factory.inputByLabel("Case name").fill("Matter 456");
   */
  inputByLabel(label: string): InputBase {
    return new InputBase(this.page.getByLabel(label));
  }

  /**
   * Input located by its placeholder text.
   *
   * Example:
   *   factory.inputByPlaceholder("Search...").type("foo");
   */
  inputByPlaceholder(placeholder: string): InputBase {
    return new InputBase(this.page.getByPlaceholder(placeholder));
  }

  /**
   * Input located by a test ID.
   *
   * Example:
   *   factory.inputByTestId("EmailInput").fill("user@example.com");
   */
  inputByTestId(testId: string): InputBase {
    return new InputBase(this.page.getByTestId(testId));
  }

  /**
   * Dropdown/select located by its accessible label text.
   *
   * Example:
   *   factory.dropdownByLabel("Matter type").selectByVisibleText("Suits");
   */
  dropdownByLabel(label: string): DropdownBase {
    return new DropdownBase(this.page.getByLabel(label));
  }

  /**
   * Dropdown/select located by test ID.
   */
  dropdownByTestId(testId: string): DropdownBase {
    return new DropdownBase(this.page.getByTestId(testId));
  }

  /**
   * Button located by its accessible name (role="button").
   *
   * @param name  Visible/accessible name of the button.
   * @param exact If true, require exact match on the name.
   *
   * Example:
   *   factory.buttonByRoleName("Save").click();
   */
  buttonByRoleName(name: string, options?: { exact?: boolean }): ButtonBase {
    const locator = this.page.getByRole("button", {
      name,
      exact: options?.exact,
    });
    return new ButtonBase(locator);
  }

  /**
   * Button located by test ID.
   */
  buttonByTestId(testId: string): ButtonBase {
    return new ButtonBase(this.page.getByTestId(testId));
  }

  /**
   * Link located by its accessible name (role="link").
   */
  linkByRoleName(name: string, options?: { exact?: boolean }): LinkBase {
    const locator = this.page.getByRole("link", {
      name,
      exact: options?.exact,
    });
    return new LinkBase(locator);
  }

  /**
   * Checkbox located by its label.
   */
  checkboxByLabel(label: string): CheckboxBase {
    return new CheckboxBase(this.page.getByLabel(label));
  }

  /**
   * Checkbox located by test ID.
   */
  checkboxByTestId(testId: string): CheckboxBase {
    return new CheckboxBase(this.page.getByTestId(testId));
  }

  /**
   * Radio button located by its label.
   */
  radioByLabel(label: string): RadioBase {
    return new RadioBase(this.page.getByLabel(label));
  }

  /**
   * Radio button located by its accessible name (role="radio").
   */
  radioByRoleName(name: string, options?: { exact?: boolean }): RadioBase {
    const locator = this.page.getByRole("radio", {
      name,
      exact: options?.exact,
    });
    return new RadioBase(locator);
  }

  /**
   * Listbox located by its role and accessible name.
   *
   * Example:
   *   factory.listboxByRoleName("States").select("Maine");
   */
  listboxByRoleName(name: string, options?: { exact?: boolean }): ListBoxBase {
    const locator = this.page.getByRole("listbox", {
      name,
      exact: options?.exact,
    });
    return new ListBoxBase(locator);
  }

  /**
   * Modal dialog located by role="dialog" and accessible name.
   */
  modalByRoleName(name: string, options?: { exact?: boolean }): ModalBase {
    const locator = this.page.getByRole("dialog", {
      name,
      exact: options?.exact,
    });
    return new ModalBase(locator);
  }

  /**
   * Date picker located by its label (typically <input type="date"> or custom).
   */
  datePickerByLabel(label: string): DatePickerBase {
    return new DatePickerBase(this.page.getByLabel(label));
  }

  /**
   * Date picker located by test ID.
   */
  datePickerByTestId(testId: string): DatePickerBase {
    return new DatePickerBase(this.page.getByTestId(testId));
  }

  // ---------------------------------------------------------------------------
  // LOW-LEVEL "FROM LOCATOR" HELPERS (if you already have a Locator in hand)
  // ---------------------------------------------------------------------------

  /** Wrap an existing Locator in an InputBase. */
  inputFromLocator(locator: Locator): InputBase {
    return new InputBase(locator);
  }

  /** Wrap an existing Locator in a DropdownBase. */
  dropdownFromLocator(locator: Locator): DropdownBase {
    return new DropdownBase(locator);
  }

  /** Wrap an existing Locator in a ButtonBase. */
  buttonFromLocator(locator: Locator): ButtonBase {
    return new ButtonBase(locator);
  }

  /** Wrap an existing Locator in a CheckboxBase. */
  checkboxFromLocator(locator: Locator): CheckboxBase {
    return new CheckboxBase(locator);
  }

  /** Wrap an existing Locator in a RadioBase. */
  radioFromLocator(locator: Locator): RadioBase {
    return new RadioBase(locator);
  }

  /** Wrap an existing Locator in a ListBoxBase. */
  listboxFromLocator(locator: Locator): ListBoxBase {
    return new ListBoxBase(locator);
  }

  /** Wrap an existing Locator in a ModalBase. */
  modalFromLocator(locator: Locator): ModalBase {
    return new ModalBase(locator);
  }

  /** Wrap an existing Locator in a DatePickerBase. */
  datePickerFromLocator(locator: Locator): DatePickerBase {
    return new DatePickerBase(locator);
  }
}
