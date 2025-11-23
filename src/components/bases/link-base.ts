// src/components/bases/link-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * LinkBase
 * --------
 * Chainable, type-safe base class for <a> anchor links.
 *
 * This wraps a Playwright Locator and provides:
 *  - Click & navigation helpers (clickAndNavigate, clickAndWaitForNewPage, clickAndWaitForUrl)
 *  - State queries (isVisible, isDisabled, getHref, getTarget, getRel)
 *  - Assertions (shouldHaveText, shouldHaveHref, shouldOpenInNewTab, etc.)
 *  - Waiters (waitUntilReady, waitForHref, waitForText)
 *
 * Construction patterns:
 *  - Selector-based (legacy / fallback):
 *      const link = new LinkBase(page, 'a[href="/dashboard"]');
 *  - Locator-based (preferred, used by ComponentFactory):
 *      const link = new LinkBase(page.getByRole("link", { name: "Dashboard" }));
 *
 * Example usage with your ComponentFactory:
 *
 *   const $ = new ComponentFactory(page);
 *   const dashboardLink = $.linkByRoleName("Dashboard");
 *
 *   await dashboardLink
 *     .shouldBeVisible()
 *     .shouldHaveHref("/dashboard")
 *     .clickAndWaitForUrl(/\/dashboard$/);
 */
export class LinkBase {
  /** Underlying Playwright Locator for this link. */
  readonly locator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string (CSS/xpath/etc).
   *
   * @example
   *   const link = new LinkBase(page, 'a[href="/dashboard"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator (e.g., page.getByRole()).
   *
   * @example
   *   const link = new LinkBase(page.getByRole("link", { name: "Dashboard" }));
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      // Usage: new LinkBase(page, 'a[href="/dashboard"]')
      this.locator = (pageOrLocator as Page).locator(selector);
    } else {
      // Usage: new LinkBase(page.getByRole("link", { name: "Dashboard" }))
      this.locator = pageOrLocator as Locator;
    }
  }

  /**
   * Expose the underlying Locator for advanced operations.
   */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // Navigation & click actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Click the link and wait for the next network response after the click.
   *
   * Generic helper for flows where the link click triggers
   * an important network call (navigation, SPA route change, etc.).
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
   * Click the link without waiting for navigation.
   * Use this for in-page actions (e.g., modals, accordions).
   */
  async click(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click(options);
    return this;
  }

  /**
   * Click and wait for a new page (e.g., target="_blank").
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
   * Click the link and wait for the URL on the *current* page
   * to match an expected string or RegExp.
   *
   * This is typically how juniors will test navigation:
   *
   *   await dashboardLink.clickAndWaitForUrl(/\/dashboard$/);
   */
  async clickAndWaitForUrl(
    expected: string | RegExp,
    options?: { timeout?: number }
  ): Promise<this> {
    const page = this.locator.page();
    await Promise.all([
      page.waitForURL(expected, { timeout: options?.timeout ?? 30_000 }),
      this.locator.click(),
    ]);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Getters (async)
  // ───────────────────────────────────────────────────────────────

  /** Get the `href` attribute (empty string if missing). */
  async getHref(): Promise<string> {
    return (await this.locator.getAttribute("href")) ?? "";
  }

  /** Get the visible text content. */
  async getText(): Promise<string> {
    return (await this.locator.textContent({ timeout: 5_000 }))?.trim() ?? "";
  }

  /** Get the `target` attribute. */
  async getTarget(): Promise<string | null> {
    return await this.locator.getAttribute("target");
  }

  /** Get the `rel` attribute (e.g., "noopener noreferrer nofollow"). */
  async getRel(): Promise<string | null> {
    return await this.locator.getAttribute("rel");
  }

  /** Get a specific attribute value. */
  async getAttribute(name: string): Promise<string | null> {
    return await this.locator.getAttribute(name);
  }

  /** Check if link is disabled (framework-dependent: aria/role/disabled). */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /** Check if link is visible. */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  // ───────────────────────────────────────────────────────────────
  // Actions (advanced)
  // ───────────────────────────────────────────────────────────────

  /** Hover over the link. */
  async hover(options?: Parameters<Locator["hover"]>[0]): Promise<this> {
    await this.locator.hover(options);
    return this;
  }

  /** Double-click the link. */
  async dblclick(options?: Parameters<Locator["dblclick"]>[0]): Promise<this> {
    await this.locator.dblclick(options);
    return this;
  }

  /** Right-click the link. */
  async rightClick(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click({ ...options, button: "right" });
    return this;
  }

  /** Focus the link. */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /** Remove focus from the link. */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /** Scroll link into view if needed. */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Take a screenshot of just the link.
   *
   * @param path Optional path; if provided, writes screenshot to disk.
   * @returns The screenshot Buffer.
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions (async – wrap Playwright's auto-retrying expect)
  // ───────────────────────────────────────────────────────────────

  /** Assert link has exact text. */
  async shouldHaveText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveText(expected);
    return this;
  }

  /** Assert link contains text. */
  async shouldContainText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toContainText(expected);
    return this;
  }

  /** Assert link has exact href. */
  async shouldHaveHref(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("href", expected);
    return this;
  }

  /** Assert link has specific rel attribute. */
  async shouldHaveRel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("rel", expected);
    return this;
  }

  /** Assert link has target="_blank". */
  async shouldOpenInNewTab(): Promise<this> {
    await expect(this.locator).toHaveAttribute("target", "_blank");
    return this;
  }

  /** Assert link does *not* have target="_blank" (opens in same tab). */
  async shouldOpenInSameTab(): Promise<this> {
    await expect(this.locator).not.toHaveAttribute("target", "_blank");
    return this;
  }

  /** Assert link has rel containing "nofollow". */
  async shouldBeNoFollow(): Promise<this> {
    await expect(this.locator).toHaveAttribute("rel", /nofollow/);
    return this;
  }

  /** Assert link is visible. */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /** Assert link is hidden. */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert link is not visible (alias for hidden). */
  async shouldNotBeVisible(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert link is enabled. */
  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  /** Assert link is disabled. */
  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  /** Assert link is focused. */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Assert link intersects the viewport.
   *
   * @param options.ratio   0–1: how much of the element must be visible.
   * @param options.timeout Assertion timeout override (optional).
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  /** Assert link has specific class. */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /** Assert link has aria-label. */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /** Assert link has a specific accessible name. */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /** Assert link has a specific accessible description. */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  /** Assert link has a specific attribute and value. */
  async shouldHaveAttribute(
    name: string,
    value: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute(name, value);
    return this;
  }

  /** Assert link does *not* have a given attribute. */
  async shouldNotHaveAttribute(name: string): Promise<this> {
    await expect(this.locator).not.toHaveAttribute(name, /.*/);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /** Wait for link to be visible and enabled. */
  async waitUntilReady(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeEnabled({ timeout });
    return this;
  }

  /** Wait for href to match/contain a value. */
  async waitForHref(
    expected: string | RegExp,
    timeout = 10_000
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute("href", expected, { timeout });
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
}
