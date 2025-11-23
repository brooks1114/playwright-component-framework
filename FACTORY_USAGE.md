# ComponentFactory & Base Classes – Developer Guide

This project uses a **Component Factory + Base Class** pattern to keep Playwright tests:

- **Readable** – domain language: `ui.buttonByRoleName("Search")` instead of CSS chains.
- **Consistent** – same style of methods across components (e.g. `.shouldBeVisible()`, `.waitUntilReady()`).
- **A11y-first** – prefers `role`, `label`, and test IDs over brittle selectors.
- **Safe to refactor** – most selector changes are isolated to page objects/constants, not tests.

> You only need one thing in your tests:  
> `const ui = new ComponentFactory(page);`

---

## 1. Quick Start

In your test file:

```ts
import { test } from "@playwright/test";
import { ComponentFactory } from "../src/components/factory";

test("example using ComponentFactory", async ({ page }) => {
  const ui = new ComponentFactory(page);

  await page.goto("/");

  await ui.inputByLabel("Case name").fill("Matter 0001");
  await ui.dropdownByLabel("Matter type").selectByText("Suits");
  await ui.buttonByRoleName("Search").click();

  await ui.alertByRole("status").shouldContainText(/search completed/i);
});
2. Philosophy & Best Practices
Use these rules when writing tests:

Prefer semantic helpers over raw selectors

✅ ui.buttonByRoleName("Save")

✅ ui.inputByLabel("Email")

✅ ui.dropdownByLabel("Matter type")

🚫 page.locator("form button.lm-Primary")

Use base classes instead of raw locator and expect

✅ await ui.buttonByTestId("navbar-search-button").shouldBeVisible().click();

🚫 await expect(page.getByTestId("navbar-search-button")).toBeVisible();

Keep assertions close to intent

ButtonBase, InputBase, TableBase, etc. expose domain-specific helpers
(shouldBeOn(), shouldHaveRowCount(), shouldHaveOptions()) so tests read like checklists.

One factory per test

Instantiate ComponentFactory once in each test (or in a fixture) and reuse:

ts
Copy code
const ui = new ComponentFactory(page);
3. Common Patterns by Component Type
Below are “most common” examples for each base class. For details, open the class file under src/components/bases.

3.1 Inputs & Date Pickers
ts
Copy code
// InputBase – <input>, <textarea>, contenteditable
const ui = new ComponentFactory(page);

await ui.inputByLabel("Case name")
  .shouldBeVisible()
  .shouldBeRequired()
  .fill("Matter 0001");

await ui.inputByPlaceholder("Search...").type("coverage opinion");

await ui.inputByTestId("EmailInput")
  .fill("user@example.com")
  .shouldHaveValue("user@example.com");

// DatePickerBase – underlying <input type="date">
await ui.datePickerByLabel("Loss date")
  .setDate(new Date(2025, 0, 1))
  .shouldHaveDate(new Date(2025, 0, 1));
3.2 Buttons & Links
ts
Copy code
// ButtonBase
await ui.buttonByRoleName("Search").shouldBeVisible().click();

await ui.buttonByTestId("navbar-search-button")
  .waitUntilEnabled()
  .click()
  .shouldBeEnabled();

// LinkBase
await ui.linkByRoleName("Dashboard")
  .shouldHaveHref(/\/dashboard/)
  .clickAndNavigate();

const docsLink = ui.linkByRoleName("View docs");
const docsPage = await docsLink.clickAndWaitForNewPage();
await docsPage.waitForURL(/docs/);
3.3 Dropdowns & Listboxes
ts
Copy code
// DropdownBase – native <select>
await ui.dropdownByLabel("Matter type")
  .waitUntilReady()
  .selectByText("Suits")
  .shouldHaveValue("suit_01");

await ui.dropdownByTestId("MatterSubtype")
  .shouldContainOption("Class Action")
  .selectByText("Bad Faith");

// ListBoxBase – ARIA listbox role="listbox"
await ui.listboxByRoleName("States")
  .shouldBeVisible()
  .selectByText("Maine")
  .shouldHaveSelected("Maine");
3.4 Checkboxes, Radios, Toggles
ts
Copy code
// CheckboxBase
await ui.checkboxByLabel("I agree")
  .check()
  .shouldBeChecked();

await ui.checkboxByTestId("SelectAll")
  .setChecked(false)
  .shouldBeUnchecked();

// RadioBase
await ui.radioByLabel("Admin")
  .check()
  .shouldBeChecked();

// ToggleBase – role="switch"
await ui.toggleByRoleName("Dark mode")
  .toggleOn()
  .shouldBeOn();

await ui.toggleByTestId("NotificationsToggle")
  .waitUntilOn()
  .toggleOff()
  .shouldBeOff();
3.5 Tables & Data Grids
ts
Copy code
// TableBase – HTML <table> or role="table"
await ui.tableByRoleName("Matter list")
  .shouldBeVisible()
  .shouldHaveRowCount(10)
  .shouldHaveHeaders(["Case #", "Insured", "Status"]);

await ui.tableByTestId("MatterTable")
  .row(0)
  .cellByHeader("Case #")
  .shouldContainText("Matter 0001");

// DataGridBase – role="grid" (e.g., AG Grid, MUI DataGrid)
await ui.dataGridByRoleName("Claims grid")
  .shouldHaveColumnHeaders(["Claim #", "Status"])
  .shouldHaveRowCount(25)
  .rowByCellText("Claim #", "CLM-000123")
  .cellByColumn("Status")
  .shouldHaveText("Open");
3.6 Alerts & Modals
ts
Copy code
// AlertBase – role="alert" or role="status"
await ui.alertByRole("alert")
  .shouldBeVisible()
  .shouldContainText(/failed to save/i);

await ui.alertByTestId("SaveStatus")
  .shouldBePolite()
  .shouldContainText(/saved successfully/i);

// ModalBase – role="dialog"
const confirmDelete = ui.modalByRoleName("Confirm delete");

await confirmDelete
  .waitUntilOpen()
  .shouldBeVisible()
  .shouldContainText(/are you sure/i);

await confirmDelete.closeWithEsc().waitUntilClosed();
3.7 Tabs & Tab Panels
ts
Copy code
// TabListBase – role="tablist"
const tabs = ui.tabListByRoleName("Matter tabs");

await tabs
  .shouldHaveTabs(["Details", "History", "Notes"])
  .selectTabByLabel("History")
  .waitUntilTabActive("History")
  .shouldActivePanelContain(/no history yet/i);

await tabs.navigateWithKey("ArrowRight").waitUntilTabActive(/Notes/);
4. When to Use Which Pattern
Page objects / components
Use base classes inside page object classes to keep them small and semantic:

ts
Copy code
// Example: MatterDetailsSection uses SectionBase, LabelBase, InputBase, DropdownBase
const matterTypeDropdown = this.factory.dropdownByLabel("Matter type");
Tests
In tests, prefer:

ui factory + base classes for interaction/assertions

Page objects only when the flow is complex and repeated

5. Adding New Component Types
If the UI introduces a new pattern (e.g., slider, chips, breadcrumb):

Create a new *Base class under components/bases.

Add factory helpers:

Selector-based: slider(selector: string): SliderBase

Semantic-based: sliderByRoleName("Volume")

From-locator: sliderFromLocator(locator)

Keep the same style:

Async methods, chainable, should* assertions, wait* helpers

Heavy logic lives in the base class, not in tests.

6. TL;DR for New Engineers
Always start your test with:

ts
Copy code
const ui = new ComponentFactory(page);
Prefer:

inputByLabel, buttonByRoleName, dropdownByLabel, tabListByRoleName, etc.

Let the base classes do the work:

.shouldBeVisible(), .shouldHaveText(), .waitUntilReady(), .shouldHaveRowCount(), etc.

If you’re about to write page.locator(...) with a long selector, stop and ask:

“Can I express this as a ComponentFactory + base class call instead?”

This keeps the test suite readable, robust, and easy to evolve even as the app and DOM change over time.
```

