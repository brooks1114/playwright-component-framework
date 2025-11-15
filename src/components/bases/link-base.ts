// components/bases/link-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * Chainable, type-safe base class for <a> anchor links.
 * Wraps Playwright locator actions, navigation helpers, attributes, and assertions.
 *
 * All methods that talk to the page or use Playwright's async expect()
 * are async and return `this` for chaining, unless noted otherwise.
 *
 * @example
 * const link = new LinkBase(page, 'a[href="/dashboard"]');
 * await link.clickAndNavigate();
 * await link.shouldHaveText("Dashboard");
 * await link.shouldOpenInNewTab();
 */
export class LinkBase {
  readonly locator: Locator;

  constructor(page: Page, selector: string) {
    this.locator = page.locator(selector);
  }

  // === NAVIGATION & CLICK ACTIONS ===

  /**
   * Click the link and wait for the next network response after the click.
   *
   * This is a generic helper for flows where the link click triggers
   * an important network call (e.g., navigation, SPA route change).
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
   * Click the link without waiting for navigation.
   * Use for in-page actions (e.g., modals, accordions).
   */
  async click(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click(options);
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

  // === GETTERS (async) ===

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

  /** Get the `rel` attribute (e.g., "nofollow"). */
  async getRel(): Promise<string | null> {
    return await this.locator.getAttribute("rel");
  }

  /** Check if link is disabled (framework-dependent: aria/role/disabled). */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /** Check if link is visible. */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  // === ACTIONS (advanced) ===

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

  // === ASSERTIONS (async – wrap Playwright's auto-retrying expect) ===

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

  /** Assert link has target="_blank". */
  async shouldOpenInNewTab(): Promise<this> {
    await expect(this.locator).toHaveAttribute("target", "_blank");
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

  // === WAITERS ===

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

  // === UTILITIES ===

  /** Scroll link into view. */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /** Take a screenshot of just the link. */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }
}
