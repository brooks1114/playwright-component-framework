// src/components/bases/label-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { ElementBase } from "./element-base";

/**
 * LabelBase
 * ---------
 * Semantic base class for labels/headings/text elements.
 *
 * Typical DOM examples:
 *  - <h2>Matter details</h2>
 *  - <h6>Case name</h6>
 *  - <label for="caseName">Case name</label>
 *  - <div class="lm-Body" data-testid="CaseNameLabel">Case name *</div>
 *
 * Design:
 *  - Extends ElementBase, so it inherits all generic element assertions:
 *      - shouldBeVisible, shouldContainText, shouldHaveClass, etc.
 *  - Adds label-specific helpers around "required" indicators and naming.
 *  - Uses Playwright's auto-retrying expect() for assertions.
 *
 * Usage from a Section or Component:
 *
 *   const label = new LabelBase(
 *     section.locator.getByRole("heading", { name: "Case name" })
 *   );
 *
 *   await label
 *     .shouldBeVisible()
 *     .shouldIndicateRequired();   // e.g., "Case name *" or aria-required="true"
 */
export class LabelBase extends ElementBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string.
   *
   * @example
   *   const label = new LabelBase(page, 'label[for="caseName"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator (heading/label/text node).
   *
   * @example
   *   const label = new LabelBase(
   *     page.getByRole("heading", { name: "Case name" })
   *   );
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      // Usage: new LabelBase(page, 'label[for="caseName"]')
      super(pageOrLocator as Page, selector);
    } else {
      // Usage: new LabelBase(page.getByRole('heading', { name: 'Case name' }))
      super(pageOrLocator as Locator);
    }
  }

  /**
   * Expose the underlying Locator for advanced operations.
   */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // Label-specific helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Heuristic check: does this label *appear* to indicate a required field?
   *
   * This looks for common patterns:
   *  - aria-required="true"
   *  - data-required="true" or data-required present
   *  - trailing asterisk in the text: "Case name *"
   *  - "(required)" substring: "Case name (required)"
   *
   * NOTE:
   *  - This does *not* assert. It just returns a boolean.
   *  - Prefer the assertion helpers for test code:
   *      await label.shouldIndicateRequired();
   */
  async isRequiredIndicatorPresent(): Promise<boolean> {
    // ARIA pattern
    const ariaRequired = await this.locator.getAttribute("aria-required");
    if (ariaRequired?.toLowerCase() === "true") {
      return true;
    }

    // data-required pattern (HTML/custom attribute)
    const dataRequired = await this.locator.getAttribute("data-required");
    if (
      dataRequired !== null &&
      (dataRequired === "" || dataRequired.toLowerCase() === "true")
    ) {
      return true;
    }

    // Text-based patterns (* or "(required)")
    const rawText = (await this.locator.textContent()) ?? "";
    const text = rawText.trim();

    // e.g., "Case name *" or "Case name*"
    if (/\*\s*$/.test(text)) {
      return true;
    }

    // e.g., "Case name (required)"
    if (/\(required\)/i.test(text)) {
      return true;
    }

    return false;
  }

  /**
   * Assert that the label indicates a required field.
   *
   * Uses `isRequiredIndicatorPresent()` under the hood and wraps it
   * with Playwright's auto-retrying `expect.poll()` so it remains
   * stable under async UI updates.
   *
   * @example
   *   await label.shouldIndicateRequired();
   */
  async shouldIndicateRequired(timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.isRequiredIndicatorPresent(), { timeout })
      .toBe(true);
    return this;
  }

  /**
   * Assert that the label does *not* indicate a required field.
   *
   * Inverse of shouldIndicateRequired().
   *
   * @example
   *   await label.shouldNotIndicateRequired();
   */
  async shouldNotIndicateRequired(timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.isRequiredIndicatorPresent(), { timeout })
      .toBe(false);
    return this;
  }

  /**
   * Assert the label's trimmed text exactly matches the expected value.
   *
   * This is a thin alias over ElementBase / Locator behavior, but keeps
   * test code expressive:
   *
   *   await caseNameLabel.shouldHaveLabelText("Case name");
   */
  async shouldHaveLabelText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveText(expected);
    return this;
  }

  /**
   * Assert the label's text contains a substring/pattern.
   *
   * Example:
   *   await label.shouldContainLabelText("Matter details");
   */
  async shouldContainLabelText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toContainText(expected);
    return this;
  }
}
