// components/bases/checkbox-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * Chainable, type-safe base class for checkbox controls.
 *
 * Supports:
 * - <input type="checkbox">
 * - Elements with role="checkbox" (when used with proper locators)
 *
 * Wraps Playwright locator actions, check/uncheck helpers, attributes, and assertions.
 *
 * All methods that talk to the page or use Playwright's async expect()
 * are async and return `this` for chaining, unless noted otherwise.
 *
 * Construction:
 *  - new CheckboxBase(page, '#terms');
 *  - new CheckboxBase(page.getByLabel('I agree'));
 *
 * @example
 * const checkbox = new CheckboxBase(page, '#terms');
 * await checkbox.check();
 * await checkbox.shouldBeChecked();
 * await checkbox.uncheck();
 * await checkbox.shouldBeUnchecked();
 */
export class CheckboxBase {
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
      // Usage: new CheckboxBase(page, '#terms')
      this.locator = (pageOrLocator as Page).locator(selector);
    } else {
      // Usage: new CheckboxBase(page.getByLabel('I agree'))
      this.locator = pageOrLocator as Locator;
    }
  }

  // === WAIT & STATE ===

  /**
   * Wait for checkbox to be visible or attached.
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

  /** Check if checkbox is visible. */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /** Check if checkbox is enabled. */
  async isEnabled(): Promise<boolean> {
    return await this.locator.isEnabled();
  }

  /** Check if checkbox is disabled. */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /** Check if checkbox is checked. */
  async isChecked(): Promise<boolean> {
    return await this.locator.isChecked();
  }

  // === ACTIONS (async) ===

  /**
   * Click the checkbox (toggles state depending on implementation).
   *
   * Prefer using check()/uncheck()/setChecked() for explicit state.
   */
  async click(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click(options);
    return this;
  }

  /**
   * Check the checkbox if not already checked.
   */
  async check(options?: Parameters<Locator["check"]>[0]): Promise<this> {
    await this.locator.check(options);
    return this;
  }

  /**
   * Uncheck the checkbox if it is checked.
   */
  async uncheck(options?: Parameters<Locator["uncheck"]>[0]): Promise<this> {
    await this.locator.uncheck(options);
    return this;
  }

  /**
   * Explicitly set checked state.
   */
  async setChecked(
    checked: boolean,
    options?: Parameters<Locator["setChecked"]>[1]
  ): Promise<this> {
    await this.locator.setChecked(checked, options);
    return this;
  }

  /**
   * Focus the checkbox.
   */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /**
   * Blur the checkbox (remove focus).
   */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /**
   * Scroll checkbox into view.
   */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Take a screenshot of just the checkbox.
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // === GETTERS (async) ===

  /** Get the checkbox value attribute (if present). */
  async getValue(): Promise<string | null> {
    return await this.locator.getAttribute("value");
  }

  /** Get the checkbox name (if present). */
  async getName(): Promise<string | null> {
    return await this.locator.getAttribute("name");
  }

  /** Get the aria-checked attribute (useful for tri-state checkboxes). */
  async getAriaChecked(): Promise<string | null> {
    return await this.locator.getAttribute("aria-checked");
  }

  // === ASSERTIONS (async – wrap Playwright's auto-retrying expect) ===

  /** Assert checkbox is checked. */
  async shouldBeChecked(): Promise<this> {
    await expect(this.locator).toBeChecked();
    return this;
  }

  /** Assert checkbox is not checked. */
  async shouldBeUnchecked(): Promise<this> {
    await expect(this.locator).not.toBeChecked();
    return this;
  }

  /**
   * Assert checkbox is partially checked (indeterminate state).
   *
   * Uses the native `indeterminate` JS property on <input type="checkbox">.
   * If your app uses ARIA (aria-checked="mixed"), you can swap this implementation.
   */
  async shouldBePartiallyChecked(): Promise<this> {
    await expect(this.locator).toHaveJSProperty("indeterminate", true);
    return this;
  }

  /** Assert checkbox is visible. */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /** Assert checkbox is hidden. */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert checkbox is enabled. */
  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  /** Assert checkbox is disabled. */
  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  /** Assert checkbox is focused. */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Assert checkbox intersects the viewport.
   *
   * @param options.ratio 0–1: how much of the element must be visible.
   * @param options.timeout Assertion timeout override (optional).
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  /** Assert checkbox has specific value attribute. */
  async shouldHaveValue(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("value", expected);
    return this;
  }

  /** Assert checkbox has specific name attribute. */
  async shouldHaveName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("name", expected);
    return this;
  }

  /** Assert checkbox has specific class or matches a class pattern. */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /** Assert checkbox has aria-label. */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /** Assert checkbox has aria-checked with a specific value. */
  async shouldHaveAriaChecked(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-checked", expected);
    return this;
  }

  /** Assert checkbox has a specific accessible name. */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /** Assert checkbox has a specific accessible description. */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  // === WAITERS ===

  /** Wait for checkbox to be visible and enabled. */
  async waitUntilReady(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeEnabled({ timeout });
    return this;
  }

  /** Wait until checkbox becomes checked. */
  async waitUntilChecked(timeout = 10_000): Promise<this> {
    await expect(this.locator).toBeChecked({ timeout });
    return this;
  }

  /** Wait until checkbox becomes unchecked. */
  async waitUntilUnchecked(timeout = 10_000): Promise<this> {
    await expect(this.locator).not.toBeChecked({ timeout });
    return this;
  }
}
