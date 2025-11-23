// src/components/bases/listbox-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * ListBoxBase
 * -----------
 * Chainable base class for ARIA listbox components.
 *
 * Intended for patterns like:
 *   <div role="listbox" aria-label="States">
 *     <div role="option" aria-selected="true">Maine</div>
 *     <div role="option">New Hampshire</div>
 *   </div>
 *
 * This wraps:
 *  - Option selection by text or index
 *  - Querying option texts & selected options
 *  - Accessibility-aware assertions
 *  - Waiters for options & selection
 *
 * Construction patterns:
 *  - Selector-based:
 *      const listbox = new ListBoxBase(page, '[role="listbox"]');
 *  - Locator-based:
 *      const listbox = new ListBoxBase(
 *        page.getByRole("listbox", { name: "States" })
 *      );
 *
 * Example usage with your ComponentFactory:
 *
 *   const $ = new ComponentFactory(page);
 *   const statesList = $.listboxByRoleName("States");
 *
 *   await statesList
 *     .shouldBeVisible()
 *     .shouldContainOption("Maine")
 *     .selectByText("Maine")
 *     .shouldHaveSelected("Maine");
 */
export class ListBoxBase {
  /** Underlying Playwright Locator for the listbox container. */
  readonly locator: Locator;

  /** Locator for all option elements inside this listbox. */
  private readonly optionsLocator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string (CSS/xpath/etc).
   *
   * @example
   *   const listbox = new ListBoxBase(page, '[role="listbox"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator pointing at the listbox.
   *
   * @example
   *   const listbox = new ListBoxBase(
   *     page.getByRole("listbox", { name: "States" })
   *   );
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      // Usage: new ListBoxBase(page, '[role="listbox"]')
      this.locator = (pageOrLocator as Page).locator(selector);
    } else {
      // Usage: new ListBoxBase(page.getByRole('listbox', { name: 'States' }))
      this.locator = pageOrLocator as Locator;
    }

