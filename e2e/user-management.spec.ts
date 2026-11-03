import { expect, test, type BrowserContext } from "@playwright/test";
import {
  adminCredentials,
  forgedSessionCookie,
  hasAdminCredentials,
  missingAdminCredentialsMessage,
  newLoggedInContext,
} from "./helpers";

test.describe("send invite", () => {
  test.skip(!hasAdminCredentials, missingAdminCredentialsMessage);

  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    context = await newLoggedInContext(browser, adminCredentials);
  });

  test.afterEach(async () => {
    await context?.close();
  });

  test("is rejected without a session", async ({ baseURL }) => {
    const page = await context.newPage();
    await page.goto("/user-management");

    // Use the admin test account's own row, so even a regression could only
    // email the test address.
    const row = page
      .getByRole("row")
      .filter({ hasText: adminCredentials.email });
    await row.getByRole("button").click();

    // Forge the session only after the page has loaded as an admin, then send.
    const [name, value] = forgedSessionCookie.split("=");
    await context.clearCookies();
    await context.addCookies([{ name, value, url: baseURL! }]);

    await page.getByRole("menuitem", { name: "Send Invite" }).click();
    await expect(page.getByText("Unauthorized")).toBeVisible();

    await page.close();
  });
});
