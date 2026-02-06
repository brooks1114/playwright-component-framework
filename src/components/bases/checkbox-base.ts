// src/components/bases/checkbox-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * CheckboxBase
 * ------------
 * Chainable, type-safe base class for checkbox controls in a React application.
 *
 * Designed for:
 *  - Native `<input type="checkbox">` elements
 *  - Custom checkboxes using `role="checkbox"` with proper ARIA (when using React locators)
 *
 * Provides:
 *  - **Actions**: check, uncheck, toggle via click, force state, focus/blur
 *  - **State queries**: checked status, disabled, visible, value/name attributes, ARIA state
 *  - **Assertions**: fluent `shouldX()` methods using Playwright's auto-waiting `expect`
 *  - **Waiters**: readiness, state change waiting
 *
 * Supports two construction patterns:
 *  1. **Locator-based** (preferred – from `page.getByLabel()`, `page.getByRole()`, or ComponentFactory)
 *  2. **Selector-based** (fallback for legacy or non-React parts)
 *
 * @remarks
 * Always prefer locator-based construction when using ComponentFactory or React-specific locators
 * (`_react=...`, `getByRole`, `getByLabel`, etc.) for better resilience to DOM changes.
 *
 * @example
 * // Using ComponentFactory (recommended pattern)
 * const $ = new ComponentFactory(page);
 * const terms = $.checkboxByLabel("Accept terms and conditions");
 * await terms.shouldBeVisible().shouldBeEnabled().check().shouldBeChecked();
 *
 * @example
 * // Direct locator construction
 * const privacy = new CheckboxBase(page.getByRole("checkbox", { name: "Privacy policy" }));
 * await privacy.check();
 */
export class CheckboxBase {
  /** Underlying Playwright Locator that targets this checkbox control. */
  readonly locator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a CheckboxBase from a Page and CSS/XPath selector (fallback pattern).
   *
   * @param page - The Playwright Page instance
   * @param selector - CSS, XPath, or other selector string
   *
   * @example
   * const cb = new CheckboxBase(page, "#terms-agree");
   */
  constructor(page: Page, selector: string);

  /**
   * Creates a CheckboxBase directly from an existing Locator (preferred pattern).
   *
   * @param locator - Pre-resolved Playwright Locator (e.g. `page.getByLabel("Agree")`)
   *
   * @example
   * const cb = new CheckboxBase(page.getByLabel("I agree to the terms"));
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      this.locator = (pageOrLocator as Page).locator(selector);
    } else {
      this.locator = pageOrLocator as Locator;
    }
  }

  /**
   * Returns the underlying Playwright Locator for advanced or custom operations.
   *
   * @returns The raw Locator instance
   *
   * @example
   * await checkbox.asLocator().hover(); // access Playwright methods directly
   */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // Wait & State Queries
  // ───────────────────────────────────────────────────────────────

  /**
   * Waits for the checkbox to reach the desired state (visible or attached).
   *
   * @param options - Optional configuration
   * @param options.timeout - Maximum time to wait (ms)
   * @param options.state - Desired state ("visible" | "attached")
   * @returns This instance (for chaining)
   *
   * @example
   * await checkbox.waitFor({ timeout: 15_000 });
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
   * Checks whether the checkbox is currently visible on the page.
   *
   * @returns `true` if visible, `false` otherwise
   */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /**
   * Checks whether the checkbox is enabled (not disabled).
   *
   * @returns `true` if enabled, `false` if disabled
   */
  async isEnabled(): Promise<boolean> {
    return await this.locator.isEnabled();
  }

  /**
   * Checks whether the checkbox is disabled.
   *
   * @returns `true` if disabled, `false` otherwise
   */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /**
   * Checks the current checked state of the checkbox.
   *
   * @returns `true` if checked, `false` otherwise
   *
   * @remarks For ARIA-only checkboxes, consider `getAriaChecked()` as well.
   */
  async isChecked(): Promise<boolean> {
    return await this.locator.isChecked();
  }

