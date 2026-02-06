// src/components/bases/alert-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { ElementBase } from "./element-base";

/**
 * AlertBase
 * ---------
 * Semantic, chainable base class for inline alerts, status messages, and toast notifications.
 *
 * Common patterns this class supports:
 *  - Inline banners: <div role="alert" class="alert alert-error">Error message</div>
 *  - Live status: <div role="status" aria-live="polite">Item saved</div>
 *  - Dismissible toasts: <div role="alert" data-testid="toast">Success! <button aria-label="Close">×</button></div>
 *
 * Extends ElementBase to inherit:
 *  - Visibility, text, screenshot, accessibility, scrollIntoView, etc.
 *
 * Adds alert-specific features:
 *  - Role / aria-live inspection
 *  - Severity detection (data-severity or class tokens)
 *  - Close button handling (semantic + test-id)
 *  - Message assertions & waiters
 *
 * Preferred construction via ComponentFactory:
 *   ui.alertByRoleName("Error")
 *
 * @example Usage in a test
 *   const ui = new ComponentFactory(page);
 *   const errorAlert = ui.alertByRoleName(/could not save/i);
 *
 *   await errorAlert
 *     .shouldBeVisible()
 *     .shouldHaveRole("alert")
 *     .shouldContainMessage("Validation failed")
 *     .shouldHaveSeverity("error")
 *     .close()
 *     .waitUntilHidden();
 */
