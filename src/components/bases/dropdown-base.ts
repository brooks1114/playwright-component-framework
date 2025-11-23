// src/components/bases/dropdown-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * DropdownBase
 * ------------
 * Chainable, type-safe base class for <select> dropdowns
 * (single- and multi-select).
 *
 * This wraps a Playwright Locator and provides:
 *  - Selection helpers (by label/text, by value, by index, multi-select)
 *  - State queries (isVisible, isEnabled, isMultiple, getSelected* helpers)
 *  - Assertion helpers (shouldHaveValue, shouldContainOption, etc.)
 *  - Waiters (waitUntilReady, waitForValue, waitForOption, etc.)
 *
 * Construction patterns (all supported):
 *  - Selector-based (legacy / fallback):
 *      const dd = new DropdownBase(page, "#role");
 *  - Locator-based (preferred, used by ComponentFactory):
 *      const dd = new DropdownBase(page.getByLabel("Role"));
 *
 * Example usage in a test with your ComponentFactory:
 *
 *   const $ = new ComponentFactory(page);
 *   const matterTypeDropdown = $.dropdownByLabel("Matter type");
 *
 *   await matterTypeDropdown
 *     .shouldBeVisible()
 *     .shouldBeEnabled()
 *     .selectByText("Suits");
 */
export class DropdownBase {
  /** Underlying <select> locator (or equivalent custom dropdown root). */
  readonly locator: Locator;

