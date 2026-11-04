import { expect, test, type Browser, type Page } from "@playwright/test";
import {
  hasCredentials,
  missingCredentialsMessage,
  newLoggedInContext,
  queryDb,
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

// Opens the create dialog and fills it with valid values, without saving.
async function fillCreateForm(page: Page, marker: string) {
  await page.getByRole("button", { name: "Add New Entry" }).click();
  const dialog = page.getByRole("dialog");
  // The first text field is the one the table searches on (LGA or age group).
  await dialog.locator('input:not([type="number"])').first().fill(marker);
  // Read-only fields (youth population) are calculated by the form.
  const editable = dialog.locator('input[type="number"]:not([readonly])');
  for (const input of await editable.all()) {
    await input.fill("1");
  }
  // The database requires male + female and urban + rural to equal the total
  // (calculated by the form as 1 + 1), and youth to be at most the population.
  for (const id of ["total", "totalPopulation"]) {
    const total = dialog.locator(`input#${id}:not([readonly])`);
    if ((await total.count()) > 0) await total.fill("2");
  }
  // The server only accepts years from 1900 to 2100.
  const year = dialog.locator("input#year");
  if ((await year.count()) > 0) await year.fill("2024");
  return dialog;
}

async function createRecord(page: Page, marker: string) {
  const dialog = await fillCreateForm(page, marker);
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog).toBeHidden();
}

// Rewrites the JSON argument of the next server action call the page makes,
// the way a caller bypassing the form could.
async function rewriteNextAction(
  page: Page,
  change: (arg: Record<string, unknown>) => void,
) {
  let done = false;
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (done || request.method() !== "POST" || !request.headers()["next-action"]) {
      return route.fallback();
    }
    done = true;
    const args = JSON.parse(request.postData() ?? "[]");
    change(args[0]);
    await route.continue({ postData: JSON.stringify(args) });
  });
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

  test("a search with no matches says No entries", async ({ browser }) => {
    const { context, page } = await openSearch(
      browser,
      "/youth-population",
      "zzz-no-such-lga",
    );
    await expect(page.getByText("No entries")).toBeVisible();
    await expect(page.getByText(/Showing 1 to 0/)).toHaveCount(0);
    await context.close();
  });

  // Input validation: the actions check what they are sent, not just the
  // form. Each test changes the real request after the form submits it.
  const youthPopulationRows = (marker: string) =>
    queryDb(
      "select id, version from youth_population where lga = $1",
      [marker],
    );

  test("create ignores id and version sent by the caller", async ({
    browser,
  }) => {
    const marker = `E2E-${Date.now()}`;
    const { context, page } = await openSearch(
      browser,
      "/youth-population",
      marker,
    );
    const dialog = await fillCreateForm(page, marker);
    await rewriteNextAction(page, (arg) => {
      arg.id = 2_000_000_000;
      arg.version = 77;
    });
    await dialog.locator('button[type="submit"]').click();
    await expect(dialog).toBeHidden();
    await context.close();

    const [row] = await youthPopulationRows(marker);
    expect(row).toBeDefined();
    expect(row.id).not.toBe(2_000_000_000);
    expect(row.version).toBe(1);
  });

  test("create rejects a value of the wrong type", async ({ browser }) => {
    const marker = `E2E-${Date.now()}`;
    const { context, page } = await openSearch(
      browser,
      "/youth-population",
      marker,
    );
    const dialog = await fillCreateForm(page, marker);
    await rewriteNextAction(page, (arg) => {
      arg.year = "not-a-year";
    });
    await dialog.locator('button[type="submit"]').click();
    await expect(page.getByText(/Invalid year/)).toBeVisible();
    await context.close();

    expect(await youthPopulationRows(marker)).toHaveLength(0);
  });

  test("CSV export shows a formula-like value as text", async ({
    browser,
  }) => {
    // Starts with "=", so a spreadsheet would run it as a formula unless the
    // export neutralizes it. Still contains "E2E-" for cleanup.
    const marker = `=E2E-${Date.now()}`;
    const { context, page } = await openSearch(
      browser,
      "/youth-population",
      marker,
    );
    await createRecord(page, marker);

    const res = await context.request.get(
      "/api/export/youth-population?format=csv",
    );
    const line = (await res.text())
      .split("\n")
      .find((row) => row.includes(marker.slice(1)));
    expect(line).toBeDefined();
    expect(line!.startsWith(`'${marker},`)).toBe(true);
    await context.close();
  });

  test("delete rejects a malformed id", async ({ browser }) => {
    const marker = `E2E-${Date.now()}`;
    const { context, page, rows } = await openSearch(
      browser,
      "/youth-population",
      marker,
    );
    await createRecord(page, marker);
    await searchFor(page, marker);
    await expect(rows).toHaveCount(1);

    await rows.getByRole("button").click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await rewriteNextAction(page, (arg) => {
      arg.id = -5;
    });
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Delete" })
      .click();
    await expect(page.getByText(/Invalid id/)).toBeVisible();
    await context.close();

    expect(await youthPopulationRows(marker)).toHaveLength(1);
  });
});
