import { expect, type Browser, type BrowserContext } from "@playwright/test";

export const credentials = {
  email: process.env.E2E_EMAIL ?? "",
  password: process.env.E2E_PASSWORD ?? "",
};

export const hasCredentials = Boolean(
  credentials.email && credentials.password,
);

export const missingCredentialsMessage =
  "Set E2E_EMAIL and E2E_PASSWORD in .env (an admin or data_entry user) to run logged-in tests.";

export const adminCredentials = {
  email: process.env.E2E_ADMIN_EMAIL ?? "",
  password: process.env.E2E_ADMIN_PASSWORD ?? "",
};

export const hasAdminCredentials = Boolean(
  adminCredentials.email && adminCredentials.password,
);

export const missingAdminCredentialsMessage =
  "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD in .env (an admin user) to run admin tests.";

// Passes the proxy's cookie-presence check but is not a real session, so
// only the server-side session check can reject the request.
export const forgedSessionCookie = "better-auth.session_token=forged-token";

export async function newLoggedInContext(
  browser: Browser,
  user: { email: string; password: string } = credentials,
): Promise<BrowserContext> {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page).toHaveURL(/\/dashboard/);

  await page.close();
  return context;
}
