import { Page, Locator, expect } from "@playwright/test";

/**
 * Chainable, type-safe base class for <input>, <textarea>, and contenteditable elements.
 * Wraps Playwright locator actions, input methods, attributes, and assertions.
 *
 * All methods that talk to the page or use Playwright's async expect()
 * are async and return `this` for chaining, unless noted otherwise.
 *
 * @example
 * const input = new InputBase(page, '#email');
 * await input.fill('hello@example.com');
 * await input.clear();
 * await input.shouldHaveValue('hello@example.com');
 * await input.shouldBeEmpty();
 */
export class InputBase {
  readonly locator: Locator;

  constructor(page: Page, selector: string) {
    this.locator = page.locator(selector);
  }

  // === INPUT ACTIONS (async) ===

  /**
   * Fill the input with text. Overwrites current value.
   * @param text Text to fill.
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
   * @param text Text to type.
   */
  async type(
    text: string,
    options?: Parameters<Locator["type"]>[1]
  ): Promise<this> {
    await this.locator.clear();
    await this.locator.type(text, options);
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
   * Press a key (e.g., 'Enter', 'Tab').
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

  // === GETTERS (async) ===

  /** Get the current input value. */
  async getValue(): Promise<string> {
    return (await this.locator.inputValue()) ?? "";
  }

  /** Get the placeholder text. */
  async getPlaceholder(): Promise<string | null> {
    return await this.locator.getAttribute("placeholder");
  }

  /** Get the input type (e.g., 'text', 'email'). */
  async getType(): Promise<string | null> {
    return await this.locator.getAttribute("type");
  }

  /** Check if input is readonly. */
  async isReadonly(): Promise<boolean> {
    const readonly = await this.locator.getAttribute("readonly");
    return readonly !== null;
  }

  /** Check if input is required. */
  async isRequired(): Promise<boolean> {
    const required = await this.locator.getAttribute("required");
    return required !== null;
  }

  /** Check if input is disabled. */
  async isDisabled(): Promise<boolean> {
    return await this.locator.isDisabled();
  }

  /** Check if input is visible. */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  // === ACTIONS (advanced) ===

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
   * Trigger the browser file chooser and drop a file (for dropzones or custom file inputs).
   */
  async dropFile(path: string): Promise<this> {
    const [fileChooser] = await Promise.all([
      this.locator.page().waitForEvent("filechooser"),
      this.locator.click(),
    ]);
    await fileChooser.setFiles(path);
    return this;
  }

  // === ASSERTIONS (async – wrap Playwright's auto-retrying expect) ===

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

  /** Assert input is required. */
  async shouldBeRequired(): Promise<this> {
    await expect(this.locator).toHaveAttribute("required", "");
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
   * @param options.ratio 0–1: how much of the element must be visible.
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

  // === WAITERS ===

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

  // === UTILITIES ===

  /** Scroll input into view. */
  async scrollIntoView(): Promise<this> {
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /** Take a screenshot of just the input. */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.locator.screenshot({ path });
  }
}
