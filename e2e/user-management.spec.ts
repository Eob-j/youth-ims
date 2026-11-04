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

// Creating a user sends a real invite email, so these tests only cover cases
// that are rejected before any user is created.
test.describe("add user", () => {
  test.skip(!hasAdminCredentials, missingAdminCredentialsMessage);

  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    context = await newLoggedInContext(browser, adminCredentials);
  });

  test.afterEach(async () => {
    await context?.close();
  });

  async function openAddUser() {
    const page = await context.newPage();
    await page.goto("/user-management");
    await page.getByRole("button", { name: "Add New User" }).click();
    return { page, dialog: page.getByRole("dialog") };
  }

  test("has no password fields and checks its input", async () => {
    const { dialog } = await openAddUser();

    // The password is generated, so the admin never types one.
    await expect(dialog.locator('input[type="password"]')).toHaveCount(0);

    // Submitted empty: a malformed email is already blocked by the browser's
    // own type="email" check before the form validates.
    await dialog.getByRole("button", { name: "Save User" }).click();
    await expect(dialog.getByText("Name is required")).toBeVisible();
    await expect(dialog.getByText("Enter a valid email address")).toBeVisible();
    await expect(dialog.getByText("Role is required")).toBeVisible();
  });

  test("the server rejects a role that does not exist", async () => {
    const { page, dialog } = await openAddUser();
    await dialog.locator("#name").fill("E2E Role Check");
    await dialog.locator("#email").fill("e2e-role-check@example.invalid");
    await dialog.getByRole("combobox").click();
    await page.getByRole("option", { name: /Viewer/ }).click();

    // Change the role in the real request after the form submits it.
    let rewritten = false;
    await page.route("**/*", async (route) => {
      const request = route.request();
      if (rewritten || request.method() !== "POST" || !request.headers()["next-action"]) {
        return route.fallback();
      }
      rewritten = true;
      const args = JSON.parse(request.postData() ?? "[]");
      args[0].role = "superadmin";
      await route.continue({ postData: JSON.stringify(args) });
    });

    await dialog.getByRole("button", { name: "Save User" }).click();
    await expect(page.getByText(/Invalid role/)).toBeVisible();
    // The form keeps what was typed after a failed save.
    await expect(dialog.locator("#name")).toHaveValue("E2E Role Check");
  });
});
