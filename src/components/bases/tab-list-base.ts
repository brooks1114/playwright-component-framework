// src/components/bases/tab-list-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { ElementBase } from "./element-base";

/**
 * TabListBase
 * -----------
 * Semantic base class for tabbed navigation components.
 *
 * ARIA pattern (recommended):
 *   <div role="tablist" aria-label="Matter tabs">
 *     <button role="tab" aria-selected="true" aria-controls="panel-details" id="tab-details">Details</button>
 *     <button role="tab" aria-selected="false" aria-controls="panel-history" id="tab-history">History</button>
 *   </div>
 *
 *   <div id="panel-details" role="tabpanel" aria-labelledby="tab-details">...</div>
 *   <div id="panel-history" role="tabpanel" aria-labelledby="tab-history" hidden>...</div>
 *
 * This class:
 *  - Extends ElementBase (visibility, text, a11y, screenshots, etc.)
 *  - Adds tab-specific helpers:
 *      - getTabs(), getActiveTab(), getActiveTabLabel()
 *      - selectTabByLabel(), selectTabByIndex()
 *      - panel resolution via aria-controls/aria-labelledby
 *      - assertions & waiters for active tab and panel visibility
 *
 * Example:
 *   const tabs = new TabListBase(
 *     page.getByRole("tablist", { name: "Matter tabs" })
 *   );
 *
 *   await tabs
 *     .shouldHaveTabs(["Details", "History", "Notes"])
 *     .selectTabByLabel("History")
 *     .shouldHaveActiveTab("History")
 *     .shouldActivePanelContain(/no history yet/i);
 */