    this.optionsLocator = this.locator.getByRole("option");
  }

  /**
   * Expose the underlying Locator for advanced operations.
   */
  asLocator(): Locator {
    return this.locator;
  }

  /**
   * Get a Locator for an option by its accessible text.
   */
  private optionByText(text: string): Locator {
    return this.locator.getByRole("option", { name: text });
  }

  /**
   * Get a Locator for an option by index (0-based).
   */
  private optionByIndex(index: number): Locator {
    return this.optionsLocator.nth(index);
  }

  // ───────────────────────────────────────────────────────────────
  // Wait & state
  // ───────────────────────────────────────────────────────────────

  /** Wait for listbox to be visible or attached. */
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

  /** Check if listbox is visible. */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /** Check if listbox is disabled (ARIA or native). */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /** Check if listbox is enabled. */
  async isEnabled(): Promise<boolean> {
    return !(await this.isDisabled());
  }

  /** Check if a given option text is present in the listbox. */
  async isOptionPresent(text: string): Promise<boolean> {
    return await this.optionByText(text)
      .count()
      .then((c) => c > 0);
  }

  /** Check if a given option text is selected (aria-selected="true"). */
  async isOptionSelected(text: string): Promise<boolean> {
    const selectedTexts = await this.getSelectedOptionTexts();
    return selectedTexts.includes(text);
  }

  // ───────────────────────────────────────────────────────────────
  // Selection (async)
  // ───────────────────────────────────────────────────────────────

  /**
   * Select an option by its visible text (accessible name).
   */
  async selectByText(text: string): Promise<this> {
    await this.optionByText(text).click();
    return this;
  }

  /**
   * Select an option by index (0-based).
   */
  async selectByIndex(index: number): Promise<this> {
    await this.optionByIndex(index).click();
    return this;
  }

  /**
   * Select multiple options by text.
   *
   * NOTE: This assumes your listbox supports multi-selection via clicks.
   * For keyboard-based multi-select, you'd need a different strategy.
   */
  async selectMultipleByText(texts: readonly string[]): Promise<this> {
    for (const text of texts) {
      await this.optionByText(text).click();
    }
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Getters (async)
  // ───────────────────────────────────────────────────────────────

  /** Get all option texts. */
  async getAllOptionTexts(): Promise<string[]> {
    return (await this.optionsLocator.allTextContents()).map((t) => t.trim());
  }

  /** Get the number of options in the listbox. */
  async getOptionCount(): Promise<number> {
    return await this.optionsLocator.count();
  }

  /**
   * Get texts of selected options.
   *
   * Uses aria-selected="true" as the selection marker.
   */
  async getSelectedOptionTexts(): Promise<string[]> {
    return await this.optionsLocator.evaluateAll((els) =>
      els
        .filter((el) => el.getAttribute("aria-selected") === "true")
        .map((el) => el.textContent?.trim() ?? "")
    );
  }

  // ───────────────────────────────────────────────────────────────
  // Actions (advanced)
  // ───────────────────────────────────────────────────────────────

  /** Focus the listbox. */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /** Blur the listbox (remove focus). */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /** Press a key while the listbox is focused (e.g., ArrowDown, Enter). */
  async press(
    key: string,
    options?: Parameters<Locator["press"]>[1]
  ): Promise<this> {
    await this.locator.press(key, options);
    return this;
  }

  /** Scroll listbox into view. */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Take a screenshot of just the listbox.
   *
   * @param path Optional path; if provided, writes screenshot to disk.
   * @returns The screenshot Buffer.
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions (async – mix of locator and value assertions)
  // ───────────────────────────────────────────────────────────────

  /** Assert listbox is visible. */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /** Assert listbox is hidden. */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert listbox is not visible (alias). */
  async shouldNotBeVisible(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert listbox is enabled. */
  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  /** Assert listbox is disabled. */
  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  /** Assert listbox is focused. */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Assert listbox intersects the viewport.
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  /**
   * Assert listbox contains an option with the given text.
   */
  async shouldContainOption(text: string | RegExp): Promise<this> {
    await expect(this.optionsLocator).toContainText(text);
    return this;
  }

  /**
   * Assert listbox has exactly the given option texts (in order).
   */
  async shouldHaveOptions(expected: readonly string[]): Promise<this> {
    await expect(this.optionsLocator).toHaveText(expected as string[]);
    return this;
  }

  /**
   * Assert a single option is selected by text.
   *
   * Uses expect.poll for retry-friendly selection checks.
   */
  async shouldHaveSelected(expected: string, timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.getSelectedOptionTexts(), { timeout })
      .toContain(expected);
    return this;
  }

  /**
   * Assert multiple options are selected by text (order-insensitive).
   */
  async shouldHaveSelectedOptions(
    expected: readonly string[],
    timeout = 10_000
  ): Promise<this> {
    const expectedMutable = [...expected]; // <-- fixes readonly → mutable safely

    await expect
      .poll(async () => await this.getSelectedOptionTexts(), { timeout })
      .toEqual(expect.arrayContaining(expectedMutable));

    return this;
  }

  /** Assert listbox has aria-label. */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /** Assert listbox has a specific accessible name. */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /** Assert listbox has a specific accessible description. */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  /** Assert listbox has specific class or matches a class pattern. */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /** Assert listbox has a specific attribute and value. */
  async shouldHaveAttribute(
    name: string,
    value: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute(name, value);
    return this;
  }

  /** Assert listbox does *not* have a given attribute. */
  async shouldNotHaveAttribute(name: string): Promise<this> {
    await expect(this.locator).not.toHaveAttribute(name, /.*/);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /** Wait for an option with the given text to appear. */
  async waitForOption(text: string, timeout = 10_000): Promise<this> {
    await expect(this.optionsLocator.getByText(text)).toBeVisible({ timeout });
    return this;
  }

  /** Wait until at least one option is selected. */
  async waitUntilAnySelected(timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => (await this.getSelectedOptionTexts()).length, {
        timeout,
      })
      .toBeGreaterThan(0);
    return this;
  }

  /** Wait until a specific option text is selected. */
  async waitUntilSelected(text: string, timeout = 10_000): Promise<this> {
    await this.shouldHaveSelected(text, timeout);
    return this;
  }
}
