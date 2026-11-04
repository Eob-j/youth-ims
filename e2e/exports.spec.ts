import { expect, test, type BrowserContext } from "@playwright/test";
import {
  forgedSessionCookie,
  hasCredentials,
  missingCredentialsMessage,
  newLoggedInContext,
  queryDb,
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

    // Named after the table and today's date.
    expect(res.headers()["content-disposition"]).toMatch(
      /filename="youth-population-\d{4}-\d{2}-\d{2}\.csv"/,
    );

    // Same labels and order as the table in the UI.
    const [headerRow] = (await res.text()).split("\n");
    expect(headerRow.trim()).toBe(
      "LGA,Total Population,Youth Population,Youth Share (%),Male Youth,Female Youth,Urban Youth,Rural Youth,Year",
    );
  });

  test("an empty table exports just the column headers", async () => {
    const [{ count }] = await queryDb(
      "select count(*)::int as count from nyc_participants",
    );
    test.skip(count > 0, "NYC participants has data; this needs an empty table.");

    const res = await context.request.get(
      "/api/export/nyc-participants?format=csv",
    );
    expect(res.status()).toBe(200);
    expect((await res.text()).trim()).toBe(
      "Name,Age,Gender,Region,Category,Sport,Level,Status,Achievements,Date Registered,Contact",
    );
  });

  test("an unknown format is rejected with 400", async () => {
    const res = await context.request.get(
      "/api/export/youth-population?format=bogus",
    );
    expect(res.status()).toBe(400);
  });
});
