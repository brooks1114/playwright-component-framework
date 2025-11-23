// src/components/bases/button-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * ButtonBase
 * ----------
 * Chainable, type-safe base class for <button>, input[type="submit"],
 * and role="button" elements.
 *
 * This wraps a Playwright Locator and provides:
 *  - Click helpers (click, double-click, right-click, navigate helpers)
 *  - Interaction helpers (hover, focus, press)
 *  - State queries (isVisible, isDisabled, getText, getAttribute, etc.)
 *  - Assertion helpers (shouldBeVisible, shouldHaveText, etc.)
 *  - Waiters (waitUntilEnabled, waitUntilDisabled, waitForText)
 *
 * Construction patterns (all supported):
 *  - Selector-based (legacy / fallback):
 *      const btn = new ButtonBase(page, 'button[type="submit"]');
 *  - Locator-based (preferred, used by ComponentFactory):
 *      const btn = new ButtonBase(page.getByRole('button', { name: 'Save' }));
 *
 * Example usage in a test with your ComponentFactory:
 *
 *   const $ = new ComponentFactory(page);
 *   const searchButton = $.buttonByTestId("navbar-search-button");
 *
 *   await searchButton
 *     .shouldBeVisible()
 *     .shouldBeEnabled()
 *     .click();
 */
