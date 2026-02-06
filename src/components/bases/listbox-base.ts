// src/components/bases/listbox-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * ListBoxBase
 * -----------
 * Chainable base class for ARIA listbox components (role="listbox").
 *
 * Designed for patterns such as:
 *   <div role="listbox" aria-label="States">
 *     <div role="option" aria-selected="true">Maine</div>
 *     <div role="option">New Hampshire</div>
 *   </div>
 *
 * Core features:
 *   - Option selection by text, index, or keyboard navigation
 *   - Querying visible/selected option texts
 *   - Accessibility-focused assertions (ARIA attributes, selection state)
 *   - Waiters for visibility, options, and selection changes
 *   - Keyboard interaction support (ArrowUp/Down, type-ahead search)
 *
 * Construction patterns:
 *   - Selector-based: `new ListBoxBase(page, '[role="listbox"]')`
 *   - Locator-based: `new ListBoxBase(page.getByRole("listbox", { name: "States" }))`
 *
 * Recommended usage with ComponentFactory:
 *   ```ts
 *   const $ = new ComponentFactory(page);
 *   const statesList = $.listboxByRoleName("States");
 *
 *   await statesList
 *     .shouldBeVisible()
 *     .shouldContainOption("Maine")
 *     .selectByText("Maine")
 *     .shouldHaveSelected("Maine");
 *   ```
 */
export class ListBoxBase {
  /** Underlying Playwright Locator for the listbox container (role="listbox"). */
  readonly locator: Locator;

  /** Locator for all option elements (role="option") inside this listbox. */
  private readonly optionsLocator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string (CSS, XPath, etc).
   *
   * @param page - The Playwright Page instance
   * @param selector - Selector string pointing to the listbox
   * @example
   *   const listbox = new ListBoxBase(page, '[role="listbox"][aria-label="States"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator already pointing to the listbox.
   *
   * @param locator - Pre-resolved Locator for the listbox
   * @example
   *   const listbox = new ListBoxBase(page.getByRole("listbox", { name: "States" }));
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      this.locator = (pageOrLocator as Page).locator(selector);
    } else {
      this.locator = pageOrLocator as Locator;
    }

