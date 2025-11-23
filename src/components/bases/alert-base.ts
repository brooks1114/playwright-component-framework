// src/components/bases/alert-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { ElementBase } from "./element-base";

/**
 * AlertBase
 * ---------
 * Semantic base class for inline alerts and toast-style notifications.
 *
 * Typical patterns:
 *  - Inline error/success banner:
 *      <div role="alert" class="alert alert-error">Something went wrong</div>
 *
 *  - Status messages:
 *      <div role="status" aria-live="polite">Saved successfully</div>
 *
 *  - Toast notifications:
 *      <div role="alert" data-testid="toast">
 *        <span>Record created</span>
 *        <button aria-label="Close">×</button>
 *      </div>
 *
 * This class:
 *  - Extends ElementBase (visibility, text, a11y, screenshots, etc.)
 *  - Adds alert-specific helpers:
 *      - role / aria-live inspection
 *      - severity helpers (via class or data-attribute)
 *      - close button helpers
 *      - message assertions & waiters
 *
 * Example:
 *   const alert = new AlertBase(
 *     page.getByRole("alert", { name: /could not create matter/i })
 *   );
 *
 *   await alert
 *     .shouldBeVisible()
 *     .shouldContainMessage(/could not create/i)
 *     .shouldHaveSeverityToken("error")
 *     .close()
 *     .waitUntilHidden();
 */
