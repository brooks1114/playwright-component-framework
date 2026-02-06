// src/components/bases/dropdown-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * DropdownBase
 * ------------
 * Chainable, type-safe wrapper for native <select> dropdowns (single- and multi-select).
 * Acts as a Component Object Model (COM) building block.
 *
 * Wraps Playwright Locator to centralize interactions, assertions, and waits.
 * Compatible with Playwright v1.40+ (including latest 1.58.x as of Feb 2026) —
 * no breaking changes in recent releases affect this class.
 *
 * Preferred construction: via ComponentFactory (locator-based, accessibility-first):
 *   ui.dropdownByLabel("Role")
 *
 * Fallback: selector-based (CSS/XPath) when needed.
 *
 * @example Basic usage in a test
 *   const $ = new ComponentFactory(page);
 *   const roleDropdown = $.dropdownByLabel("Role");
 *
 *   await roleDropdown
 *     .shouldBeVisible()
 *     .shouldBeEnabled()
 *     .selectByText("Admin")
 *     .shouldHaveSelectedText("Admin");
 *
 * @example Multi-select
 *   await roleDropdown
 *     .selectMultiple(["admin", "editor"])
 *     .shouldContainSelectedValue("admin")
 *     .shouldHaveValues(["admin", "editor"]);
 */
export class DropdownBase {
  /** Underlying Playwright Locator pointing to the <select> (or equivalent). */
  readonly locator: Locator;

  /** Locator for all <option> children (for native <select>). */
  private readonly optionsLocator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors (overloaded for flexibility)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from Page + CSS/XPath selector (fallback / legacy).
   *
   * @example
   *   new DropdownBase(page, "#role-select");
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator (preferred).
   *
   * @example
   *   new DropdownBase(page.getByLabel("Role"));
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    this.locator =
      selector !== undefined
        ? (pageOrLocator as Page).locator(selector)
        : (pageOrLocator as Locator);

