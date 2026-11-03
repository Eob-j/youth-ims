import { expect, test, type Browser, type Page } from "@playwright/test";
import {
  hasCredentials,
  missingCredentialsMessage,
  newLoggedInContext,
  queryDb,
} from "./helpers";

// Two editors change the same record at once. PIA is one of the tables whose
// updates checked the version but never increased it, so the second save
// silently overwrote the first. The test creates its own record (marked in
// the free-text Academic Year field) and removes it afterwards.
const path = "/pia-students";
let department = "";

async function openTable(browser: Browser) {
  const context = await newLoggedInContext(browser);
  const page = await context.newPage();
  await page.goto(path);
  await expect(page.getByRole("table")).toBeVisible();
  // The table searches on department; the marker then picks out the row.
  if (department) await page.getByPlaceholder("Search...").fill(department);
  return { context, page };
}

function rowFor(page: Page, marker: string) {
  return page.getByRole("row").filter({ hasText: marker });
}

async function openEdit(page: Page, marker: string, graduated: string) {
  await rowFor(page, marker).getByRole("button").click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator("#graduated").fill(graduated);
  return dialog;
}

test.describe("concurrent edits", () => {
  test.skip(!hasCredentials, missingCredentialsMessage);

  test.afterAll(async ({ browser }) => {
    if (!department) return;
    const { context, page } = await openTable(browser);
    const rows = page.getByRole("row").filter({ hasText: "E2E-" });
    while ((await rows.count()) > 0) {
      const before = await rows.count();
      await rows.first().getByRole("button").click();
      await page.getByRole("menuitem", { name: "Delete" }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete" })
        .click();
      await expect(rows).toHaveCount(before - 1);
    }
    await context.close();
  });

  test("the second of two edits to the same record is rejected", async ({
    browser,
  }) => {
    const marker = `E2E-${Date.now()}`;

    // Create the record: male + female must equal enrolled.
    const a = await openTable(browser);
    await a.page.getByRole("button", { name: "Add New Entry" }).click();
    const create = a.page.getByRole("dialog");
    await create.getByRole("combobox").first().click();
    const option = a.page.getByRole("option").first();
    department = (await option.innerText()).trim();
    await option.click();
    await create.locator("#year").fill(marker);
    for (const [id, value] of [
      ["male", "1"],
      ["female", "1"],
      ["enrolled", "2"],
      ["graduated", "1"],
    ]) {
      await create.locator(`#${id}`).fill(value);
    }
    await create.locator('button[type="submit"]').click();
    await expect(create).toBeHidden();
    await a.page.getByPlaceholder("Search...").fill(department);
    await expect(rowFor(a.page, marker)).toHaveCount(1);

    // Both editors open the record before either saves.
    const b = await openTable(browser);
    const editA = await openEdit(a.page, marker, "0");
    const editB = await openEdit(b.page, marker, "2");

    await editB.locator('button[type="submit"]').click();
    await expect(editB).toBeHidden();

    await editA.locator('button[type="submit"]').click();
    await expect(
      a.page.getByText("Record modified by another user."),
    ).toBeVisible();

    await a.context.close();
    await b.context.close();

    // The first save is kept and the version moved on.
    const [row] = await queryDb(
      "select graduated, version from pia_students where year = $1",
      [marker],
    );
    expect(row.graduated).toBe(2);
    expect(row.version).toBe(2);
  });
});
