// src/components/bases/data-grid-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { TableBase } from "./table-base";

/**
 * DataGridBase
 * ------------
 * Specialization of TableBase for interactive data grids:
 *
 *  - Sortable column headers (aria-sort or visual sort)
 *  - Row-order assertions (ascending/descending)
 *  - Optional "filter-like" expectations (e.g. all rows match a predicate)
 *
 * Assumptions:
 *  - Data grid is still structurally a table:
 *      - Headers: <th>, <td>, or [role="columnheader"]
 *      - Rows:    <tr> or [role="row"]
 *      - Cells:   <td>, <th>, or [role="cell"]
 *  - Sort is triggered by clicking column headers.
 *  - Sort state is either:
 *      - Exposed via aria-sort on the header cell ("ascending"/"descending"/"none"), OR
 *      - Only reflected in the row order (we can still validate order).
 *
 * Common usage:
 *   const grid = new DataGridBase(
 *     page.getByRole("grid", { name: "Search results" })
 *   );
 *
 *   await grid.sortByColumn("Case", "asc");
 *   await grid.shouldBeSortedBy("Case", { direction: "asc" });
 *
 *   await grid.sortByColumn(/Status/, "desc");
 *   await grid.shouldHaveSortState("Status", "descending");
 */
export class DataGridBase extends TableBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string that points
   * at the data-grid container (table, grid, etc.).
   *
   * @example
   *   const grid = new DataGridBase(page, "table#results");
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator.
   *
   * @example
   *   const grid = new DataGridBase(
   *     page.getByRole("grid", { name: "Search results" })
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
  // Header locators (override-friendly helpers)
  // ───────────────────────────────────────────────────────────────

  /**
   * Locator for header cells.
   *
   * Overriding this in a subclass is an easy way to adapt
   * to different grid implementations if needed.
   */
  protected get headerCellsLocator(): Locator {
    // Mirrors TableBase.headerCells logic
    return this.asLocator().locator(
      "thead tr:first-of-type th, " +
        "thead tr:first-of-type td, " +
        "[role='columnheader']"
    );
  }

  /**
   * Get header cell Locator by resolved column index.
   */
  protected getHeaderCellByIndex(index: number): Locator {
    return this.headerCellsLocator.nth(index);
  }

  // ───────────────────────────────────────────────────────────────
  // Sort state helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Get aria-sort value for a given column:
   *  - "ascending"
   *  - "descending"
   *  - "none" | null (unsorted / not exposed)
   */
  async getSortStateForColumn(
    column: number | string | RegExp
  ): Promise<string | null> {
    const colIndex = await (this as any)["resolveColumnIndex"](column); // reuse TableBase internal helper
    const headerCell = this.getHeaderCellByIndex(colIndex);
    const ariaSort = await headerCell.getAttribute("aria-sort");
    return ariaSort; // may be "ascending", "descending", "none", or null
  }

  /**
   * Click a header cell for the given column.
   *
   * By default this performs a single click. Your grid implementation
   * usually cycles states like: none → asc → desc → none ...
   */
  protected async clickHeader(
    column: number | string | RegExp,
    options?: Parameters<Locator["click"]>[0]
  ): Promise<void> {
    const colIndex = await (this as any)["resolveColumnIndex"](column);
    await this.getHeaderCellByIndex(colIndex).click(options);
  }

  /**
   * Ensure the grid is sorted in the desired direction for the given column.
   *
   * Strategy:
   *  - If aria-sort is present, we click headers until aria-sort matches
   *    the desired direction (with a max number of attempts).
   *  - If aria-sort is missing, we still perform up to 3 header clicks and
   *    rely on external assertions (e.g. shouldBeSortedBy) to validate order.
   *
   * @param direction "asc" or "desc"
   */
  async sortByColumn(
    column: number | string | RegExp,
    direction: "asc" | "desc",
    options?: Parameters<Locator["click"]>[0]
  ): Promise<this> {
    const targetAria = direction === "asc" ? "ascending" : "descending";

    // Try a few times to reach the desired aria-sort state
    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const current = await this.getSortStateForColumn(column);

      if (current === targetAria) {
        return this;
      }

      // Click header to cycle sort state
      await this.clickHeader(column, options);
    }

    // After maxAttempts, we just return; caller can still verify order by data
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Sorting assertions (data-based + aria-based)
  // ───────────────────────────────────────────────────────────────

  /**
   * Assert the grid exposes a particular aria-sort state for the given column.
   *
   * @param expected "ascending" | "descending" | "none" | null
   */
  async shouldHaveSortState(
    column: number | string | RegExp,
    expected: "ascending" | "descending" | "none" | null
  ): Promise<this> {
    await expect
      .poll(async () => await this.getSortStateForColumn(column), {
        timeout: 10_000,
      })
      .toBe(expected);
    return this;
  }

  /**
   * Assert that the grid is sorted by a given column in ascending or descending order.
   *
   * Sorting is based on the current **cell text values** for that column.
   * This is independent of aria-sort and works even if the grid doesn't
   * expose sort state via ARIA.
   *
   * Options:
   *  - numeric: if true, we parse floats and compare numerically.
   */
  async shouldBeSortedBy(
    column: number | string | RegExp,
    options: {
      direction: "asc" | "desc";
      numeric?: boolean;
      /** Optional custom normalizer before comparison (e.g., strip currency). */
      normalize?: (raw: string) => string;
    }
  ): Promise<this> {
    const colIndex = await (this as any)["resolveColumnIndex"](column);
    const rowCount = await this.getRowCount();

    const rawValues: string[] = [];
    for (let row = 0; row < rowCount; row++) {
      const text = await this.getCellText(row, colIndex);
      rawValues.push(text);
    }

    const normalize = options.normalize ?? ((s: string) => s.trim());

    const normalized = rawValues.map(normalize);

    if (options.numeric) {
      const nums = normalized.map((v) => Number(v.replace(/[^0-9.-]/g, "")));
      await this.assertSortedNumeric(nums, options.direction);
    } else {
      await this.assertSortedStrings(normalized, options.direction);
    }

    return this;
  }

  /**
   * Assert that all rows in the grid satisfy a "filter-like" condition
   * for a given column (e.g., Status = "Open").
   *
   * This is **not** performing the filter; it just validates the result.
   */
  async shouldAllRowsMatch(
    column: number | string | RegExp,
    predicate: (value: string) => boolean,
    message?: string
  ): Promise<this> {
    const colIndex = await (this as any)["resolveColumnIndex"](column);
    const rowCount = await this.getRowCount();

    const failures: { rowIndex: number; value: string }[] = [];

    for (let row = 0; row < rowCount; row++) {
      const value = await this.getCellText(row, colIndex);
      if (!predicate(value)) {
        failures.push({ rowIndex: row, value });
      }
    }

    if (failures.length > 0) {
      const details = failures
        .map((f) => `row ${f.rowIndex}: "${f.value}"`)
        .join(", ");
      throw new Error(
        message ??
          `DataGridBase.shouldAllRowsMatch: predicate failed for ${failures.length} row(s): ${details}`
      );
    }

    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Internal helpers for sorting checks
  // ───────────────────────────────────────────────────────────────

  private async assertSortedStrings(
    values: string[],
    direction: "asc" | "desc"
  ): Promise<void> {
    const copy = [...values];
    const sorted = [...values].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );

    if (direction === "desc") {
      sorted.reverse();
    }

    // Use Jest-style expect so you get a nice diff
    expect(copy).toEqual(sorted);
  }

  private async assertSortedNumeric(
    values: number[],
    direction: "asc" | "desc"
  ): Promise<void> {
    const copy = [...values];
    const sorted = [...values].sort((a, b) => a - b);

    if (direction === "desc") {
      sorted.reverse();
    }

    expect(copy).toEqual(sorted);
  }
}