    // For native <select>, targets <option> children.
    // Custom dropdowns (React/MUI/etc.) should extend and override.
    this.optionsLocator = this.locator.locator("option");
  }

  /** Returns the underlying Locator for advanced / custom operations. */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // Wait & State Checks
  // ───────────────────────────────────────────────────────────────

  /**
   * Wait for the dropdown to reach the desired state (default: visible).
   *
   * @example
   *   await dropdown.waitFor({ timeout: 15_000 });
   */
  async waitFor(options?: {
    timeout?: number;
    state?: "visible" | "attached" | "hidden" | "detached";
  }): Promise<this> {
    await this.locator.waitFor(options);
    return this;
  }

  async isVisible(): Promise<boolean> {
    return this.locator.isVisible();
  }

  async isEnabled(): Promise<boolean> {
    return this.locator.isEnabled();
  }

  async isDisabled(): Promise<boolean> {
    return this.locator.isDisabled();
  }

  /**
   * Checks if multiple selections are allowed (via `multiple` attribute).
   *
   * @returns `true` for `<select multiple>`, `false` otherwise.
   */
  async isMultiple(): Promise<boolean> {
    return (await this.locator.getAttribute("multiple")) !== null;
  }

  // ───────────────────────────────────────────────────────────────
  // Selection Methods (chainable)
  // ───────────────────────────────────────────────────────────────

  /**
   * Low-level select helper — supports string, object, or array of values/labels/indexes.
   * Waits for visibility first.
   */
  async selectOption(
    value:
      | string
      | { value?: string; label?: string; index?: number }
      | readonly (
          | string
          | { value?: string; label?: string; index?: number }
        )[],
    options?: Parameters<Locator["selectOption"]>[1],
  ): Promise<this> {
    await this.waitFor();
    await this.locator.selectOption(value as any, options); // Safe cast — Playwright handles readonly
    return this;
  }

  /** Select an option by its visible text (label). Most common usage. */
  async selectByText(text: string): Promise<this> {
    return this.selectOption({ label: text });
  }

  /** Select by the option's `value` attribute. */
  async selectByValue(value: string): Promise<this> {
    return this.selectOption({ value });
  }

  /** Select by 0-based index in the options list. */
  async selectByIndex(index: number): Promise<this> {
    return this.selectOption({ index });
  }

  /** Clear all selections (multi-select only). */
  async clearSelection(): Promise<this> {
    return this.selectOption([]);
  }

  /** Alias for `clearSelection()` — more intuitive for multi-select users. */
  async deselectAll(): Promise<this> {
    return this.clearSelection();
  }

  /** Select multiple values (multi-select only). */
  async selectMultiple(values: readonly string[]): Promise<this> {
    return this.selectOption(values);
  }

  /**
   * Wait until visible/enabled, then select by text.
   * Useful for async-populated dropdowns.
   */
  async waitUntilEnabledAndSelectByText(
    text: string,
    timeout = 10_000,
  ): Promise<this> {
    await this.waitUntilReady(timeout);
    await this.selectByText(text);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Getters
  // ───────────────────────────────────────────────────────────────

  /**
   * Get currently selected value(s).
   * - Single-select: string
   * - Multi-select: string[]
   */
  async getSelectedValue(): Promise<string | string[]> {
    if (await this.isMultiple()) {
      return this.optionsLocator.evaluateAll((els) =>
        Array.from(els as HTMLOptionElement[])
          .filter((el) => el.selected)
          .map((el) => el.value),
      );
    }
    return this.locator.inputValue();
  }

  async getSelectedValuesArray(): Promise<string[]> {
    const val = await this.getSelectedValue();
    return Array.isArray(val) ? val : [val];
  }

  /** Get selected option text(s) — single: string, multi: string[] */
  async getSelectedText(): Promise<string | string[]> {
    const texts = await this.optionsLocator.evaluateAll((els) =>
      Array.from(els as HTMLOptionElement[])
        .filter((el) => el.selected)
        .map((el) => el.textContent?.trim() ?? ""),
    );
    return texts.length === 1 ? texts[0] : texts;
  }

  async getSelectedTextsArray(): Promise<string[]> {
    const txt = await this.getSelectedText();
    return Array.isArray(txt) ? txt : [txt];
  }

  /** Get all available option texts. */
  async getAllOptionTexts(): Promise<string[]> {
    return (await this.optionsLocator.allTextContents()).map((t) => t.trim());
  }

  /** Get all available option values. */
  async getAllOptionValues(): Promise<string[]> {
    return this.optionsLocator.evaluateAll((els) =>
      Array.from(els as HTMLOptionElement[]).map((el) => el.value),
    );
  }

  /** Get number of available options (useful for dynamic lists). */
  async getOptionCount(): Promise<number> {
    return this.optionsLocator.count();
  }

  /** Get the `name` attribute of the <select>. */
  async getName(): Promise<string | null> {
    return this.locator.getAttribute("name");
  }

  // ───────────────────────────────────────────────────────────────
  // Basic Actions
  // ───────────────────────────────────────────────────────────────

  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  async press(key: string): Promise<this> {
    await this.locator.press(key);
    return this;
  }

  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  async screenshot(path?: string): Promise<Buffer> {
    return this.locator.screenshot({ path });
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions (chainable, auto-retrying via expect)
  // ───────────────────────────────────────────────────────────────

  async shouldHaveValue(expected: string): Promise<this> {
    await expect(this.locator).toHaveValue(expected);
    return this;
  }

  async shouldHaveValues(expected: readonly string[]): Promise<this> {
    await expect(this.locator).toHaveValues(expected as string[]);
    return this;
  }

  async shouldHaveSelectedText(expected: string | RegExp): Promise<this> {
    const text = await this.getSelectedText();
    await expect
      .soft(text)
      .toMatch(
        expected instanceof RegExp ? expected : new RegExp(`^${expected}$`),
      );
    return this;
  }

  async shouldHaveSelectedTexts(expected: readonly string[]): Promise<this> {
    const texts = await this.getSelectedTextsArray();
    await expect.soft(texts).toEqual(expected as string[]);
    return this;
  }

  async shouldContainSelectedValue(value: string): Promise<this> {
    const values = await this.getSelectedValuesArray();
    expect(values).toContain(value);
    return this;
  }

  async shouldContainSelectedText(text: string): Promise<this> {
    const texts = await this.getSelectedTextsArray();
    expect(texts).toContain(text);
    return this;
  }

  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  async shouldContainOption(text: string): Promise<this> {
    await expect(this.optionsLocator).toContainText(text);
    return this;
  }

  async shouldHaveOptions(expected: readonly string[]): Promise<this> {
    await expect(this.optionsLocator).toHaveText(expected as string[]);
    return this;
  }

  async shouldHaveOptionCount(expected: number): Promise<this> {
    await expect(this.optionsLocator).toHaveCount(expected);
    return this;
  }

  async shouldBeMultiple(): Promise<this> {
    await expect(this.locator).toHaveAttribute("multiple", "");
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Advanced Waiters
  // ───────────────────────────────────────────────────────────────

  /**
   * Wait until dropdown is visible and enabled.
   * Combines visibility + enabled checks.
   */
  async waitUntilReady(timeout = 10_000): Promise<this> {
    await Promise.all([
      this.waitFor({ timeout }),
      expect(this.locator).toBeEnabled({ timeout }),
    ]);
    return this;
  }

  /** Wait until at least one option appears (for lazy-loaded dropdowns). */
  async waitForOptionsPopulated(timeout = 10_000): Promise<this> {
    await expect(this.optionsLocator.first()).toBeVisible({ timeout });
    return this;
  }

  async waitForValue(value: string, timeout = 10_000): Promise<this> {
    await expect(this.locator).toHaveValue(value, { timeout });
    return this;
  }

  async waitForValues(
    values: readonly string[],
    timeout = 10_000,
  ): Promise<this> {
    await expect(this.locator).toHaveValues(values as string[], { timeout });
    return this;
  }

  async waitForOption(text: string, timeout = 10_000): Promise<this> {
    await expect(this.optionsLocator.getByText(text)).toBeVisible({ timeout });
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Compound / Verification Helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Select by text and immediately verify the resulting value.
   * Great for label → code mapping tests.
   */
  async selectAndVerify(text: string, expectedValue: string): Promise<this> {
    await this.selectByText(text);
    await this.shouldHaveValue(expectedValue);
    return this;
  }

  async selectByTextAndVerifySelectedText(text: string): Promise<this> {
    await this.selectByText(text);
    await this.shouldHaveSelectedText(text);
    return this;
  }

  async selectMultipleAndVerify(
    valuesToSelect: readonly string[],
    expectedValues: readonly string[],
  ): Promise<this> {
    await this.selectMultiple(valuesToSelect);
    await this.shouldHaveValues(expectedValues);
    return this;
  }
}
