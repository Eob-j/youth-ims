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

// Passes the proxy's cookie-presence check but is not a real session, so
// only the server-side session check can reject the request.
export const forgedSessionCookie = "better-auth.session_token=forged-token";

export async function newLoggedInContext(
  browser: Browser,
): Promise<BrowserContext> {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/login");
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page).toHaveURL(/\/dashboard/);

  await page.close();
  return context;
}
