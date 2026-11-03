import { expect, test, type Browser, type Page } from "@playwright/test";
import {
  hasCredentials,
  missingCredentialsMessage,
  newLoggedInContext,
  sessionSwaps,
} from "./helpers";

// Each test creates its own record and removes it afterwards, so existing
// data is never edited or deleted, even if a check regresses.
const tables = [
  { name: "youth population", path: "/youth-population" },
  { name: "youth with disabilities", path: "/youth-with-disabilities" },
  { name: "youth without disabilities", path: "/youth-without-disabilities" },
];

function findRow(page: Page, marker: string) {
  return page.getByRole("row").filter({ hasText: marker });
}

async function searchFor(page: Page, marker: string) {
  await page.getByPlaceholder("Search...").fill(marker);
}

async function createRecord(page: Page, marker: string) {
  await page.getByRole("button", { name: "Add New Entry" }).click();
  const dialog = page.getByRole("dialog");
  // The first text field is the one the table searches on (LGA or age group).
  await dialog.locator('input:not([type="number"])').first().fill(marker);
  for (const input of await dialog.locator('input[type="number"]').all()) {
    await input.fill("1");
  }
  // The database requires male + female and urban + rural to equal the total.
  for (const id of ["total", "totalPopulation", "youthPopulation"]) {
    const total = dialog.locator(`input#${id}`);
    if ((await total.count()) > 0) await total.fill("2");
  }
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog).toBeHidden();
}

// Logs in as the editor and filters the table to rows matching `search`.
async function openSearch(browser: Browser, path: string, search: string) {
  const context = await newLoggedInContext(browser);
  const page = await context.newPage();
  await page.goto(path);
  await expect(page.getByRole("table")).toBeVisible();
  await searchFor(page, search);
  return { context, page, rows: findRow(page, search) };
}

// Deletes every row whose marker contains `search`, while logged in.
async function removeRecords(browser: Browser, path: string, search: string) {
  const { context, page, rows } = await openSearch(browser, path, search);
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
}

test.describe("update and delete actions", () => {
  test.skip(!hasCredentials, missingCredentialsMessage);

  // Runs with its own timeout, so test records are removed even when a test
  // times out. Matching the "E2E-" prefix also removes leftovers from earlier
  // interrupted runs.
  test.afterAll(async ({ browser }) => {
    for (const { path } of tables) {
      await removeRecords(browser, path, "E2E-");
    }
  });

  for (const swap of sessionSwaps) {
    for (const { name, path } of tables) {
      test(`${name}: edit and delete are rejected ${swap.label}`, async ({
        browser,
        baseURL,
      }) => {
        test.skip(!swap.enabled, swap.skipMessage);
        const marker = `E2E-${Date.now()}`;

        // A forged session makes Better Auth clear the cookie, which refreshes
        // the page onto /login. So each check opens its dialog with the
        // editor's session and swaps the session just before submitting.

        // Edit: submit the form unchanged.
        const edit = await openSearch(browser, path, marker);
        await createRecord(edit.page, marker);
        await searchFor(edit.page, marker);
        await expect(edit.rows).toHaveCount(1);
        await edit.rows.getByRole("button").click();
        await edit.page.getByRole("menuitem", { name: "Edit" }).click();
        await swap.apply(edit.context, baseURL!, browser);
        await edit.page
          .getByRole("dialog")
          .locator('button[type="submit"]')
          .click();
        await expect(edit.page.getByText("Unauthorized")).toBeVisible();
        await edit.context.close();

        // Delete: confirm in the alert dialog.
        const del = await openSearch(browser, path, marker);
        await expect(del.rows).toHaveCount(1);
        await del.rows.getByRole("button").click();
        await del.page.getByRole("menuitem", { name: "Delete" }).click();
        await swap.apply(del.context, baseURL!, browser);
        await del.page
          .getByRole("alertdialog")
          .getByRole("button", { name: "Delete" })
          .click();
        await expect(del.page.getByText("Unauthorized")).toBeVisible();
        await del.context.close();

        // The rejected delete must not have removed the record.
        const check = await openSearch(browser, path, marker);
        await expect(check.rows).toHaveCount(1);
        await check.context.close();
      });
    }
  }
});
