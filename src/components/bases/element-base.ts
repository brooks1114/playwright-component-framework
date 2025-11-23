// src/components/bases/element-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * ElementBase
 * -----------
 * Generic, chainable base class for non-interactive DOM elements:
 *
 *  - Headings
 *  - Labels
 *  - Static text blocks
 *  - Card / section containers
 *  - Icons, tags, badges, etc.
 *
 * It wraps a Playwright Locator and exposes common getters + assertions,
 * so component/page objects rarely need to talk to `expect` directly.
 *
 * Construction:
 *  - new ElementBase(page, "#matter-details");
 *  - new ElementBase(page.getByRole("heading", { name: "Case name" }));
 *
 * Example:
 *   const heading = new ElementBase(
 *     page.getByRole("heading", { name: "Matter details" })
 *   );
 *
 *   await heading
 *     .shouldBeVisible()
 *     .shouldHaveText("Matter details");
 */
export class ElementBase {
  /** Underlying Playwright Locator. All operations are routed through this. */
  readonly locator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string (CSS/xpath/etc).
   *
   * @example
   *   const element = new ElementBase(page, "#matter-details");
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator.
   *
   * @example
   *   const element = new ElementBase(
   *     page.getByRole("heading", { name: "Case name" })
   *   );
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
   * Expose the underlying Locator for advanced operations.
   *
   * Use this if you need something that ElementBase does not wrap yet:
   *
   *   await element.asLocator().nth(0).click();
   */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // GETTERS
  // ───────────────────────────────────────────────────────────────

  /** Get visible text content (trimmed, empty string if none). */
  async getText(timeout = 5_000): Promise<string> {
    return (await this.locator.textContent({ timeout }))?.trim() ?? "";
  }

  /** Get innerHTML for this element. */
  async getHtml(): Promise<string> {
    return (await this.locator.innerHTML()) ?? "";
  }

  /** Get a specific attribute value. */
  async getAttribute(name: string): Promise<string | null> {
    return await this.locator.getAttribute(name);
  }

  /** Get the element id attribute (if present). */
  async getId(): Promise<string | null> {
    return await this.locator.getAttribute("id");
  }

  /** Get the element class attribute as a raw string (or null). */
  async getClassName(): Promise<string | null> {
    return await this.locator.getAttribute("class");
  }

  /** Get the element class list as an array of class names. */
  async getClassList(): Promise<string[]> {
    const classAttr = (await this.locator.getAttribute("class")) ?? "";
    return classAttr
      .split(/\s+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
  }

  /** Check if element is visible. */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /** Check if element is hidden. */
  async isHidden(): Promise<boolean> {
    return await this.locator.isHidden();
  }

  /** Check if element is enabled (for ARIA/role-based controls). */
  async isEnabled(): Promise<boolean> {
    return await this.locator.isEnabled();
  }

  /** Check if element is disabled. */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  // ───────────────────────────────────────────────────────────────
  // ASSERTIONS
  // ───────────────────────────────────────────────────────────────

  /** Assert element is visible. */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /** Assert element is hidden. */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Alias: assert element is NOT visible. */
  async shouldNotBeVisible(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert element has exact text (string or RegExp). */
  async shouldHaveText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveText(expected);
    return this;
  }

  /** Assert element contains text (substring or pattern). */
  async shouldContainText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toContainText(expected);
    return this;
  }

  /** Assert element has a specific class or matches a pattern. */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /** Assert element has a specific id. */
  async shouldHaveId(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("id", expected);
    return this;
  }

  /** Assert element has a specific attribute and value. */
  async shouldHaveAttribute(
    name: string,
    value: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute(name, value);
    return this;
  }

  /** Assert element does *not* have the given attribute. */
  async shouldNotHaveAttribute(name: string): Promise<this> {
    await expect(this.locator).not.toHaveAttribute(name, /.*/);
    return this;
  }

  /** Assert element has a specific accessible name. */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /** Assert element has a specific accessible description. */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  /**
   * Assert element intersects the viewport.
   *
   * @param options.ratio  0–1: how much of the element must be visible.
   * @param options.timeout Assertion timeout override (optional).
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // WAITERS
  // ───────────────────────────────────────────────────────────────

  /** Wait until element is visible. */
  async waitUntilVisible(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    return this;
  }

  /** Wait until element is hidden (detached or not visible). */
  async waitUntilHidden(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "hidden", timeout });
    return this;
  }

  /** Wait until text matches/contains the expected value. */
  async waitForText(
    expected: string | RegExp,
    timeout = 10_000
  ): Promise<this> {
    await expect(this.locator).toHaveText(expected, { timeout });
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // UTILITIES
  // ───────────────────────────────────────────────────────────────

  /** Scroll element into view if needed. */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Take a screenshot of just this element.
   *
   * @param path Optional path to save the screenshot.
   * @returns The screenshot Buffer.
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }
}
