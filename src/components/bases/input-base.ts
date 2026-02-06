// src/components/bases/input-base.ts
import { Page, Locator, expect } from "@playwright/test";

/**
 * InputBase
 * ---------
 * Chainable, type-safe base class for text input elements, including:
 *  - <input> (text, email, password, number, etc.)
 *  - <textarea>
 *  - contenteditable elements
 *
 * This class wraps a Playwright Locator to provide:
 *  - Input actions (fill, type, clear, press keys, focus/blur)
 *  - File upload support (for <input type="file">)
 *  - State checks (visible, enabled, disabled, readonly, required)
 *  - Value/attribute getters
 *  - Rich assertions with auto-retrying expect
 *  - Wait helpers for common conditions
 *
 * Construction patterns (all supported):
 *  - Selector-based (fallback / legacy):
 *      const input = new InputBase(page, "#case-name");
 *  - Locator-based (preferred – used by ComponentFactory):
 *      const input = new InputBase(page.getByLabel("Case name"));
 *
 * @example Basic usage in a test with ComponentFactory
 *   const ui = new ComponentFactory(page);
 *   const caseNameInput = ui.inputByLabel("Case name");
 *
 *   await caseNameInput
 *     .shouldBeVisible()
 *     .shouldBeEnabled()
 *     .shouldBeRequired()
 *     .fill("Matter 0001 – Foo vs Bar")
 *     .shouldHaveValue("Matter 0001 – Foo vs Bar");
 *
 * @example Typing with verification (simulates user input)
 *   await caseNameInput
 *     .clear()
 *     .type("New Case Title")
 *     .shouldHaveValue("New Case Title");
 *
 * @example File upload
 *   const fileInput = ui.inputByLabel("Upload supporting document");
 *   await fileInput.uploadFile("./documents/evidence.pdf");
 */
export class InputBase {
  /** Underlying Playwright Locator pointing to the input/textarea/contenteditable element. */
  readonly locator: Locator;

  // ───────────────────────────────────────────────────────────────
  // Constructors (overloaded for flexibility)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a CSS/XPath selector string (fallback pattern).
   *
   * @example
   *   const input = new InputBase(page, "#email-address");
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator (preferred – accessibility-first).
   *
   * @example
   *   const input = new InputBase(page.getByLabel("Email address"));
   *   const input = new InputBase(page.getByPlaceholder("Enter email"));
   */
  constructor(locator: Locator);

  constructor(pageOrLocator: Page | Locator, selector?: string) {
    this.locator =
      selector !== undefined
        ? (pageOrLocator as Page).locator(selector)
        : (pageOrLocator as Locator);
  }

  /**
   * Returns the underlying Playwright Locator for custom or advanced operations.
   *
   * @example
   *   await input.asLocator().press("Control+A");
   */
  asLocator(): Locator {
    return this.locator;
  }

  // ───────────────────────────────────────────────────────────────
  // Input Actions – chainable
  // ───────────────────────────────────────────────────────────────

  /**
   * Fill the input with the provided text, overwriting any existing value.
   * Playwright automatically waits for the element to be visible and editable.
   *
   * @param text - Text to fill into the input
   * @param options - Optional fill options (e.g., { timeout: 5000, force: true })
   *
   * @example
   *   await input.fill("john.doe@example.com");
   */
  async fill(
    text: string,
    options?: Parameters<Locator["fill"]>[1],
  ): Promise<this> {
    await this.locator.fill(text, options);
    return this;
  }

  /**
   * Clear the field and simulate user typing (character by character).
   * Uses Playwright's pressSequentially (recommended replacement for deprecated type()).
   * Useful when key events or per-character validation matters.
   *
   * @param text - Text to type into the input
   * @param options - Optional typing options (delay, timeout, etc.)
   *
   * @example
   *   await input.type("Slow typing demo");
   */
  async type(
    text: string,
    options?: Parameters<Locator["pressSequentially"]>[1],
  ): Promise<this> {
    await this.locator.clear();
    await this.locator.pressSequentially(text, options);
    return this;
  }

  /**
   * Compound action: clear the field and then type the new text.
   * More readable alias for common clear-then-type pattern.
   */
  async clearAndType(
    text: string,
    options?: Parameters<Locator["pressSequentially"]>[1],
  ): Promise<this> {
    return this.type(text, options);
  }

