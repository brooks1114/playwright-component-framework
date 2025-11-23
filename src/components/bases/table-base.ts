// src/components/bases/table-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { ElementBase } from "./element-base";

/**
 * TableBase
 * ---------
 * Chainable base class for tabular data:
 *
 *  - Native HTML <table> with <thead>/<tbody>
 *  - ARIA table/grid with role="table" / role="grid"
 *
 * Assumptions:
 *  - Headers are expressed as:
 *      - <thead> <tr> <th|td>...</th|td> </tr> </thead>
 *        OR
 *      - elements with role="columnheader"
 *  - Body rows are:
 *      - <tbody> <tr>...</tr> </tbody>
 *        OR
 *      - elements with role="row" (for ARIA grid)
 *  - Cells within rows are:
 *      - <td> / <th>
 *      - OR elements with role="cell"
 *
 * Design:
 *  - Extends ElementBase so it inherits:
 *      - visibility, text, viewport, a11y assertions, screenshots, etc.
 *  - Adds table-specific helpers:
 *      - Header & row introspection
 *      - Cell read helpers
 *      - Row lookup by header+cell text
 *      - Row-level action helpers (buttons/links inside a row)
 *
 * Example:
 *   const table = new TableBase(
 *     page.getByRole("table", { name: "Search results" })
 *   );
 *
 *   const headers = await table.getHeaderTexts(); // ["Case", "Type", "Status", "Actions"]
 *
 *   const rowIndex = await table.findRowIndexByCellText(
 *     "Case",
 *     "Matter 0003"
 *   );
 *
 *   await table.clickActionInRow(
 *     "Case",
 *     "Matter 0003",
 *     "Open" // button/link accessible name
 *   );
 *
 *   await table.shouldHaveHeaders(["Case", "Type", "Status", "Actions"]);
 *   await table.shouldHaveRowCount(10);
 */
