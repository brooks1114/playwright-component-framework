// src/components/bases/toggle-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { ElementBase } from "./element-base";

/**
 * ToggleBase
 * ----------
 * Chainable base class for ON/OFF toggle controls (switches, toggle buttons, etc.).
 *
 * Supports common implementation patterns:
 *   - `<button role="switch" aria-checked="true|false">`
 *   - `<div role="switch" aria-checked="true|false">`
 *   - `<input type="checkbox">` (often styled as toggle)
 *   - `<button aria-pressed="true|false">` (toggle button pattern)
 *   - Components using `data-state="on"|"off"|"mixed"`
 *
 * State detection priority (layered heuristic):
 *   1. `aria-checked` → "true" / "false" / "mixed"
 *   2. `aria-pressed` → "true" / "false"
 *   3. `data-state` → "on" / "off" / "mixed" / "indeterminate"
 *   4. DOM `checked` property (for `<input type="checkbox">`)
 *   5. Fallback → `"unknown"`
 *
 * Construction patterns:
 *   - Selector-based: `new ToggleBase(page, '[data-testid="theme-toggle"]')`
 *   - Locator-based: `new ToggleBase(page.getByRole("switch", { name: "Notifications" }))`
 *
 * Recommended usage with ComponentFactory:
 *   ```ts
 *   const $ = new ComponentFactory(page);
 *   const notificationsToggle = $.toggleByRoleName("Notifications");
 *
 *   await notificationsToggle
 *     .shouldBeVisible()
 *     .shouldBeOff()
 *     .toggleOn()
 *     .shouldBeOn()
 *     .shouldHaveAccessibleName("Notifications enabled");
 *   ```
 */
