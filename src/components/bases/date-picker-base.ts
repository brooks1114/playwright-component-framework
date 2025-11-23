// src/components/bases/date-picker-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { InputBase } from "./input-base";

/**
 * DatePickerBase
 * --------------
 * Specialized base class for date-picker inputs, typically:
 *   - <input type="date">
 *   - Custom date inputs that expose a "YYYY-MM-DD" style value
 *
 * Extends InputBase and adds date-specific helpers for setting,
 * reading, and asserting date values in the standard "YYYY-MM-DD"
 * format used by native date inputs.
 *
 * It does NOT try to manipulate complex popup calendars (month views,
 * year pickers, etc.). It focuses on the underlying input value. You
 * can always extend this class if you want more app-specific behavior.
 *
 * Construction patterns:
 *  - Selector-based:
 *      const dp = new DatePickerBase(page, "#startDate");
 *  - Locator-based:
 *      const dp = new DatePickerBase(page.getByLabel("Start date"));
 *
 * Example usage with your ComponentFactory:
 *
 *   const $ = new ComponentFactory(page);
 *   const startDate = $.datePickerByLabel("Start date");
 *
 *   await startDate
 *     .shouldBeVisible()
 *     .setDate(new Date(2025, 0, 1)) // Jan 1, 2025
 *     .shouldHaveDate(new Date(2025, 0, 1));
 */
export class DatePickerBase extends InputBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string (CSS/xpath/etc).
   *
   * @example
   *   const dp = new DatePickerBase(page, "#startDate");
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator (e.g., page.getByLabel()).
   *
   * @example
   *   const dp = new DatePickerBase(page.getByLabel("Start date"));
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      // Usage: new DatePickerBase(page, "#startDate")
      super(pageOrLocator as Page, selector);
    } else {
      // Usage: new DatePickerBase(page.getByLabel("Start date"))
      super(pageOrLocator as Locator);
    }
  }

  // ───────────────────────────────────────────────────────────────
  // Internal helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Format a Date object into "YYYY-MM-DD" for <input type="date">.
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse "YYYY-MM-DD" into a Date (local), or null if invalid/empty.
   */
  private parseDate(value: string): Date | null {
    if (!value) return null;
    const [year, month, day] = value.split("-").map((v) => Number(v));
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  /**
   * Add days to a given Date and return a new Date instance.
   * Negative values move backward in time.
   */
  private plusDays(date: Date, days: number): Date {
    const copy = new Date(date.getTime());
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  // ───────────────────────────────────────────────────────────────
  // Date-specific actions
  // ───────────────────────────────────────────────────────────────

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
   * Set the date to "today" (based on the current local Date).
   */
  async setToday(): Promise<this> {
    const today = new Date();
    return this.setDate(today);
  }

  /**
   * Set the date relative to today, e.g.:
   *  - daysOffset = +7 → one week in the future
   *  - daysOffset = -1 → yesterday
   */
  async setRelativeToToday(daysOffset: number): Promise<this> {
    const today = new Date();
    const target = this.plusDays(today, daysOffset);
    return this.setDate(target);
  }

  /**
   * Set the underlying date input to a literal string value.
   *
   * Use this when you want full control over the value passed
   * to the input (e.g., boundary/invalid/string tests).
   */
  async setRawValue(value: string): Promise<this> {
    await this.fill(value);
    return this;
  }

  /**
   * Open the calendar popup, if the date-picker uses one.
   *
   * For native <input type="date"> this is browser-specific, but
   * for most custom components, clicking the input opens the calendar.
   */
  async openCalendar(): Promise<this> {
    await this.focus();
    await this.asLocator().click();
    return this;
  }

  /**
   * Close the calendar popup via Escape key.
   */
  async closeCalendarWithEsc(): Promise<this> {
    await this.asLocator().page().keyboard.press("Escape");
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Getters
  // ───────────────────────────────────────────────────────────────

  /**
   * Get the raw value from the input (commonly "YYYY-MM-DD").
   *
   * Note: this is just the underlying string; it may be empty or invalid.
   */
  async getRawValue(): Promise<string> {
    return await this.getValue();
  }

  /**
   * Get the current value as a Date, or null if empty/invalid.
   */
  async getDate(): Promise<Date | null> {
    const value = await this.getValue();
    return this.parseDate(value);
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions
  // ───────────────────────────────────────────────────────────────

  /**
   * Assert the date-picker has an exact raw value (string or RegExp).
   *
   * This is useful for boundary/invalid cases where you care about
   * the exact contents of the field, not just valid Date objects.
   */
  async shouldHaveRawValue(expected: string | RegExp): Promise<this> {
    await expect(this.asLocator()).toHaveValue(expected);
    return this;
  }

  /**
   * Assert the date-picker has a specific Date value.
   *
   * Compares against the "YYYY-MM-DD" formatted value.
   */
  async shouldHaveDate(expected: Date): Promise<this> {
    const formatted = this.formatDate(expected);
    await expect(this.asLocator()).toHaveValue(formatted);
    return this;
  }

  /**
   * Assert the date-picker is empty (no value).
   *
   * This is just a date-specific alias for InputBase.shouldBeEmpty().
   */
  async shouldBeEmptyDate(): Promise<this> {
    await expect(this.asLocator()).toHaveValue("");
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /**
   * Wait for the date-picker to have a specific raw value.
   */
  async waitForRawValue(
    expected: string | RegExp,
    timeout = 10_000
  ): Promise<this> {
    await expect(this.asLocator()).toHaveValue(expected, { timeout });
    return this;
  }

  /**
   * Wait for the date-picker to have a specific Date value.
   *
   * Compares against the "YYYY-MM-DD" formatted value.
   */
  async waitForDate(expected: Date, timeout = 10_000): Promise<this> {
    const formatted = this.formatDate(expected);
    await expect(this.asLocator()).toHaveValue(formatted, { timeout });
    return this;
  }

  /**
   * Wait until the date-picker becomes empty (no value).
   */
  async waitUntilEmptyDate(timeout = 10_000): Promise<this> {
    await expect(this.asLocator()).toHaveValue("", { timeout });
    return this;
  }
}
