// components/bases/radio-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * Chainable, type-safe base class for radio controls.
 *
 * Supports:
 * - <input type="radio">
 * - Elements with role="radio" (when used with proper locators)
 *
 * Wraps Playwright locator actions, check helpers, attributes, and assertions.
 *
 * All methods that talk to the page or use Playwright's async expect()
 * are async and return `this` for chaining, unless noted otherwise.
 *
 * Construction:
 *  - new RadioBase(page, 'input[name="role"][value="admin"]');
 *  - new RadioBase(page.getByLabel('Admin'));
 *
 * @example
 * const radio = new RadioBase(page, 'input[name="role"][value="admin"]');
 * await radio.check();
 * await radio.shouldBeChecked();
 */
export class RadioBase {
  readonly locator: Locator;

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
      // Usage: new RadioBase(page, 'input[name="role"][value="admin"]')
      this.locator = (pageOrLocator as Page).locator(selector);
    } else {
      // Usage: new RadioBase(page.getByLabel('Admin'))
      this.locator = pageOrLocator as Locator;
    }
  }

  // === WAIT & STATE ===

  /** Wait for radio to be visible or attached. */
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

  /** Check if radio is visible. */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /** Check if radio is enabled. */
  async isEnabled(): Promise<boolean> {
    return await this.locator.isEnabled();
  }

  /** Check if radio is disabled. */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /** Check if radio is checked. */
  async isChecked(): Promise<boolean> {
    return await this.locator.isChecked();
  }

  // === ACTIONS (async) ===

  /**
   * Click the radio (typically selects it).
   */
  async click(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click(options);
    return this;
  }

  /**
   * Check the radio if not already checked.
   *
   * Playwright's `check` is designed for radios and checkboxes.
   */
  async check(options?: Parameters<Locator["check"]>[0]): Promise<this> {
    await this.locator.check(options);
    return this;
  }

  /**
   * Explicitly set checked state.
   *
   * NOTE: For standard radios, setting `false` may not be supported
   * by the underlying implementation. Prefer `check()` for normal usage.
   */
  async setChecked(
    checked: boolean,
    options?: Parameters<Locator["setChecked"]>[1]
  ): Promise<this> {
    await this.locator.setChecked(checked, options);
    return this;
  }

  /** Focus the radio. */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /** Blur the radio (remove focus). */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /** Scroll radio into view. */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /** Take a screenshot of just the radio. */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // === GETTERS (async) ===

  /** Get the radio value attribute (if present). */
  async getValue(): Promise<string | null> {
    return await this.locator.getAttribute("value");
  }

  /** Get the radio name (if present). */
  async getName(): Promise<string | null> {
    return await this.locator.getAttribute("name");
  }

  /** Get the aria-checked attribute (if present). */
  async getAriaChecked(): Promise<string | null> {
    return await this.locator.getAttribute("aria-checked");
  }

  // === ASSERTIONS (async – wrap Playwright's auto-retrying expect) ===

  /** Assert radio is checked. */
  async shouldBeChecked(): Promise<this> {
    await expect(this.locator).toBeChecked();
    return this;
  }

  /** Assert radio is not checked. */
  async shouldBeUnchecked(): Promise<this> {
    await expect(this.locator).not.toBeChecked();
    return this;
  }

  /** Assert radio is visible. */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /** Assert radio is hidden. */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert radio is enabled. */
  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  /** Assert radio is disabled. */
  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  /** Assert radio is focused. */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Assert radio intersects the viewport.
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  /** Assert radio has specific value attribute. */
  async shouldHaveValue(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("value", expected);
    return this;
  }

  /** Assert radio has specific name attribute. */
  async shouldHaveName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("name", expected);
    return this;
  }

  /** Assert radio has specific class or matches a class pattern. */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /** Assert radio has aria-label. */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /** Assert radio has aria-checked with a specific value. */
  async shouldHaveAriaChecked(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-checked", expected);
    return this;
  }

  /** Assert radio has a specific accessible name. */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /** Assert radio has a specific accessible description. */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  // === WAITERS ===

  /** Wait for radio to be visible and enabled. */
  async waitUntilReady(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeEnabled({ timeout });
    return this;
  }

  /** Wait until radio becomes checked. */
  async waitUntilChecked(timeout = 10_000): Promise<this> {
    await expect(this.locator).toBeChecked({ timeout });
    return this;
  }

  /** Wait until radio becomes unchecked. */
  async waitUntilUnchecked(timeout = 10_000): Promise<this> {
    await expect(this.locator).not.toBeChecked({ timeout });
    return this;
  }
}
