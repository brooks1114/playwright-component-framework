// src/components/bases/table-base.ts
import { Page, Locator, expect } from "@playwright/test";
import { ElementBase } from "./element-base";

/**
 * TableBase
 * ---------
 * Chainable base class for **HTML tables** and **ARIA grids/tables** in React applications.
 *
 * Supports:
 * - Native `<table>` with `<thead>`, `<tbody>`, `<th>`, `<td>`
 * - ARIA patterns: `role="table"`, `role="grid"`, `role="row"`, `role="columnheader"`, `role="cell"`
 *
 * Extends `ElementBase`, so inherits:
 * - visibility, enabled, text, attribute, screenshot, accessibility assertions, etc.
 *
 * Main capabilities:
 * - Header & row introspection
 * - Cell text extraction (single cell, row, entire table)
 * - Row lookup by column header + cell content
 * - Actions inside rows (click buttons/links)
 * - Assertions & waiters for shape, content, and count
 *
 * @extends ElementBase
 *
 * @example
 * // Recommended: via ComponentFactory
 * const $ = new ComponentFactory(page);
 * const resultsTable = $.tableByRole("User list");
 *
 * await resultsTable
 *   .shouldHaveHeaders(["ID", "Name", "Email", "Status"])
 *   .shouldHaveRowCount(15)
 *   .clickActionInRow("Name", "John Doe", "Edit");
 *
 * @example
 * // Direct construction
 * const invoices = new TableBase(
 *   page.getByRole("table", { name: /Pending Invoices/ })
 * );
 * const headers = await invoices.getHeaderTexts();
 */
export class TableBase extends ElementBase {
  // ───────────────────────────────────────────────────────────────
  // Constructors
  // ───────────────────────────────────────────────────────────────

  /**
   * Creates a TableBase from a Page and selector string targeting the table/grid container.
   *
   * @param page - Playwright Page instance
   * @param selector - CSS/XPath selector (e.g. "table#data", "[role='grid']")
   */
  constructor(page: Page, selector: string);

  /**
   * Creates a TableBase directly from a pre-resolved Locator.
   *
   * @param locator - Locator pointing to the table or grid element
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
  // Internal Locators (override-friendly)
  // ───────────────────────────────────────────────────────────────

  /**
   * Locator for all header cells (th, td in thead, or role="columnheader").
   * Override in subclasses if your grid uses different structure.
   */
  protected get headerCells(): Locator {
    return this.locator.locator(
      "thead tr:first-of-type th, " +
        "thead tr:first-of-type td, " +
        "[role='columnheader']",
    );
  }

  /**
   * Locator for all body rows (tr in tbody or role="row").
   * Does not include header rows.
   */
  protected get bodyRows(): Locator {
    return this.locator.locator(
      "tbody tr, [role='row']:not([role='columnheader'])",
    );
  }

  /**
   * Locator for all cells within a specific body row.
   *
   * @param rowIndex - 0-based index among body rows
   */
  protected cellsInRow(rowIndex: number): Locator {
    return this.bodyRows.nth(rowIndex).locator("td, th, [role='cell']");
  }

  // ───────────────────────────────────────────────────────────────
  // Shape & Header Helpers
  // ───────────────────────────────────────────────────────────────

  /**
   * Returns the text content of all header cells (trimmed).
   *
   * @returns Array of header labels in DOM order
   */
  async getHeaderTexts(): Promise<string[]> {
    const texts = await this.headerCells.allTextContents();
    return texts.map((t) => (t ?? "").trim());
  }

  /**
   * Returns the number of columns (based on header cells count).
   */
  async getColumnCount(): Promise<number> {
    return await this.headerCells.count();
  }

  /**
   * Returns the current number of body rows.
   */
  async getRowCount(): Promise<number> {
    return await this.bodyRows.count();
  }

  /**
   * Finds the 0-based column index for a header label or pattern.
   *
   * @param header - Exact string or RegExp to match header text
   * @returns 0-based index, or -1 if not found
   */
  async findColumnIndexByHeader(header: string | RegExp): Promise<number> {
    const headers = await this.getHeaderTexts();

    for (let i = 0; i < headers.length; i++) {
      const text = headers[i];
      if (header instanceof RegExp) {
        if (header.test(text)) return i;
      } else if (text === header) {
        return i;
      }
    }
    return -1;
  }