export class TableBase extends ElementBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors (overloads)
  // ───────────────────────────────────────────────────────────────

  /**
   * Construct from a Page and a selector string that points at the table
   * or grid container.
   *
   * @example
   *   const table = new TableBase(page, "table#results");
   */
  constructor(page: Page, selector: string);

  /**
   * Construct directly from an existing Locator.
   *
   * @example
   *   const table = new TableBase(
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
  // Locators (internal helpers)
  // ───────────────────────────────────────────────────────────────

  /**
   * Locator for header cells.
   *
   * We support both:
   *  - <thead> based headers (th/td)
   *  - ARIA columnheaders (role="columnheader")
   */
  private get headerCells(): Locator {
    return this.locator.locator(
      "thead tr:first-of-type th, " +
        "thead tr:first-of-type td, " +
        "[role='columnheader']"
    );
  }

  /**
   * Locator for body rows.
   *
   * We support both:
   *  - <tbody> <tr>...</tr>
   *  - [role="row"] (for ARIA grids)
   *
   * NOTE: If your markup has multiple rowgroups, you may later enhance this
   * to filter by a specific group.
   */
  private get bodyRows(): Locator {
    return this.locator.locator("tbody tr, [role='row']");
  }

  /**
   * Locator for cells inside a given row.
   *
   * We support:
   *  - <td> / <th>
   *  - [role="cell"]
   */
  private cellsInRow(rowIndex: number): Locator {
    return this.bodyRows.nth(rowIndex).locator("th, td, [role='cell']"); // ordered as in DOM
  }

  // ───────────────────────────────────────────────────────────────
  // Header & shape helpers
  // ───────────────────────────────────────────────────────────────

  /** Get header texts from the first header row. */
  async getHeaderTexts(): Promise<string[]> {
    const texts = await this.headerCells.allTextContents();
    return texts.map((t) => t.trim());
  }

  /** Get number of header columns. */
  async getColumnCount(): Promise<number> {
    return await this.headerCells.count();
  }

  /** Get number of body rows. */
  async getRowCount(): Promise<number> {
    return await this.bodyRows.count();
  }

  /**
   * Find the column index by header text or pattern.
   *
   * @returns 0-based column index, or -1 if not found.
   */
  async findColumnIndexByHeader(header: string | RegExp): Promise<number> {
    const headers = await this.getHeaderTexts();

    for (let i = 0; i < headers.length; i++) {
      const text = headers[i];
      if (header instanceof RegExp) {
        if (header.test(text)) return i;
      } else {
        if (text === header) return i;
      }
    }

    return -1;
  }

  // ───────────────────────────────────────────────────────────────
  // Cell access helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Get a Locator for a specific cell [rowIndex, colIndex].
   *
   * @param rowIndex 0-based row index (body rows only).
   * @param colIndex 0-based column index within the row.
   */
  getCellLocator(rowIndex: number, colIndex: number): Locator {
    return this.cellsInRow(rowIndex).nth(colIndex);
  }

  /**
   * Get text from a specific cell [rowIndex, colIndex].
   */
  async getCellText(rowIndex: number, colIndex: number): Promise<string> {
    const cell = this.getCellLocator(rowIndex, colIndex);
    return (await cell.textContent())?.trim() ?? "";
  }

  /**
   * Get all cell texts for a given row.
   */
  async getRowTexts(rowIndex: number): Promise<string[]> {
    const cells = this.cellsInRow(rowIndex);
    const texts = await cells.allTextContents();
    return texts.map((t) => t.trim());
  }

  // ───────────────────────────────────────────────────────────────
  // Row lookup helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Resolve a column identifier to its index.
   *
   * - If `column` is a number, it is returned as-is.
   * - If `column` is text/RegExp, we look up by header text.
   *
   * Throws a clear error if the header cannot be found.
   */
  private async resolveColumnIndex(
    column: number | string | RegExp
  ): Promise<number> {
    if (typeof column === "number") {
      return column;
    }

    const index = await this.findColumnIndexByHeader(column);
    if (index === -1) {
      const headers = await this.getHeaderTexts();
      throw new Error(
        `TableBase: Could not find column with header ${String(
          column
        )}. Available headers: [${headers.join(", ")}]`
      );
    }
    return index;
  }

  /**
   * Find the first row index where the specified column's cell
   * text matches the given value or pattern.
   *
   * @param column Column index or header text/RegExp.
   * @param value  Exact string or RegExp to match in that column.
   * @returns 0-based row index, or -1 if not found.
   */
  async findRowIndexByCellText(
    column: number | string | RegExp,
    value: string | RegExp
  ): Promise<number> {
    const colIndex = await this.resolveColumnIndex(column);
    const rowCount = await this.getRowCount();

    for (let row = 0; row < rowCount; row++) {
      const cellText = await this.getCellText(row, colIndex);

      if (value instanceof RegExp) {
        if (value.test(cellText)) return row;
      } else {
        if (cellText === value) return row;
      }
    }

    return -1;
  }

  /**
   * Get the Locator for the first row where [column, value]
   * matches. Throws if not found.
   */
  async getRowLocatorByCellText(
    column: number | string | RegExp,
    value: string | RegExp
  ): Promise<Locator> {
    const rowIndex = await this.findRowIndexByCellText(column, value);
    if (rowIndex === -1) {
      throw new Error(
        `TableBase: No row found where column ${String(
          column
        )} matches ${String(value)}`
      );
    }
    return this.bodyRows.nth(rowIndex);
  }

  // ───────────────────────────────────────────────────────────────
  // Row-level actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Click a specific cell.
   */
  async clickCell(
    rowIndex: number,
    colIndex: number,
    options?: Parameters<Locator["click"]>[0]
  ): Promise<this> {
    await this.getCellLocator(rowIndex, colIndex).click(options);
    return this;
  }

  /**
   * Click a button inside a row matched by column header + cell text.
   *
   * Common pattern: an Actions column with "Open", "Edit", "Delete" buttons.
   *
   * @param column       Column index or header to use for row lookup.
   * @param value        Cell value to identify the row (string or RegExp).
   * @param actionName   Accessible name of the button/link to click.
   * @param options      Click options.
   */
  async clickActionInRow(
    column: number | string | RegExp,
    value: string | RegExp,
    actionName: string | RegExp,
    options?: Parameters<Locator["click"]>[0]
  ): Promise<this> {
    const row = await this.getRowLocatorByCellText(column, value);
    const action = row.getByRole("button", { name: actionName });
    await action.click(options);
    return this;
  }

  /**
   * Click a link inside a row matched by column header + cell text.
   */
  async clickLinkInRow(
    column: number | string | RegExp,
    value: string | RegExp,
    linkName: string | RegExp,
    options?: Parameters<Locator["click"]>[0]
  ): Promise<this> {
    const row = await this.getRowLocatorByCellText(column, value);
    const link = row.getByRole("link", { name: linkName });
    await link.click(options);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Assertions (table-specific)
  // ───────────────────────────────────────────────────────────────

  /** Assert header texts exactly match the expected list (in order). */
  async shouldHaveHeaders(expected: readonly string[]): Promise<this> {
    await expect(this.headerCells).toHaveText(expected as string[]);
    return this;
  }

  /** Assert table has a specific row count. */
  async shouldHaveRowCount(expected: number): Promise<this> {
    await expect.poll(async () => await this.getRowCount()).toBe(expected);
    return this;
  }

  /**
   * Assert table has at least `min` rows.
   */
  async shouldHaveAtLeastRows(min: number): Promise<this> {
    await expect
      .poll(async () => await this.getRowCount())
      .toBeGreaterThanOrEqual(min);
    return this;
  }

  /**
   * Assert that there exists a row where [column, value] matches.
   */
  async shouldContainRowWhere(
    column: number | string | RegExp,
    value: string | RegExp
  ): Promise<this> {
    const index = await this.findRowIndexByCellText(column, value);
    expect(index).not.toBe(-1);
    return this;
  }

  /**
   * Assert that a specific cell [rowIndex, colIndex] has the expected text.
   */
  async shouldHaveCellText(
    rowIndex: number,
    colIndex: number,
    expected: string | RegExp
  ): Promise<this> {
    const cell = this.getCellLocator(rowIndex, colIndex);
    await expect(cell).toHaveText(expected);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters (for dynamic tables)
  // ───────────────────────────────────────────────────────────────

  /** Wait until row count equals the expected number. */
  async waitUntilRowCount(expected: number, timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.getRowCount(), { timeout })
      .toBe(expected);
    return this;
  }

  /** Wait until row count is at least `min`. */
  async waitUntilRowCountAtLeast(min: number, timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.getRowCount(), { timeout })
      .toBeGreaterThanOrEqual(min);
    return this;
  }

  /**
   * Wait until a row where [column, value] matches appears.
   */
  async waitForRowWhere(
    column: number | string | RegExp,
    value: string | RegExp,
    timeout = 10_000
  ): Promise<this> {
    await expect
      .poll(async () => await this.findRowIndexByCellText(column, value), {
        timeout,
      })
      .not.toBe(-1);
    return this;
  }
}
