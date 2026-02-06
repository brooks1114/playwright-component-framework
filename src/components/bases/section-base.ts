// src/components/bases/section-base.ts
import { Page, Locator } from "@playwright/test";
import { ElementBase } from "./element-base";
import { LabelBase } from "./label-base";

/**
 * SectionBase
 * -----------
 * Semantic scoping wrapper for page sections, cards, panels, form groups, regions, etc.
 *
 * Represents a container element (e.g. `<section>`, `<div role="region">`, card wrapper)
 * and provides **scoped** helpers to locate child elements within it.
 *
 * Design principles:
 *  - Does NOT perform assertions (`expect`) itself
 *  - Delegates assertions to `ElementBase`, `LabelBase`, or more specialized bases
 *  - Focuses exclusively on **discovery** and **scoping** of child elements
 *  - Prefers accessibility-first locators (`getByRole`, accessible name) when possible
 *  - Acts as a clean boundary for ComponentFactory composition
 *
 * Typical usage:
 * ```ts
 * const section = new SectionBase(page, "#user-profile-card");
 *
 * await section
 *   .getHeadingByText("User Profile")
 *   .shouldBeVisible();
 *
 * const emailLabel = section.getLabelByText("Email address");
 * await emailLabel.shouldBeVisible();
 *
 * const saveBtn = section.getElementByRole("button", "Save");
 * await saveBtn.click();
 * ```
 *
 * Recommended entry point: Use via `ComponentFactory`:
 * ```ts
 * const $ = new ComponentFactory(page);
 * const profileSection = $.sectionByTestId("user-profile");
 * ```
 */
export class SectionBase extends ElementBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string pointing to the section container.
   *
   * @param page - Playwright Page instance
   * @param selector - CSS, XPath, or text selector for the section root
   * @example
   *   const section = new SectionBase(page, "#account-settings");
   *   const section = new SectionBase(page, '[data-testid="profile-card"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator already pointing to the section.
   *
   * @param locator - Pre-resolved Locator (preferred for accessibility)
   * @example
   *   const section = new SectionBase(
   *     page.getByRole("region", { name: "Billing information" })
   *   );
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      super(pageOrLocator as Page, selector);
    } else {
      super(pageOrLocator as Locator);
    }
  }

  // ───────────────────────────────────────────────────────────────
  // Scoped Element Factories
  // ───────────────────────────────────────────────────────────────

  /**
   * Locates a heading (h1–h6) inside this section by its accessible name.
   *
   * @param name - Exact or RegExp pattern to match the heading's accessible name
   * @returns LabelBase wrapping the heading (supports heading assertions)
   * @example
   *   const title = section.getHeadingByText("Payment Details");
   *   await title.shouldHaveText("Payment Details");
   */
  getHeadingByText(name: string | RegExp): LabelBase {
    return new LabelBase(this.locator.getByRole("heading", { name }));
  }

  /**
   * Locates a label element (or label-like text) inside the section by its text content.
   *
   * Useful for form sections where labels precede inputs.
   *
   * @param text - Exact or RegExp text to match
   * @returns LabelBase for assertion and interaction
   * @example
   *   const label = section.getLabelByText("Date of birth");
   *   await label.shouldBeVisible();
   */
  getLabelByText(text: string | RegExp): LabelBase {
    return new LabelBase(this.locator.getByText(text));
  }

  /**
   * Locates an element inside the section using its `data-testid` attribute.
   *
   * Preferred for stable, non-visible test identifiers.
   *
   * @param testId - Value of the data-testid attribute
   * @returns ElementBase for generic assertions and actions
   * @example
   *   const status = section.getElementByTestId("subscription-status");
   *   await status.shouldHaveText("Active");
   */
  getElementByTestId(testId: string): ElementBase {
    return new ElementBase(this.locator.getByTestId(testId));
  }

  /**
   * Locates any element inside the section by ARIA role and optional accessible name.
   *
   * Accessibility-first way to find buttons, links, regions, etc. within the section.
   *
   * @param role - ARIA role (button, link, textbox, region, etc.)
   * @param name - Optional accessible name or RegExp to match
   * @param options - Additional getByRole options (e.g. { exact: true })
   * @returns ElementBase wrapping the matched element
   * @example
   *   const submit = section.getElementByRole("button", "Submit");
   *   await submit.click();
   */
  getElementByRole(
    role: Parameters<Locator["getByRole"]>[0],
    name?: string | RegExp,
    options?: { exact?: boolean },
  ): ElementBase {
    return new ElementBase(
      this.locator.getByRole(role, {
        name,
        exact: options?.exact,
      } as any),
    );
  }

  /**
   * Low-level escape hatch: Locates any descendant using a CSS/XPath selector
   * relative to this section.
   *
   * Use only when role/name/testId locators are insufficient.
   *
   * @param selector - CSS or XPath selector (relative to section)
   * @returns ElementBase for the matched element
   * @example
   *   const alert = section.getElement(".alert.alert-error");
   *   await alert.shouldContainText("Invalid input");
   */
  getElement(selector: string): ElementBase {
    return new ElementBase(this.locator.locator(selector));
  }

  /**
   * Locates an input, textarea, or select inside the section by its associated label text.
   *
   * Very useful in form-heavy sections.
   *
   * @param labelText - Text of the label associated with the control
   * @returns ElementBase (can be further cast to InputBase, SelectBase, etc. in tests)
   * @example
   *   const input = section.getInputByLabel("Full name");
   *   await input.fill("John Doe");
   */
  getInputByLabel(labelText: string | RegExp): ElementBase {
    return new ElementBase(this.locator.getByLabel(labelText));
  }

  /**
   * Locates any link inside the section by its visible text or accessible name.
   *
   * @param name - Link text or RegExp
   * @returns ElementBase wrapping the <a> element
   * @example
   *   const link = section.getLinkByText("View invoice");
   *   await link.click();
   */
  getLinkByText(name: string | RegExp): ElementBase {
    return new ElementBase(this.locator.getByRole("link", { name }));
  }

  /**
   * Returns all direct children that match a role, useful for counting or iterating.
   *
   * @param role - ARIA role to filter by
   * @returns Array of ElementBase instances
   */
  async getAllByRole(
    role: Parameters<Locator["getByRole"]>[0],
  ): Promise<ElementBase[]> {
    const locators = await this.locator.getByRole(role).all();
    return locators.map((loc) => new ElementBase(loc));
  }
}