---

## ✅ Do & ❌ Don’t — Best Practices for Using ComponentFactory + Base Classes

This project uses a strict architectural pattern to keep tests **stable, readable, and selector-proof**.  
Use this table as a quick reference while writing or reviewing tests.

| **Do**                                                                            | **Don’t**                                                    | **Why**                                                       |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| **Use ComponentFactory:**<br>`const name = ui.inputByLabel("Case name");`         | ❌ `page.locator("#case-name")`                              | Prevents brittle selector usage and centralizes UI structure. |
| **Use Base classes for actions:**<br>`await dropdown.selectByText("Admin")`       | ❌ `await page.locator("select#role").selectOption("admin")` | Base classes wrap retries, timeouts, and ARIA-safe helpers.   |
| **Use Base assertions:**<br>`await button.shouldBeEnabled()`                      | ❌ `await expect(page.locator(...)).toBeEnabled()`           | Keeps test code consistent and readable.                      |
| **Use semantic objects:**<br>`matterDetailsSection.caseNameInput`                 | ❌ `page.getByLabel("Case name")` scattered everywhere       | Stronger abstraction, reduces DOM dependencies.               |
| **Use constants for labels & testids:**                                           | ❌ Hard-coded strings inside tests                           | Constants prevent drift when UI text changes.                 |
| **Prefer component methods for behavior:**<br>`await section.validateStructure()` | ❌ Copy/paste long sequences of locators or expectations     | Encapsulates common flows and reduces boilerplate.            |
| **Use factories for all interactive components**                                  | ❌ Manually instantiate base classes from tests              | Prevents inconsistencies and mistakes in locators.            |
| **Use Page Object methods for business flow**                                     | ❌ Write click/fill logic directly in tests                  | Makes tests readable, stable, and maintainable.               |
| **Use declarative, intent-based APIs:**<br>`await table.assertRowExists({...})`   | ❌ Index-based or brittle selectors like `.nth(2)`           | Intent-based code survives DOM structure shifts.              |
| **Use ARIA-first selectors (label, role)**                                        | ❌ `//div[4]/span[2]` or CSS chains                          | ARIA-based selectors match real user expectations.            |
| **Use BaseClass utilities for scrolling & focusing**                              | ❌ `page.evaluate(() => ...)`                                | Fixtures automatically handle waiting and retrying.           |

---

### Quick Examples

**Good**

```ts
await ui.buttonByTestId("save-btn").shouldBeEnabled().click();
await ui.dropdownByLabel("Matter type").selectByText("Suits");
await createMatterPage.matterDetails.validateStructure();
await page.click('#save-btn');
await page.locator('select[name="matterType"]').selectOption('Suits');
await expect(page.locator('h2')).toHaveText('Matter Details');

Summary

Following these guidelines ensures:

Maximum test stability

Minimal selector maintenance

Clean and readable business-level test code

A reusable, scalable automation framework

This table should be treated as the standard for writing and reviewing all new tests.
```
