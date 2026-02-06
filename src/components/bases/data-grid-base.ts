// src/components/bases/data-grid-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { TableBase } from "./table-base";

/**
 * DataGridBase
 * ------------
 * Specialized base class for **interactive data grids** (e.g. Material-UI DataGrid, AG-Grid, custom React tables).
 * Extends `TableBase` with support for sorting, sort state verification, and row content validation.
 *
 * Key features:
 * - Clicking column headers to sort
 * - Reading `aria-sort` state (if exposed)
 * - Validating sort order via **cell text content** (works even without ARIA)
 * - Numeric/string sorting detection
 * - "Filter result" validation (all rows match a condition)
 *
 * Assumptions:
 * - Grid uses `<table>`, `role="grid"`, or similar structure
 * - Headers are `<th>`, `<td>`, or `[role="columnheader"]`
 * - Sorting is triggered by clicking headers
 * - Sort state may be in `aria-sort` **or** only visible in row order
 *
 * @extends TableBase
 *
 * @example
 * // Using ComponentFactory (recommended)
 * const $ = new ComponentFactory(page);
 * const resultsGrid = $.dataGridByRole("Search results");
 *
 * await resultsGrid
 *   .sortByColumn("Date", "desc")
 *   .shouldBeSortedBy("Date", { direction: "desc", numeric: false });
 *
 * @example
 * // Direct locator construction
 * const grid = new DataGridBase(
 *   page.getByRole("grid", { name: "Patient Records" })
 * );
 * await grid.sortByColumn(/Status/, "asc");
 */