    this.optionsLocator = this.locator.getByRole("option");
  }

  /**
   * Returns the underlying Locator for advanced / custom operations.
   *
   * @returns The raw Playwright Locator for this listbox
   */
  asLocator(): Locator {
    return this.locator;
  }

  /**
   * Internal helper: Gets a Locator for an option by its accessible name/text.
   *
   * @param text - Exact or partial accessible name of the option
   * @returns Locator pointing to the matching option
   */
  private optionByText(text: string): Locator {
    return this.locator.getByRole("option", { name: text });
  }

  /**
   * Internal helper: Gets a Locator for an option by its 0-based index.
   *
   * @param index - 0-based index of the option
   * @returns Locator pointing to the nth option
   */
  private optionByIndex(index: number): Locator {
    return this.optionsLocator.nth(index);
  }

  // ───────────────────────────────────────────────────────────────
  // Wait & Visibility / State
  // ───────────────────────────────────────────────────────────────

  /**
   * Waits for the listbox to reach the desired state (visible by default).
   *
   * @param options - Optional wait configuration
   * @param options.timeout - Max wait time (ms)
   * @param options.state - "visible" | "attached" | "hidden" etc.
   * @returns this (chainable)
   */
  async waitFor(options?: {
    timeout?: number;
    state?: "visible" | "attached" | "hidden";
  }): Promise<this> {
    await this.locator.waitFor({
      state: options?.state ?? "visible",
      timeout: options?.timeout ?? 30_000,
    });
    return this;
  }

  /**
   * Checks if the listbox is currently visible.
   *
   * @returns True if visible
   */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /**
   * Checks if the listbox is disabled (via aria-disabled or disabled attribute).
   *
   * @returns True if disabled
   */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /**
   * Checks if the listbox is enabled (not disabled).
   *
   * @returns True if enabled
   */
  async isEnabled(): Promise<boolean> {
    return !(await this.isDisabled());
  }

  /**
   * Checks whether an option with the given text exists in the listbox.
   *
   * @param text - Text or accessible name to look for
   * @returns True if at least one matching option exists
   */
  async isOptionPresent(text: string): Promise<boolean> {
    return (await this.optionByText(text).count()) > 0;
  }

  /**
   * Checks if the specified option text is currently selected (aria-selected="true").
   *
   * @param text - Option text to check
   * @returns True if selected
   */
  async isOptionSelected(text: string): Promise<boolean> {
    const selected = await this.getSelectedOptionTexts();
    return selected.includes(text);
  }

  // ───────────────────────────────────────────────────────────────
  // Selection Actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Selects an option by clicking its visible/accessible text.
   *
   * @param text - Exact or partial text of the option
   * @returns this (chainable)
   * @example
   *   await listbox.selectByText("California");
   */
  async selectByText(text: string): Promise<this> {
    await this.optionByText(text).click();
    return this;
  }

  /**
   * Selects an option by its 0-based index.
   *
   * @param index - 0-based position in the list
   * @returns this (chainable)
   */
  async selectByIndex(index: number): Promise<this> {
    await this.optionByIndex(index).click();
    return this;
  }

  /**
   * Selects multiple options by text (assumes multi-select is supported via click).
   *
   * @param texts - Array of option texts to select
   * @returns this (chainable)
   * @note For keyboard multi-select (Ctrl+click simulation), use custom logic.
   */
  async selectMultipleByText(texts: readonly string[]): Promise<this> {
    for (const text of texts) {
      await this.optionByText(text).click();
    }
    return this;
  }

  /**
   * Deselects an option by text if currently selected (click again).
   *
   * @param text - Option text to deselect
   * @returns this (chainable)
   */
  async deselectByText(text: string): Promise<this> {
    if (await this.isOptionSelected(text)) {
      await this.optionByText(text).click();
    }
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Keyboard Navigation (ARIA listbox best practices)
  // ───────────────────────────────────────────────────────────────

  /**
   * Focuses the listbox and presses ArrowDown repeatedly to select an option.
   *
   * @param times - Number of ArrowDown presses (default 1)
   * @returns this (chainable)
   * @note Assumes first focus selects first item or follows ARIA spec
   */
  async selectByKeyboardArrowDown(times = 1): Promise<this> {
    await this.focus();
    for (let i = 0; i < times; i++) {
      await this.press("ArrowDown");
    }
    return this;
  }

  /**
   * Focuses the listbox and presses ArrowUp repeatedly.
   *
   * @param times - Number of ArrowUp presses (default 1)
   * @returns this (chainable)
   */
  async selectByKeyboardArrowUp(times = 1): Promise<this> {
    await this.focus();
    for (let i = 0; i < times; i++) {
      await this.press("ArrowUp");
    }
    return this;
  }

  /**
   * Presses Enter to activate/confirm the currently focused option.
   *
   * @returns this (chainable)
   */
  async selectCurrentFocusedOption(): Promise<this> {
    await this.press("Enter");
    return this;
  }

  /**
   * Focuses listbox and types characters to trigger type-ahead search.
   *
   * @param text - Text to type (e.g. "Cal" to jump to California)
   * @returns this (chainable)
   * @note Depends on listbox implementing type-ahead (common in ARIA-compliant ones)
   */
  async focusAndTypeToSearch(text: string): Promise<this> {
    await this.focus();
    await this.locator.pressSequentially(text, { delay: 100 });
    return this;
  }

  /**
   * Gets the text of the currently focused option (if any).
   *
   * @returns Text of focused option or empty string
   */
  async getFocusedOptionText(): Promise<string> {
    const focused = await this.optionsLocator.evaluateAll(
      (els) =>
        els.find((el) => el === document.activeElement)?.textContent?.trim() ??
        "",
    );
    return focused ?? "";
  }

  // ───────────────────────────────────────────────────────────────
  // Getters
  // ───────────────────────────────────────────────────────────────

  /**
   * Retrieves the text content of all options (trimmed).
   *
   * @returns Array of option texts
   */
  async getAllOptionTexts(): Promise<string[]> {
    return (await this.optionsLocator.allTextContents()).map((t) => t.trim());
  }

  /**
   * Returns the total number of options.
   *
   * @returns Number of options
   */
  async getOptionCount(): Promise<number> {
    return await this.optionsLocator.count();
  }

  /**
   * Gets texts of all currently selected options (aria-selected="true").
   *
   * @returns Array of selected option texts
   */
  async getSelectedOptionTexts(): Promise<string[]> {
    return await this.optionsLocator.evaluateAll((els) =>
      els
        .filter((el) => el.getAttribute("aria-selected") === "true")
        .map((el) => el.textContent?.trim() ?? ""),
    );
  }

  // ───────────────────────────────────────────────────────────────
  // Focus & Low-level Actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Focuses the listbox.
   *
   * @returns this (chainable)
   */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /**
   * Removes focus from the listbox.
   *
   * @returns this (chainable)
   */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /**
   * Presses a key while the listbox (or focused option) is active.
   *
   * @param key - Key name (e.g. "ArrowDown", "Enter", "a")
   * @param options - Press options (delay, etc.)
   * @returns this (chainable)
   */
  async press(
    key: string,
    options?: Parameters<Locator["press"]>[1],
  ): Promise<this> {
    await this.locator.press(key, options);
    return this;
  }

  /**
   * Scrolls the listbox into view if needed.
   *
   * @returns this (chainable)
   */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Captures a screenshot of the listbox.
   *
   * @param path - Optional file path to save screenshot
   * @returns Buffer of the screenshot
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions (chainable)
  // ───────────────────────────────────────────────────────────────

  /**
   * Asserts the listbox is visible.
   *
   * @returns this (chainable)
   */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /**
   * Asserts the listbox is hidden/not visible.
   *
   * @returns this (chainable)
   */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Alias for {@link shouldBeHidden} */
  async shouldNotBeVisible(): Promise<this> {
    return this.shouldBeHidden();
  }

  /**
   * Asserts the listbox is enabled.
   *
   * @returns this (chainable)
   */
  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  /**
   * Asserts the listbox is disabled.
   *
   * @returns this (chainable)
   */
  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  async shouldNotBeDisabled(): Promise<this> {
    await expect(this.locator).not.toBeDisabled();
    return this;
  }

  /**
   * Asserts the listbox (or an option) is focused.
   *
   * @returns this (chainable)
   */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Asserts the listbox is in the viewport.
   *
   * @param options - In-viewport assertion options
   * @returns this (chainable)
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  /**
   * Asserts an option with the given text exists.
   *
   * @param text - Text or RegExp to match
   * @returns this (chainable)
   */
  async shouldContainOption(text: string | RegExp): Promise<this> {
    await expect(this.optionsLocator).toContainText(text);
    return this;
  }

  /**
   * Asserts the listbox contains exactly the expected option texts (in order).
   *
   * @param expected - Ordered array of expected option texts
   * @returns this (chainable)
   */
  async shouldHaveOptions(expected: readonly string[]): Promise<this> {
    await expect(this.optionsLocator).toHaveText(expected as string[]);
    return this;
  }

  /**
   * Asserts a specific option is selected (retries via poll).
   *
   * @param expected - Text that must be selected
   * @param timeout - Max wait time (ms)
   * @returns this (chainable)
   */
  async shouldHaveSelected(expected: string, timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.getSelectedOptionTexts(), { timeout })
      .toContain(expected);
    return this;
  }

  /**
   * Asserts multiple specific options are selected (order-insensitive).
   *
   * @param expected - Array of texts that must all be selected
   * @param timeout - Max wait time (ms)
   * @returns this (chainable)
   */
  async shouldHaveSelectedOptions(
    expected: readonly string[],
    timeout = 10_000,
  ): Promise<this> {
    const expectedMutable = [...expected];
    await expect
      .poll(async () => await this.getSelectedOptionTexts(), { timeout })
      .toEqual(expect.arrayContaining(expectedMutable));
    return this;
  }

  /**
   * Asserts the listbox has a specific aria-label.
   *
   * @param expected - Expected aria-label value or pattern
   * @returns this (chainable)
   */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /**
   * Asserts the listbox has the given accessible name.
   *
   * @param expected - Expected accessible name
   * @returns this (chainable)
   */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /**
   * Asserts the listbox has the given accessible description.
   *
   * @param expected - Expected description
   * @returns this (chainable)
   */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  /**
   * Asserts the listbox has a specific class (or matches pattern).
   *
   * @param expected - Class name or RegExp
   * @returns this (chainable)
   */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /**
   * Asserts a specific attribute exists with expected value.
   *
   * @param name - Attribute name
   * @param value - Expected value or pattern
   * @returns this (chainable)
   */
  async shouldHaveAttribute(
    name: string,
    value: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute(name, value);
    return this;
  }

  /**
   * Asserts an attribute does NOT exist (or is empty).
   *
   * @param name - Attribute name
   * @returns this (chainable)
   */
  async shouldNotHaveAttribute(name: string): Promise<this> {
    await expect(this.locator).not.toHaveAttribute(name, /.*/);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Specialized Waiters
  // ───────────────────────────────────────────────────────────────

  /**
   * Waits until an option with the given text appears.
   *
   * @param text - Option text to wait for
   * @param timeout - Max wait time (ms)
   * @returns this (chainable)
   */
  async waitForOption(text: string, timeout = 10_000): Promise<this> {
    await expect(this.optionsLocator.getByText(text)).toBeVisible({ timeout });
    return this;
  }

  /**
   * Waits until at least one option is selected.
   *
   * @param timeout - Max wait time (ms)
   * @returns this (chainable)
   */
  async waitUntilAnySelected(timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => (await this.getSelectedOptionTexts()).length, {
        timeout,
      })
      .toBeGreaterThan(0);
    return this;
  }

  /**
   * Waits until a specific option is selected.
   *
   * @param text - Option text expected to be selected
   * @param timeout - Max wait time (ms)
   * @returns this (chainable)
   */
  async waitUntilSelected(text: string, timeout = 10_000): Promise<this> {
    await this.shouldHaveSelected(text, timeout);
    return this;
  }
}
