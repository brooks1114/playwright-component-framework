// src/components/bases/button-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * ButtonBase
 * ----------
 * Chainable, type-safe base class for interactive button elements, including:
 *  - <button> elements
 *  - <input type="submit">, <input type="button">, <input type="reset">
 *  - Any element with role="button" (ARIA-compliant buttons)
 *
 * This class wraps a Playwright Locator to provide:
 *  - Click variations (single, double, right-click, with navigation or new page)
 *  - Hover, focus, blur, keyboard press
 *  - State checks (visible, enabled, disabled, loading, text)
 *  - Rich assertions (text, accessibility, attributes, viewport)
 *  - Wait helpers for common button states
 *
 * Preferred construction via ComponentFactory (accessibility-first):
 *   ui.buttonByRoleName("Save")
 *   ui.buttonByTestId("submit-form")
 *
 * Fallback: direct selector construction when needed.
 *
 * @example Basic usage in a test
 *   const ui = new ComponentFactory(page);
 *   const saveButton = ui.buttonByRoleName("Save");
 *
 *   await saveButton
 *     .shouldBeVisible()
 *     .shouldBeEnabled()
 *     .shouldHaveText("Save")
 *     .click()
 *     .waitUntilDisabled();  // common after form submission
 *
 * @example Navigation / form submit
 *   await ui.buttonByRoleName("Next")
 *     .shouldBeEnabled()
 *     .clickAndNavigate();
 *
 * @example Opening a new tab
 *   const reportPage = await ui.buttonByRoleName("View Full Report")
 *     .clickAndWaitForNewPage();
 *   await reportPage.waitForURL(/report/);
 */
export class ButtonBase {
  /** Underlying Playwright Locator pointing to the button element. */
  readonly locator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a CSS/XPath selector string (fallback pattern).
   *
   * @param page - The Playwright Page instance
   * @param selector - CSS or XPath selector for the button
   *
   * @example
   *   const btn = new ButtonBase(page, 'button[type="submit"]');
   *   const btn = new ButtonBase(page, '[data-testid="login-btn"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator (preferred – accessibility-first).
   *
   * @param locator - Playwright Locator pointing to the button
   *
   * @example
   *   const btn = new ButtonBase(page.getByRole("button", { name: "Save" }));
   *   const btn = new ButtonBase(page.getByTestId("submit-form"));
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    this.locator =
      selector !== undefined
        ? (pageOrLocator as Page).locator(selector)
        : (pageOrLocator as Locator);
  }

  /**
   * Returns the underlying Playwright Locator for advanced or custom operations.
   *
   * @returns The raw Locator
   *
   * @example
   *   await button.asLocator().dispatchEvent("customEvent");
   */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // Click & Interaction Actions – chainable
  // ───────────────────────────────────────────────────────────────

  /**
   * Perform a standard left-click on the button.
   * Playwright automatically waits for visibility and actionability.
   *
   * @param options - Playwright click options (force, timeout, position, etc.)
   * @returns this (for chaining)
   *
   * @example
   *   await button.click();
   *   await button.click({ force: true }); // bypass actionability checks if needed
   */
  async click(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click(options);
    return this;
  }

  /**
   * Wait until the button is visible and enabled, then perform a click.
   * Very useful for buttons that are temporarily disabled during loading/validation.
   *
   * @param timeout - Maximum wait time in milliseconds (default: 10 seconds)
   * @returns this (for chaining)
   *
   * @example
   *   await submitButton.waitUntilEnabledAndClick(15000);
   */
  async waitUntilEnabledAndClick(timeout = 10_000): Promise<this> {
    await this.waitUntilEnabled(timeout);
    await this.click();
    return this;
  }

  /**
   * Click the button and wait for a network response (e.g. form submission, page navigation).
   *
   * @param options.timeout - Timeout for waiting on the response (default: 30 seconds)
   * @returns this (for chaining)
   *
   * @example
   *   await loginButton.clickAndNavigate();
   */
  async clickAndNavigate(options?: { timeout?: number }): Promise<this> {
    const [response] = await Promise.all([
      this.locator
        .page()
        .waitForEvent("response", { timeout: options?.timeout ?? 30_000 }),
      this.click(),
    ]);
    await response?.finished();
    return this;
  }

