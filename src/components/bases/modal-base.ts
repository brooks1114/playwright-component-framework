import { Page, Locator, expect } from "@playwright/test";

/**
 * Chainable base class for modal dialogs (e.g., role="dialog").
 *
 * Intended to wrap the modal container element. Works best when the
 * selector points at the root dialog element (backdrop+content or content).
 *
 * All methods that talk to the page or use Playwright's async expect()
 * are async and return `this` for chaining, unless noted otherwise.
 *
 * @example
 * const modal = new ModalBase(page, '[role="dialog"]');
 * await modal.waitUntilOpen();
 * await modal.shouldBeVisible();
 * await modal.closeWithEsc();
 * await modal.waitUntilClosed();
 */
export class ModalBase {
  readonly locator: Locator;

  constructor(page: Page, selector: string) {
    this.locator = page.locator(selector);
  }

  // === WAIT & STATE ===

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

  /** Check if modal is hidden. */
  async isHidden(): Promise<boolean> {
    return !(await this.locator.isVisible());
  }

  // === ACTIONS ===

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
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }

  // === GETTERS (async) ===

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

  // === ASSERTIONS (async – wrap Playwright's auto-retrying expect) ===

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

  // === WAITERS ===

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
}
