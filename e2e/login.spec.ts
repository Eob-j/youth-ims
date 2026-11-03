import { expect, test } from "@playwright/test";

test.describe("login", () => {
  test("signs in through the rate-limited HTTP endpoint", async ({ page }) => {
    // A nonexistent account, so failed attempts never affect a real user.
    await page.goto("/login");
    await page.getByLabel("Email").fill("e2e-nobody@example.invalid");
    await page.getByLabel("Password").fill("wrong-password");

    // Better Auth only rate-limits HTTP requests to its router, not
    // server-side auth.api calls, so the form must post to this endpoint.
    const signInRequest = page.waitForRequest(
      (req) =>
        req.method() === "POST" && req.url().includes("/api/auth/sign-in/email"),
    );
    await page.getByRole("button", { name: "Sign In" }).click();
    await signInRequest;

    await expect(page.getByText("Invalid email or password")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
