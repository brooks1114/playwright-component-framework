// src/components/bases/modal-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * ModalBase
 * ---------
 * Chainable base class for modal dialogs (e.g., role="dialog", "alertdialog").
 *
 * Intended to wrap the modal container element. Works best when the
 * selector/locator points at the root dialog element (backdrop+content or
 * content container).
 *
 * Responsibilities:
 *  - Scope: represent a single modal instance.
 *  - Actions: focus/blur, close via Escape, scroll, screenshot.
 *  - State: isVisible, isHidden, isOpen, isClosed.
 *  - Assertions: visible/hidden, in viewport, role, text, a11y attributes.
 *  - Waiters: waitUntilOpen, waitUntilClosed.
 *
 * Example:
 *   const modal = new ModalBase(page, '[role="dialog"]');
 *
 *   await modal
 *     .waitUntilOpen()
 *     .shouldBeVisible()
 *     .shouldContainText("Are you sure?")
 *     .closeWithEsc()
 *     .waitUntilClosed();
 */
export class ModalBase {
  /** Underlying Playwright Locator for the modal container. */
  readonly locator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string.
   *
   * @example
   *   const modal = new ModalBase(page, '[role="dialog"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator.
   *
   * @example
   *   const modal = new ModalBase(
   *     page.getByRole("dialog", { name: "Confirm delete" })
   *   );
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
   * Expose the underlying Locator for advanced operations.
   */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // Wait & state
  // ───────────────────────────────────────────────────────────────

  /** Wait for modal to be visible or attached. */
  async waitFor(options?: {
    timeout?: number;
    state?: "visible" | "attached";
  }): Promise<this> {
    await this.locator.waitFor({
      state: options?.state ?? "visible",
      timeout: options?.timeout ?? 30_000,
    });
    return this;
  }

  /** Check if modal is visible. */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /** Check if modal is hidden (not visible). */
  async isHidden(): Promise<boolean> {
    return !(await this.locator.isVisible());
  }

  /** Alias for isVisible, but expresses dialog semantics. */
  async isOpen(): Promise<boolean> {
    return await this.isVisible();
  }

  /** Alias for isHidden, but expresses dialog semantics. */
  async isClosed(): Promise<boolean> {
    return await this.isHidden();
  }

  // ───────────────────────────────────────────────────────────────
  // Actions
  // ───────────────────────────────────────────────────────────────

  /** Focus the modal container. */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /** Remove focus from the modal container. */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  /**
   * Close the modal by pressing Escape.
   *
   * Assumes your app wires Escape-key handling to close dialogs.
   */
  async closeWithEsc(): Promise<this> {
    await this.locator.page().keyboard.press("Escape");
    return this;
  }

  /**
   * Scroll modal into view.
   */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Take a screenshot of just the modal.
   *
   * @param path Optional path to write screenshot file.
   * @returns Screenshot buffer.
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // ───────────────────────────────────────────────────────────────
  // Getters (async)
  // ───────────────────────────────────────────────────────────────

  /** Get the visible text content of the modal. */
  async getText(): Promise<string> {
    return (await this.locator.textContent({ timeout: 5_000 }))?.trim() ?? "";
  }

  /** Get the ARIA role (e.g., "dialog", "alertdialog"). */
  async getRole(): Promise<string | null> {
    return await this.locator.getAttribute("role");
  }

  /** Get the aria-label attribute (if present). */
  async getAriaLabel(): Promise<string | null> {
    return await this.locator.getAttribute("aria-label");
  }

  /** Get a specific attribute value by name. */
  async getAttribute(name: string): Promise<string | null> {
    return await this.locator.getAttribute(name);
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions (async – wrap Playwright's auto-retrying expect)
  // ───────────────────────────────────────────────────────────────

  /** Assert modal is visible (open). */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /** Assert modal is hidden (closed or not in DOM). */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Alias for shouldBeHidden (expresses dialog semantics). */
  async shouldNotBeVisible(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert modal is focused. */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Assert modal intersects the viewport.
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  /** Assert modal contains specific text. */
  async shouldContainText(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toContainText(expected);
    return this;
  }

  /** Assert modal has specific role (e.g., "dialog"). */
  async shouldHaveRole(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveRole(expected as any);
    return this;
  }

  /** Assert modal has aria-label. */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /** Assert modal has a specific accessible name. */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /** Assert modal has a specific accessible description. */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  /** Assert modal has specific class or matches a class pattern. */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /** Assert modal has a specific attribute and value. */
  async shouldHaveAttribute(
    name: string,
    value: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute(name, value);
    return this;
  }

  /** Assert modal does *not* have the given attribute. */
  async shouldNotHaveAttribute(name: string): Promise<this> {
    await expect(this.locator).not.toHaveAttribute(name, /.*/);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /** Wait until modal is visible (open). */
  async waitUntilOpen(timeout = 10_000): Promise<this> {
    await expect(this.locator).toBeVisible({ timeout });
    return this;
  }

  /** Wait until modal is hidden (closed). */
  async waitUntilClosed(timeout = 10_000): Promise<this> {
    await expect(this.locator).toBeHidden({ timeout });
    return this;
  }

  /** Wait until modal text matches/contains the expected value. */
  async waitForText(
    expected: string | RegExp,
    timeout = 10_000
  ): Promise<this> {
    await expect(this.locator).toHaveText(expected, { timeout });
    return this;
  }
}
