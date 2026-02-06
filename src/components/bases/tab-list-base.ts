// src/components/bases/tab-list-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { ElementBase } from "./element-base";

/**
 * TabListBase
 * -----------
 * Chainable base class for ARIA-compliant tabbed interfaces (role="tablist").
 *
 * Follows the WAI-ARIA Tab Pattern:
 *   <div role="tablist" aria-label="Content sections">
 *     <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">Tab 1</button>
 *     <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">Tab 2</button>
 *   </div>
 *   <div id="panel-1" role="tabpanel" aria-labelledby="tab-1">...</div>
 *   <div id="panel-2" role="tabpanel" aria-labelledby="tab-2" hidden>...</div>
 *
 * Responsibilities:
 *   - Tab discovery, selection, and keyboard navigation
 *   - Active tab & panel resolution via ARIA attributes
 *   - Assertions on tab labels, active state, panel content
 *   - Waiters for tab activation and panel updates
 *
 * Construction:
 *   - Selector-based: `new TabListBase(page, '[role="tablist"]')`
 *   - Locator-based: `new TabListBase(page.getByRole("tablist", { name: "Matter tabs" }))`
 *
 * Recommended usage with ComponentFactory:
 *   ```ts
 *   const $ = new ComponentFactory(page);
 *   const tabs = $.tabListByRoleName("Matter tabs");
 *
 *   await tabs
 *     .shouldBeVisible()
 *     .shouldHaveTabs(["Details", "History", "Attachments"])
 *     .selectTabByLabel("History")
 *     .shouldHaveActiveTab("History")
 *     .shouldActivePanelContain("No history available");
 *   ```
 */
