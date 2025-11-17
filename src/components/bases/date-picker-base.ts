import { Page, Locator, expect } from "@playwright/test";
import { InputBase } from "./input-base";

/**
 * Base class for date-picker inputs (e.g., <input type="date">).
 *
 * Extends InputBase and adds date-specific helpers for setting,
 * reading, and asserting date values in the standard "YYYY-MM-DD"
 * format used by native date inputs.
 *
 * NOTE: This does NOT try to manipulate complex popup calendars;
 * it's focused on the underlying input value. You can extend it
 * later if your app uses a custom calendar UI.
 *
 * Construction:
 *  - new DatePickerBase(page, '#startDate');
 *  - new DatePickerBase(page.getByLabel('Start date'));
 *
 * @example
 * const datePicker = new DatePickerBase(page, '#startDate');
 * await datePicker.setDate(new Date(2025, 0, 1)); // Jan 1, 2025
 * await datePicker.shouldHaveDate(new Date(2025, 0, 1));
 */
export class DatePickerBase extends InputBase {
  // === CONSTRUCTORS (overloads) ===

  /**
   * Construct from a Page and a selector string (CSS/xpath/etc).
   */
  constructor(page: Page, selector: string);
  /**
   * Construct directly from an existing Locator (e.g., page.getByLabel()).
   */
  constructor(locator: Locator);
  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      // Usage: new DatePickerBase(page, '#startDate')
      super(pageOrLocator as Page, selector);
    } else {
      // Usage: new DatePickerBase(page.getByLabel('Start date'))
      super(pageOrLocator as Locator);
    }
  }

  // === INTERNAL HELPERS ===

  /** Format a Date object into "YYYY-MM-DD" for <input type="date">. */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /** Parse "YYYY-MM-DD" into a Date (local), or null if invalid/empty. */
  private parseDate(value: string): Date | null {
    if (!value) return null;
    const [year, month, day] = value.split("-").map((v) => Number(v));
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  // === DATE-SPECIFIC ACTIONS ===

  /**
   * Set the underlying date input to the given Date value,
   * using the native "YYYY-MM-DD" format.
   */
  async setDate(date: Date): Promise<this> {
    const value = this.formatDate(date);
    await this.fill(value);
    return this;
  }

  /**
   * Set the underlying date input to a literal string value.
   *
   * Use this when you want full control over the value passed
   * to the input (e.g., for boundary/invalid tests).
   */
  async setRawValue(value: string): Promise<this> {
    await this.fill(value);
    return this;
  }

  /**
   * Open the calendar popup, if the date-picker uses one.
   *
   * For native <input type="date"> implementations this may be browser-specific,
   * but for most custom components clicking the input opens the calendar.
   */
  async openCalendar(): Promise<this> {
    await this.focus();
    await this.locator.click();
    return this;
  }

  /**
   * Close the calendar popup via Escape key.
   */
  async closeCalendarWithEsc(): Promise<this> {
    await this.locator.page().keyboard.press("Escape");
    return this;
  }

  // === GETTERS ===

  /** Get the raw "YYYY-MM-DD" (or other) value from the input. */
  async getRawValue(): Promise<string> {
    return await this.getValue();
  }

  /** Get the current value as a Date, or null if empty/invalid. */
  async getDate(): Promise<Date | null> {
    const value = await this.getValue();
    return this.parseDate(value);
  }

  // === ASSERTIONS ===

  /**
   * Assert the date-picker has an exact raw value (string or RegExp).
   */
  async shouldHaveRawValue(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveValue(expected);
    return this;
  }

  /**
   * Assert the date-picker has a specific Date value.
   *
   * Compares against the "YYYY-MM-DD" formatted value.
   */
  async shouldHaveDate(expected: Date): Promise<this> {
    const formatted = this.formatDate(expected);
    await expect(this.locator).toHaveValue(formatted);
    return this;
  }

  // === WAITERS ===

  /** Wait for the date-picker to have a specific raw value. */
  async waitForRawValue(
    expected: string | RegExp,
    timeout = 10_000
  ): Promise<this> {
    await expect(this.locator).toHaveValue(expected, { timeout });
    return this;
  }

  /** Wait for the date-picker to have a specific Date value. */
  async waitForDate(expected: Date, timeout = 10_000): Promise<this> {
    const formatted = this.formatDate(expected);
    await expect(this.locator).toHaveValue(formatted, { timeout });
    return this;
  }
}
