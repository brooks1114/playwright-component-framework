// components/bases/listbox-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * Chainable base class for ARIA listbox components.
 *
 * Intended for patterns like:
 *   <div role="listbox"> ... <div role="option">Option</div> ... </div>
 *
 * Wraps option selection, querying, and assertions.
 *
 * All methods that talk to the page or use Playwright's async expect()
 * are async and return `this` for chaining, unless noted otherwise.
 *
 * Construction:
 *  - new ListBoxBase(page, '[role="listbox"]');
 *  - new ListBoxBase(page.getByRole('listbox', { name: 'States' }));
 *
 * @example
 * const listbox = new ListBoxBase(page, '[role="listbox"]');
 * await listbox.selectByText('Admin');
 * await listbox.shouldHaveSelected('Admin');
 */
export class ListBoxBase {
  readonly locator: Locator;
  private readonly optionsLocator: Locator;

  // === CONSTRUCTORS (overloads) ===

  /**
   * Construct from a Page and a selector string (CSS/xpath/etc).
   */
  constructor(page: Page, selector: string);
  /**
   * Construct directly from an existing Locator pointing at the listbox.
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

  // === WAIT & STATE ===

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

  // === SELECTION (async) ===

  /**
   * Select an option by its visible text (accessible name).
   */
  async selectByText(text: string): Promise<this> {
    await this.locator.getByRole("option", { name: text }).click();
    return this;
  }

  /**
   * Select an option by index (0-based).
   */
  async selectByIndex(index: number): Promise<this> {
    await this.optionsLocator.nth(index).click();
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
      await this.locator.getByRole("option", { name: text }).click();
    }
    return this;
  }

  // === GETTERS (async) ===

  /** Get all option texts. */
  async getAllOptionTexts(): Promise<string[]> {
    return (await this.optionsLocator.allTextContents()).map((t) => t.trim());
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

  // === ACTIONS (advanced) ===

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

  /** Scroll listbox into view. */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /** Take a screenshot of just the listbox. */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // === ASSERTIONS (async – mix of locator and value assertions) ===

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
   * Uses a value-based assertion (non-retrying) on top of `getSelectedOptionTexts`.
   */
  async shouldHaveSelected(expected: string): Promise<this> {
    const selected = await this.getSelectedOptionTexts();
    expect(selected).toContain(expected);
    return this;
  }

  /**
   * Assert multiple options are selected by text (order-insensitive).
   */
  async shouldHaveSelectedOptions(expected: readonly string[]): Promise<this> {
    const selected = await this.getSelectedOptionTexts();
    for (const text of expected) {
      expect(selected).toContain(text);
    }
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

  // === WAITERS ===

  /** Wait for an option with the given text to appear. */
  async waitForOption(text: string, timeout = 10_000): Promise<this> {
    await expect(this.optionsLocator.getByText(text)).toBeVisible({ timeout });
    return this;
  }
}