export class TabListBase extends ElementBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string pointing to the tablist container.
   *
   * @param page - Playwright Page instance
   * @param selector - CSS/XPath selector for the tablist
   * @example
   *   const tabs = new TabListBase(page, '[role="tablist"][aria-label="Settings"]');
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from a Locator pointing to the tablist (preferred).
   *
   * @param locator - Pre-resolved Locator for the tablist
   * @example
   *   const tabs = new TabListBase(page.getByRole("tablist", { name: "Matter tabs" }));
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
  // Core Locators
  // ───────────────────────────────────────────────────────────────

  /**
   * Locator for all tab elements within this tablist.
   */
  protected get tabsLocator(): Locator {
    return this.locator.getByRole("tab");
  }

  /**
   * Root-level locator used to find tab panels (often outside the tablist).
   */
  protected get pageRoot(): Locator {
    return this.locator.page().locator("body");
  }

  // ───────────────────────────────────────────────────────────────
  // Tab Discovery
  // ───────────────────────────────────────────────────────────────

  /**
   * Returns the number of tabs in this tablist.
   *
   * @returns Number of tabs
   */
  async getTabCount(): Promise<number> {
    return await this.tabsLocator.count();
  }

  /**
   * Returns all tab labels in order (trimmed).
   *
   * @returns Array of tab text labels
   * @example
   *   const labels = await tabs.getTabLabels();
   *   expect(labels).toContain("Overview");
   */
  async getTabLabels(): Promise<string[]> {
    const contents = await this.tabsLocator.allTextContents();
    return contents.map((t) => t?.trim() ?? "");
  }

  /**
   * Locates a tab by its visible/accessible name.
   *
   * @param label - Exact or RegExp label to match
   * @returns Locator for the matching tab
   */
  protected locateTabByLabel(label: string | RegExp): Locator {
    return this.tabsLocator.filter({
      has: this.locator.page().getByText(label, { exact: true }),
    });
  }

  /**
   * Returns the Locator for the tab at the given 0-based index.
   *
   * @param index - 0-based tab position
   * @returns Locator for the nth tab
   */
  protected getTabByIndex(index: number): Locator {
    return this.tabsLocator.nth(index);
  }

  /**
   * Finds the currently active tab using multiple heuristics.
   *
   * Checks in order:
   * 1. aria-selected="true"
   * 2. data-state="active" | "selected" | "current"
   * 3. aria-current="page" | "true"
   *
   * @returns Active tab Locator or null if none found
   */
  async getActiveTab(): Promise<Locator | null> {
    const count = await this.tabsLocator.count();
    for (let i = 0; i < count; i++) {
      const tab = this.tabsLocator.nth(i);

      const ariaSelected = await tab.getAttribute("aria-selected");
      if (ariaSelected?.toLowerCase() === "true") return tab;

      const dataState = await tab.getAttribute("data-state");
      if (
        ["active", "selected", "current"].includes(
          dataState?.toLowerCase() ?? "",
        )
      )
        return tab;

      const ariaCurrent = await tab.getAttribute("aria-current");
      if (["page", "true", "step"].includes(ariaCurrent?.toLowerCase() ?? ""))
        return tab;
    }
    return null;
  }

  /**
   * Returns the text label of the currently active tab.
   *
   * @returns Active tab label or null
   */
  async getActiveTabLabel(): Promise<string | null> {
    const active = await this.getActiveTab();
    if (!active) return null;
    return (await active.textContent())?.trim() ?? null;
  }

  // ───────────────────────────────────────────────────────────────
  // Panel Resolution
  // ───────────────────────────────────────────────────────────────

  /**
   * Resolves the tabpanel associated with a given tab using ARIA wiring.
   *
   * Strategies (in order):
   * 1. aria-controls attribute on tab → #id
   * 2. [role="tabpanel"][aria-labelledby="{tab.id}"]
   *
   * @param tab - Locator of a tab
   * @returns Associated panel Locator or null
   */
  protected async resolvePanelForTab(tab: Locator): Promise<Locator | null> {
    const controls = await tab.getAttribute("aria-controls");
    if (controls) {
      const panel = this.pageRoot.locator(`#${controls}`);
      if ((await panel.count()) > 0) return panel.first();
    }

    const tabId = await tab.getAttribute("id");
    if (tabId) {
      const panel = this.pageRoot.locator(
        `[role="tabpanel"][aria-labelledby="${tabId}"]`,
      );
      if ((await panel.count()) > 0) return panel.first();
    }

    return null;
  }

  /**
   * Resolves the currently active tabpanel.
   *
   * @returns Active panel Locator or null
   */
  async getActivePanel(): Promise<Locator | null> {
    const activeTab = await this.getActiveTab();
    if (!activeTab) return null;
    return this.resolvePanelForTab(activeTab);
  }

  // ───────────────────────────────────────────────────────────────
  // Selection Actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Selects a tab by clicking its label/name.
   *
   * @param label - Tab label (string or RegExp)
   * @param options - Click options
   * @returns this (chainable)
   */
  async selectTabByLabel(
    label: string | RegExp,
    options?: Parameters<Locator["click"]>[0],
  ): Promise<this> {
    const tab = this.locateTabByLabel(label);
    await tab.click(options);
    return this;
  }

  /**
   * Selects a tab by its 0-based index.
   *
   * @param index - Tab position
   * @param options - Click options
   * @returns this (chainable)
   */
  async selectTabByIndex(
    index: number,
    options?: Parameters<Locator["click"]>[0],
  ): Promise<this> {
    await this.getTabByIndex(index).click(options);
    return this;
  }

  /**
   * Selects the next tab using keyboard navigation (ArrowRight).
   *
   * @returns this (chainable)
   */
  async selectNextTab(): Promise<this> {
    return this.navigateWithKey("ArrowRight");
  }

  /**
   * Selects the previous tab using keyboard navigation (ArrowLeft).
   *
   * @returns this (chainable)
   */
  async selectPreviousTab(): Promise<this> {
    return this.navigateWithKey("ArrowLeft");
  }

  /**
   * Selects the first tab (Home key simulation).
   *
   * @returns this (chainable)
   */
  async selectFirstTab(): Promise<this> {
    return this.navigateWithKey("Home");
  }

  /**
   * Selects the last tab (End key simulation).
   *
   * @returns this (chainable)
   */
  async selectLastTab(): Promise<this> {
    return this.navigateWithKey("End");
  }

  /**
   * Focuses a tab (or the active/first one) and presses a key.
   *
   * @param key - Keyboard key (ArrowRight, ArrowLeft, Home, End, etc.)
   * @param options - Press options
   * @returns this (chainable)
   */
  async navigateWithKey(
    key: string,
    options?: Parameters<Locator["press"]>[1],
  ): Promise<this> {
    let tab = await this.getActiveTab();
    if (!tab) tab = this.getTabByIndex(0);

    await tab.focus();
    await tab.press(key, options);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions
  // ───────────────────────────────────────────────────────────────

  /**
   * Asserts the tablist has exactly the expected tab labels (in order).
   *
   * @param expectedLabels - Ordered array of tab labels
   * @returns this (chainable)
   */
  async shouldHaveTabs(expectedLabels: readonly string[]): Promise<this> {
    const actual = await this.getTabLabels();
    await expect(actual).toEqual(expectedLabels);
    return this;
  }

  /**
   * Asserts that the tablist contains at least these labels (order-insensitive).
   *
   * @param expectedLabels - Labels that must be present
   * @returns this (chainable)
   */
  async shouldContainTabs(expectedLabels: readonly string[]): Promise<this> {
    const actual = await this.getTabLabels();
    for (const label of expectedLabels) {
      expect(actual).toContain(label);
    }
    return this;
  }

  /**
   * Asserts a specific tab is currently active.
   *
   * @param expected - Expected active tab label
   * @returns this (chainable)
   */
  async shouldHaveActiveTab(expected: string | RegExp): Promise<this> {
    const actual = await this.getActiveTabLabel();
    if (actual === null) {
      throw new Error(`No active tab found. Expected: ${expected.toString()}`);
    }
    if (expected instanceof RegExp) {
      expect(actual).toMatch(expected);
    } else {
      expect(actual).toBe(expected);
    }
    return this;
  }

  /**
   * Asserts that there is an active tab present.
   *
   * @returns this (chainable)
   */
  async shouldHaveAnyActiveTab(): Promise<this> {
    const active = await this.getActiveTab();
    expect(active).not.toBeNull();
    return this;
  }

  /**
   * Asserts the active panel contains the expected text/pattern.
   *
   * @param expected - Text or RegExp to find in active panel
   * @returns this (chainable)
   */
  async shouldActivePanelContain(expected: string | RegExp): Promise<this> {
    const panel = await this.getActivePanel();
    if (!panel) {
      throw new Error(
        "Cannot resolve active panel. Ensure proper ARIA tab ↔ tabpanel wiring.",
      );
    }
    await expect(panel).toContainText(expected);
    return this;
  }

  /**
   * Asserts that the panel for a specific tab (not necessarily active) contains text.
   *
   * @param tabLabel - Tab label to locate
   * @param expected - Expected content in its panel
   * @returns this (chainable)
   */
  async shouldPanelForTabContain(
    tabLabel: string | RegExp,
    expected: string | RegExp,
  ): Promise<this> {
    const tab = this.locateTabByLabel(tabLabel);
    await expect(tab).toBeVisible();

    const panel = await this.resolvePanelForTab(tab);
    if (!panel) {
      throw new Error(`No panel found for tab: ${tabLabel.toString()}`);
    }

    await expect(panel).toContainText(expected);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters
  // ───────────────────────────────────────────────────────────────

  /**
   * Waits until a specific tab becomes the active one.
   *
   * @param expected - Label that should become active
   * @param timeout - Max wait time (ms)
   * @returns this (chainable)
   */
  async waitUntilTabActive(
    expected: string | RegExp,
    timeout = 10_000,
  ): Promise<this> {
    await expect
      .poll(async () => (await this.getActiveTabLabel()) ?? "", { timeout })
      .toMatch(expected);
    return this;
  }

  /**
   * Waits until the active panel contains the expected text.
   *
   * @param expected - Text or RegExp
   * @param timeout - Max wait time (ms)
   * @returns this (chainable)
   */
  async waitUntilActivePanelContains(
    expected: string | RegExp,
    timeout = 10_000,
  ): Promise<this> {
    await expect
      .poll(
        async () => {
          const panel = await this.getActivePanel();
          return panel ? ((await panel.textContent())?.trim() ?? "") : "";
        },
        { timeout },
      )
      .toMatch(expected);
    return this;
  }
}