  // ───────────────────────────────────────────────────────────────
  // Cell & Row Access
  // ───────────────────────────────────────────────────────────────

  /**
   * Returns a Locator for a specific cell at [rowIndex, colIndex].
   *
   * @param rowIndex - 0-based body row index
   * @param colIndex - 0-based column index
   */
  getCellLocator(rowIndex: number, colIndex: number): Locator {
    return this.cellsInRow(rowIndex).nth(colIndex);
  }

  /**
   * Returns the trimmed text content of a specific cell.
   *
   * @param rowIndex - 0-based body row index
   * @param colIndex - 0-based column index
   */
  async getCellText(rowIndex: number, colIndex: number): Promise<string> {
    const cell = this.getCellLocator(rowIndex, colIndex);
    return (await cell.textContent())?.trim() ?? "";
  }

  /**
   * Returns all cell texts in a row as an array.
   *
   * @param rowIndex - 0-based body row index
   */
  async getRowTexts(rowIndex: number): Promise<string[]> {
    const cells = this.cellsInRow(rowIndex);
    const texts = await cells.allTextContents();
    return texts.map((t) => (t ?? "").trim());
  }

  /**
   * Returns the entire table body as a 2D array of strings.
   * Useful for snapshot comparison or advanced assertions.
   */
  async getAllRowTexts(): Promise<string[][]> {
    const rowCount = await this.getRowCount();
    const result: string[][] = [];

    for (let i = 0; i < rowCount; i++) {
      result.push(await this.getRowTexts(i));
    }

    return result;
  }

  // ───────────────────────────────────────────────────────────────
  // Column & Row Resolution
  // ───────────────────────────────────────────────────────────────

  /**
   * Converts column identifier (index, header text, or RegExp) to 0-based index.
   * Throws descriptive error if header not found.
   *
   * @internal
   */
  protected async resolveColumnIndex(
    column: number | string | RegExp,
  ): Promise<number> {
    if (typeof column === "number") {
      const colCount = await this.getColumnCount();
      if (column < 0 || column >= colCount) {
        throw new Error(
          `Column index ${column} out of bounds (0-${colCount - 1})`,
        );
      }
      return column;
    }

    const index = await this.findColumnIndexByHeader(column);
    if (index === -1) {
      const headers = await this.getHeaderTexts();
      throw new Error(
        `Could not find column "${String(column)}". ` +
          `Available headers: [${headers.map((h) => `"${h}"`).join(", ")}]`,
      );
    }
    return index;
  }

  /**
   * Finds the first body row index where the cell in `column` matches `value`.
   *
   * @returns 0-based row index or -1 if not found
   */
  async findRowIndexByCellText(
    column: number | string | RegExp,
    value: string | RegExp,
  ): Promise<number> {
    const colIndex = await this.resolveColumnIndex(column);
    const rowCount = await this.getRowCount();

    for (let row = 0; row < rowCount; row++) {
      const cellText = await this.getCellText(row, colIndex);
      if (value instanceof RegExp) {
        if (value.test(cellText)) return row;
      } else if (cellText === value) {
        return row;
      }
    }
    return -1;
  }

  /**
   * Returns Locator for the first row matching the column + value condition.
   * Throws if no matching row is found.
   */
  async getRowLocatorByCellText(
    column: number | string | RegExp,
    value: string | RegExp,
  ): Promise<Locator> {
    const rowIndex = await this.findRowIndexByCellText(column, value);
    if (rowIndex === -1) {
      throw new Error(
        `No row found where column ${String(column)} = ${String(value)}`,
      );
    }
    return this.bodyRows.nth(rowIndex);
  }

  // ───────────────────────────────────────────────────────────────
  // Row Actions
  // ───────────────────────────────────────────────────────────────

  /**
   * Clicks a specific cell in the table.
   *
   * @param rowIndex - 0-based body row index
   * @param colIndex - 0-based column index
   * @param options - Click options
   */
  async clickCell(
    rowIndex: number,
    colIndex: number,
    options?: Parameters<Locator["click"]>[0],
  ): Promise<this> {
    await this.getCellLocator(rowIndex, colIndex).click(options);
    return this;
  }

