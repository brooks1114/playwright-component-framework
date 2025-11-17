import { Page, Locator, expect } from "@playwright/test";

/**
 * Chainable, type-safe base class for <button>, input[type="submit"], and role="button" elements.
 * Wraps Playwright locator actions, clicks, navigation helpers, attributes, and assertions.
 *
 * All methods that talk to the page or use Playwright's async expect()
 * are async and return `this` for chaining, unless noted otherwise.
 *
 * Construction:
 *  - new ButtonBase(page, 'button[type="submit"]');
 *  - new ButtonBase(page.getByRole('button', { name: 'Save' }));
 *
 * @example
 * const button = new ButtonBase(page, 'button[type="submit"]');
 * await button.click();
 * await button.clickAndNavigate();
 * await button.shouldBeEnabled();
 * await button.shouldHaveText("Save");
 */
export class ButtonBase {
  readonly locator: Locator;

  // === CONSTRUCTORS (overloads) ===

  /**
   * Construct from a Page and a selector string (CSS/xpath/etc).
   */
  constructor(page: Page, selector: string);
  /**
   * Construct directly from an existing Locator (e.g., page.getByRole()).
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

  // === CLICK ACTIONS (async) ===

  /**
   * Click the button.
   * @param options Click options (delay, button, modifiers, etc.)
   */
  async click(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click(options);
    return this;
  }

  /**
   * Click and wait for the next network response after the click.
   *
   * This is a generic helper for flows where the click triggers
   * an important network call (e.g., form submit, SPA route change).
   * For app-specific flows it's often better to wait on URL changes
   * or specific locators in your tests.
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
   * Click and wait for a new page (e.g., target="_blank").
   * Returns the new Page object.
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
   * Press a key while the button is focused (e.g., 'Enter').
   */
  async press(
    key: string,
    options?: Parameters<Locator["press"]>[1]
  ): Promise<this> {
    await this.locator.press(key, options);
    return this;
  }

  // === GETTERS (async) ===

  /** Get the visible button text. */
  async getText(): Promise<string> {
    return (await this.locator.textContent({ timeout: 5_000 }))?.trim() ?? "";
  }

  /** Get the `type` attribute (e.g., 'submit', 'button'). */
  async getType(): Promise<string | null> {
    return await this.locator.getAttribute("type");
  }

  /** Get the `value` attribute. */
  async getValue(): Promise<string | null> {
    return await this.locator.getAttribute("value");
  }

  /** Check if button is disabled. */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /** Check if button is visible. */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  // === ACTIONS (advanced) ===

  /**
   * Scroll button into view.
   */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Take a screenshot of just the button.
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // === ASSERTIONS (async – wrap Playwright's auto-retrying expect) ===

  /** Assert button has exact text. */
  async shouldHaveText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveText(expected);
    return this;
  }

  /** Assert button contains text. */
  async shouldContainText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toContainText(expected);
    return this;
  }

  /** Assert button is visible. */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /** Assert button is hidden. */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert button is enabled. */
  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  /** Assert button is disabled. */
  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  /** Assert button is focused. */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Assert button intersects the viewport.
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

  /** Assert button has specific type. */
  async shouldHaveType(expected: string): Promise<this> {
    await expect(this.locator).toHaveAttribute("type", expected);
    return this;
  }

  /** Assert button has specific value. */
  async shouldHaveValue(expected: string): Promise<this> {
    await expect(this.locator).toHaveAttribute("value", expected);
    return this;
  }

  /** Assert button has specific class or matches a class pattern. */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /** Assert button has aria-label. */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /** Assert button has aria-disabled="true". */
  async shouldBeAriaDisabled(): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-disabled", "true");
    return this;
  }

  /** Assert button has a specific ARIA role. */
  async shouldHaveRole(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveRole(expected as any);
    return this;
  }

  /** Assert button has a specific accessible name. */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /** Assert button has a specific accessible description. */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  // === WAITERS ===

  /** Wait for button to be visible and enabled. */
  async waitUntilEnabled(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeEnabled({ timeout });
    return this;
  }

  /** Wait for button to be visible and then disabled. */
  async waitUntilDisabled(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeDisabled({ timeout });
    return this;
  }

  /** Wait for text to match. */
  async waitForText(
    expected: string | RegExp,
    timeout = 10_000
  ): Promise<this> {
    await expect(this.locator).toHaveText(expected, { timeout });
    return this;
  }

  // === UTILITIES ===

  /**
   * Check if button is "loading" (e.g., spinner inside).
   * Customizable via selector.
   */
  async isLoading(
    spinnerSelector = '.spinner, [aria-busy="true"]'
  ): Promise<boolean> {
    const spinner = this.locator.locator(spinnerSelector);
    return await spinner.isVisible();
  }
}
