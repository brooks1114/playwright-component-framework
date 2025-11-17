// components/bases/label-base.ts
import { Page, Locator } from "@playwright/test";
import { ElementBase } from "./element-base";

/**
 * Semantic base class for labels/headings/text elements.
 *
 * Examples:
 *  - <h2> Matter details </h2>
 *  - <h6> Case name </h6>
 *  - <label for="..."> Case name </label>
 *  - <div class="lm-Body" data-testid="...">Some text</div>
 *
 * This class does NOT introduce new assertions yet; it mainly exists to
 * make component code more self-documenting ("LabelBase" instead of
 * generic "ElementBase").
 */
export class LabelBase extends ElementBase {
  constructor(page: Page, selector: string);
  constructor(locator: Locator);
  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      super(pageOrLocator as Page, selector);
    } else {
      super(pageOrLocator as Locator);
    }
  }

  // Place label-specific helpers here later if you want, e.g.:
  // - shouldIndicateRequired()
  // - shouldHaveHelpIcon()
}