  /**
   * Click the button and wait for a new browser page/tab to open (e.g. target="_blank").
   *
   * @returns The newly opened Page
   *
   * @example
   *   const reportPage = await ui.buttonByRoleName("View Full Report")
   *     .clickAndWaitForNewPage();
   */
  async clickAndWaitForNewPage(): Promise<Page> {
    const [newPage] = await Promise.all([
      this.locator.page().context().waitForEvent("page"),
      this.click(),
    ]);
    await newPage.waitForLoadState("domcontentloaded");
    return newPage;
  }

  /**
   * Perform a double-click on the button.
   *
   * @param options - Playwright dblclick options
   * @returns this (for chaining)
   */
  async dblclick(options?: Parameters<Locator["dblclick"]>[0]): Promise<this> {
    await this.locator.dblclick(options);
    return this;
  }

  /**
   * Perform a right-click on the button.
   *
   * @param options - Playwright click options (applied with button: "right")
   * @returns this (for chaining)
   */
  async rightClick(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click({ ...options, button: "right" });
    return this;
  }

  /**
   * Hover over the button (triggers mouseenter, tooltips, hover styles).
   *
   * @param options - Playwright hover options
   * @returns this (for chaining)
   */
  async hover(options?: Parameters<Locator["hover"]>[0]): Promise<this> {
    await this.locator.hover(options);
    return this;
  }

  /**
   * Focus the button (useful for keyboard navigation testing).
   *
   * @returns this (for chaining)
   */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /**
   * Remove focus from the button.
   *
   * @returns this (for chaining)
   */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /**
   * Press a keyboard key while the button is focused (e.g. "Enter" to activate).
   *
   * @param key - Key name (e.g. "Enter", "Space", "ArrowDown")
   * @param options - Press options (delay, timeout, etc.)
   * @returns this (for chaining)
   */
  async press(
    key: string,
    options?: Parameters<Locator["press"]>[1],
  ): Promise<this> {
    await this.locator.press(key, options);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Getters & State Queries
  // ───────────────────────────────────────────────────────────────

  /**
   * Get the visible text content of the button, trimmed.
   *
   * @returns The button's text (empty string if none)
   *
   * @example
   *   const label = await button.getText(); // "Save Changes"
   */
  async getText(): Promise<string> {
    return (await this.locator.textContent())?.trim() ?? "";
  }

  /**
   * Get the type attribute (e.g. "submit", "button", "reset").
   *
   * @returns The type value or null if not present
   */
  async getType(): Promise<string | null> {
    return await this.locator.getAttribute("type");
  }

  /**
   * Get the value attribute (common on <input type="submit">).
   *
   * @returns The value or null if not present
   */
  async getValue(): Promise<string | null> {
    return await this.locator.getAttribute("value");
  }

  /**
   * Get any attribute value by name.
   *
   * @param name - Attribute name (e.g. "data-testid", "aria-label")
   * @returns Attribute value or null
   */
  async getAttribute(name: string): Promise<string | null> {
    return await this.locator.getAttribute(name);
  }

  /**
   * Check if the button is visible.
   *
   * @returns true if visible, false otherwise
   */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /**
   * Check if the button is disabled.
   *
   * @returns true if disabled, false otherwise
   */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /**
   * Check if the button appears in the viewport (basic proxy).
   * For precise assertion use shouldBeInViewport().
   *
   * @returns true if visible (proxy check)
   */
  async isInViewport(): Promise<boolean> {
    return await this.locator.isVisible(); // proxy; use shouldBeInViewport() for exact
  }

  /**
   * Check if the button is in a loading/busy state.
   * Looks for common loading indicators inside the button.
   *
   * @param spinnerSelector - Optional custom selector for spinner/busy indicator
   * @returns true if loading indicator is visible
   *
   * @example
   *   await submitButton.isLoading(); // true if .spinner is visible inside
   */
  async isLoading(
    spinnerSelector = '.spinner, [aria-busy="true"], .loading, [role="progressbar"]',
  ): Promise<boolean> {
    const indicator = this.locator.locator(spinnerSelector);
    return await indicator.isVisible();
  }

  // ───────────────────────────────────────────────────────────────
  // Utilities
  // ───────────────────────────────────────────────────────────────

  /**
   * Scroll the button into view if it is not currently visible.
   *
   * @returns this (for chaining)
   */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Take a screenshot of just the button element.
   *
   * @param path - Optional file path to save the screenshot
   * @returns Buffer containing the screenshot image
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions – chainable, auto-retrying via expect
  // ───────────────────────────────────────────────────────────────

  /**
   * Assert the button has the exact expected text.
   *
   * @param expected - Exact string or RegExp to match against textContent
   * @returns this (for chaining)
   *
   * @example
   *   await button.shouldHaveText("Save");
   */
  async shouldHaveText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveText(expected);
    return this;
  }

