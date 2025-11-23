// src/components/bases/input-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * InputBase
 * ---------
 * Chainable, type-safe base class for:
 *  - <input>
 *  - <textarea>
 *  - contenteditable elements
 *
 * This wraps a Playwright Locator and provides:
 *  - Input helpers (fill, type, clear, press, focus/blur)
 *  - State queries (isVisible, isDisabled, isReadonly, isRequired)
 *  - Getters (value, placeholder, type, attributes)
 *  - File helpers (uploadFile, dropFile for <input type="file">)
 *  - Assertions (shouldHaveValue, shouldBeEmpty, shouldBeRequired, etc.)
 *  - Waiters (waitUntilReady, waitForValue)
 *
 * Construction patterns:
 *  - Selector-based (legacy / fallback):
 *      const input = new InputBase(page, "#email");
 *  - Locator-based (preferred, used by ComponentFactory):
 *      const input = new InputBase(page.getByLabel("Email"));
 *
 * Example usage in a test with your ComponentFactory:
 *
 *   const ui = new ComponentFactory(page);
 *   const caseNameInput = ui.inputByLabel("Case name");
 *
 *   await caseNameInput
 *     .shouldBeVisible()
 *     .shouldBeRequired()
 *     .fill("Matter 0001")
 *     .shouldHaveValue("Matter 0001");
 */
export class InputBase {
  /** Underlying Playwright Locator for this input / textarea / contenteditable. */
  readonly locator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string (CSS/xpath/etc).
   *
   * @example
   *   const input = new InputBase(page, "#email");
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator (e.g., page.getByLabel()).
   *
   * @example
   *   const input = new InputBase(page.getByLabel("Email"));
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    if (selector !== undefined) {
      // Usage: new InputBase(page, "#email")
      this.locator = (pageOrLocator as Page).locator(selector);
    } else {
      // Usage: new InputBase(page.getByLabel("Email"))
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
  // Input actions (async)
  // ───────────────────────────────────────────────────────────────

  /**
   * Fill the input with text. Overwrites the current value.
   *
   * Uses Playwright's locator.fill() which:
   *  - waits for the element to be visible & editable
   *  - selects existing text and replaces it
   */
  async fill(
    text: string,
    options?: Parameters<Locator["fill"]>[1]
  ): Promise<this> {
    await this.locator.fill(text, options);
    return this;
  }

  /**
   * Clear the input and type new text (simulates user typing).
   *
   * Uses Locator.pressSequentially() under the hood (Playwright's
   * recommended replacement for the deprecated Locator.type()).
   */
  async type(
    text: string,
    options?: Parameters<Locator["pressSequentially"]>[1]
  ): Promise<this> {
    await this.locator.clear();
    await this.locator.pressSequentially(text, options);
    return this;
  }

  /**
   * Clear the input field.
   */
  async clear(): Promise<this> {
    await this.locator.fill("");
    return this;
  }

  /**
   * Press a key (e.g., "Enter", "Tab").
   */
  async press(
    key: string,
    options?: Parameters<Locator["press"]>[1]
  ): Promise<this> {
    await this.locator.press(key, options);
    return this;
  }

  /**
   * Focus the input.
   */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /**
   * Blur the input (remove focus).
   */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Getters / state queries (async)
  // ───────────────────────────────────────────────────────────────

  /**
   * Get the current input value.
   *
   * - For <input> / <textarea>, returns the "value".
   * - For contenteditable elements, falls back to innerText.
   */
  async getValue(): Promise<string> {
    return await this.locator.evaluate((el) => {
      const anyEl = el as any;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        return el.value ?? "";
      }
      if ((el as HTMLElement).isContentEditable) {
        return (el as HTMLElement).innerText ?? "";
      }
      // Fallback: try inputValue logic
      return anyEl.value ?? "";
    });
  }

  /** Get the placeholder text, if present. */
  async getPlaceholder(): Promise<string | null> {
    return await this.locator.getAttribute("placeholder");
  }

  /** Get the input type (e.g., "text", "email"), if present. */
  async getType(): Promise<string | null> {
    return await this.locator.getAttribute("type");
  }

  /** Get the name attribute, if present. */
  async getName(): Promise<string | null> {
    return await this.locator.getAttribute("name");
  }

  /** Get a specific attribute value. */
  async getAttribute(name: string): Promise<string | null> {
    return await this.locator.getAttribute(name);
  }

  /** Check if input is readonly. */
  async isReadonly(): Promise<boolean> {
    const readonly = await this.locator.getAttribute("readonly");
    return readonly !== null;
  }

  /** Check if input is required. */
  async isRequired(): Promise<boolean> {
    const required = await this.locator.getAttribute("required");
    const ariaRequired = await this.locator.getAttribute("aria-required");
    return required !== null || ariaRequired === "true";
  }

  /** Check if input is disabled. */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /** Check if input is visible. */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /** Check if the input's value is empty. */
  async isEmpty(): Promise<boolean> {
    const value = await this.getValue();
    return value === "";
  }

