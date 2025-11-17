// components/bases/section-base.ts
import { Page, Locator } from "@playwright/test";
import { ElementBase } from "./element-base";
import { LabelBase } from "./label-base";

/**
 * Base class for page/card sections.
 *
 * Represents a container element (e.g. card, panel, form section) and
 * provides helpers for working with headings inside that section.
 *
 * This class does NOT call Playwright `expect` directly; it delegates
 * assertions to ElementBase/LabelBase.
 */
export class SectionBase extends ElementBase {
  constructor(page: Page, selector: string);
  constructor(locator: Locator);
  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      super(pageOrLocator as Page, selector);
    } else {
      super(pageOrLocator as Locator);
    }
  }

  /**
   * Get a heading inside the section by accessible name.
   *
   * Works for any heading level (h1–h6), relying only on accessible name.
   */
  getHeadingByText(name: string | RegExp): LabelBase {
    return new LabelBase(
      this.locator.getByRole("heading", {
        name,
      })
    );
  }
}
