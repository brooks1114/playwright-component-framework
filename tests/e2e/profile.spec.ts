// tests/e2e/profile-update.spec.ts
import { test, expect } from "@playwright/test";
import { ComponentFactory } from "../../src/components/factory";
import { LOCATORS } from "../../src/constants/locators/profile.locators";
import { DROPDOWN } from "../../src/constants/dropdown-values";

test.describe("Profile page", async () => {
  test.beforeEach(async ({ page }) => {
    // Adjust this to however your app is hosted / routed
    await page.goto("/profile");
  });

  test("user can update their profile details", async ({ page }) => {
    // Single, per-test factory instance.
    // Think of this as your "$" helper for this test.
    const $ = new ComponentFactory(page);

    // --- ROLE DROPDOWN ---

    await (
      await (
        await $.dropdown(LOCATORS.PROFILE.ROLE_DROPDOWN).waitUntilReady()
      ).selectByText("Admin")
    ).shouldHaveValue(DROPDOWN.ROLE.ADMIN);

    await (
      await $.dropdown(LOCATORS.PROFILE.COUNTRY_DROPDOWN).selectByText(
        "United States"
      )
    ).shouldHaveValue(DROPDOWN.COUNTRY.USA);

    await (
      await $.dropdown(LOCATORS.PROFILE.THEME_DROPDOWN).selectByText("Dark")
    ).shouldHaveValue(DROPDOWN.THEME.DARK);
  });
});