export class ToggleBase extends ElementBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string pointing to the toggle element.
   *
   * @param page - Playwright Page instance
   * @param selector - CSS, XPath, or text selector
   * @example
   *   const toggle = new ToggleBase(page, '[data-testid="dark-mode-toggle"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator (preferred).
   *
   * @param locator - Pre-resolved Locator (e.g. getByRole, getByLabel)
   * @example
   *   const toggle = new ToggleBase(page.getByRole("switch", { name: "Dark mode" }));
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
  // State Detection
  // ───────────────────────────────────────────────────────────────

  /**
   * Returns the normalized toggle state using a layered heuristic.
   *
   * @returns `"on" | "off" | "mixed" | "unknown"`
   */
  async getState(): Promise<"on" | "off" | "mixed" | "unknown"> {
    // 1. aria-checked (highest priority – standard for role="switch")
    const ariaChecked = (
      await this.locator.getAttribute("aria-checked")
    )?.toLowerCase();
    if (ariaChecked === "true") return "on";
    if (ariaChecked === "false") return "off";
    if (ariaChecked === "mixed") return "mixed";

    // 2. aria-pressed (toggle button pattern)
    const ariaPressed = (
      await this.locator.getAttribute("aria-pressed")
    )?.toLowerCase();
    if (ariaPressed === "true") return "on";
    if (ariaPressed === "false") return "off";

    // 3. data-state (common in component libraries: Headless UI, Radix, etc.)
    const dataState = (
      await this.locator.getAttribute("data-state")
    )?.toLowerCase();
    if (dataState === "on") return "on";
    if (dataState === "off") return "off";
    if (dataState === "mixed" || dataState === "indeterminate") return "mixed";

    // 4. checked property (native checkbox fallback)
    const jsChecked = await this.locator.evaluate<boolean | null>((el) => {
      const input = el as HTMLInputElement;
      return typeof input.checked === "boolean" ? input.checked : null;
    });

    if (jsChecked === true) return "on";
    if (jsChecked === false) return "off";

    // 5. Could not determine
    return "unknown";
  }

  /**
   * Convenience method: Checks if toggle is in the ON state.
   *
   * @returns `true` if state is "on"
   */
  async isOn(): Promise<boolean> {
    return (await this.getState()) === "on";
  }

  /**
   * Convenience method: Checks if toggle is in the OFF state.
   *
   * @returns `true` if state is "off"
   */
  async isOff(): Promise<boolean> {
    return (await this.getState()) === "off";
  }

  /**
   * Convenience method: Checks if toggle is in MIXED / indeterminate state.
   *
   * @returns `true` if state is "mixed"
   */
  async isMixed(): Promise<boolean> {
    return (await this.getState()) === "mixed";
  }

  // ───────────────────────────────────────────────────────────────
  // Actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Performs a generic click on the toggle element.
   *
   * @param options - Click options (force, timeout, position, etc.)
   * @returns this (chainable)
   */
  async click(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click(options);
    return this;
  }

  /**
   * Toggles the control by clicking it (semantic alias for `click()`).
   *
   * @param options - Click options
   * @returns this (chainable)
   */
  async toggle(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.click(options);
    return this;
  }

  /**
   * Ensures the toggle is ON (idempotent).
   *
   * - If already ON → does nothing
   * - Otherwise clicks and verifies final state
   *
   * @param options - Click options
   * @returns this (chainable)
   * @throws Error if state is not "on" after click
   */
  async toggleOn(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    if (await this.isOn()) return this;

    await this.click(options);

    const finalState = await this.getState();
    if (finalState !== "on") {
      throw new Error(
        `toggleOn() failed: expected "on" after click, got "${finalState}". ` +
          `Check toggle implementation or locator.`,
      );
    }

    return this;
  }

  /**
   * Ensures the toggle is OFF (idempotent).
   *
   * @param options - Click options
   * @returns this (chainable)
   * @throws Error if state is not "off" after click
   */
  async toggleOff(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    if (await this.isOff()) return this;

    await this.click(options);

    const finalState = await this.getState();
    if (finalState !== "off") {
      throw new Error(
        `toggleOff() failed: expected "off" after click, got "${finalState}". ` +
          `Check toggle implementation or locator.`,
      );
    }

    return this;
  }

  /**
   * Focuses the toggle (useful for accessibility testing).
   *
   * @returns this (chainable)
   */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /**
   * Removes focus from the toggle.
   *
   * @returns this (chainable)
   */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /**
   * Presses Space key while focused (standard way to toggle switches).
   *
   * @returns this (chainable)
   */
  async pressSpaceToToggle(): Promise<this> {
    await this.focus();
    await this.locator.press("Space");
    return this;
  }

  /**
   * Presses Enter key while focused (alternative activation method).
   *
   * @returns this (chainable)
   */
  async pressEnterToToggle(): Promise<this> {
    await this.focus();
    await this.locator.press("Enter");
    return this;
  }

  /**
   * Presses any key while the toggle is focused.
   *
   * @param key - Key name (e.g. "Space", "Enter")
   * @param options - Press options
   * @returns this (chainable)
   */
  async press(
    key: string,
    options?: Parameters<Locator["press"]>[1],
  ): Promise<this> {
    await this.locator.press(key, options);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions
  // ───────────────────────────────────────────────────────────────

  /**
   * Asserts the toggle is in the ON state.
   *
   * @returns this (chainable)
   */
  async shouldBeOn(): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout: 10_000 })
      .toBe("on");
    return this;
  }

  /**
   * Asserts the toggle is **not** in the ON state.
   *
   * @returns this (chainable)
   */
  async shouldNotBeOn(): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout: 10_000 })
      .not.toBe("on");
    return this;
  }

  /**
   * Asserts the toggle is in the OFF state.
   *
   * @returns this (chainable)
   */
  async shouldBeOff(): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout: 10_000 })
      .toBe("off");
    return this;
  }

  /**
   * Asserts the toggle is **not** in the OFF state.
   *
   * @returns this (chainable)
   */
  async shouldNotBeOff(): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout: 10_000 })
      .not.toBe("off");
    return this;
  }

  /**
   * Asserts the toggle is in MIXED / indeterminate state.
   *
   * @returns this (chainable)
   */
  async shouldBeMixed(): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout: 10_000 })
      .toBe("mixed");
    return this;
  }

  /**
   * Asserts the toggle has a specific state.
   *
   * @param expected - Expected state
   * @returns this (chainable)
   */
  async shouldHaveState(
    expected: "on" | "off" | "mixed" | "unknown",
  ): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout: 10_000 })
      .toBe(expected);
    return this;
  }

  /**
   * Asserts the toggle is visible (from ElementBase).
   *
   * @returns this (chainable)
   */
  async shouldBeVisible(): Promise<this> {
    await super.shouldBeVisible();
    return this;
  }

  /**
   * Asserts the toggle is hidden.
   *
   * @returns this (chainable)
   */
  async shouldBeHidden(): Promise<this> {
    await super.shouldBeHidden();
    return this;
  }

  /**
   * Asserts the toggle is currently focused.
   *
   * @returns this (chainable)
   */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Asserts the toggle has an appropriate role (switch or checkbox).
   *
   * @param expected - Role or RegExp (default: /^(switch|checkbox)$/i)
   * @returns this (chainable)
   */
  async shouldHaveRole(
    expected: string | RegExp = /^(switch|checkbox)$/i,
  ): Promise<this> {
    const role = (await this.locator.getAttribute("role")) ?? "";
    if (expected instanceof RegExp) {
      expect(role).toMatch(expected);
    } else {
      expect(role).toBe(expected);
    }
    return this;
  }

  /**
   * Asserts a specific `aria-checked` value.
   *
   * @param expected - Value or RegExp
   * @returns this (chainable)
   */
  async shouldHaveAriaChecked(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-checked", expected);
    return this;
  }

  /**
   * Asserts the toggle has the expected accessible name.
   *
   * @param expected - Name or RegExp
   * @returns this (chainable)
   */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /**
   * Asserts the toggle has the expected accessible description.
   *
   * @param expected - Description or RegExp
   * @returns this (chainable)
   */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /**
   * Waits until the toggle reaches the ON state.
   *
   * @param timeout - Max wait time (ms)
   * @returns this (chainable)
   */
  async waitUntilOn(timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout })
      .toBe("on");
    return this;
  }

  /**
   * Waits until the toggle reaches the OFF state.
   *
   * @param timeout - Max wait time (ms)
   * @returns this (chainable)
   */
  async waitUntilOff(timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout })
      .toBe("off");
    return this;
  }

  /**
   * Waits until the toggle is visible and enabled.
   *
   * @param timeout - Max wait time (ms)
   * @returns this (chainable)
   */
  async waitUntilReady(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeEnabled({ timeout });
    return this;
  }
}
