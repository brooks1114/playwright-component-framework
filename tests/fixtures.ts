// tests/fixtures.ts
import { test as base, expect } from "@playwright/test";
import { ComponentFactory } from "../src/components/factory";

/**
 * Custom Playwright fixtures:
 *
 * - `ui`: a ComponentFactory bound to the current Page.
 *
 * Usage in tests:
 *
 *   import { test, expect } from "../tests/fixtures";
 *
 *   test("create matter happy path", async ({ page, ui }) => {
 *     await page.goto("/create-matter");
 *
 *     await ui
 *       .matterDetailsSection()
 *       .fillFromData({
 *         caseName: "Foo vs Bar",
 *         docketNumber: "123-XYZ",
 *         matterType: "Suits",
 *         matterSubtype: "Defense",
 *       });
 *
 *     await ui
 *       .referralDetailsSection()
 *       .validateStructure();
 *   });
 */

type UiFixtures = {
  /** Typed UI factory bound to the current Page. */
  ui: ComponentFactory;
};

export const test = base.extend<UiFixtures>({
  ui: async ({ page }, use) => {
    const ui = new ComponentFactory(page);
    await use(ui);
  },
});

// Re-export expect so tests can do:
//   import { test, expect } from "../tests/fixtures";
export { expect };
