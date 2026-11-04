import { expect, test } from "@playwright/test";
import {
  adminCredentials,
  credentials,
  hasAdminCredentials,
  hasCredentials,
  hasViewerCredentials,
  newLoggedInContext,
  viewerCredentials,
} from "./helpers";

// User Management is only linked for admins: in the sidebar and in the page
// search (Ctrl+K). The page itself also refuses everyone else.
const accounts = [
  { role: "admin", user: adminCredentials, enabled: hasAdminCredentials, sees: true },
  { role: "data entry", user: credentials, enabled: hasCredentials, sees: false },
  { role: "viewer", user: viewerCredentials, enabled: hasViewerCredentials, sees: false },
];

test.describe("user management link", () => {
  for (const { role, user, enabled, sees } of accounts) {
    test(`${sees ? "is" : "is not"} shown to ${role} users`, async ({
      browser,
    }) => {
      test.skip(!enabled, `Set the ${role} test account in .env to run this.`);

      const context = await newLoggedInContext(browser, user);
      const page = await context.newPage();
      await page.goto("/dashboard");

      // Sidebar: Dashboard is always there, User Management only for admins.
      const sidebarLink = (name: string) =>
        page.locator("[data-sidebar=sidebar]").getByRole("link", { name });
      await expect(sidebarLink("Dashboard")).toBeVisible();
      await expect(sidebarLink("User Management")).toHaveCount(sees ? 1 : 0);

      // Page search.
      await page.keyboard.press("Control+k");
      await page.getByPlaceholder(/search/i).last().fill("user");
      const option = page.getByRole("option", { name: /User Management/ });
      await expect(option).toHaveCount(sees ? 1 : 0);

      await context.close();
    });
  }
});