export class AlertBase extends ElementBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string that points
   * at the alert container element.
   *
   * @example
   *   const alert = new AlertBase(page, '[role="alert"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator.
   *
   * @example
   *   const alert = new AlertBase(
   *     page.getByRole("alert", { name: /Error/i })
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
  // Getter helpers (role / live region / severity)
  // ───────────────────────────────────────────────────────────────

  /** Get the ARIA role, e.g. "alert", "status". */
  async getRole(): Promise<string | null> {
    return await this.locator.getAttribute("role");
  }

  /** Get the aria-live politeness setting, if any. */
  async getAriaLive(): Promise<string | null> {
    return await this.locator.getAttribute("aria-live");
  }

  /** Get the aria-atomic value, if any. */
  async getAriaAtomic(): Promise<string | null> {
    return await this.locator.getAttribute("aria-atomic");
  }

  /**
   * Get a generic "severity" signal, trying common patterns:
   *  - data-severity="error|warning|info|success"
   *  - class tokens containing those strings
   *
   * Returns the first matching severity token, or null if none.
   */
  async getSeverity(): Promise<
    "error" | "warning" | "info" | "success" | null
  > {
    const dataSeverity = await this.locator.getAttribute("data-severity");
    if (
      dataSeverity === "error" ||
      dataSeverity === "warning" ||
      dataSeverity === "info" ||
      dataSeverity === "success"
    ) {
      return dataSeverity;
    }

    const classAttr = (await this.locator.getAttribute("class")) ?? "";
    const tokens = classAttr.split(/\s+/);

    const known: Array<"error" | "warning" | "info" | "success"> = [
      "error",
      "warning",
      "info",
      "success",
    ];

    for (const sev of known) {
      if (tokens.some((t) => t.toLowerCase().includes(sev))) {
        return sev;
      }
    }

    return null;
  }

  // ───────────────────────────────────────────────────────────────
  // Close button helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Try to locate a close button inside the alert.
   *
   * Heuristics:
   *  - [data-testid="alert-close"]
   *  - role="button" with accessible name matching "Close" (case-insensitive)
   *  - button[aria-label~="Close"]
   *
   * This keeps the tests expressive while staying implementation-agnostic.
   */
  protected get closeButton(): Locator {
    // Common test-id style hook
    const testIdCandidate = this.locator.getByTestId("alert-close");

    // Use a composite locator that will work with either:
    //  - the test-id-based one, or
    //  - a semantic button with "Close" label
    const semanticButton = this.locator.getByRole("button", {
      name: /close/i,
    });

    // Use a union-style locator: either candidate could resolve elements.
    // In Playwright, locator("selectorA, selectorB") combines selectors,
    // but here we're combining two Locators via their underlying selectors
    // with a best-effort approach.
    return this.locator
      .locator(
        '[data-testid="alert-close"], button[aria-label*="Close" i], button:has-text("×")'
      )
      .or(semanticButton)
      .or(testIdCandidate);
  }

  /**
   * Click the close button if present.
   *
   * Throws a friendly error if no close button can be found.
   */
  async close(options?: Parameters<Locator["click"]>[0]): Promise<this> {
    const btn = this.closeButton;

    if (await btn.count().then((n) => n === 0)) {
      throw new Error(
        "AlertBase.close(): could not find a close button inside the alert. " +
          "Consider adding [data-testid='alert-close'] or a button with accessible name 'Close'."
      );
    }

    await btn.first().click(options);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions (alert-specific)
  // ───────────────────────────────────────────────────────────────

  /** Assert the alert is visible. (Delegates to ElementBase behavior.) */
  async shouldBeVisible(): Promise<this> {
    await super.shouldBeVisible();
    return this;
  }

  /** Assert the alert is hidden. */
  async shouldBeHidden(): Promise<this> {
    await super.shouldBeHidden();
    return this;
  }

  /** Assert the alert contains specific text. */
  async shouldContainMessage(expected: string | RegExp): Promise<this> {
    await this.shouldContainText(expected);
    return this;
  }

  /** Assert the alert has *exact* text (string or RegExp). */
  async shouldHaveMessage(expected: string | RegExp): Promise<this> {
    await this.shouldHaveText(expected);
    return this;
  }

  /**
   * Assert the alert has a given ARIA role, e.g. "alert" or "status".
   */
  async shouldHaveRole(expected: string | RegExp): Promise<this> {
    const currentRole = await this.getRole();
    expect(currentRole).not.toBeNull();
    if (expected instanceof RegExp) {
      expect(currentRole as string).toMatch(expected);
    } else {
      expect(currentRole).toBe(expected);
    }
    return this;
  }

  /**
   * Assert that the alert acts like a "live region":
   *  - role="alert" (assertive), OR
   *  - aria-live set to "polite" or "assertive"
   */
  async shouldBeLiveRegion(): Promise<this> {
    const role = (await this.getRole()) ?? "";
    const live = ((await this.getAriaLive()) ?? "").toLowerCase();

    const isAlertRole = role.toLowerCase() === "alert";
    const isLive = live === "polite" || live === "assertive" || live === "rude"; // just in case

    if (!isAlertRole && !isLive) {
      throw new Error(
        `AlertBase.shouldBeLiveRegion(): expected role="alert" or aria-live="polite|assertive", ` +
          `but got role="${role}" aria-live="${live}".`
      );
    }

    return this;
  }

  /**
   * Assert the alert has a particular severity token.
   *
   * We check both:
   *  - data-severity="error|warning|info|success"
   *  - class tokens that contain those substrings
   */
  async shouldHaveSeverity(
    expected: "error" | "warning" | "info" | "success"
  ): Promise<this> {
    const severity = await this.getSeverity();
    expect(severity).toBe(expected);
    return this;
  }

  /**
   * Assert the alert's CSS classes or data attributes contain a given token.
   *
   * This is the more generic version; useful if your design system uses
   * tokens like "alert-error", "alert-success", etc.
   */
  async shouldHaveSeverityToken(token: string | RegExp): Promise<this> {
    const classAttr = (await this.locator.getAttribute("class")) ?? "";
    const dataSeverity =
      (await this.locator.getAttribute("data-severity")) ?? "";

    const combined = `${classAttr} ${dataSeverity}`;

    if (token instanceof RegExp) {
      expect(combined).toMatch(token);
    } else {
      expect(combined.toLowerCase()).toContain(token.toLowerCase());
    }

    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters (alert-specific)
  // ───────────────────────────────────────────────────────────────

  /** Wait until alert is visible (shown). */
  async waitUntilVisible(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    return this;
  }

  /** Wait until alert is hidden (dismissed). */
  async waitUntilHidden(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "hidden", timeout });
    return this;
  }

  /**
   * Wait until the alert's message contains given text/pattern.
   */
  async waitForMessage(
    expected: string | RegExp,
    timeout = 10_000
  ): Promise<this> {
    await expect(this.locator).toContainText(expected, { timeout });
    return this;
  }
}
