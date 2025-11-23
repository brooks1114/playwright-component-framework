// src/components/bases/toggle-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { ElementBase } from "./element-base";

/**
 * ToggleBase
 * ----------
 * Semantic base class for ON/OFF toggle controls.
 *
 * Supports common patterns:
 *  - <button role="switch" aria-checked="true|false">
 *  - <div role="switch" aria-checked="true|false">
 *  - <input type="checkbox" class="...-toggle">
 *  - <button aria-pressed="true|false">...</button>
 *  - Components with data-state="on|off" or similar.
 *
 * This class does NOT require a specific HTML tag; instead it infers
 * state from ARIA + attributes + JS properties using a layered heuristic:
 *
 *   1. aria-checked     → "true"/"false"/"mixed"
 *   2. aria-pressed     → "true"/"false" (toggle button pattern)
 *   3. data-state       → "on"/"off"/"mixed"
 *   4. checked property → true/false for <input type="checkbox">
 *
 * If none of these are present, the state is "unknown".
 *
 * Construction:
 *   - new ToggleBase(page, '[data-testid="dark-mode-toggle"]');
 *   - new ToggleBase(page.getByRole('switch', { name: 'Dark mode' }));
 *
 * Example:
 *   const toggle = new ToggleBase(
 *     page.getByRole("switch", { name: "Dark mode" })
 *   );
 *
 *   await toggle
 *     .shouldBeVisible()
 *     .shouldBeOff()
 *     .toggleOn()
 *     .shouldBeOn();
 */