  /** Locator for <option> elements inside the dropdown (native <select>). */
  private readonly optionsLocator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string (CSS/xpath/etc).
   *
   * @example
   *   const dd = new DropdownBase(page, "#role");
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator (e.g., page.getByLabel()).
   * The locator should point to the <select> element (or equivalent).
   *
   * @example
   *   const dd = new DropdownBase(page.getByLabel("Role"));
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      // Usage: new DropdownBase(page, "#role")
      this.locator = (pageOrLocator as Page).locator(selector);
    } else {
      // Usage: new DropdownBase(page.getByLabel("Role"))
      this.locator = pageOrLocator as Locator;
    }

    // For native <select> elements this will target <option> children.
    // For custom dropdowns, override usage or extend this class.
    this.optionsLocator = this.locator.locator("option");
  }

  /**
   * Expose the underlying Locator for advanced operations.
   */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // Wait & state
  // ───────────────────────────────────────────────────────────────

  /**
   * Wait for dropdown to be visible or attached.
   */
  async waitFor(options?: {
    timeout?: number;
    state?: "visible" | "attached";
  }): Promise<this> {
    await this.locator.waitFor({
      state: options?.state ?? "visible",
      timeout: options?.timeout ?? 30_000,
    });
    return this;
  }

  /**
   * Check if dropdown is visible.
   */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /**
   * Check if dropdown is enabled.
   */
  async isEnabled(): Promise<boolean> {
    return await this.locator.isEnabled();
  }

  /**
   * Check if dropdown is disabled.
   */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /**
   * Check if dropdown allows multiple selections (has `multiple` attribute).
   */
  async isMultiple(): Promise<boolean> {
    const multiple = await this.locator.getAttribute("multiple");
    return multiple !== null;
  }

  // ───────────────────────────────────────────────────────────────
  // Selection (async)
  //  - Uses Playwright's selectOption under the hood.
  // ───────────────────────────────────────────────────────────────

  /**
   * Low-level selection helper.
   *
   * Select option(s) by value, label, index, or array of those.
   * Accepts string, object, or readonly array.
   */
  async selectOption(
    value:
      | string
      | { value?: string; label?: string; index?: number }
      | readonly (
          | string
          | { value?: string; label?: string; index?: number }
        )[],
    options?: Parameters<Locator["selectOption"]>[1]
  ): Promise<this> {
    await this.waitFor();
    // Playwright accepts mutable arrays — safe cast for readonly arrays.
    await this.locator.selectOption(value as any, options);
    return this;
  }

  /**
   * Select by visible text (label).
   *
   * This is the method you should use with your MATTER_SUBTYPE label
   * constants, e.g.:
   *
   *   await subtypeDropdown.selectByText(
   *     MATTER_SUBTYPE_OPTIONS.SUITS.CLASS_ACTION.label
   *   );
   */
  async selectByText(text: string): Promise<this> {
    return this.selectOption({ label: text });
  }

  /**
   * Select by option value (the underlying `value` attribute).
   *
   * Use this if your framework works in terms of codes like "suit_06".
   */
  async selectByValue(value: string): Promise<this> {
    return this.selectOption({ value });
  }

  /**
   * Select by option index (0-based index into <option> list).
   */
  async selectByIndex(index: number): Promise<this> {
    return this.selectOption({ index });
  }

  /**
   * Clear all selections (multi-select only).
   */
  async clearSelection(): Promise<this> {
    return this.selectOption([]);
  }

  /**
   * Select multiple option values (for multi-selects).
   *
   * NOTE: These are option *values* (not labels).
   */
  async selectMultiple(values: readonly string[]): Promise<this> {
    return this.selectOption(values);
  }

  /**
   * Wait until dropdown is visible & enabled, then select by text.
   */
  async waitUntilEnabledAndSelectByText(
    text: string,
    timeout = 10_000
  ): Promise<this> {
    await this.waitUntilReady(timeout);
    await this.selectByText(text);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Getters (async)
  // ───────────────────────────────────────────────────────────────

  /**
   * Get selected value(s).
   *
   * For single-select: returns a string value.
   * For multi-select: returns an array of selected values.
   */
  async getSelectedValue(): Promise<string | string[]> {
    if (await this.isMultiple()) {
      // Collect values from selected <option> elements
      return await this.optionsLocator.evaluateAll((els) =>
        (els as HTMLOptionElement[])
          .filter((el) => el.selected)
          .map((el) => el.value)
      );
    }

    // Single-select: underlying control value
    return await this.locator.inputValue();
  }

  /**
   * Get selected value(s) as an array, regardless of single-/multi-select.
   */
  async getSelectedValuesArray(): Promise<string[]> {
    const selected = await this.getSelectedValue();
    return Array.isArray(selected) ? selected : [selected];
  }

  /**
   * Get selected option text(s).
   *  - Single-select: string
   *  - Multi-select: string[]
   */
  async getSelectedText(): Promise<string | string[]> {
    const texts = await this.optionsLocator.evaluateAll((els) =>
      (els as HTMLOptionElement[])
        .filter((el) => el.selected)
        .map((el) => el.textContent?.trim() ?? "")
    );
    return texts.length === 1 ? texts[0] : texts;
  }

  /**
   * Get selected option text(s) as an array.
   */
  async getSelectedTextsArray(): Promise<string[]> {
    const selected = await this.getSelectedText();
    return Array.isArray(selected) ? selected : [selected];
  }

  /** Get all option texts. */
  async getAllOptionTexts(): Promise<string[]> {
    return (await this.optionsLocator.allTextContents()).map((t) => t.trim());
  }

  /** Get all option values. */
  async getAllOptionValues(): Promise<string[]> {
    return await this.optionsLocator.evaluateAll((els) =>
      (els as HTMLOptionElement[]).map((el) => el.value)
    );
  }

  /** Get the <select> name attribute. */
  async getName(): Promise<string | null> {
    return await this.locator.getAttribute("name");
  }

  // ───────────────────────────────────────────────────────────────
  // Actions (advanced)
  // ───────────────────────────────────────────────────────────────

  /** Focus the dropdown. */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /** Remove focus from the dropdown. */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /** Press a key (e.g., 'ArrowDown', 'Enter'). */
  async press(key: string): Promise<this> {
    await this.locator.press(key);
    return this;
  }

  /** Scroll dropdown into view if needed. */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Take a screenshot of just the dropdown.
   *
   * @param path Optional path; if provided, writes screenshot to disk.
   * @returns The screenshot Buffer.
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions (async – wrap Playwright's auto-retrying expect)
  // ───────────────────────────────────────────────────────────────

  /** Assert single selected value (for single-select dropdowns). */
  async shouldHaveValue(expected: string): Promise<this> {
    await expect(this.locator).toHaveValue(expected);
    return this;
  }

  /** Assert multiple selected values (for multi-select dropdowns). */
  async shouldHaveValues(expected: readonly string[]): Promise<this> {
    await expect(this.locator).toHaveValues(expected as string[]);
    return this;
  }

  /** Assert the selected text (label) for single-select dropdowns. */
  async shouldHaveSelectedText(expected: string | RegExp): Promise<this> {
    const selectedText = await this.getSelectedText();
    await expect
      .soft(selectedText)
      .toMatch(
        expected instanceof RegExp ? expected : new RegExp(`^${expected}$`)
      );
    return this;
  }

  /** Assert the selected texts (labels) for multi-select dropdowns. */
  async shouldHaveSelectedTexts(expected: readonly string[]): Promise<this> {
    const texts = await this.getSelectedTextsArray();
    await expect.soft(texts).toEqual(expected as string[]);
    return this;
  }

  /** Assert dropdown is visible. */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /** Assert dropdown is hidden. */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert dropdown is enabled. */
  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  /** Assert dropdown is disabled. */
  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  /** Assert dropdown is focused. */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Assert dropdown intersects the viewport.
   *
   * @param options.ratio   0–1: how much of the element must be visible.
   * @param options.timeout Assertion timeout override (optional).
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  /**
   * Assert dropdown contains an option with the given text (label).
   *
   * This is what you want for:
   *   await subtypeDropdown.shouldContainOption(
   *     MATTER_SUBTYPE_OPTIONS.SUITS.CLASS_ACTION.label
   *   );
   */
  async shouldContainOption(text: string): Promise<this> {
    await expect(this.optionsLocator).toContainText(text);
    return this;
  }

  /**
   * Assert dropdown has exactly the given option texts (in order).
   */
  async shouldHaveOptions(expected: readonly string[]): Promise<this> {
    await expect(this.optionsLocator).toHaveText(expected as string[]);
    return this;
  }

  /** Assert dropdown is marked as multiple. */
  async shouldBeMultiple(): Promise<this> {
    await expect(this.locator).toHaveAttribute("multiple", "");
    return this;
  }

  /** Assert dropdown has specific name attribute. */
  async shouldHaveName(expected: string): Promise<this> {
    await expect(this.locator).toHaveAttribute("name", expected);
    return this;
  }

  /** Assert dropdown has aria-label. */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /** Assert dropdown has a specific accessible name. */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /** Assert dropdown has a specific accessible description. */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /** Wait for dropdown to be visible and enabled. */
  async waitUntilReady(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeEnabled({ timeout });
    return this;
  }

  /** Wait for a specific single value (single-select dropdowns). */
  async waitForValue(value: string, timeout = 10_000): Promise<this> {
    await expect(this.locator).toHaveValue(value, { timeout });
    return this;
  }

  /** Wait for multiple values (multi-select dropdowns). */
  async waitForValues(
    values: readonly string[],
    timeout = 10_000
  ): Promise<this> {
    await expect(this.locator).toHaveValues(values as string[], { timeout });
    return this;
  }

  /** Wait for an option with the given text to appear. */
  async waitForOption(text: string, timeout = 10_000): Promise<this> {
    await expect(this.optionsLocator.getByText(text)).toBeVisible({ timeout });
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Compound actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Select by text (label) and verify resulting value.
   *
   * Useful when your test data includes both the label and the expected code.
   */
  async selectAndVerify(text: string, value: string): Promise<this> {
    await this.selectByText(text);
    await this.shouldHaveValue(value);
    return this;
  }

  /**
   * Select by text (label) and verify the selected text.
   *
   * This is often what you want when using label-driven test data:
   *
   *   await matterTypeDropdown
   *     .selectByText(MATTER_TYPE_OPTIONS.SUITS)
   *     .selectByTextAndVerifySelectedText(MATTER_TYPE_OPTIONS.SUITS);
   */
  async selectByTextAndVerifySelectedText(text: string): Promise<this> {
    await this.selectByText(text);
    await this.shouldHaveSelectedText(text);
    return this;
  }

  /**
   * Select multiple option values and verify the selected values.
   *
   * @param valuesToSelect - Option values to select (multi-select only).
   * @param expectedValues - Expected selected values after selection.
   */
  async selectMultipleAndVerify(
    valuesToSelect: readonly string[],
    expectedValues: readonly string[]
  ): Promise<this> {
    await this.selectMultiple(valuesToSelect);
    await this.shouldHaveValues(expectedValues);
    return this;
  }
}