export class AlertBase extends ElementBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors (overloaded)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from Page + selector pointing to the alert container.
   *
   * @example
   *   new AlertBase(page, '[role="alert"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from a Locator (preferred).
   *
   * @example
   *   new AlertBase(page.getByRole("alert", { name: /Error/i }));
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
  // ARIA & Severity Getters
  // ───────────────────────────────────────────────────────────────

  /**
   * Get the ARIA role of the alert container (e.g. "alert", "status").
   *
   * @returns The role value or null if not set
   */
  async getRole(): Promise<string | null> {
    return await this.locator.getAttribute("role");
  }

  /**
   * Get the aria-live politeness level (e.g. "polite", "assertive").
   */
  async getAriaLive(): Promise<string | null> {
    return await this.locator.getAttribute("aria-live");
  }

  /**
   * Get aria-atomic value if present ("true" means entire region announced).
   */
  async getAriaAtomic(): Promise<string | null> {
    return await this.locator.getAttribute("aria-atomic");
  }

  /**
   * Detect severity from common patterns:
   *  - data-severity="error|warning|info|success"
   *  - class names containing "error", "warning", etc.
   *
   * @returns Detected severity or null
   *
   * @example
   *   const sev = await alert.getSeverity(); // "error"
   */
  async getSeverity(): Promise<
    "error" | "warning" | "info" | "success" | null
  > {
    const dataSeverity = await this.locator.getAttribute("data-severity");
    if (["error", "warning", "info", "success"].includes(dataSeverity ?? "")) {
      return dataSeverity as "error" | "warning" | "info" | "success";
    }

    const classAttr = (await this.locator.getAttribute("class")) ?? "";
    const tokens = classAttr.toLowerCase().split(/\s+/);

    for (const sev of ["error", "warning", "info", "success"] as const) {
      if (tokens.some((t) => t.includes(sev))) {
        return sev;
      }
    }

    return null;
  }

  /**
   * Get the main message text (alias for inherited getText()).
   */
  async getMessage(): Promise<string> {
    return this.getText();
  }

  // ───────────────────────────────────────────────────────────────
  // Close Button Handling
  // ───────────────────────────────────────────────────────────────

  /**
   * Locator for the close button inside the alert.
   * Tries multiple reliable patterns (test-id, aria-label, text, role).
   *
   * Protected so subclasses can override/extend if needed.
   */
  protected get closeButton(): Locator {
    return this.locator
      .locator('[data-testid="alert-close"]')
      .or(this.locator.getByRole("button", { name: /close/i }))
      .or(this.locator.locator('button[aria-label*="Close" i]'))
      .or(this.locator.locator('button:has-text("×"), button:has-text("×")'));
  }

  /**
   * Click the close button to dismiss the alert/toast.
   * Throws if no close button is found.
   *
   * @param options - Click options (force, timeout, etc.)
   *
   * @example
   *   await alert.close();
   */
  async close(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    const btn = this.closeButton;
    const count = await btn.count();

    if (count === 0) {
      throw new Error(
        "AlertBase.close(): No close button found in alert. " +
          "Expected one of: [data-testid='alert-close'], button[aria-label*='Close'], " +
          "or button with text '×'. Add one for dismissible alerts.",
      );
    }

    await btn.first().click(options);
    return this;
  }

  /**
   * Assert the alert has a close button (is dismissible).
   */
  async shouldBeDismissable(): Promise<this> {
    await expect(this.closeButton).toBeVisible();
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions (chainable)
  // ───────────────────────────────────────────────────────────────

  /**
   * Assert alert is visible (inherited from ElementBase).
   */
  async shouldBeVisible(): Promise<this> {
    await super.shouldBeVisible();
    return this;
  }

  async shouldBeHidden(): Promise<this> {
    await super.shouldBeHidden();
    return this;
  }

  /**
   * Assert the alert contains the expected message text.
   *
   * @param expected - String or RegExp
   *
   * @example
   *   await alert.shouldContainMessage("Saved successfully");
   */
  async shouldContainMessage(expected: string | RegExp): Promise<this> {
    await this.shouldContainText(expected);
    return this;
  }

  /**
   * Assert the alert has exactly the expected message.
   */
  async shouldHaveMessage(expected: string | RegExp): Promise<this> {
    await this.shouldHaveText(expected);
    return this;
  }

  /**
   * Assert the alert has the specified ARIA role.
   *
   * @param expected - e.g. "alert" or /status/i
   */
  async shouldHaveRole(expected: string | RegExp): Promise<this> {
    const role = await this.getRole();
    expect(role).not.toBeNull();
    if (expected instanceof RegExp) {
      expect(role!).toMatch(expected);
    } else {
      expect(role).toBe(expected);
    }
    return this;
  }

  /**
   * Assert this is a live region (role="alert" or aria-live set).
   */
  async shouldBeLiveRegion(): Promise<this> {
    const role = ((await this.getRole()) ?? "").toLowerCase();
    const live = ((await this.getAriaLive()) ?? "").toLowerCase();

    const isAlert = role === "alert";
    const isLive = ["polite", "assertive", "rude"].includes(live);

    if (!isAlert && !isLive) {
      throw new Error(
        `Expected role="alert" or aria-live="polite/assertive", ` +
          `got role="${role}" aria-live="${live}"`,
      );
    }
    return this;
  }

  /**
   * Assert the alert is polite (aria-live="polite").
   */
  async shouldBePolite(): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-live", "polite");
    return this;
  }

  /**
   * Assert the alert is assertive (role="alert" or aria-live="assertive").
   */
  async shouldBeAssertive(): Promise<this> {
    const role = await this.getRole();
    if (role?.toLowerCase() === "alert") return this;

    await expect(this.locator).toHaveAttribute("aria-live", "assertive");
    return this;
  }

  /**
   * Assert the alert has the given severity.
   *
   * @param expected - "error" | "warning" | "info" | "success"
   */
  async shouldHaveSeverity(
    expected: "error" | "warning" | "info" | "success",
  ): Promise<this> {
    const severity = await this.getSeverity();
    expect(severity).toBe(expected);
    return this;
  }

  /**
   * Assert severity token present in class or data-severity.
   *
   * @param token - e.g. "error", /alert-warning/i
   */
  async shouldHaveSeverityToken(token: string | RegExp): Promise<this> {
    const classAttr = (await this.locator.getAttribute("class")) ?? "";
    const data = (await this.locator.getAttribute("data-severity")) ?? "";
    const combined = `${classAttr} ${data}`.toLowerCase();

    if (token instanceof RegExp) {
      expect(combined).toMatch(token);
    } else {
      expect(combined).toContain(token.toLowerCase());
    }
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /**
   * Wait until the alert becomes visible.
   *
   * @param timeout - Max wait in ms
   */
  async waitUntilVisible(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    return this;
  }

  /**
   * Wait until the alert is hidden/dismissed.
   */
  async waitUntilHidden(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "hidden", timeout });
    return this;
  }

  /**
   * Wait until the alert contains the expected message.
   */
  async waitForMessage(
    expected: string | RegExp,
    timeout = 10_000,
  ): Promise<this> {
    await expect(this.locator).toContainText(expected, { timeout });
    return this;
  }
}
