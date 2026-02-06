// src/components/bases/date-picker-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { InputBase } from "./input-base";

/**
 * DatePickerBase
 * --------------
 * Specialized base class for date picker controls in React applications.
 *
 * Designed for:
 * - Native `<input type="date">` elements
 * - Custom date inputs that expose or accept `YYYY-MM-DD` formatted values
 * - Date fields where the underlying value is ISO-like date string
 *
 * Extends `InputBase`, inheriting:
 * - `fill()`, `clear()`, `focus()`, `blur()`, `shouldHaveValue()`, etc.
 * - Visibility, enabled/disabled, placeholder, attribute assertions
 *
 * **Does NOT** handle complex calendar popup interactions (month/year navigation,
 * day selection, custom calendar widgets). Focus is on the **input value** itself.
 * For calendar-specific testing, create a subclass or separate `CalendarPopupBase`.
 *
 * @extends InputBase
 *
 * @example
 * // Recommended: via ComponentFactory
 * const $ = new ComponentFactory(page);
 * const birthDate = $.datePickerByLabel("Date of birth");
 *
 * await birthDate
 *   .shouldBeVisible()
 *   .shouldBeEnabled()
 *   .setDate(new Date(1990, 5, 15))           // June 15, 1990
 *   .shouldHaveDate(new Date(1990, 5, 15));
 *
 * @example
 * // Direct construction
 * const startDate = new DatePickerBase(
 *   page.getByLabel("Project start date")
 * );
 * await startDate.setRelativeToToday(7).shouldNotBeEmpty();
 */
export class DatePickerBase extends InputBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a DatePickerBase from a Page and selector string.
   *
   * @param page - Playwright Page instance
   * @param selector - CSS/XPath selector targeting the date input
   */
  constructor(page: Page, selector: string);

  /**
   * Creates a DatePickerBase from an existing Locator (preferred).
   *
   * @param locator - Locator targeting the `<input>` or custom date field
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      super(pageOrLocator as Page, selector);
    } else {
      super(pageOrLocator as Locator);
    }
  }

  // ───────────────────────────────────────────────────────────────
  // Internal Date Formatting & Parsing Helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Formats a Date object to the standard "YYYY-MM-DD" string expected
   * by native `<input type="date">` and most custom date inputs.
   *
   * @param date - Date to format
   * @returns "YYYY-MM-DD" string
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Parses a "YYYY-MM-DD" string into a local Date object.
   *
   * @param value - Raw input value (expected "YYYY-MM-DD")
   * @returns Date object or `null` if invalid or empty
   */
  private parseDate(value: string): Date | null {
    if (!value || value.trim() === "") return null;

    const parts = value.split("-");
    if (parts.length !== 3) return null;

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    // Create date and validate it matches input (prevents invalid like 2023-04-31)
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() + 1 !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  /**
   * Returns a new Date shifted by the given number of days.
   *
   * @param date - Starting date
   * @param days - Positive = future, negative = past
   */
  private plusDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
  }

  // ───────────────────────────────────────────────────────────────
  // Date-Specific Actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Sets the date picker to the specified Date using "YYYY-MM-DD" format.
   *
   * @param date - The target date
   * @returns This instance (for chaining)
   */
  async setDate(date: Date): Promise<this> {
    const formatted = this.formatDate(date);
    await this.fill(formatted);
    return this;
  }

  /**
   * Sets the date picker to today's date (local time).
   *
   * @returns This instance (for chaining)
   */
  async setToday(): Promise<this> {
    return this.setDate(new Date());
  }

  /**
   * Sets the date relative to today (e.g. +7 = next week, -30 = one month ago).
   *
   * @param daysOffset - Number of days from today (positive = future)
   * @returns This instance (for chaining)
   */
  async setRelativeToToday(daysOffset: number): Promise<this> {
    const target = this.plusDays(new Date(), daysOffset);
    return this.setDate(target);
  }

  /**
   * Directly fills the input with a raw string value.
   * Useful for testing invalid formats, boundary values, or browser-specific behavior.
   *
   * @param value - Raw string to set (e.g. "2025-02-30", "invalid")
   */
  async setRawValue(value: string): Promise<this> {
    await this.fill(value);
    return this;
  }

  /**
   * Attempts to open the date picker popup/calendar by focusing and clicking.
   * Works for native `<input type="date">` in most browsers and many custom pickers.
   *
   * @remarks Behavior is browser-dependent for native inputs.
   */
  async openCalendar(): Promise<this> {
    await this.focus();
    await this.asLocator().click();
    return this;
  }

  /**
   * Closes the calendar popup by pressing Escape key.
   * Common pattern in both native and custom date pickers.
   */
  async closeCalendarWithEsc(): Promise<this> {
    await this.asLocator().page().keyboard.press("Escape");
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Getters
  // ───────────────────────────────────────────────────────────────

  /**
   * Gets the raw string value of the input (usually "YYYY-MM-DD" or empty).
   *
   * @returns Current value attribute/string
   */
  async getRawValue(): Promise<string> {
    return await this.getValue();
  }

  /**
   * Parses and returns the current value as a Date object.
   *
   * @returns Date object or `null` if empty or invalid
   */
  async getDate(): Promise<Date | null> {
    const value = await this.getValue();
    return this.parseDate(value);
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions
  // ───────────────────────────────────────────────────────────────

  /**
   * Asserts the raw input value matches the expected string or pattern.
   *
   * @param expected - Exact string or RegExp
   */
  async shouldHaveRawValue(expected: string | RegExp): Promise<this> {
    await expect(this.asLocator()).toHaveValue(expected);
    return this;
  }

  /**
   * Asserts the date picker contains the exact expected Date.
   * Compares formatted "YYYY-MM-DD" values.
   *
   * @param expected - Date to compare against
   */
  async shouldHaveDate(expected: Date): Promise<this> {
    const formatted = this.formatDate(expected);
    await expect(this.asLocator()).toHaveValue(formatted);
    return this;
  }

  /**
   * Asserts the date picker is empty (value = "").
   */
  async shouldBeEmptyDate(): Promise<this> {
    await expect(this.asLocator()).toHaveValue("");
    return this;
  }

  /**
   * Asserts the current date is today (local date).
   *
   * @remarks Uses local timezone — be careful in CI/cross-region tests.
   */
  async shouldHaveToday(): Promise<this> {
    const todayFormatted = this.formatDate(new Date());
    await expect(this.asLocator()).toHaveValue(todayFormatted);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /**
   * Waits until the raw input value matches the expected value/pattern.
   *
   * @param expected - String or RegExp to wait for
   * @param timeout - Max wait time (ms)
   */
  async waitForRawValue(
    expected: string | RegExp,
    timeout = 10_000,
  ): Promise<this> {
    await expect(this.asLocator()).toHaveValue(expected, { timeout });
    return this;
  }

  /**
   * Waits until the parsed date matches the expected Date.
   *
   * @param expected - Target Date
   * @param timeout - Max wait time (ms)
   */
  async waitForDate(expected: Date, timeout = 10_000): Promise<this> {
    const formatted = this.formatDate(expected);
    await expect(this.asLocator()).toHaveValue(formatted, { timeout });
    return this;
  }

  /**
   * Waits until the date picker becomes empty.
   *
   * @param timeout - Max wait time (ms)
   */
  async waitUntilEmptyDate(timeout = 10_000): Promise<this> {
    await expect(this.asLocator()).toHaveValue("", { timeout });
    return this;
  }
}