  /**
   * Determines if the checkbox is in indeterminate (partially checked) state.
   *
   * @returns `true` if partially/indeterminate, `false` otherwise
   *
   * @remarks
   * Checks both native `indeterminate` property and `aria-checked="mixed"`.
   * Useful for tri-state checkboxes (e.g. "select all" with partial selection).
   */
  async isPartiallyChecked(): Promise<boolean> {
    const aria = await this.getAriaChecked();
    if (aria === "mixed") return true;

    return await this.locator.evaluate((el) => {
      const input = el as HTMLInputElement;
      return !!(input && "indeterminate" in input && input.indeterminate);
    });
  }

  // ───────────────────────────────────────────────────────────────
  // Actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Performs a click on the checkbox (usually toggles state).
   *
   * @param options - Click options (force, position, timeout, etc.)
   * @returns This instance (for chaining)
   *
   * @remarks Prefer `.check()` / `.uncheck()` / `.setChecked()` for explicit behavior.
   */
  async click(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click(options);
    return this;
  }

  /**
   * Checks the checkbox (sets to checked if not already).
   *
   * @param options - Check options (force, timeout, etc.)
   * @returns This instance (for chaining)
   */
  async check(options?: Parameters<Locator["check"]>[0]): Promise<this> {
    await this.locator.check(options);
    return this;
  }

  /**
   * Unchecks the checkbox (sets to unchecked if currently checked).
   *
   * @param options - Uncheck options
   * @returns This instance (for chaining)
   */
  async uncheck(options?: Parameters<Locator["uncheck"]>[0]): Promise<this> {
    await this.locator.uncheck(options);
    return this;
  }

  /**
   * Forces the checkbox into the desired checked state.
   *
   * @param checked - `true` to check, `false` to uncheck
   * @param options - Additional options
   * @returns This instance (for chaining)
   */
  async setChecked(
    checked: boolean,
    options?: Parameters<Locator["setChecked"]>[1],
  ): Promise<this> {
    await this.locator.setChecked(checked, options);
    return this;
  }

  /**
   * Focuses the checkbox (useful for keyboard interaction testing).
   *
   * @returns This instance (for chaining)
   */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /**
   * Removes focus from the checkbox.
   *
   * @returns This instance (for chaining)
   */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /**
   * Scrolls the checkbox into the viewport if not already visible.
   *
   * @returns This instance (for chaining)
   */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Captures a screenshot of the checkbox element only.
   *
   * @param path - Optional file path to save the screenshot
   * @returns Buffer containing the screenshot
   *
   * @example
   * const buffer = await checkbox.screenshot("screenshots/checkbox.png");
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // ───────────────────────────────────────────────────────────────
  // Attribute Getters
  // ───────────────────────────────────────────────────────────────

  /**
   * Retrieves the `value` attribute of the checkbox.
   *
   * @returns The value string or `null` if not present
   */
  async getValue(): Promise<string | null> {
    return await this.locator.getAttribute("value");
  }

  /**
   * Retrieves the `name` attribute of the checkbox.
   *
   * @returns The name string or `null` if not present
   */
  async getName(): Promise<string | null> {
    return await this.locator.getAttribute("name");
  }

  /**
   * Gets the `aria-checked` attribute value.
   *
   * @returns `"true"`, `"false"`, `"mixed"`, or `null`
   *
   * @remarks Especially useful for custom/tri-state ARIA checkboxes.
   */
  async getAriaChecked(): Promise<string | null> {
    return await this.locator.getAttribute("aria-checked");
  }

  /**
   * Retrieves any attribute by name.
   *
   * @param name - Attribute name (e.g. "data-testid", "aria-label")
   * @returns Attribute value or `null`
   */
  async getAttribute(name: string): Promise<string | null> {
    return await this.locator.getAttribute(name);
  }

  // ───────────────────────────────────────────────────────────────
  // Fluent Assertions (auto-retrying via expect)
  // ───────────────────────────────────────────────────────────────

  /**
   * Asserts that the checkbox is checked.
   *
   * @returns This instance (for chaining)
   */
  async shouldBeChecked(): Promise<this> {
    await expect(this.locator).toBeChecked();
    return this;
  }

  /**
   * Asserts that the checkbox is **not** checked.
   *
   * @returns This instance (for chaining)
   */
  async shouldBeUnchecked(): Promise<this> {
    await expect(this.locator).not.toBeChecked();
    return this;
  }

