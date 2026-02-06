// src/components/bases/link-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * LinkBase
 * --------
 * Chainable, type-safe base class for `<a>` anchor elements and link-like controls in React applications.
 *
 * Supports:
 * - Standard navigation links
 * - Router links (React Router, Next.js, etc.)
 * - External links (`target="_blank"`, `rel="noopener noreferrer"`)
 * - Download links (`download` attribute)
 * - In-page anchor links (`#section-id`)
 *
 * Provides fluent, chainable methods for:
 * - Navigation with waiting
 * - Attribute reading and assertion
 * - Interaction (click, hover, focus, keyboard)
 * - Visibility, accessibility, and position checks
 *
 * @example
 * // Using ComponentFactory (recommended)
 * const $ = new ComponentFactory(page);
 * const docsLink = $.linkByRole("Documentation");
 *
 * await docsLink
 *   .shouldBeVisible()
 *   .shouldBeEnabled()
 *   .shouldHaveHref(/docs/)
 *   .shouldOpenInNewTab()
 *   .clickAndWaitForNewPage();
 *
 * @example
 * // Direct construction
 * const profileLink = new LinkBase(page.getByRole("link", { name: "Profile" }));
 * await profileLink.clickAndWaitForUrl("/profile");
 */
export class LinkBase {
  /** Underlying Playwright Locator that targets this link element. */
  readonly locator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a LinkBase from a Page and a selector string.
   *
   * @param page - Playwright Page instance
   * @param selector - CSS, XPath, or other selector string
   *
   * @example
   * const link = new LinkBase(page, 'a[href="/dashboard"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Creates a LinkBase directly from an existing Locator (preferred pattern).
   *
   * @param locator - Pre-resolved Playwright Locator
   *
   * @example
   * const link = new LinkBase(page.getByRole("link", { name: "Sign in" }));
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
   * await link.asLocator().hover({ timeout: 2000 });
   */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // Navigation & Click Actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Clicks the link and waits for a network response to complete.
   * Useful for SPA route changes or API-triggered navigations.
   *
   * @param options - Optional configuration
   * @param options.timeout - Maximum time to wait for response (ms)
   * @returns This instance (for chaining)
   */
  async clickAndNavigate(options?: { timeout?: number }): Promise<this> {
    const page = this.locator.page();
    const [response] = await Promise.all([
      page.waitForEvent("response", { timeout: options?.timeout ?? 30_000 }),
      this.locator.click(),
    ]);
    await response?.finished();
    return this;
  }

  /**
   * Performs a simple click on the link without waiting for navigation.
   * Suitable for in-page actions (modals, accordions, tabs).
   *
   * @param options - Click options (force, position, modifiers, timeout, etc.)
   * @returns This instance (for chaining)
   */
  async click(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click(options);
    return this;
  }

  /**
   * Clicks the link and waits for a new browser page/tab to open.
   * Commonly used with `target="_blank"` links.
   *
   * @returns The newly opened Page instance
   *
   * @example
   * const newPage = await externalLink.clickAndWaitForNewPage();
   * await newPage.waitForLoadState("networkidle");
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
   * Clicks the link and waits for the current page URL to match the expected pattern.
   *
   * @param expected - Expected URL string or RegExp
   * @param options - Optional configuration
   * @param options.timeout - Maximum time to wait (ms)
   * @returns This instance (for chaining)
   *
   * @example
   * await dashboardLink.clickAndWaitForUrl("/dashboard");
   */
  async clickAndWaitForUrl(
    expected: string | RegExp,
    options?: { timeout?: number },
  ): Promise<this> {
    const page = this.locator.page();
    await Promise.all([
      page.waitForURL(expected, { timeout: options?.timeout ?? 30_000 }),
      this.locator.click(),
    ]);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Getters
  // ───────────────────────────────────────────────────────────────

  /**
   * Retrieves the `href` attribute value.
   *
   * @returns The href string or empty string if not present
   */
  async getHref(): Promise<string> {
    return (await this.locator.getAttribute("href")) ?? "";
  }

  /**
   * Gets the visible text content of the link (trimmed).
   *
   * @returns Trimmed text or empty string if none
   */
  async getText(): Promise<string> {
    return (await this.locator.textContent())?.trim() ?? "";
  }

  /**
   * Retrieves the `target` attribute value.
   *
   * @returns Target value (e.g. "_blank") or null
   */
  async getTarget(): Promise<string | null> {
    return await this.locator.getAttribute("target");
  }

  /**
   * Retrieves the `rel` attribute value.
   *
   * @returns Rel value (e.g. "noopener noreferrer") or null
   */
  async getRel(): Promise<string | null> {
    return await this.locator.getAttribute("rel");
  }

  /**
   * Retrieves the `download` attribute value.
   *
   * @returns Download filename or null if not present
   */
  async getDownload(): Promise<string | null> {
    return await this.locator.getAttribute("download");
  }

  /**
   * Gets the value of any attribute by name.
   *
   * @param name - Attribute name (e.g. "data-testid", "aria-label")
   * @returns Attribute value or null if not present
   */
  async getAttribute(name: string): Promise<string | null> {
    return await this.locator.getAttribute(name);
  }

  /**
   * Checks if the link is currently disabled.
   *
   * @returns `true` if disabled, `false` otherwise
   */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /**
   * Checks if the link is currently visible.
   *
   * @returns `true` if visible, `false` otherwise
   */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /**
   * Gets the bounding box (position and size) of the link element.
   *
   * @returns Object with x, y, width, height or null if not attached/visible
   */
  async getBoundingBox(): Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null> {
    return await this.locator.boundingBox();
  }

  // ───────────────────────────────────────────────────────────────
  // Interactions
  // ───────────────────────────────────────────────────────────────

  /**
   * Hovers over the link (useful for revealing tooltips or hover styles).
   *
   * @param options - Hover options
   * @returns This instance (for chaining)
   */
  async hover(options?: Parameters<Locator["hover"]>[0]): Promise<this> {
    await this.locator.hover(options);
    return this;
  }

  /**
   * Focuses the link (useful for keyboard navigation testing).
   *
   * @returns This instance (for chaining)
   */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /**
   * Removes focus from the link.
   *
   * @returns This instance (for chaining)
   */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /**
   * Presses a keyboard key while the link is focused.
   *
   * @param key - Key to press (e.g. "Enter", "Space", "ArrowDown")
   * @param options - Press options
   * @returns This instance (for chaining)
   *
   * @example
   * await link.focus().pressKey("Enter");
   */
  async pressKey(
    key: string,
    options?: Parameters<Locator["press"]>[1],
  ): Promise<this> {
    await this.locator.press(key, options);
    return this;
  }

  /**
   * Scrolls the link into view if it is not already visible.
   *
   * @returns This instance (for chaining)
   */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Takes a screenshot of the link element only.
   *
   * @param path - Optional path to save the screenshot to disk
   * @returns Buffer containing the screenshot
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions
  // ───────────────────────────────────────────────────────────────

  /**
   * Asserts the link has the expected exact text content.
   *
   * @param expected - Expected text or RegExp
   * @returns This instance (for chaining)
   */
  async shouldHaveText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveText(expected);
    return this;
  }

  /**
   * Asserts the link contains the expected text substring or pattern.
   *
   * @param expected - Substring or RegExp
   * @returns This instance (for chaining)
   */
  async shouldContainText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toContainText(expected);
    return this;
  }

