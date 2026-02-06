// src/components/bases/element-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * ElementBase
 * -----------
 * The foundational, chainable base class for **non-interactive** DOM elements in a React application.
 *
 * Intended for:
 * - Headings (`<h1>`, `<h2>`, etc.)
 * - Labels, static text blocks, paragraphs
 * - Cards, sections, containers, panels
 * - Icons, badges, tags, chips, avatars
 * - Any read-only content that does **not** require input or click actions
 *
 * Wraps a Playwright `Locator` and provides:
 * - Getters for text, HTML, attributes, visibility, classes
 * - Fluent assertions using Playwright's auto-waiting `expect`
 * - Waiters for visibility and content changes
 * - Utilities (scroll, screenshot)
 *
 * All interactive elements (buttons, inputs, checkboxes, etc.) should extend more specific bases
 * like `ButtonBase`, `InputBase`, `CheckboxBase`, etc.
 *
 * @example
 * // Recommended: via ComponentFactory
 * const $ = new ComponentFactory(page);
 * const title = $.headingByRole("Welcome to Dashboard");
 *
 * await title
 *   .shouldBeVisible()
 *   .shouldHaveText("Welcome to Dashboard")
 *   .shouldHaveClass("text-2xl font-bold");
 *
 * @example
 * // Direct construction
 * const cardTitle = new ElementBase(
 *   page.getByRole("heading", { name: "Patient Summary" })
 * );
 * await cardTitle.scrollIntoView().shouldBeInViewport();
 */
export class ElementBase {
  /** Underlying Playwright Locator — all operations are performed through this. */
  readonly locator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates an ElementBase from a Page and selector string.
   *
   * @param page - Playwright Page instance
   * @param selector - CSS, XPath, or text selector
   *
   * @example
   * const section = new ElementBase(page, "section[data-testid='summary']");
   */
  constructor(page: Page, selector: string);

  /**
   * Creates an ElementBase directly from a pre-resolved Locator (preferred).
   *
   * @param locator - Locator targeting the element
   *
   * @example
   * const badge = new ElementBase(page.getByText("New", { exact: true }));
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
   * @returns Raw Locator instance
   *
   * @example
   * await element.asLocator().hover(); // access methods not wrapped by ElementBase
   */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // Getters
  // ───────────────────────────────────────────────────────────────

  /**
   * Gets the visible text content of the element (trimmed).
   *
   * @param timeout - Optional timeout override (ms)
   * @returns Trimmed text or empty string if none
   */
  async getText(timeout = 5_000): Promise<string> {
    return (await this.locator.textContent({ timeout }))?.trim() ?? "";
  }

  /**
   * Gets the inner HTML of the element.
   *
   * @returns Inner HTML string (empty if none)
   */
  async getHtml(): Promise<string> {
    return (await this.locator.innerHTML()) ?? "";
  }

  /**
   * Gets the value of a specified attribute.
   *
   * @param name - Attribute name (e.g. "data-testid", "aria-label")
   * @returns Attribute value or `null` if not present
   */
  async getAttribute(name: string): Promise<string | null> {
    return await this.locator.getAttribute(name);
  }

  /**
   * Gets the `id` attribute value.
   *
   * @returns ID string or `null`
   */
  async getId(): Promise<string | null> {
    return await this.locator.getAttribute("id");
  }

  /**
   * Gets the `class` attribute as a raw string.
   *
   * @returns Class string or `null`
   */
  async getClassName(): Promise<string | null> {
    return await this.locator.getAttribute("class");
  }

  /**
   * Gets the list of classes applied to the element.
   *
   * @returns Array of class names (empty if none)
   */
  async getClassList(): Promise<string[]> {
    const classAttr = (await this.locator.getAttribute("class")) ?? "";
    return classAttr
      .split(/\s+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
  }

  /**
   * Checks whether the element is currently visible.
   *
   * @returns `true` if visible, `false` otherwise
   */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /**
   * Checks whether the element is hidden.
   *
   * @returns `true` if hidden, `false` otherwise
   */
  async isHidden(): Promise<boolean> {
    return await this.locator.isHidden();
  }

  /**
   * Checks if the element is enabled (useful for ARIA-controlled elements).
   *
   * @returns `true` if enabled, `false` if disabled
   */
  async isEnabled(): Promise<boolean> {
    return await this.locator.isEnabled();
  }

  /**
   * Checks if the element is disabled.
   *
   * @returns `true` if disabled, `false` otherwise
   */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  // ───────────────────────────────────────────────────────────────
  // Fluent Assertions (auto-retrying via expect)
  // ───────────────────────────────────────────────────────────────

  /**
   * Asserts the element is visible.
   *
   * @returns This instance (for chaining)
   */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /**
   * Asserts the element is hidden.
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
   * Asserts the element has exact text content.
   *
   * @param expected - Exact string or RegExp pattern
   */
  async shouldHaveText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveText(expected);
    return this;
  }

  /**
   * Asserts the element contains the expected text (substring or pattern).
   *
   * @param expected - Substring or RegExp
   */
  async shouldContainText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toContainText(expected);
    return this;
  }

  /**
   * Asserts the element has a specific class or class pattern.
   *
   * @param expected - Exact class name or RegExp
   */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /**
   * Asserts the element has a specific `id` attribute.
   *
   * @param expected - Exact ID or RegExp
   */
  async shouldHaveId(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("id", expected);
    return this;
  }

  /**
   * Asserts the element has a specific attribute with expected value.
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
   * Asserts the element does **not** have the specified attribute.
   *
   * @param name - Attribute name that should be absent
   */
  async shouldNotHaveAttribute(name: string): Promise<this> {
    await expect(this.locator).not.toHaveAttribute(name, /.*/);
    return this;
  }

  /**
   * Asserts the element has the expected accessible name.
   *
   * @param expected - Accessible name or pattern
   */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /**
   * Asserts the element has the expected accessible description.
   *
   * @param expected - Accessible description or pattern
   */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  /**
   * Asserts the element is at least partially in the viewport.
   *
   * @param options - Configuration
   * @param options.ratio - Minimum visible ratio (0–1, default ~0)
   * @param options.timeout - Assertion timeout override
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /**
   * Waits until the element becomes visible.
   *
   * @param timeout - Max wait time (ms)
   */
  async waitUntilVisible(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    return this;
  }

  /**
   * Waits until the element becomes hidden or detached.
   *
   * @param timeout - Max wait time (ms)
   */
  async waitUntilHidden(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "hidden", timeout });
    return this;
  }

  /**
   * Waits until the element's text matches or contains the expected value.
   *
   * @param expected - Text or RegExp to wait for
   * @param timeout - Max wait time (ms)
   */
  async waitForText(
    expected: string | RegExp,
    timeout = 10_000,
  ): Promise<this> {
    await expect(this.locator).toHaveText(expected, { timeout });
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Utilities
  // ───────────────────────────────────────────────────────────────

  /**
   * Scrolls the element into view if not already visible.
   *
   * @returns This instance (for chaining)
   */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Captures a screenshot of this element only.
   *
   * @param path - Optional file path to save screenshot
   * @returns Screenshot buffer
   *
   * @example
   * await heading.screenshot("screenshots/heading.png");
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }
}