  /**
   * Assert the button contains the given text (substring or pattern).
   *
   * @param expected - String or RegExp to find within textContent
   */
  async shouldContainText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toContainText(expected);
    return this;
  }

  /**
   * Assert the button is visible.
   */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /**
   * Assert the button is hidden.
   */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /**
   * Assert the button is enabled.
   */
  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  /**
   * Assert the button is disabled.
   */
  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  /**
   * Assert the button is focused.
   */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Assert the button intersects the viewport.
   *
   * @param options - { ratio?: number (0-1), timeout?: number }
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  /**
   * Assert the button has a specific type attribute.
   *
   * @param expected - e.g. "submit", "button"
   */
  async shouldHaveType(expected: string): Promise<this> {
    await expect(this.locator).toHaveAttribute("type", expected);
    return this;
  }

  /**
   * Assert the button has a specific value attribute.
   */
  async shouldHaveValue(expected: string): Promise<this> {
    await expect(this.locator).toHaveAttribute("value", expected);
    return this;
  }

  /**
   * Assert the button's class attribute matches exactly or a pattern.
   */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /**
   * Assert the button has aria-label with the given value or pattern.
   */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /**
   * Assert the button has a specific accessible name.
   */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /**
   * Assert the button has a specific accessible description.
   */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  /**
   * Assert the button has a specific attribute and value.
   *
   * @param name - Attribute name
   * @param value - Expected value or RegExp
   */
  async shouldHaveAttribute(
    name: string,
    value: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute(name, value);
    return this;
  }

  /**
   * Assert the button does NOT have a given attribute.
   *
   * @param name - Attribute name that should be absent
   */
  async shouldNotHaveAttribute(name: string): Promise<this> {
    await expect(this.locator).not.toHaveAttribute(name, /.*/);
    return this;
  }

  /**
   * Assert the button shows a loading indicator.
   *
   * @param spinnerSelector - Optional custom selector for loading indicator
   */
  async shouldHaveLoadingState(
    spinnerSelector = '.spinner, [aria-busy="true"], .loading',
  ): Promise<this> {
    await expect(this.locator.locator(spinnerSelector)).toBeVisible();
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Wait Helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Wait until the button is visible and enabled.
   * Most common readiness check before interacting with buttons.
   *
   * @param timeout - Maximum wait time in milliseconds
   * @returns this (for chaining)
   */
  async waitUntilEnabled(timeout = 10_000): Promise<this> {
    await Promise.all([
      this.locator.waitFor({ state: "visible", timeout }),
      expect(this.locator).toBeEnabled({ timeout }),
    ]);
    return this;
  }

  /**
   * Wait until the button is visible and becomes disabled.
   * Useful after form submission or async action that disables the button.
   *
   * @param timeout - Maximum wait time in milliseconds
   */
  async waitUntilDisabled(timeout = 10_000): Promise<this> {
    await Promise.all([
      this.locator.waitFor({ state: "visible", timeout }),
      expect(this.locator).toBeDisabled({ timeout }),
    ]);
    return this;
  }

  /**
   * Wait until the button's text matches the expected value or pattern.
   *
   * @param expected - String or RegExp to match against textContent
   * @param timeout - Maximum wait time in milliseconds
   */
  async waitForText(
    expected: string | RegExp,
    timeout = 10_000,
  ): Promise<this> {
    await expect(this.locator).toHaveText(expected, { timeout });
    return this;
  }
}