  /**
   * Asserts that the checkbox is in indeterminate (partially checked) state.
   *
   * @returns This instance (for chaining)
   *
   * @remarks Uses native `indeterminate` property; extend with ARIA checks if needed.
   */
  async shouldBePartiallyChecked(): Promise<this> {
    await expect(this.locator).toHaveJSProperty("indeterminate", true);
    return this;
  }

  /**
   * Asserts that the checkbox is visible.
   *
   * @returns This instance (for chaining)
   */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /**
   * Asserts that the checkbox is hidden.
   *
   * @returns This instance (for chaining)
   */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /**
   * Alias for `shouldBeHidden()`.
   */
  async shouldNotBeVisible(): Promise<this> {
    return this.shouldBeHidden();
  }

  /**
   * Asserts that the checkbox is enabled.
   *
   * @returns This instance (for chaining)
   */
  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  /**
   * Asserts that the checkbox is disabled.
   *
   * @returns This instance (for chaining)
   */
  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  /**
   * Asserts that the checkbox has keyboard focus.
   *
   * @returns This instance (for chaining)
   */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Asserts that the checkbox is within the viewport.
   *
   * @param options - Customization
   * @param options.ratio - Minimum visible ratio (0–1)
   * @param options.timeout - Override timeout
   * @returns This instance (for chaining)
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  /**
   * Asserts that the checkbox has the expected `value` attribute.
   *
   * @param expected - Exact string or RegExp pattern
   * @returns This instance (for chaining)
   */
  async shouldHaveValue(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("value", expected);
    return this;
  }

  /**
   * Asserts that the checkbox has the expected `name` attribute.
   *
   * @param expected - Exact string or RegExp pattern
   * @returns This instance (for chaining)
   */
  async shouldHaveName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("name", expected);
    return this;
  }

  /**
   * Asserts that the checkbox has a specific class or class pattern.
   *
   * @param expected - Exact class string or RegExp
   * @returns This instance (for chaining)
   */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /**
   * Asserts the presence and value of `aria-label`.
   *
   * @param expected - Expected label text or pattern
   * @returns This instance (for chaining)
   */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /**
   * Asserts the value of `aria-checked`.
   *
   * @param expected - "true" | "false" | "mixed" or RegExp
   * @returns This instance (for chaining)
   */
  async shouldHaveAriaChecked(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-checked", expected);
    return this;
  }

  /**
   * Asserts the accessible name of the checkbox.
   *
   * @param expected - Expected accessible name or pattern
   * @returns This instance (for chaining)
   */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /**
   * Asserts the accessible description of the checkbox.
   *
   * @param expected - Expected description or pattern
   * @returns This instance (for chaining)
   */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  /**
   * Generic attribute assertion.
   *
   * @param name - Attribute name
   * @param value - Expected value or pattern
   * @returns This instance (for chaining)
   */
  async shouldHaveAttribute(
    name: string,
    value: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute(name, value);
    return this;
  }

  /**
   * Asserts that a specific attribute does **not** exist.
   *
   * @param name - Attribute name that should be absent
   * @returns This instance (for chaining)
   */
  async shouldNotHaveAttribute(name: string): Promise<this> {
    await expect(this.locator).not.toHaveAttribute(name, /.*/);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Specialized Waiters
  // ───────────────────────────────────────────────────────────────

  /**
   * Waits until the checkbox is visible **and** enabled.
   *
   * @param timeout - Max wait time (ms)
   * @returns This instance (for chaining)
   *
   * @example
   * await checkbox.waitUntilReady(15_000).check();
   */
  async waitUntilReady(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeEnabled({ timeout });
    return this;
  }

  /**
   * Waits until the checkbox becomes checked.
   *
   * @param timeout - Max wait time (ms)
   * @returns This instance (for chaining)
   */
  async waitUntilChecked(timeout = 10_000): Promise<this> {
    await expect(this.locator).toBeChecked({ timeout });
    return this;
  }

  /**
   * Waits until the checkbox becomes unchecked.
   *
   * @param timeout - Max wait time (ms)
   * @returns This instance (for chaining)
   */
  async waitUntilUnchecked(timeout = 10_000): Promise<this> {
    await expect(this.locator).not.toBeChecked({ timeout });
    return this;
  }
}
