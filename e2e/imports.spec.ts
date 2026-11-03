import { expect, test, type BrowserContext } from "@playwright/test";
import {
  forgedSessionCookie,
  hasCredentials,
  missingCredentialsMessage,
  newLoggedInContext,
} from "./helpers";

// The import actions in feature/import-csv/action.ts, reached through the
// "Import Data" dialog on each page.
const importPages = [
  { name: "youth population", path: "/youth-population" },
  { name: "youth with disabilities", path: "/youth-with-disabilities" },
  { name: "youth without disabilities", path: "/youth-without-disabilities" },
  { name: "human trafficking", path: "/human-trafficking" },
  { name: "youth migration", path: "/youth-migration" },
  { name: "NEDI programs", path: "/nedi-programs" },
  { name: "NYSS programs", path: "/nyss" },
  { name: "NYSS graduates", path: "/nyss", tab: "Graduates" },
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

  // Each test forges its cookies partway through, so each gets its own login.
  test.beforeEach(async ({ browser }) => {
    context = await newLoggedInContext(browser);
  });

  test.afterEach(async () => {
    await context?.close();
  });

  for (const { name, path, tab } of importPages) {
    test(`${name}: runs when logged in, rejected without a session`, async ({
      baseURL,
    }) => {
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

      // Logged in: the action gets past the session check to validation.
      await importButton.click();
      await expect(page.getByText("No valid rows found")).toBeVisible();

      // Swap the real session for a forged cookie and submit again. The
      // dialog stays open on error, so the same file is still selected.
      const [name, value] = forgedSessionCookie.split("=");
      await context.clearCookies();
      await context.addCookies([{ name, value, url: baseURL! }]);

      await importButton.click();
      await expect(page.getByText("Unauthorized")).toBeVisible();

      await page.close();
    });
  }
});