export class DataGridBase extends TableBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a DataGridBase from a Page and selector string pointing to the grid container.
   *
   * @param page - Playwright Page instance
   * @param selector - CSS/XPath selector for the grid (e.g. "table#results", "[role='grid']")
   *
   * @example
   * const grid = new DataGridBase(page, "div[data-testid='user-grid'] > table");
   */
  constructor(page: Page, selector: string);

  /**
   * Creates a DataGridBase directly from a pre-resolved Locator.
   *
   * @param locator - Locator targeting the grid container
   *
   * @example
   * const grid = new DataGridBase(page.getByRole("grid", { name: /Invoices/ }));
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
  // Header Locators (override-friendly)
  // ───────────────────────────────────────────────────────────────

  /**
   * Returns the locator for all header cells in the grid.
   * Can be overridden in subclasses for non-standard grid implementations.
   *
   * @returns Locator targeting header cells
   */
  protected get headerCellsLocator(): Locator {
    return this.asLocator().locator(
      "thead tr:first-of-type th, " +
        "thead tr:first-of-type td, " +
        "[role='columnheader']",
    );
  }

  /**
   * Gets the locator for a specific header cell by its 0-based index.
   *
   * @param index - Column index (0-based)
   * @returns Locator for the header cell
   */
  protected getHeaderCellByIndex(index: number): Locator {
    return this.headerCellsLocator.nth(index);
  }

  // ───────────────────────────────────────────────────────────────
  // Sort Interaction & State
  // ───────────────────────────────────────────────────────────────

  /**
   * Retrieves the current `aria-sort` value for the specified column.
   *
   * @param column - Column identifier: index (number), header text (string), or RegExp
   * @returns `"ascending"`, `"descending"`, `"none"`, or `null` if not present
   *
   * @remarks Returns `null` if ARIA sort is not used by the grid.
   */
  async getSortStateForColumn(
    column: number | string | RegExp,
  ): Promise<string | null> {
    // Leverage TableBase's internal resolveColumnIndex (assumed protected method)
    const colIndex = await (this as any).resolveColumnIndex(column);
    const headerCell = this.getHeaderCellByIndex(colIndex);
    return await headerCell.getAttribute("aria-sort");
  }

  /**
   * Clicks the header cell of the specified column to trigger sorting.
   * Protected method — used internally by `sortByColumn`.
   *
   * @param column - Column identifier
   * @param options - Click options (force, timeout, etc.)
   */
  protected async clickHeader(
    column: number | string | RegExp,
    options?: Parameters<Locator["click"]>[0],
  ): Promise<void> {
    const colIndex = await (this as any).resolveColumnIndex(column);
    await this.getHeaderCellByIndex(colIndex).click(options);
  }

  /**
   * Clicks the column header (up to 3 times) until the desired sort direction is reached.
   *
   * @param column - Column to sort by (index, exact text, or RegExp)
   * @param direction - Target sort direction
   * @param options - Click options
   * @returns This instance (for chaining)
   *
   * @remarks
   * - If `aria-sort` is present, stops when it matches the target.
   * - If no `aria-sort`, performs up to 3 clicks and relies on `shouldBeSortedBy` for validation.
   * - Many grids cycle: none → asc → desc → none
   */
  async sortByColumn(
    column: number | string | RegExp,
    direction: "asc" | "desc",
    options?: Parameters<Locator["click"]>[0],
  ): Promise<this> {
    const targetAria = direction === "asc" ? "ascending" : "descending";
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const current = await this.getSortStateForColumn(column);

      if (current === targetAria) {
        return this;
      }

      await this.clickHeader(column, options);
    }

    // If aria-sort not present or not matching after attempts, return anyway
    // Caller should follow with shouldBeSortedBy() for data-level check
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions – Sort State & Order
  // ───────────────────────────────────────────────────────────────

  /**
   * Asserts that the column header has the expected `aria-sort` value.
   *
   * @param column - Column identifier
   * @param expected - Expected aria-sort value ("ascending" | "descending" | "none" | null)
   * @returns This instance (for chaining)
   *
   * @example
   * await grid.shouldHaveSortState("Name", "ascending");
   */
  async shouldHaveSortState(
    column: number | string | RegExp,
    expected: "ascending" | "descending" | "none" | null,
  ): Promise<this> {
    await expect
      .poll(async () => await this.getSortStateForColumn(column), {
        message: `Expected aria-sort to be "${expected}" for column ${String(column)}`,
        timeout: 10_000,
      })
      .toBe(expected);

    return this;
  }

  /**
   * Asserts that rows are sorted by the given column in the specified direction.
   * Validates based on **actual cell text content** — works even without `aria-sort`.
   *
   * @param column - Column to check
   * @param options - Sort validation options
   * @param options.direction - "asc" or "desc"
   * @param options.numeric - Treat values as numbers (default: false)
   * @param options.normalize - Optional function to clean values before comparison
   * @returns This instance (for chaining)
   *
   * @example
   * await grid.shouldBeSortedBy("Price", {
   *   direction: "desc",
   *   numeric: true,
   *   normalize: (v) => v.replace("$", "")
   * });
   */
  async shouldBeSortedBy(
    column: number | string | RegExp,
    options: {
      direction: "asc" | "desc";
      numeric?: boolean;
      normalize?: (raw: string) => string;
    },
  ): Promise<this> {
    const colIndex = await (this as any).resolveColumnIndex(column);
    const rowCount = await this.getRowCount();

    const rawValues: string[] = [];
    for (let row = 0; row < rowCount; row++) {
      const text = await this.getCellText(row, colIndex);
      rawValues.push(text);
    }

    const normalize = options.normalize ?? ((s: string) => s.trim());
    const normalized = rawValues.map(normalize);

    if (options.numeric) {
      const nums = normalized.map((v) => {
        const cleaned = v.replace(/[^0-9.-]/g, "");
        return cleaned ? Number(cleaned) : NaN;
      });
      await this.assertSortedNumeric(nums, options.direction);
    } else {
      await this.assertSortedStrings(normalized, options.direction);
    }

    return this;
  }

  /**
   * Asserts that **every row** in the specified column satisfies the given predicate.
   * Useful for validating filter results, search results, etc.
   *
   * @param column - Column to check
   * @param predicate - Function that returns true if value is valid
   * @param message - Optional custom error message
   * @returns This instance (for chaining)
   *
   * @example
   * await grid.shouldAllRowsMatch("Status", (v) => v === "Active");
   */
  async shouldAllRowsMatch(
    column: number | string | RegExp,
    predicate: (value: string) => boolean,
    message?: string,
  ): Promise<this> {
    const colIndex = await (this as any).resolveColumnIndex(column);
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
          `shouldAllRowsMatch failed for ${failures.length} rows in column ${String(column)}: ${details}`,
      );
    }

    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Internal Sorting Assertion Helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Internal: Asserts string array is sorted (ascending or descending).
   * Uses localeCompare with numeric sorting support.
   */
  private async assertSortedStrings(
    values: string[],
    direction: "asc" | "desc",
  ): Promise<void> {
    const copy = [...values];
    const sorted = [...values].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    );

    if (direction === "desc") {
      sorted.reverse();
    }

    expect(copy).toEqual(sorted);
  }

  /**
   * Internal: Asserts numeric array is sorted (ascending or descending).
   */
  private async assertSortedNumeric(
    values: number[],
    direction: "asc" | "desc",
  ): Promise<void> {
    const copy = [...values];
    const sorted = [...values].sort((a, b) => a - b);

    if (direction === "desc") {
      sorted.reverse();
    }

    expect(copy).toEqual(sorted);
  }
}