export class TabListBase extends ElementBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and selector pointing at the tablist container.
   *
   * @example
   *   const tabs = new TabListBase(page, '[role="tablist"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator (tablist root).
   *
   * @example
   *   const tabs = new TabListBase(
   *     page.getByRole("tablist", { name: "Matter tabs" })
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
  // Core locators
  // ───────────────────────────────────────────────────────────────

  /** Locator for tabs inside this tablist. */
  protected get tabsLocator(): Locator {
    return this.locator.getByRole("tab");
  }

  /**
   * Panels are often outside the immediate tablist container, but they
   * should still use role="tabpanel". We resolve panels primarily via
   * aria-controls on the active tab, but this is a convenient base locator.
   */
  protected get pageRoot(): Locator {
    // Use the root page via the locator.
    return this.locator.page().locator("body");
  }

  // ───────────────────────────────────────────────────────────────
  // Tab discovery / helpers
  // ───────────────────────────────────────────────────────────────

  /** Get the count of tabs in this tablist. */
  async getTabCount(): Promise<number> {
    return await this.tabsLocator.count();
  }

  /** Get tab Locator by index (0-based). */
  protected getTabByIndex(index: number): Locator {
    return this.tabsLocator.nth(index);
  }

  /**
   * Get tab Locator by visible/accessible name.
   *
   * @example
   *   const tab = await tabs.locateTabByLabel("Details");
   */
  protected locateTabByLabel(label: string | RegExp): Locator {
    return this.locator.getByRole("tab", { name: label });
  }

  /** Get all tab labels as trimmed strings. */
  async getTabLabels(): Promise<string[]> {
    const texts = await this.tabsLocator.allTextContents();
    return texts.map((t) => t.trim());
  }

  /**
   * Get the currently active tab locator.
   *
   * Detection strategy:
   *  - aria-selected="true"
   *  - data-state="active" | "selected"
   *  - role="tab" with aria-current="page" (less common but supported)
   *
   * If multiple match, the first is returned.
   * If none match, null is returned.
   */
  async getActiveTab(): Promise<Locator | null> {
    const tabs = this.tabsLocator;
    const count = await tabs.count();

    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i);

      const ariaSelected =
        (await tab.getAttribute("aria-selected"))?.toLowerCase() ?? "";
      if (ariaSelected === "true") {
        return tab;
      }

      const dataState =
        (await tab.getAttribute("data-state"))?.toLowerCase() ?? "";
      if (dataState === "active" || dataState === "selected") {
        return tab;
      }

      const ariaCurrent =
        (await tab.getAttribute("aria-current"))?.toLowerCase() ?? "";
      if (ariaCurrent === "page" || ariaCurrent === "true") {
        return tab;
      }
    }

    return null;
  }

  /** Get the label of the currently active tab, or null if none. */
  async getActiveTabLabel(): Promise<string | null> {
    const active = await this.getActiveTab();
    if (!active) return null;

    const text = await active.textContent();
    return text?.trim() ?? null;
  }

  // ───────────────────────────────────────────────────────────────
  // Panel resolution
  // ───────────────────────────────────────────────────────────────

  /**
   * Given a specific tab, resolve its associated panel via ARIA wiring:
   *
   *  - aria-controls = panel id
   *  - OR find first [role="tabpanel"][aria-labelledby="<tab.id>"]
   */
  protected async resolvePanelForTab(tab: Locator): Promise<Locator | null> {
    const ariaControls = await tab.getAttribute("aria-controls");
    const tabId = await tab.getAttribute("id");

    // 1) aria-controls → #id
    if (ariaControls) {
      const panelById = this.pageRoot.locator(`#${ariaControls}`);
      if (await panelById.count().then((n) => n > 0)) {
        return panelById.first();
      }
    }

    // 2) aria-labelledby on panel referring back to this tab's id
    if (tabId) {
      const panelByLabel = this.pageRoot.locator(
        `[role="tabpanel"][aria-labelledby="${tabId}"]`
      );
      if (await panelByLabel.count().then((n) => n > 0)) {
        return panelByLabel.first();
      }
    }

    return null;
  }

  /**
   * Resolve the currently active tab's panel, if any.
   */
  async getActivePanel(): Promise<Locator | null> {
    const activeTab = await this.getActiveTab();
    if (!activeTab) return null;
    return await this.resolvePanelForTab(activeTab);
  }

  // ───────────────────────────────────────────────────────────────
  // Actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Select a tab by its visible/accessible label.
   *
   * Does a simple click, then returns this for chaining.
   */
  async selectTabByLabel(
    label: string | RegExp,
    options?: Parameters<Locator["click"]>[0]
  ): Promise<this> {
    const tab = this.locateTabByLabel(label);
    await tab.click(options);
    return this;
  }

  /**
   * Select a tab by index (0-based).
   *
   * Useful when labels are dynamic or repeated.
   */
  async selectTabByIndex(
    index: number,
    options?: Parameters<Locator["click"]>[0]
  ): Promise<this> {
    await this.getTabByIndex(index).click(options);
    return this;
  }

  /**
   * Keyboard navigation helper:
   *  - Focuses the active tab (or first tab if none marked active)
   *  - Sends the given key (e.g., "ArrowRight", "ArrowLeft", "Home", "End")
   */
  async navigateWithKey(
    key: string,
    options?: Parameters<Locator["press"]>[1]
  ): Promise<this> {
    let tab = await this.getActiveTab();
    if (!tab) {
      // Fallback: first tab
      tab = this.getTabByIndex(0);
    }

    await tab.focus();
    await tab.press(key, options);

    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions
  // ───────────────────────────────────────────────────────────────

  /** Assert that the tablist is visible (delegates to ElementBase). */
  async shouldBeVisible(): Promise<this> {
    await super.shouldBeVisible();
    return this;
  }

  /** Assert that the tablist is hidden. */
  async shouldBeHidden(): Promise<this> {
    await super.shouldBeHidden();
    return this;
  }

  /**
   * Assert that tab labels exactly match in order.
   */
  async shouldHaveTabs(expectedLabels: readonly string[]): Promise<this> {
    const actual = await this.getTabLabels();
    await expect(actual).toEqual(expectedLabels);
    return this;
  }

  /**
   * Assert that at least the given labels are present (order-insensitive).
   *
   * This is useful if the app adds new tabs over time but you still
   * want to validate the presence of key tabs.
   */
  async shouldContainTabs(expectedLabels: readonly string[]): Promise<this> {
    const actual = await this.getTabLabels();
    for (const label of expectedLabels) {
      expect(actual).toContain(label);
    }
    return this;
  }

  /**
   * Assert that a particular tab is currently active (by label).
   */
  async shouldHaveActiveTab(expected: string | RegExp): Promise<this> {
    const label = await this.getActiveTabLabel();
    if (label === null) {
      throw new Error(
        `TabListBase.shouldHaveActiveTab(): no active tab found, expected "${expected.toString()}".`
      );
    }

    if (expected instanceof RegExp) {
      expect(label).toMatch(expected);
    } else {
      expect(label).toBe(expected);
    }

    return this;
  }

  /**
   * Assert that there is some active tab (does not check which one).
   */
  async shouldHaveAnyActiveTab(): Promise<this> {
    const active = await this.getActiveTab();
    if (!active) {
      throw new Error(
        "TabListBase.shouldHaveAnyActiveTab(): no active tab found (check aria-selected / data-state wiring)."
      );
    }
    return this;
  }

  /**
   * Assert that the active panel (if any) contains text.
   */
  async shouldActivePanelContain(expected: string | RegExp): Promise<this> {
    const panel = await this.getActivePanel();
    if (!panel) {
      throw new Error(
        "TabListBase.shouldActivePanelContain(): could not resolve active panel from active tab. " +
          "Ensure aria-controls/aria-labelledby wiring follows the ARIA tab pattern."
      );
    }

    await expect(panel).toContainText(expected);
    return this;
  }

  /**
   * Assert that a specific tab's panel (resolved by label) contains text.
   *
   * This does NOT require that the tab is currently active.
   */
  async shouldPanelForTabContain(
    tabLabel: string | RegExp,
    expected: string | RegExp
  ): Promise<this> {
    const tab = this.locateTabByLabel(tabLabel);

    // Ensure the tab actually exists in the DOM.
    await expect(tab).toBeVisible();

    const panel = await this.resolvePanelForTab(tab);
    if (!panel) {
      throw new Error(
        `TabListBase.shouldPanelForTabContain(): could not resolve panel for tab "${tabLabel.toString()}".`
      );
    }

    await expect(panel).toContainText(expected);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /**
   * Wait until a specific tab becomes active.
   *
   * Uses Playwright's expect.poll() to repeatedly read the active tab label
   * until it matches the expected string/RegExp or times out.
   */
  async waitUntilTabActive(
    expected: string | RegExp,
    timeout = 10_000
  ): Promise<this> {
    await expect
      .poll(async () => (await this.getActiveTabLabel()) ?? "", { timeout })
      .toMatch(expected); // supports both string and RegExp

    return this;
  }

  /**
   * Wait until the active panel contains specific text.
   */
  async waitUntilActivePanelContains(
    expected: string | RegExp,
    timeout = 10_000
  ): Promise<this> {
    await expect
      .poll(
        async () => {
          const panel = await this.getActivePanel();
          if (!panel) return "";
          return (await panel.textContent()) ?? "";
        },
        { timeout }
      )
      .toMatch(expected);
    return this;
  }
}
