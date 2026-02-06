// src/components/bases/modal-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * ModalBase
 * ---------
 * Chainable base class for modal dialogs (role="dialog" or "alertdialog").
 *
 * Designed to represent the root modal container (usually the element with role="dialog").
 * It can also be used when the locator points to the modal content wrapper inside a backdrop.
 *
 * Responsibilities:
 *  - Visibility & presence management
 *  - Common modal actions (focus, close via Esc, close via button)
 *  - Accessibility assertions (role, aria-label, accessible name/description)
 *  - Text/content verification
 *  - Waiters for open/close state transitions
 *
 * Construction patterns:
 *  - Selector-based: `new ModalBase(page, '[role="dialog"]')`
 *  - Locator-based: `new ModalBase(page.getByRole("dialog", { name: "Confirm" }))`
 *
 * Recommended usage with ComponentFactory:
 *   ```ts
 *   const $ = new ComponentFactory(page);
 *   const confirmModal = $.modalByRoleName("Confirm delete");
 *
 *   await confirmModal
 *     .waitUntilOpen()
 *     .shouldBeVisible()
 *     .shouldContainText("Are you sure?")
 *     .shouldHaveAccessibleName("Confirm delete")
 *     .closeWithEsc()
 *     .waitUntilClosed();
 *   ```
 */
export class ModalBase {
  /** Underlying Playwright Locator for the modal container (usually role="dialog"). */
  readonly locator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string (CSS, XPath, text-based, etc.).
   *
   * @param page - Playwright Page instance
   * @param selector - Selector targeting the modal root element
   * @example
   *   const modal = new ModalBase(page, '[role="dialog"][aria-modal="true"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator already pointing to the modal.
   *
   * @param locator - Pre-resolved Locator for the modal
   * @example
   *   const modal = new ModalBase(page.getByRole("dialog", { name: "Edit profile" }));
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
   * Returns the underlying raw Locator for custom or advanced interactions.
   *
   * @returns The Playwright Locator for this modal
   */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // State & Visibility Checks
  // ───────────────────────────────────────────────────────────────

  /**
   * Waits for the modal to reach a specific state (visible by default).
   *
   * @param options - Wait configuration
   * @param options.timeout - Maximum wait time in milliseconds
   * @param options.state - Desired state ("visible", "attached", "hidden")
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
   * Checks if the modal is currently visible.
   *
   * @returns `true` if visible, `false` otherwise
   */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /**
   * Checks if the modal is hidden (not visible).
   *
   * @returns `true` if hidden
   */
  async isHidden(): Promise<boolean> {
    return !(await this.isVisible());
  }

  /**
   * Semantic alias for `isVisible()` – expresses dialog open state.
   *
   * @returns `true` if the modal is open/visible
   */
  async isOpen(): Promise<boolean> {
    return await this.isVisible();
  }

  /**
   * Semantic alias for `isHidden()` – expresses dialog closed state.
   *
   * @returns `true` if the modal is closed/hidden
   */
  async isClosed(): Promise<boolean> {
    return await this.isHidden();
  }

  // ───────────────────────────────────────────────────────────────
  // Actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Focuses the modal container (useful for testing focus trapping).
   *
   * @returns this (chainable)
   */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /**
   * Removes focus from the modal.
   *
   * @returns this (chainable)
   */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /**
   * Closes the modal by pressing the Escape key.
   *
   * Assumes the application handles Escape to close modals (standard behavior).
   *
   * @returns this (chainable)
   * @note If Escape does not close the modal, implement custom close logic instead.
   */
  async closeWithEsc(): Promise<this> {
    await this.locator.page().keyboard.press("Escape");
    return this;
  }

  /**
   * Closes the modal by clicking a close button (×, "Cancel", "Close", etc.).
   *
   * @param closeSelector - Selector or role/name for the close button
   * @param options - Click options (timeout, force, etc.)
   * @returns this (chainable)
   * @example
   *   await modal.closeWithButton('[aria-label="Close"]');
   */
  async closeWithButton(
    closeSelector:
      | string
      | Locator = '[role="button"][name=/close|cancel/i], [aria-label=/close/i]',
    options?: Parameters<Locator["click"]>[0],
  ): Promise<this> {
    const closeLocator =
      typeof closeSelector === "string"
        ? this.locator.locator(closeSelector)
        : closeSelector;

    await closeLocator.click(options);
    return this;
  }

  /**
   * Scrolls the modal into view if it's partially outside the viewport.
   *
   * @returns this (chainable)
   */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Captures a screenshot of the modal.
   *
   * @param path - Optional path to save the screenshot file
   * @returns Buffer containing the screenshot
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // ───────────────────────────────────────────────────────────────
  // Getters
  // ───────────────────────────────────────────────────────────────

  /**
   * Gets the trimmed text content of the entire modal.
   *
   * @returns Visible text content (or empty string if none)
   */
  async getText(): Promise<string> {
    return (await this.locator.textContent())?.trim() ?? "";
  }

  /**
   * Returns the ARIA role of the modal (usually "dialog" or "alertdialog").
   *
   * @returns Role value or null
   */
  async getRole(): Promise<string | null> {
    return await this.locator.getAttribute("role");
  }

  /**
   * Returns the value of the aria-label attribute if present.
   *
   * @returns aria-label value or null
   */
  async getAriaLabel(): Promise<string | null> {
    return await this.locator.getAttribute("aria-label");
  }

  /**
   * Gets the value of any attribute by name.
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
   * Asserts that the modal is visible.
   *
   * @returns this (chainable)
   */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /**
   * Asserts that the modal is hidden.
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
   * Asserts that the modal (or its content) is focused.
   *
   * @returns this (chainable)
   * @note Many modals trap focus inside — consider asserting on inner inputs/buttons instead
   */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Asserts the modal is at least partially in the viewport.
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
   * Asserts the modal contains the expected text or pattern.
   *
   * @param expected - Text or RegExp to find
   * @returns this (chainable)
   */
  async shouldContainText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toContainText(expected);
    return this;
  }

