import { expect, test } from "@playwright/test";
import {
  hasCredentials,
  missingCredentialsMessage,
  newLoggedInContext,
} from "./helpers";

test.describe("accessibility", () => {
  test("Forgot password says whether its help text is shown", async ({
    page,
  }) => {
    await page.goto("/login");
    const toggle = page.getByRole("button", { name: "Forgot password?" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const helpId = await toggle.getAttribute("aria-controls");
    await expect(page.locator(`#${helpId}`)).toContainText(
      "contact your system administrator",
    );
  });

  test.describe("signed in", () => {
    test.skip(!hasCredentials, missingCredentialsMessage);

    test("table columns can be sorted with the keyboard", async ({
      browser,
    }) => {
      const context = await newLoggedInContext(browser);
      const page = await context.newPage();
      await page.goto("/youth-population");

      const sortButton = page.getByRole("button", { name: "LGA" });
      const header = page.getByRole("columnheader").filter({ has: sortButton });
      await expect(header).toHaveAttribute("aria-sort", "none");

      await sortButton.focus();
      await page.keyboard.press("Enter");
      await expect(header).toHaveAttribute("aria-sort", "ascending");
      await page.keyboard.press("Enter");
      await expect(header).toHaveAttribute("aria-sort", "descending");

      // The search box has an accessible name, not just a placeholder.
      await expect(
        page.getByRole("textbox", { name: "Search table" }),
      ).toBeVisible();
      await context.close();
    });

    test("the account menu button has a name", async ({ browser }) => {
      const context = await newLoggedInContext(browser);
      const page = await context.newPage();
      await page.goto("/dashboard");

      await page.getByRole("button", { name: /^Account menu for / }).click();
      await expect(page.getByText("Profile Settings")).toBeVisible();
      await context.close();
    });

    test("the NYC organisations tab still loads", async ({ browser }) => {
      const context = await newLoggedInContext(browser);
      const page = await context.newPage();
      await page.goto("/nyc-activities");

      await page.getByRole("tab", { name: /Organizations|Organisations/ }).click();
      await expect(page.getByText(/Total of \d+ organizations/)).toBeVisible();
      await context.close();
    });
  });
});
