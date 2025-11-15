// components/factory.ts
import { Page } from "@playwright/test";

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
 * and a selector string (CSS/xpath/role-based, depending on your conventions).
 *
 * Usage:
 *   const factory = new ComponentFactory(page);
 *   await factory.button(LOCATORS.PROFILE.SAVE_BUTTON).click();
 *   await factory.input(LOCATORS.PROFILE.EMAIL_INPUT).fill("test@example.com");
 */
export class ComponentFactory {
  constructor(public page: Page) {}

  /** Create a DropdownBase for <select> elements. */
  dropdown(selector: string): DropdownBase {
    return new DropdownBase(this.page, selector);
  }

  /** Create an InputBase for <input>, <textarea>, or contenteditable elements. */
  input(selector: string): InputBase {
    return new InputBase(this.page, selector);
  }

  /** Create a ButtonBase for <button>, input[type="submit"], or role="button" elements. */
  button(selector: string): ButtonBase {
    return new ButtonBase(this.page, selector);
  }

  /** Create a LinkBase for <a> anchor elements or role="link". */
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
   * Create a ModalBase for modal dialogs (typically role="dialog" or role="alertdialog").
   *
   * Selector should point at the modal container element.
   */
  modal(selector: string): ModalBase {
    return new ModalBase(this.page, selector);
  }

  /**
   * Create a DatePickerBase for date inputs (e.g., <input type="date">)
   * or custom date-picker inputs that still expose a textual value.
   */
  datePicker(selector: string): DatePickerBase {
    return new DatePickerBase(this.page, selector);
  }
}
