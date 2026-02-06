// src/components/bases/radio-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * RadioBase
 * ---------
 * Chainable base class for radio button controls.
 *
 * Supports both:
 *   - Native `<input type="radio">` elements
 *   - Custom elements with `role="radio"` (when properly located)
 *
 * Provides:
 *   - Selection actions (click, check, setChecked, keyboard)
 *   - State checks (checked, enabled, visible, value, name)
 *   - Accessibility assertions (aria-checked, accessible name, label)
 *   - Waiters for state transitions
 *
 * Construction patterns:
 *   - Selector-based: `new RadioBase(page, 'input[name="role"][value="admin"]')`
 *   - Locator-based: `new RadioBase(page.getByLabel("Admin"))`
 *
 * Recommended usage with ComponentFactory:
 *   ```ts
 *   const $ = new ComponentFactory(page);
 *   const adminRadio = $.radioByLabel("Admin");
 *
 *   await adminRadio
 *     .shouldBeVisible()
 *     .shouldBeEnabled()
 *     .check()
 *     .shouldBeChecked()
 *     .shouldHaveAccessibleName("Admin");
 *   ```
 */
export class RadioBase {
  /** Underlying Playwright Locator for this radio button. */
  readonly locator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string.
   *
   * @param page - Playwright Page instance
   * @param selector - CSS, XPath, or text-based selector
   * @example
   *   const radio = new RadioBase(page, 'input[type="radio"][value="yes"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator (recommended).
   *
   * @param locator - Pre-resolved Locator (e.g. via getByLabel, getByRole)
   * @example
   *   const radio = new RadioBase(page.getByRole("radio", { name: "Yes" }));
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      this.locator = (pageOrLocator as Page).locator(selector);
    } else {
      this.locator = pageOrLocator as Locator;
    }
  }

  /**
   * Returns the underlying raw Locator for custom operations.
   *
   * @returns Playwright Locator for this radio
   */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // State & Visibility
  // ───────────────────────────────────────────────────────────────

  /**
   * Waits for the radio to reach the desired state (visible by default).
   *
   * @param options - Wait configuration
   * @returns this (chainable)
   */
  async waitFor(options?: {
    timeout?: number;
    state?: "visible" | "attached" | "hidden";
  }): Promise<this> {
    await this.locator.waitFor({
      state: options?.state ?? "visible",
      timeout: options?.timeout ?? 30_000,
    });
    return this;
  }

  /**
   * Checks if the radio is currently visible.
   *
   * @returns `true` if visible
   */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /**
   * Checks if the radio is enabled (not disabled).
   *
   * @returns `true` if enabled
   */
  async isEnabled(): Promise<boolean> {
    return await this.locator.isEnabled();
  }

  /**
   * Checks if the radio is disabled.
   *
   * @returns `true` if disabled
   */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /**
   * Checks if the radio is currently selected/checked.
   *
   * @returns `true` if checked
   */
  async isChecked(): Promise<boolean> {
    return await this.locator.isChecked();
  }

  // ───────────────────────────────────────────────────────────────
  // Actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Clicks the radio button (usually selects it).
   *
   * @param options - Click options (force, timeout, position, etc.)
   * @returns this (chainable)
   */
  async click(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    await this.locator.click(options);
    return this;
  }

  /**
   * Checks the radio (selects it if not already checked).
   * Playwright's `check()` is optimized for radios and checkboxes.
   *
   * @param options - Check options
   * @returns this (chainable)
   */
  async check(options?: Parameters<Locator["check"]>[0]): Promise<this> {
    await this.locator.check(options);
    return this;
  }

  /**
   * Forces the checked state (true = checked, false = unchecked).
   *
   * @param checked - Desired checked state
   * @param options - setChecked options
   * @returns this (chainable)
   * @note Setting to `false` may not uncheck other radios in the group
   */
  async setChecked(
    checked: boolean,
    options?: Parameters<Locator["setChecked"]>[1],
  ): Promise<this> {
    await this.locator.setChecked(checked, options);
    return this;
  }

  /**
   * Focuses the radio button.
   *
   * @returns this (chainable)
   */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /**
   * Removes focus from the radio.
   *
   * @returns this (chainable)
   */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /**
   * Presses Space key to toggle/check the radio (accessibility-friendly).
   *
   * @returns this (chainable)
   */
  async pressSpaceToToggle(): Promise<this> {
    await this.focus();
    await this.locator.press("Space");
    return this;
  }

  /**
   * Presses arrow keys while focused (useful for testing radio group navigation).
   *
   * @param direction - "ArrowRight" | "ArrowDown" | "ArrowLeft" | "ArrowUp"
   * @param times - Number of presses (default 1)
   * @returns this (chainable)
   */
  async pressArrowKeysInGroup(
    direction: "ArrowRight" | "ArrowDown" | "ArrowLeft" | "ArrowUp",
    times = 1,
  ): Promise<this> {
    await this.focus();
    for (let i = 0; i < times; i++) {
      await this.locator.press(direction);
    }
    return this;
  }

  /**
   * Scrolls the radio into view if needed.
   *
   * @returns this (chainable)
   */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Captures a screenshot of the radio element.
   *
   * @param path - Optional file path to save screenshot
   * @returns Buffer of the screenshot
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // ───────────────────────────────────────────────────────────────
  // Getters
  // ───────────────────────────────────────────────────────────────

  /**
   * Gets the `value` attribute of the radio.
   *
   * @returns Value string or null
   */
  async getValue(): Promise<string | null> {
    return await this.locator.getAttribute("value");
  }

  /**
   * Gets the `name` attribute (radio group name).
   *
   * @returns Name string or null
   */
  async getName(): Promise<string | null> {
    return await this.locator.getAttribute("name");
  }

  /**
   * Gets the visible label text associated with this radio (if any).
   *
   * @returns Label text or empty string
   */
  async getLabelText(): Promise<string> {
    return (
      (await this.locator.evaluate((el) => {
        const id = el.id || el.getAttribute("aria-labelledby");
        if (!id) return "";
        const label = document.querySelector(
          `label[for="${id}"], [id="${id}"]`,
        );
        return label?.textContent?.trim() ?? "";
      })) || ""
    );
  }

  /**
   * Gets the `aria-checked` attribute value (for custom radio implementations).
   *
   * @returns "true", "false", "mixed", or null
   */
  async getAriaChecked(): Promise<string | null> {
    return await this.locator.getAttribute("aria-checked");
  }

  /**
   * Gets any attribute value by name.
   *
   * @param name - Attribute name
   * @returns Attribute value or null
   */
  async getAttribute(name: string): Promise<string | null> {
    return await this.locator.getAttribute(name);
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions (chainable)
  // ───────────────────────────────────────────────────────────────

  /**
   * Asserts the radio is checked/selected.
   *
   * @returns this (chainable)
   */
  async shouldBeChecked(): Promise<this> {
    await expect(this.locator).toBeChecked();
    return this;
  }

  /**
   * Asserts the radio is **not** checked.
   *
   * @returns this (chainable)
   */
  async shouldBeUnchecked(): Promise<this> {
    await expect(this.locator).not.toBeChecked();
    return this;
  }

  /**
   * Asserts the radio is visible.
   *
   * @returns this (chainable)
   */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /**
   * Asserts the radio is hidden.
   *
   * @returns this (chainable)
   */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Alias for {@link shouldBeHidden} */
  async shouldNotBeVisible(): Promise<this> {
    return this.shouldBeHidden();
  }

  /**
   * Asserts the radio is enabled.
   *
   * @returns this (chainable)
   */
  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  /**
   * Asserts the radio is disabled.
   *
   * @returns this (chainable)
   */
  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  async shouldNotBeEnabled(): Promise<this> {
    await expect(this.locator).not.toBeEnabled();
    return this;
  }

  /**
   * Asserts the radio is currently focused.
   *
   * @returns this (chainable)
   */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Asserts the radio is in the viewport.
   *
   * @param options - Viewport assertion options
   * @returns this (chainable)
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  /**
   * Asserts the radio has the expected `value` attribute.
   *
   * @param expected - Value or RegExp
   * @returns this (chainable)
   */
  async shouldHaveValue(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("value", expected);
    return this;
  }

  /**
   * Asserts the radio belongs to the expected radio group (`name` attribute).
   *
   * @param expected - Group name or RegExp
   * @returns this (chainable)
   */
  async shouldHaveName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("name", expected);
    return this;
  }

  /**
   * Asserts the radio has the expected visible label text.
   *
   * @param expected - Label text or RegExp
   * @returns this (chainable)
   */
  async shouldHaveLabel(expected: string | RegExp): Promise<this> {
    await expect.poll(async () => await this.getLabelText()).toMatch(expected);
    return this;
  }

  /**
   * Asserts the radio has a specific class or class pattern.
   *
   * @param expected - Class name or RegExp
   * @returns this (chainable)
   */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /**
   * Asserts the radio has an `aria-label`.
   *
   * @param expected - aria-label value or pattern
   * @returns this (chainable)
   */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /**
   * Asserts the radio has a specific `aria-checked` value.
   *
   * @param expected - "true", "false", etc.
   * @returns this (chainable)
   */
  async shouldHaveAriaChecked(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-checked", expected);
    return this;
  }

  /**
   * Asserts the radio has the given accessible name.
   *
   * @param expected - Accessible name or pattern
   * @returns this (chainable)
   */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /**
   * Asserts the radio has the given accessible description.
   *
   * @param expected - Accessible description or pattern
   * @returns this (chainable)
   */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  /**
   * Asserts a specific attribute exists with expected value.
   *
   * @param name - Attribute name
   * @param value - Expected value or pattern
   * @returns this (chainable)
   */
  async shouldHaveAttribute(
    name: string,
    value: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute(name, value);
    return this;
  }

  /**
   * Asserts an attribute does **not** exist or is empty.
   *
   * @param name - Attribute name
   * @returns this (chainable)
   */
  async shouldNotHaveAttribute(name: string): Promise<this> {
    await expect(this.locator).not.toHaveAttribute(name, /.*/);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Specialized Waiters
  // ───────────────────────────────────────────────────────────────

  /**
   * Waits until the radio is visible **and** enabled (ready for interaction).
   *
   * @param timeout - Max wait time (ms)
   * @returns this (chainable)
   */
  async waitUntilReady(timeout = 10_000): Promise<this> {
    await this.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeEnabled({ timeout });
    return this;
  }

  /**
   * Waits until the radio becomes checked.
   *
   * @param timeout - Max wait time (ms)
   * @returns this (chainable)
   */
  async waitUntilChecked(timeout = 10_000): Promise<this> {
    await expect(this.locator).toBeChecked({ timeout });
    return this;
  }

  /**
   * Waits until the radio becomes unchecked.
   *
   * @param timeout - Max wait time (ms)
   * @returns this (chainable)
   */
  async waitUntilUnchecked(timeout = 10_000): Promise<this> {
    await expect(this.locator).not.toBeChecked({ timeout });
    return this;
  }
}