  // ───────────────────────────────────────────────────────────────
  // Advanced actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Select all text in the input/textarea.
   *
   * For non-text controls (e.g., checkbox), this is a no-op.
   */
  async selectAll(): Promise<this> {
    await this.locator.evaluate((el) => {
      if ("select" in el && typeof (el as any).select === "function") {
        (el as HTMLInputElement | HTMLTextAreaElement).select();
      }
    });
    return this;
  }

  /**
   * Upload a file (for <input type="file">).
   */
  async uploadFile(path: string): Promise<this> {
    await this.locator.setInputFiles(path);
    return this;
  }

  /**
   * Trigger the browser file chooser and drop a file
   * (for dropzones or custom file inputs).
   */
  async dropFile(path: string): Promise<this> {
    const [fileChooser] = await Promise.all([
      this.locator.page().waitForEvent("filechooser"),
      this.locator.click(),
    ]);
    await fileChooser.setFiles(path);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions (async – wrap Playwright's auto-retrying expect)
  // ───────────────────────────────────────────────────────────────

  /** Assert input has exact value (string or RegExp). */
  async shouldHaveValue(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveValue(expected);
    return this;
  }

  /** Assert input is empty. */
  async shouldBeEmpty(): Promise<this> {
    await expect(this.locator).toHaveValue("");
    return this;
  }

  /** Assert input contains the given text (substring or pattern match). */
  async shouldContainValue(expected: string | RegExp): Promise<this> {
    const pattern =
      expected instanceof RegExp ? expected : new RegExp(expected);
    await expect(this.locator).toHaveValue(pattern);
    return this;
  }

  /** Assert input is visible. */
  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  /** Assert input is hidden. */
  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert input is not visible (alias for hidden). */
  async shouldNotBeVisible(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  /** Assert input is enabled. */
  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  /** Assert input is disabled. */
  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  /** Assert input is readonly. */
  async shouldBeReadonly(): Promise<this> {
    await expect(this.locator).toHaveAttribute("readonly", "");
    return this;
  }

  /**
   * Assert input is required (HTML required or ARIA-required).
   *
   * This covers:
   *  - <input required>
   *  - <input required="true">
   *  - <input aria-required="true">
   */
  async shouldBeRequired(): Promise<this> {
    const required = await this.locator.getAttribute("required");
    const ariaRequired = await this.locator.getAttribute("aria-required");

    if (required === null && ariaRequired === null) {
      throw new Error(
        "Expected input to be required, but neither 'required' nor 'aria-required' are set."
      );
    }

    if (ariaRequired !== null) {
      await expect(this.locator).toHaveAttribute("aria-required", "true");
    }

    return this;
  }

  /** Assert input has placeholder. */
  async shouldHavePlaceholder(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("placeholder", expected);
    return this;
  }

  /** Assert input has specific type. */
  async shouldHaveType(expected: string): Promise<this> {
    await expect(this.locator).toHaveAttribute("type", expected);
    return this;
  }

  /** Assert input has specific class or matches a class pattern. */
  async shouldHaveClass(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveClass(expected);
    return this;
  }

  /** Assert input has aria-label. */
  async shouldHaveAriaLabel(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("aria-label", expected);
    return this;
  }

  /** Assert input is focused. */
  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  /**
   * Assert input intersects the viewport.
   *
   * @param options.ratio   0–1: how much of the element must be visible.
   * @param options.timeout Assertion timeout override (optional).
   */
  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  /** Assert input has a specific accessible name. */
  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  /** Assert input has a specific accessible description. */
  async shouldHaveAccessibleDescription(
    expected: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  /** Assert input has a specific attribute and value. */
  async shouldHaveAttribute(
    name: string,
    value: string | RegExp
  ): Promise<this> {
    await expect(this.locator).toHaveAttribute(name, value);
    return this;
  }

  /** Assert input does *not* have a given attribute. */
  async shouldNotHaveAttribute(name: string): Promise<this> {
    await expect(this.locator).not.toHaveAttribute(name, /.*/);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /** Wait for input to be visible and enabled. */
  async waitUntilReady(timeout = 10_000): Promise<this> {
    await this.locator.waitFor({ state: "visible", timeout });
    await expect(this.locator).toBeEnabled({ timeout });
    return this;
  }

  /** Wait for value to match. */
  async waitForValue(
    expected: string | RegExp,
    timeout = 10_000
  ): Promise<this> {
    await expect(this.locator).toHaveValue(expected, { timeout });
    return this;
  }

  /** Wait for the input to become empty. */
  async waitUntilEmpty(timeout = 10_000): Promise<this> {
    await expect(this.locator).toHaveValue("", { timeout });
    return this;
  }

  /** Wait for the input to become non-empty. */
  async waitUntilNotEmpty(timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => (await this.getValue()) !== "", { timeout })
      .toBe(true);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Utilities
  // ───────────────────────────────────────────────────────────────

  /** Scroll input into view. */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Take a screenshot of just the input.
   *
   * @param path Optional path; if provided, writes screenshot to disk.
   * @returns The screenshot Buffer.
   */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }
}
