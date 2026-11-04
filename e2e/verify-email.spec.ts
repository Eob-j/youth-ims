import { expect, test } from "@playwright/test";

// The invite link opens a confirmation page; only its button verifies the
// email, so a scanner that opens links cannot verify an account by itself.
const unknownToken = "a".repeat(64);

test.describe("email verification link", () => {
  test("the old link only forwards to the confirmation page", async ({
    request,
  }) => {
    const res = await request.get(`/api/verify-email?token=${unknownToken}`, {
      maxRedirects: 0,
    });
    expect(res.headers()["location"]).toBe(
      `/verify-email?token=${unknownToken}`,
    );
  });

  test("the confirmation page is public and asks before verifying", async ({
    page,
  }) => {
    await page.goto(`/verify-email?token=${unknownToken}`);
    await expect(page).toHaveURL(/\/verify-email/);
    await expect(page.getByText("Welcome to Youth IMS")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Confirm my email" }),
    ).toBeVisible();
  });

  test("a missing token goes to the invalid link page", async ({ page }) => {
    await page.goto("/verify-email");
    await expect(page).toHaveURL(/\/invalid-token/);
  });

  for (const [label, token] of [
    ["an unknown token", unknownToken],
    ["a malformed token", "not-a-token"],
  ]) {
    test(`confirming ${label} goes to the invalid link page`, async ({
      page,
    }) => {
      await page.goto(`/verify-email?token=${token}`);
      await page.getByRole("button", { name: "Confirm my email" }).click();
      await expect(page).toHaveURL(/\/invalid-token/);
    });
  }
});