  /**
   * Asserts the modal has the correct ARIA role.
   *
   * @param expected - Expected role ("dialog", "alertdialog", etc.)
   * @returns this (chainable)
   */
  async shouldHaveRole(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveRole(expected as any);
    return this;
  }

  /**
   * Asserts the modal has a specific aria-label.
   *
   * @param expected - Expected aria-label value or pattern
   * @returns this (chainable)
   */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /**
   * Asserts the modal has the given accessible name.
   *
   * @param expected - Expected accessible name
   * @returns this (chainable)
   */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /**
   * Asserts the modal has the given accessible description.
   *
   * @param expected - Expected accessible description
   * @returns this (chainable)
   */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  /**
   * Asserts the modal has a specific class name or class pattern.
   *
   * @param expected - Class name or RegExp
   * @returns this (chainable)
   */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /**
   * Asserts a specific attribute exists with the expected value.
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
   * Asserts that a specific attribute does NOT exist or is empty.
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
   * Waits until the modal becomes visible (open).
   *
   * @param timeout - Maximum wait time in ms
   * @returns this (chainable)
   */
  async waitUntilOpen(timeout = 10_000): Promise<this> {
    await expect(this.locator).toBeVisible({ timeout });
    return this;
  }

  /**
   * Waits until the modal becomes hidden (closed).
   *
   * @param timeout - Maximum wait time in ms
   * @returns this (chainable)
   */
  async waitUntilClosed(timeout = 10_000): Promise<this> {
    await expect(this.locator).toBeHidden({ timeout });
    return this;
  }

  /**
   * Waits until the modal's text content matches or contains the expected value.
   *
   * @param expected - Text or RegExp to match
   * @param timeout - Maximum wait time in ms
   * @returns this (chainable)
   */
  async waitForText(
    expected: string | RegExp,
    timeout = 10_000,
  ): Promise<this> {
    await expect(this.locator).toHaveText(expected, { timeout });
    return this;
  }
}
