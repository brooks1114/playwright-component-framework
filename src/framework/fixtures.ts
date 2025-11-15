// playwright.config.ts or fixtures.ts
import { test as base } from "@playwright/test";
import { TestContext } from "./test-context";

export const test = base.extend<{ ctx: TestContext }>({
  ctx: async ({ page }, use) => {
    const context = new TestContext(page);
    await use(context);
  },
});

export const expect = test.expect;