export class ToggleBase extends ElementBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string that points
   * at the toggle control container element.
   *
   * @example
   *   const toggle = new ToggleBase(page, '[data-testid="dark-mode-toggle"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator.
   *
   * @example
   *   const toggle = new ToggleBase(
   *     page.getByRole("switch", { name: "Dark mode" })
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
  // State model
  // ───────────────────────────────────────────────────────────────

  /**
   * Normalized ON/OFF state for toggles.
   *
   * "mixed" = indeterminate / partially on (rare but supported).
   * "unknown" = cannot infer from ARIA/attributes/properties.
   * type ToggleState = "on" | "off" | "mixed" | "unknown";
   */

  /**
   * Infer the toggle state from ARIA and attributes.
   *
   * Priority:
   *   1. aria-checked ("true"/"false"/"mixed")
   *   2. aria-pressed ("true"/"false") for toggle buttons
   *   3. data-state ("on"/"off"/"mixed")
   *   4. checked property for <input type="checkbox">
   *   5. fallback → "unknown"
   */
  async getState(): Promise<"on" | "off" | "mixed" | "unknown"> {
    // 1) aria-checked
    const ariaChecked = (await this.locator.getAttribute("aria-checked")) ?? "";
    const ac = ariaChecked.toLowerCase();
    if (ac === "true") return "on";
    if (ac === "false") return "off";
    if (ac === "mixed") return "mixed";

    // 2) aria-pressed (toggle button pattern)
    const ariaPressed = (await this.locator.getAttribute("aria-pressed")) ?? "";
    const ap = ariaPressed.toLowerCase();
    if (ap === "true") return "on";
    if (ap === "false") return "off";

    // 3) data-state
    const dataState = (await this.locator.getAttribute("data-state")) ?? "";
    const ds = dataState.toLowerCase();
    if (ds === "on") return "on";
    if (ds === "off") return "off";
    if (ds === "mixed" || ds === "indeterminate") return "mixed";

    // 4) checked property (input[type="checkbox"] backing)
    const jsChecked = await this.locator.evaluate((el) => {
      const any = el as any;
      if (typeof any.checked === "boolean") {
        return any.checked;
      }
      return null;
    });

    if (jsChecked === true) return "on";
    if (jsChecked === false) return "off";

    // 5) Fallback
    return "unknown";
  }

  /** Convenience: is the toggle in the ON state? */
  async isOn(): Promise<boolean> {
    const state = await this.getState();
    return state === "on";
  }

  /** Convenience: is the toggle in the OFF state? */
  async isOff(): Promise<boolean> {
    const state = await this.getState();
    return state === "off";
  }

  /** Convenience: is the toggle in a MIXED/indeterminate state? */
  async isMixed(): Promise<boolean> {
    const state = await this.getState();
    return state === "mixed";
  }

  // ───────────────────────────────────────────────────────────────
  // Actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Click the toggle (generic click).
   *
   * Most toggles respond to a simple click on their container.
   * For more complex controls you can override this in a subclass.
   */
  async click(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click(options);
    return this;
  }

  /**
   * Toggle the control once (simple click).
   *
   * Alias for click(), but semantically clearer in tests.
   */
  async toggle(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.click(options);
    return this;
  }

  /**
   * Ensure the toggle ends in ON state (idempotent).
   *
   * - If state is already "on", does nothing.
   * - Otherwise performs click() and re-checks state.
   */
  async toggleOn(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    if (await this.isOn()) {
      return this;
    }

    await this.click(options);

    // Re-check and throw if still not ON (helps catch wiring issues).
    const finalState = await this.getState();
    if (finalState !== "on") {
      throw new Error(
        `ToggleBase.toggleOn(): expected state "on" after click, but got "${finalState}".`
      );
    }

    return this;
  }

  /**
   * Ensure the toggle ends in OFF state (idempotent).
   *
   * - If state is already "off", does nothing.
   * - Otherwise performs click() and re-checks state.
   */
  async toggleOff(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    if (await this.isOff()) {
      return this;
    }

    await this.click(options);

    const finalState = await this.getState();
    if (finalState !== "off") {
      throw new Error(
        `ToggleBase.toggleOff(): expected state "off" after click, but got "${finalState}".`
      );
    }

    return this;
  }

  /**
   * Focus the toggle.
   */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /**
   * Blur the toggle (remove focus).
   */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /**
   * Press a key while the toggle is focused (e.g., "Space" or "Enter").
   *
   * Useful for validating keyboard accessibility.
   */
  async press(
    key: string,
    options?: Parameters<Locator["press"]>[1]
  ): Promise<this> {
    await this.locator.press(key, options);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions (state + a11y)
  // ───────────────────────────────────────────────────────────────

  /** Assert that the toggle is ON. */
  async shouldBeOn(): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout: 10_000 })
      .toBe("on");
    return this;
  }

  /** Assert that the toggle is OFF. */
  async shouldBeOff(): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout: 10_000 })
      .toBe("off");
    return this;
  }

  /** Assert that the toggle is in MIXED state. */
  async shouldBeMixed(): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout: 10_000 })
      .toBe("mixed");
    return this;
  }

  /** Assert that the toggle has a specific normalized state. */
  async shouldHaveState(
    expected: "on" | "off" | "mixed" | "unknown"
  ): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout: 10_000 })
      .toBe(expected);
    return this;
  }

  /** Assert toggle is visible (delegates to ElementBase). */
  async shouldBeVisible(): Promise<this> {
    await super.shouldBeVisible();
    return this;
  }

  /** Assert toggle is hidden. */
  async shouldBeHidden(): Promise<this> {
    await super.shouldBeHidden();
    return this;
  }

  /** Assert toggle is focused. */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Assert toggle has role "switch" or "checkbox" (common patterns).
   * Pass a custom pattern if needed.
   */
  async shouldHaveRole(
    expected: string | RegExp = /^(switch|checkbox)$/i
  ): Promise<this> {
    const role = (await this.locator.getAttribute("role")) ?? "";
    if (expected instanceof RegExp) {
      expect(role).toMatch(expected);
    } else {
      expect(role).toBe(expected);
    }
    return this;
  }

  /** Assert toggle has aria-checked with a specific value. */
  async shouldHaveAriaChecked(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-checked", expected);
    return this;
  }

  /** Assert toggle has a specific accessible name. */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /** Assert toggle has a specific accessible description. */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /** Wait until the toggle becomes ON. */
  async waitUntilOn(timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout })
      .toBe("on");
    return this;
  }

  /** Wait until the toggle becomes OFF. */
  async waitUntilOff(timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.getState(), { timeout })
      .toBe("off");
    return this;
  }

  /** Wait until the toggle is visible and enabled (a good "ready" state). */
  async waitUntilReady(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeEnabled({ timeout });
    return this;
  }
}