  /**
   * Asserts the link's `href` attribute matches the expected value or pattern.
   *
   * @param expected - Exact href or RegExp
   * @returns This instance (for chaining)
   */
  async shouldHaveHref(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("href", expected);
    return this;
  }

  /**
   * Asserts the link's `href` contains the expected substring or pattern.
   *
   * @param expected - Partial string or RegExp
   * @returns This instance (for chaining)
   */
  async shouldHavePartialHref(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("href", expected);
    return this;
  }

  /**
   * Asserts the link has the expected `rel` attribute value.
   *
   * @param expected - Expected rel string or RegExp
   * @returns This instance (for chaining)
   */
  async shouldHaveRel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("rel", expected);
    return this;
  }

  /**
   * Asserts the link opens in a new tab (`target="_blank"`).
   *
   * @returns This instance (for chaining)
   */
  async shouldOpenInNewTab(): Promise<this> {
    await expect(this.locator).toHaveAttribute("target", "_blank");
    return this;
  }

  /**
   * Asserts the link opens in the same tab (no `target="_blank"`).
   *
   * @returns This instance (for chaining)
   */
  async shouldOpenInSameTab(): Promise<this> {
    await expect(this.locator).not.toHaveAttribute("target", "_blank");
    return this;
  }

  /**
   * Asserts the link has `rel` containing "nofollow".
   *
   * @returns This instance (for chaining)
   */
  async shouldBeNoFollow(): Promise<this> {
    await expect(this.locator).toHaveAttribute("rel", /nofollow/);
    return this;
  }

  /**
   * Asserts the link has a `download` attribute (optionally with specific filename).
   *
   * @param filename - Optional expected filename or RegExp
   * @returns This instance (for chaining)
   */
  async shouldHaveDownloadAttribute(filename?: string | RegExp): Promise<this> {
    if (filename) {
      await expect(this.locator).toHaveAttribute("download", filename);
    } else {
      await expect(this.locator).toHaveAttribute("download");
    }
    return this;
  }

  /**
   * Asserts the link has `rel` containing "noreferrer".
   *
   * @returns This instance (for chaining)
   */
  async shouldHaveNoReferrer(): Promise<this> {
    await expect(this.locator).toHaveAttribute("rel", /noreferrer/);
    return this;
  }

  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  async shouldNotBeVisible(): Promise<this> {
    return this.shouldBeHidden();
  }

  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  async shouldHaveAccessibleDescription(
    expected: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  async shouldHaveAttribute(
    name: string,
    value: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute(name, value);
    return this;
  }

  async shouldNotHaveAttribute(name: string): Promise<this> {
    await expect(this.locator).not.toHaveAttribute(name, /.*/);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /**
   * Waits until the link is visible and enabled (ready for interaction).
   *
   * @param timeout - Maximum wait time in milliseconds
   * @returns This instance (for chaining)
   */
  async waitUntilReady(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeEnabled({ timeout });
    return this;
  }

  /**
   * Waits until the `href` attribute matches the expected value or pattern.
   *
   * @param expected - Expected href string or RegExp
   * @param timeout - Maximum wait time in milliseconds
   * @returns This instance (for chaining)
   */
  async waitForHref(
    expected: string | RegExp,
    timeout = 10_000,
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute("href", expected, { timeout });
    return this;
  }

  /**
   * Waits until the link's text matches the expected value or pattern.
   *
   * @param expected - Expected text string or RegExp
   * @param timeout - Maximum wait time in milliseconds
   * @returns This instance (for chaining)
   */
  async waitForText(
    expected: string | RegExp,
    timeout = 10_000,
  ): Promise<this> {
    await expect(this.locator).toHaveText(expected, { timeout });
    return this;
  }

  /**
   * Waits until any specified attribute matches the expected value or pattern.
   *
   * @param name - Attribute name (e.g. "href", "rel", "target")
   * @param expected - Expected value or RegExp
   * @param timeout - Maximum wait time in milliseconds
   * @returns This instance (for chaining)
   */
  async waitForAttribute(
    name: string,
    expected: string | RegExp,
    timeout = 10_000,
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute(name, expected, { timeout });
    return this;
  }

  /**
   * Hovers over the link and waits for a tooltip/popover to become visible.
   *
   * @param tooltipLocator - Locator for the expected tooltip/popover element
   * @param timeout - Maximum wait time in milliseconds
   * @returns This instance (for chaining)
   */
  async hoverAndWaitForTooltip(
    tooltipLocator: Locator,
    timeout = 10_000,
  ): Promise<this> {
    await this.hover();
    await tooltipLocator.waitFor({ state: "visible", timeout });
    return this;
  }
}
