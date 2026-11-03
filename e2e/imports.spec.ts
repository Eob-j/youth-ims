import { expect, test, type BrowserContext } from "@playwright/test";
import {
  hasCredentials,
  missingCredentialsMessage,
  newLoggedInContext,
  sessionSwaps,
} from "./helpers";

// Every page with an "Import Data" dialog.
const importPages = [
  { name: "youth population", path: "/youth-population" },
  { name: "youth with disabilities", path: "/youth-with-disabilities" },
  { name: "youth without disabilities", path: "/youth-without-disabilities" },
  { name: "human trafficking", path: "/human-trafficking" },
  { name: "youth migration", path: "/youth-migration" },
  { name: "NEDI programs", path: "/nedi-programs" },
  { name: "NYSS programs", path: "/nyss" },
  { name: "NYSS graduates", path: "/nyss", tab: "Graduates" },
  { name: "indicator data", path: "/indicator-data" },
  { name: "NYC participants", path: "/nyc" },
  { name: "NSC participants", path: "/nsc" },
  { name: "NYC activities", path: "/nyc-activities" },
];

// A header row with no data rows: the import runs end to end but inserts
// nothing, so these tests never write to the database.
const emptyCsv = {
  name: "e2e-empty.csv",
  mimeType: "text/csv",
  buffer: Buffer.from("e2e_column\n"),
};

test.describe("import actions", () => {
  test.skip(!hasCredentials, missingCredentialsMessage);

  let context: BrowserContext;

  // Each test swaps its cookies partway through, so each gets its own login.
  test.beforeEach(async ({ browser }) => {
    context = await newLoggedInContext(browser);
  });

  test.afterEach(async () => {
    await context?.close();
  });

  for (const swap of sessionSwaps) {
    for (const { name, path, tab } of importPages) {
      test(`${name}: runs for an editor, rejected ${swap.label}`, async ({
        browser,
        baseURL,
      }) => {
        test.skip(!swap.enabled, swap.skipMessage);

        const page = await context.newPage();
        await page.goto(path);
        if (tab) {
          await page.getByRole("tab", { name: tab }).click();
        }

        await page.getByRole("button", { name: "Import Data" }).click();
        await page.locator('input[type="file"]').setInputFiles(emptyCsv);
        const importButton = page.getByRole("button", {
          name: "Import",
          exact: true,
        });

        // Editor: the action gets past the auth check to validation.
        await importButton.click();
        await expect(page.getByText("No valid rows found")).toBeVisible();

        // Swap the session and submit again. The dialog stays open on error,
        // so the same file is still selected.
        await swap.apply(context, baseURL!, browser);
        await importButton.click();
        await expect(page.getByText("Unauthorized")).toBeVisible();

        await page.close();
      });
    }
  }
});
