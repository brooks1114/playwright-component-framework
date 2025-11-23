// src/components/bases/section-base.ts
import { Page, Locator } from "@playwright/test";
import { ElementBase } from "./element-base";
import { LabelBase } from "./label-base";

/**
 * SectionBase
 * -----------
 * Semantic wrapper for page/card sections.
 *
 * Represents a container element (e.g., card, panel, form section) and
 * provides helpers for working with elements *inside* that section.
 *
 * Design principles:
 *  - This class does NOT call Playwright `expect` directly.
 *  - All assertions are delegated to ElementBase / LabelBase (and friends).
 *  - This keeps SectionBase focused on scoping + element discovery.
 *
 * Typical usage:
 *
 *   const section = new SectionBase(page, "#matter-details");
 *
 *   // Get a heading inside the section
 *   const heading = section.getHeadingByText("Matter details");
 *   await heading.shouldBeVisible();
 *
 *   // Get a label by text within the section
 *   const caseNameLabel = section.getLabelByText("Case name");
 *   await caseNameLabel.shouldHaveText("Case name");
 *
 *   // Get a generic element by data-testid within the section
 *   const nameDisplay = section.getElementByTestId("MatterName");
 *   await nameDisplay.shouldBeVisible();
 *
 * NOTE:
 *  - If you need more specialized behavior (inputs, dropdowns, etc.),
 *    your ComponentFactory is the preferred entry point.
 */
export class SectionBase extends ElementBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string that points to
   * the section container.
   *
   * @example
   *   const section = new SectionBase(page, "#matter-details");
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator pointing at the section.
   *
   * @example
   *   const section = new SectionBase(
   *     page.getByRole("region", { name: "Matter details" })
   *   );
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      // Usage: new SectionBase(page, "#matter-details")
      super(pageOrLocator as Page, selector);
    } else {
      // Usage: new SectionBase(page.getByRole("region", { name: "..." }))
      super(pageOrLocator as Locator);
    }
  }

  // ───────────────────────────────────────────────────────────────
  // Scoped element helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Get a heading inside the section by accessible name.
   *
   * Works for any heading level (h1–h6), relying only on accessible name.
   *
   * @example
   *   const heading = section.getHeadingByText("Matter details");
   *   await heading.shouldBeVisible();
   */
  getHeadingByText(name: string | RegExp): LabelBase {
    return new LabelBase(
      this.locator.getByRole("heading", {
        name,
      })
    );
  }

  /**
   * Get a label inside the section by its exact/regex text.
   *
   * This is useful for form sections where labels are <label> elements
   * or headings that act as labels.
   *
   * @example
   *   const label = section.getLabelByText("Case name");
   *   await label.shouldHaveText("Case name");
   */
  getLabelByText(text: string | RegExp): LabelBase {
    return new LabelBase(this.locator.getByText(text));
  }

  /**
   * Get a generic element inside the section by data-testid.
   *
   * @example
   *   const nameDisplay = section.getElementByTestId("MatterName");
   *   await nameDisplay.shouldBeVisible();
   */
  getElementByTestId(testId: string): ElementBase {
    return new ElementBase(this.locator.getByTestId(testId));
  }

  /**
   * Get a generic element inside the section by role and name.
   *
   * This is useful when you want a11y-first locators but scoped
   * to the section container.
   *
   * @example
   *   const saveButton = section.getElementByRole("button", "Save");
   *   await saveButton.shouldBeVisible();
   */
  getElementByRole(
    role: Parameters<Locator["getByRole"]>[0],
    name?: string | RegExp,
    options?: { exact?: boolean }
  ): ElementBase {
    return new ElementBase(
      this.locator.getByRole(role, {
        name,
        exact: options?.exact,
      } as any)
    );
  }

  /**
   * Get a generic ElementBase for a descendant selector within this section.
   *
   * This is a "low-level escape hatch" when you need CSS/xpath inside
   * the section, but still want ElementBase behavior.
   *
   * @example
   *   const errorBanner = section.getElement("[data-test='error-banner']");
   *   await errorBanner.shouldBeVisible();
   */
  getElement(selector: string): ElementBase {
    return new ElementBase(this.locator.locator(selector));
  }
}
