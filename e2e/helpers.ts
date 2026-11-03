import { expect, type Browser, type BrowserContext } from "@playwright/test";
import { Client } from "pg";

// Runs a read-only query against the app database, for checks the UI cannot
// show (e.g. a record's id or version).
export async function queryDb(sql: string, params: unknown[] = []) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    return (await client.query(sql, params)).rows;
  } finally {
    await client.end();
  }
}

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

export const viewerCredentials = {
  email: process.env.E2E_VIEWER_EMAIL ?? "",
  password: process.env.E2E_VIEWER_PASSWORD ?? "",
};

export const hasViewerCredentials = Boolean(
  viewerCredentials.email && viewerCredentials.password,
);

export const missingViewerCredentialsMessage =
  "Set E2E_VIEWER_EMAIL and E2E_VIEWER_PASSWORD in .env (a viewer user) to run viewer tests.";

// Passes the proxy's cookie-presence check but is not a real session, so
// only the server-side session check can reject the request.
export const forgedSessionCookie = "better-auth.session_token=forged-token";

// Ways to replace an editor's session just before submitting a dialog. Each
// must make the server reject the action with "Unauthorized".
export const sessionSwaps = [
  {
    label: "without a session",
    enabled: true,
    skipMessage: "",
    async apply(context: BrowserContext, baseURL: string) {
      const [name, value] = forgedSessionCookie.split("=");
      await context.clearCookies();
      await context.addCookies([{ name, value, url: baseURL }]);
    },
  },
  {
    label: "as a viewer",
    enabled: hasViewerCredentials,
    skipMessage: missingViewerCredentialsMessage,
    async apply(context: BrowserContext, _baseURL: string, browser: Browser) {
      const viewer = await newLoggedInContext(browser, viewerCredentials);
      const cookies = await viewer.cookies();
      await viewer.close();
      await context.clearCookies();
      await context.addCookies(cookies);
    },
  },
];

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
