import { expect, test, type BrowserContext } from "@playwright/test";
import {
  forgedSessionCookie,
  hasCredentials,
  missingCredentialsMessage,
  newLoggedInContext,
} from "./helpers";

const exportRoutes = [
  "human-trafficking",
  "indicator-data",
  "nedi-programs",
  "nsc-participants",
  "nyc-activities",
  "nyc-participants",
  "nyss-graduates",
  "nyss-programs",
  "youth-migration",
  "youth-population",
  "youth-with-disabilities",
  "youth-without-disabilities",
];

test.describe("exports without a session", () => {
  for (const route of exportRoutes) {
    test(`${route} returns 401`, async ({ request }) => {
      const res = await request.get(`/api/export/${route}?format=csv`);
      expect(res.status()).toBe(401);
    });

    test(`${route} returns 401 with a forged session cookie`, async ({
      request,
    }) => {
      const res = await request.get(`/api/export/${route}?format=csv`, {
        headers: { cookie: forgedSessionCookie },
      });
      expect(res.status()).toBe(401);
    });
  }
});

test.describe("exports with a session", () => {
  test.skip(!hasCredentials, missingCredentialsMessage);

  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    context = await newLoggedInContext(browser);
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test("youth-population CSV downloads", async () => {
    const res = await context.request.get(
      "/api/export/youth-population?format=csv",
    );
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/csv");

    // Same labels and order as the table in the UI.
    const [headerRow] = (await res.text()).split("\n");
    expect(headerRow.trim()).toBe(
      "LGA,Total Population,Youth Population,Youth Share (%),Male Youth,Female Youth,Urban Youth,Rural Youth,Year",
    );
  });
});