  /**
   * Clear the input value (sets to empty string).
   *
   * @example
   *   await input.clear();
   */
  async clear(): Promise<this> {
    await this.locator.fill("");
    return this;
  }

  /**
   * Press a keyboard key or key combination (e.g. "Enter", "Tab", "Control+A").
   *
   * @param key - Key name or combination
   * @param options - Optional press options
   *
   * @example
   *   await input.press("Enter");
   */
  async press(
    key: string,
    options?: Parameters<Locator["press"]>[1],
  ): Promise<this> {
    await this.locator.press(key, options);
    return this;
  }

  /**
   * Focus the input element.
   */
  async focus(): Promise<this> {
    await this.locator.focus();
    return this;
  }

  /**
   * Remove focus from the input (blur).
   */
  async blur(): Promise<this> {
    await this.locator.blur();
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // File Upload Actions (for <input type="file">)
  // ───────────────────────────────────────────────────────────────

  /**
   * Upload one or more files to a file input.
   * Works for standard file inputs.
   *
   * @param paths - Single file path or array of paths
   *
   * @example
   *   await fileInput.uploadFile("./reports/q1.pdf");
   */
  async uploadFile(
    paths: string | string[],
    options?: Parameters<Locator["setInputFiles"]>[1],
  ): Promise<this> {
    await this.locator.setInputFiles(paths, options);
    return this;
  }

  /**
   * Simulate dropping file(s) by triggering the file chooser dialog.
   * Useful for drag-and-drop zones or custom upload buttons.
   *
   * @param paths - File path(s) to "drop"
   *
   * @example
   *   await dropzone.dropFile("./evidence/photo.jpg");
   */
  async dropFile(paths: string | string[]): Promise<this> {
    const [fileChooser] = await Promise.all([
      this.locator.page().waitForEvent("filechooser"),
      this.locator.click(),
    ]);
    await fileChooser.setFiles(paths);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Getters & State Queries
  // ───────────────────────────────────────────────────────────────

  /**
   * Get the current value of the input.
   * - <input> / <textarea>: returns .value
   * - contenteditable: returns innerText
   *
   * @returns The current text content
   *
   * @example
   *   const value = await input.getValue();
   */
  async getValue(): Promise<string> {
    return this.locator.evaluate((el) => {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        return el.value ?? "";
      }
      if (el instanceof HTMLElement && el.isContentEditable) {
        return el.innerText ?? "";
      }
      return "";
    });
  }

  /**
   * Get the placeholder text if present.
   */
  async getPlaceholder(): Promise<string | null> {
    return this.locator.getAttribute("placeholder");
  }

  /**
   * Get the input type attribute (e.g. "text", "email", "password", "number").
   */
  async getType(): Promise<string | null> {
    return this.locator.getAttribute("type");
  }

  /**
   * Get the name attribute of the input.
   */
  async getName(): Promise<string | null> {
    return this.locator.getAttribute("name");
  }

  /**
   * Get any attribute value by name.
   *
   * @param name - Attribute name (e.g. "maxlength", "data-testid")
   */
  async getAttribute(name: string): Promise<string | null> {
    return this.locator.getAttribute(name);
  }

  async isVisible(): Promise<boolean> {
    return this.locator.isVisible();
  }

  async isEnabled(): Promise<boolean> {
    return this.locator.isEnabled();
  }

  async isDisabled(): Promise<boolean> {
    return this.locator.isDisabled();
  }

  /**
   * Check if the input has readonly attribute.
   */
  async isReadonly(): Promise<boolean> {
    return (await this.locator.getAttribute("readonly")) !== null;
  }

  /**
   * Check if input is required (HTML required or aria-required="true").
   */
  async isRequired(): Promise<boolean> {
    const required = await this.locator.getAttribute("required");
    const ariaRequired = await this.locator.getAttribute("aria-required");
    return required !== null || ariaRequired === "true";
  }

  /**
   * Check if current value is empty string.
   */
  async isEmpty(): Promise<boolean> {
    return (await this.getValue()) === "";
  }

  // ───────────────────────────────────────────────────────────────
  // Advanced Actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Select all text in the input/textarea (if supported).
   * No-op for non-text inputs.
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
   * Scroll the input into view if needed.
   */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Take a screenshot of the input element only.
   *
   * @param path - Optional file path to save screenshot
   * @returns Buffer of the screenshot
   */
  async screenshot(path?: string): Promise<Buffer> {
    return this.locator.screenshot({ path });
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions – chainable, auto-retrying
  // ───────────────────────────────────────────────────────────────

  /**
   * Assert the input has the exact expected value.
   *
   * @param expected - String or RegExp to match against value
   *
   * @example
   *   await input.shouldHaveValue("Matter 0001");
   */
  async shouldHaveValue(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveValue(expected);
    return this;
  }

  /**
   * Assert the input is empty.
   */
  async shouldBeEmpty(): Promise<this> {
    await expect(this.locator).toHaveValue("");
    return this;
  }

  /**
   * Assert the input is NOT empty.
   */
  async shouldNotBeEmpty(): Promise<this> {
    await expect(this.locator).not.toHaveValue("");
    return this;
  }

  /**
   * Assert the value contains the expected substring or pattern.
   */
  async shouldContainValue(expected: string | RegExp): Promise<this> {
    const pattern =
      expected instanceof RegExp ? expected : new RegExp(expected);
    await expect(this.locator).toHaveValue(pattern);
    return this;
  }

  async shouldBeVisible(): Promise<this> {
    await expect(this.locator).toBeVisible();
    return this;
  }

  async shouldBeHidden(): Promise<this> {
    await expect(this.locator).toBeHidden();
    return this;
  }

  async shouldBeEnabled(): Promise<this> {
    await expect(this.locator).toBeEnabled();
    return this;
  }

  async shouldBeDisabled(): Promise<this> {
    await expect(this.locator).toBeDisabled();
    return this;
  }

  /**
   * Assert input is readonly.
   */
  async shouldBeReadonly(): Promise<this> {
    await expect(this.locator).toHaveAttribute("readonly", "");
    return this;
  }

  /**
   * Assert input is marked as required (HTML or ARIA).
   */
  async shouldBeRequired(): Promise<this> {
    const required = await this.locator.getAttribute("required");
    const ariaRequired = await this.locator.getAttribute("aria-required");

    if (required !== null) return this; // presence is enough

    if (ariaRequired !== null) {
      await expect(this.locator).toHaveAttribute("aria-required", "true");
    } else {
      throw new Error(
        "Input is not marked required (missing 'required' or 'aria-required=\"true\"')",
      );
    }
    return this;
  }

  async shouldHavePlaceholder(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAttribute("placeholder", expected);
    return this;
  }

  async shouldHaveType(expected: string): Promise<this> {
    await expect(this.locator).toHaveAttribute("type", expected);
    return this;
  }

  async shouldBeFocused(): Promise<this> {
    await expect(this.locator).toBeFocused();
    return this;
  }

  async shouldBeInViewport(options?: {
    ratio?: number;
    timeout?: number;
  }): Promise<this> {
    await expect(this.locator).toBeInViewport(options);
    return this;
  }

  async shouldHaveAccessibleName(expected: string | RegExp): Promise<this> {
    await expect(this.locator).toHaveAccessibleName(expected);
    return this;
  }

  async shouldHaveAccessibleDescription(
    expected: string | RegExp,
  ): Promise<this> {
    await expect(this.locator).toHaveAccessibleDescription(expected);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Wait Helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Wait until input is visible and enabled (common readiness check).
   *
   * @param timeout - Max wait time in ms
   *
   * @example
   *   await input.waitUntilReady(15000);
   */
  async waitUntilReady(timeout = 10_000): Promise<this> {
    await Promise.all([
      this.locator.waitFor({ state: "visible", timeout }),
      expect(this.locator).toBeEnabled({ timeout }),
    ]);
    return this;
  }

  /**
   * Wait for the input value to match expected text or pattern.
   */
  async waitForValue(
    expected: string | RegExp,
    timeout = 10_000,
  ): Promise<this> {
    await expect(this.locator).toHaveValue(expected, { timeout });
    return this;
  }

  async waitUntilEmpty(timeout = 10_000): Promise<this> {
    await expect(this.locator).toHaveValue("", { timeout });
    return this;
  }

  async waitUntilNotEmpty(timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => (await this.getValue()) !== "", { timeout })
      .toBe(true);
    return this;
  }

  /**
   * Wait until the input becomes enabled.
   */
  async waitUntilEnabled(timeout = 10_000): Promise<this> {
    await expect(this.locator).toBeEnabled({ timeout });
    return this;
  }
}