  /**
   * Clicks a button inside the row identified by column + value.
   * Commonly used for action columns ("View", "Edit", "Delete", etc.).
   */
  async clickActionInRow(
    column: number | string | RegExp,
    value: string | RegExp,
    actionName: string | RegExp,
    options?: Parameters<Locator["click"]>[0],
  ): Promise<this> {
    const row = await this.getRowLocatorByCellText(column, value);
    const button = row.getByRole("button", {
      name: actionName,
      exact: typeof actionName === "string",
    });
    await button.click(options);
    return this;
  }

  /**
   * Clicks a link inside the row identified by column + value.
   */
  async clickLinkInRow(
    column: number | string | RegExp,
    value: string | RegExp,
    linkName: string | RegExp,
    options?: Parameters<Locator["click"]>[0],
  ): Promise<this> {
    const row = await this.getRowLocatorByCellText(column, value);
    const link = row.getByRole("link", {
      name: linkName,
      exact: typeof linkName === "string",
    });
    await link.click(options);
    return this;
  }

  /**
   * Hovers over a specific cell (useful for revealing tooltips, dropdowns, etc.).
   */
  async hoverCell(
    rowIndex: number,
    colIndex: number,
    options?: Parameters<Locator["hover"]>[0],
  ): Promise<this> {
    await this.getCellLocator(rowIndex, colIndex).hover(options);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Table Assertions
  // ───────────────────────────────────────────────────────────────

  /**
   * Asserts that the table headers exactly match the expected list (in order).
   */
  async shouldHaveHeaders(expected: readonly string[]): Promise<this> {
    await expect(this.headerCells).toHaveText(expected as string[]);
    return this;
  }

  /**
   * Asserts the table has exactly `expected` number of rows.
   */
  async shouldHaveRowCount(expected: number): Promise<this> {
    await expect.poll(async () => await this.getRowCount()).toBe(expected);
    return this;
  }

  /**
   * Asserts the table has at least `min` rows.
   */
  async shouldHaveAtLeastRows(min: number): Promise<this> {
    await expect
      .poll(async () => await this.getRowCount())
      .toBeGreaterThanOrEqual(min);
    return this;
  }

  /**
   * Asserts the table has zero rows (empty state).
   */
  async shouldHaveNoRows(): Promise<this> {
    await expect.poll(async () => await this.getRowCount()).toBe(0);
    return this;
  }

  /**
   * Asserts that at least one row exists where the column matches the value.
   */
  async shouldContainRowWhere(
    column: number | string | RegExp,
    value: string | RegExp,
  ): Promise<this> {
    const index = await this.findRowIndexByCellText(column, value);
    expect(
      index,
      `No row found with ${String(column)} = ${String(value)}`,
    ).not.toBe(-1);
    return this;
  }

  /**
   * Asserts that **no row** exists where the column matches the value.
   */
  async shouldNotContainRowWhere(
    column: number | string | RegExp,
    value: string | RegExp,
  ): Promise<this> {
    const index = await this.findRowIndexByCellText(column, value);
    expect(
      index,
      `Found unexpected row with ${String(column)} = ${String(value)}`,
    ).toBe(-1);
    return this;
  }

  /**
   * Asserts that a specific cell contains the expected text.
   */
  async shouldHaveCellText(
    rowIndex: number,
    colIndex: number,
    expected: string | RegExp,
  ): Promise<this> {
    await expect(this.getCellLocator(rowIndex, colIndex)).toHaveText(expected);
    return this;
  }

  // ───────────────────────────────────────────────────────────────
  // Waiters for Dynamic Tables
  // ───────────────────────────────────────────────────────────────

  /**
   * Waits until the table has exactly `expected` rows.
   */
  async waitUntilRowCount(expected: number, timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.getRowCount(), { timeout })
      .toBe(expected);
    return this;
  }

  /**
   * Waits until the table has at least `min` rows.
   */
  async waitUntilRowCountAtLeast(min: number, timeout = 10_000): Promise<this> {
    await expect
      .poll(async () => await this.getRowCount(), { timeout })
      .toBeGreaterThanOrEqual(min);
    return this;
  }

  /**
   * Waits until a row appears matching the column + value condition.
   */
  async waitForRowWhere(
    column: number | string | RegExp,
    value: string | RegExp,
    timeout = 10_000,
  ): Promise<this> {
    await expect
      .poll(async () => await this.findRowIndexByCellText(column, value), {
        timeout,
      })
      .not.toBe(-1);
    return this;
  }
}
