// src/components/bases/label-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { ElementBase } from "./element-base";

/**
 * LabelBase
 * ---------
 * Semantic base class for **labels**, **headings**, and **field captions** in a React application.
 *
 * Common DOM representations:
 * - `<label for="...">First name</label>`
 * - `<h1>`, `<h2>`, `<h3>`, etc. (section titles, form legends)
 * - `<span>`, `<div>`, or `<p>` used as visual labels (e.g. with `data-testid`, `class="field-label"`)
 * - Custom components that render text for form fields or sections
 *
 * Extends `ElementBase`, so it inherits:
 * - `shouldBeVisible()`, `shouldHaveText()`, `shouldContainText()`, `shouldHaveClass()`,
 *   `shouldHaveAttribute()`, `shouldBeInViewport()`, `waitUntilVisible()`, `screenshot()`, etc.
 *
 * Adds label-specific helpers:
 * - Detection and assertion of **required field indicators** (ARIA, data attributes, text patterns)
 * - Expressive text assertions tailored for label usage
 *
 * @extends ElementBase
 *
 * @example
 * // Recommended: via ComponentFactory
 * const $ = new ComponentFactory(page);
 * const nameLabel = $.labelByText("Full name");
 *
 * await nameLabel
 *   .shouldBeVisible()
 *   .shouldHaveLabelText("Full name")
 *   .shouldIndicateRequired();
 *
 * @example
 * // Direct construction
 * const statusLabel = new LabelBase(
 *   page.getByRole("heading", { name: "Application Status" })
 * );
 * await statusLabel.shouldContainLabelText("Status");
 */
export class LabelBase extends ElementBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a LabelBase from a Page and selector string.
   *
   * @param page - Playwright Page instance
   * @param selector - CSS/XPath/text selector targeting the label/heading
   *
   * @example
   * const label = new LabelBase(page, 'label[for="email"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Creates a LabelBase directly from an existing Locator (preferred).
   *
   * @param locator - Locator targeting the label, heading, or text element
   *
   * @example
   * const label = new LabelBase(page.getByText("Date of birth", { exact: true }));
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      super(pageOrLocator as Page, selector);
    } else {
      super(pageOrLocator as Locator);
    }
  }

  /**
   * Returns the underlying Playwright Locator for advanced operations.
   *
   * @returns Raw Locator instance
   */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // Required Field Detection & Helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Determines whether this label appears to indicate a required field.
   *
   * Detection heuristics (checked in order):
   * 1. `aria-required="true"` on the label itself
   * 2. `data-required` attribute present (with or without value, or "true")
   * 3. Text ends with asterisk (`*`) — common visual convention
   * 4. Text contains "(required)" (case-insensitive)
   *
   * @returns `true` if a required indicator is detected, `false` otherwise
   *
   * @remarks
   * This is a **heuristic** check — not authoritative. Some apps may use different patterns.
   * Use `shouldIndicateRequired()` / `shouldNotIndicateRequired()` for assertions.
   */
  async isRequiredIndicatorPresent(): Promise<boolean> {
    // 1. ARIA required
    const ariaRequired = await this.locator.getAttribute("aria-required");
    if (ariaRequired?.toLowerCase() === "true") return true;

    // 2. data-required attribute (common in custom components)
    const dataRequired = await this.locator.getAttribute("data-required");
    if (dataRequired !== null) {
      // presence alone or explicit "true" counts
      if (dataRequired === "" || dataRequired.toLowerCase() === "true")
        return true;
    }

    // 3. Text-based indicators
    const rawText = (await this.locator.textContent()) ?? "";
    const text = rawText.trim();

    // Ends with asterisk (with optional whitespace)
    if (/\*\s*$/.test(text)) return true;

    // Contains "(required)" – case-insensitive
    if (/\(required\)/i.test(text)) return true;

    return false;
  }

  /**
   * Asserts that the label indicates a required field (using polling for stability).
   *
   * @param timeout - Max wait time (ms) – useful when form state changes asynchronously
   * @returns This instance (for chaining)
   *
   * @example
   * await requiredFieldLabel.shouldIndicateRequired();
   */
  async shouldIndicateRequired(timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.isRequiredIndicatorPresent(), {
        message: "Expected label to indicate a required field",
        timeout,
      })
      .toBe(true);
    return this;
  }

  /**
   * Asserts that the label does **not** indicate a required field.
   *
   * @param timeout - Max wait time (ms)
   * @returns This instance (for chaining)
   */
  async shouldNotIndicateRequired(timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.isRequiredIndicatorPresent(), {
        message: "Expected label to NOT indicate a required field",
        timeout,
      })
      .toBe(false);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Label-Specific Text Assertions
  // ───────────────────────────────────────────────────────────────

  /**
   * Asserts that the label's trimmed text exactly matches the expected value.
   *
   * Thin wrapper over `ElementBase.shouldHaveText()` with more semantic naming.
   *
   * @param expected - Exact string or RegExp pattern
   * @returns This instance (for chaining)
   */
  async shouldHaveLabelText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveText(expected);
    return this;
  }

  /**
   * Asserts that the label's text contains the expected substring or pattern.
   *
   * Thin wrapper over `ElementBase.shouldContainText()` with semantic naming.
   *
   * @param expected - Substring or RegExp to find
   * @returns This instance (for chaining)
   */
  async shouldContainLabelText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toContainText(expected);
    return this;
  }
}
