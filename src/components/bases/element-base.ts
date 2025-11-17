// components/bases/element-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * Generic, chainable base class for non-interactive elements:
 *
 * - Headings
 * - Labels
 * - Static text blocks
 * - Card containers
 * - Icons, tags, etc.
 *
 * It wraps a Playwright Locator and exposes common getters + assertions,
 * so component/page objects never need to call `expect` directly.
 *
 * Construction:
 *  - new ElementBase(page, '#matter-details');
 *  - new ElementBase(page.getByRole('heading', { name: 'Case name' }));
 */
export class ElementBase {
  readonly locator: Locator;

  // Constructors: (page, selector) OR (locator)
  constructor(page: Page, selector: string);
  constructor(locator: Locator);
  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      this.locator = (pageOrLocator as Page).locator(selector);
    } else {
      this.locator = pageOrLocator as Locator;
    }
  }

  // === GETTERS ===

  /** Get visible text content (trimmed, empty string if none). */
  async getText(timeout = 5_000): Promise<string> {
    return (await this.locator.textContent({ timeout }))?.trim() ?? "";
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

  // === ASSERTIONS ===

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

  /** Assert element intersects the viewport. */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  // === WAITERS ===

  /** Wait until element is visible. */
  async waitUntilVisible(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    return this;
  }

  /** Wait until element is hidden. */
  async waitUntilHidden(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "hidden", timeout });
    return this;
  }

  // === UTILITIES ===

  /** Scroll element into view. */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /** Take a screenshot of just this element. */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }
}