export class ButtonBase {
  /** Underlying Playwright Locator for this button. */
  readonly locator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string (CSS/xpath/etc).
   *
   * @example
   *   const button = new ButtonBase(page, 'button[type="submit"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator (e.g., page.getByRole()).
   *
   * @example
   *   const button = new ButtonBase(page.getByRole('button', { name: 'Save' }));
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      // Usage: new ButtonBase(page, 'button[type="submit"]')
      this.locator = (pageOrLocator as Page).locator(selector);
    } else {
      // Usage: new ButtonBase(page.getByRole('button', { name: 'Save' }))
      this.locator = pageOrLocator as Locator;
    }
  }

  // Small helper in case advanced users want direct access in a “named” way.
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // Click + interaction actions (async, chainable)
  // ───────────────────────────────────────────────────────────────

  /**
   * Click the button.
   *
   * @param options  Standard Playwright locator.click() options.
   *
   * @example
   *   await $.buttonByTestId("navbar-search-button").click();
   */
  async click(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click(options);
    return this;
  }

  /**
   * Wait until the button is visible & enabled, then click.
   *
   * This is safer for dynamic UIs that enable buttons after async work.
   */
  async waitUntilEnabledAndClick(timeout = 10_000): Promise<this> {
    await this.waitUntilEnabled(timeout);
    await this.locator.click();
    return this;
  }

  /**
   * Click and wait for the next network response.
   *
   * Generic helper for flows where this button triggers a key network call.
   */
  async clickAndNavigate(options?: { timeout?: number }): Promise<this> {
    const [response] = await Promise.all([
      this.locator
        .page()
        .waitForEvent("response", { timeout: options?.timeout ?? 30_000 }),
      this.locator.click(),
    ]);
    await response?.finished();
    return this;
  }

  /**
   * Click and wait for a new Page (e.g., target="_blank").
   *
   * @returns The new Page object.
   */
  async clickAndWaitForNewPage(): Promise<Page> {
    const [newPage] = await Promise.all([
      this.locator.page().context().waitForEvent("page"),
      this.locator.click(),
    ]);
    await newPage.waitForLoadState("domcontentloaded");
    return newPage;
  }

  /**
   * Double-click the button.
   */
  async dblclick(options?: Parameters<Locator["dblclick"]>[0]): Promise<this> {
    await this.locator.dblclick(options);
    return this;
  }

  /**
   * Right-click the button.
   */
  async rightClick(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click({ ...options, button: "right" });
    return this;
  }

  /**
   * Hover over the button.
   */
  async hover(options?: Parameters<Locator["hover"]>[0]): Promise<this> {
    await this.locator.hover(options);
    return this;
  }

  /**
   * Focus the button.
   */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /**
   * Remove focus from the button.
   */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /**
   * Press a key while the button is focused (e.g., 'Enter', 'Space').
   */
  async press(
    key: string,
    options?: Parameters<Locator["press"]>[1]
  ): Promise<this> {
    await this.locator.press(key, options);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Getters / state queries (async)
  // ───────────────────────────────────────────────────────────────

  /**
   * Get the visible text of the button, trimmed.
   */
  async getText(): Promise<string> {
    return (await this.locator.textContent({ timeout: 5_000 }))?.trim() ?? "";
  }

  /**
   * Get the `type` attribute (e.g., 'submit', 'button'), if present.
   */
  async getType(): Promise<string | null> {
    return await this.locator.getAttribute("type");
  }

  /**
   * Get the `value` attribute, if present.
   */
  async getValue(): Promise<string | null> {
    return await this.locator.getAttribute("value");
  }

  /**
   * Get a specific attribute value.
   */
  async getAttribute(name: string): Promise<string | null> {
    return await this.locator.getAttribute(name);
  }

  /**
   * Check if the button is disabled.
   */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /**
   * Check if the button is visible.
   */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /**
   * Check if the button intersects the viewport.
   */
  async isInViewport(): Promise<boolean> {
    return await this.locator.isVisible(); // proxy; toBeInViewport is assertion, not predicate
  }

  // ───────────────────────────────────────────────────────────────
  // Utilities (scroll, screenshot, loading state)
  // ───────────────────────────────────────────────────────────────

  /**
   * Scroll button into view if needed.
   */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Take a screenshot of just this button.
   *
   * @param path Optional path; if provided, writes screenshot to disk.
   * @returns The screenshot Buffer.
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  /**
   * Check if the button appears to be in a "loading" state,
   * typically via a spinner or busy indicator inside it.
   *
   * @param spinnerSelector CSS selector to locate the spinner within the button.
   */
  async isLoading(
    spinnerSelector = '.spinner, [aria-busy="true"]'
  ): Promise<boolean> {
    const spinner = this.locator.locator(spinnerSelector);
    return await spinner.isVisible();
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions (async, chainable)
  //  - These wrap Playwright's auto-retrying expect()
  // ───────────────────────────────────────────────────────────────

  /** Assert the button has exact text (or matches RegExp). */
  async shouldHaveText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveText(expected);
    return this;
  }

  /** Assert the button contains text (substring/RegExp). */
  async shouldContainText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toContainText(expected);
    return this;
  }

  /** Assert the button is visible. */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /** Assert the button is hidden. */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert the button is not visible (alias for hidden). */
  async shouldNotBeVisible(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert the button is enabled. */
  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  /** Assert the button is disabled. */
  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  /** Assert the button is focused. */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Assert the button intersects the viewport.
   *
   * @param options.ratio   0–1: how much of the element must be visible.
   * @param options.timeout Assertion timeout override.
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  /** Assert the button has a specific type attribute. */
  async shouldHaveType(expected: string): Promise<this> {
    await expect(this.locator).toHaveAttribute("type", expected);
    return this;
  }

  /** Assert the button has a specific value attribute. */
  async shouldHaveValue(expected: string): Promise<this> {
    await expect(this.locator).toHaveAttribute("value", expected);
    return this;
  }

  /** Assert the button's class attribute matches exactly or matches a pattern. */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /** Assert the button's class list contains a specific substring or pattern. */
  async shouldHaveClassContaining(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(
      expected instanceof RegExp ? expected : new RegExp(expected)
    );
    return this;
  }

  /** Assert the button has aria-label with the given value or pattern. */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /** Assert aria-disabled="true" on the button. */
  async shouldBeAriaDisabled(): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-disabled", "true");
    return this;
  }

  /**
   * Assert the button has a specific ARIA role.
   *
   * Note: Playwright does not have a toHaveRole matcher;
   * we assert via the "role" attribute instead.
   */
  async shouldHaveRole(expected: string): Promise<this> {
    await expect(this.locator).toHaveAttribute("role", expected);
    return this;
  }

  /** Assert the button has a specific accessible name. */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /** Assert the button has a specific accessible description. */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  /** Assert the button has a specific attribute and value. */
  async shouldHaveAttribute(
    name: string,
    value: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute(name, value);
    return this;
  }

  /** Assert the button does *not* have a given attribute. */
  async shouldNotHaveAttribute(name: string): Promise<this> {
    await expect(this.locator).not.toHaveAttribute(name, /.*/);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters (async, chainable)
  // ───────────────────────────────────────────────────────────────

  /**
   * Wait for button to be visible and enabled.
   */
  async waitUntilEnabled(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeEnabled({ timeout });
    return this;
  }

  /**
   * Wait for button to be visible and then disabled.
   * Useful for "submit then disable" patterns.
   */
  async waitUntilDisabled(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeDisabled({ timeout });
    return this;
  }

  /**
   * Wait for the button's text to match the expected value or pattern.
   */
  async waitForText(
    expected: string | RegExp,
    timeout = 10_000
  ): Promise<this> {
    await expect(this.locator).toHaveText(expected, { timeout });
    return this;
  }
}
