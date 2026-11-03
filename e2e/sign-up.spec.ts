import { expect, test } from "@playwright/test";
import {
  hasCredentials,
  missingCredentialsMessage,
  newLoggedInContext,
} from "./helpers";

test.describe("public sign-up", () => {
  test("the sign-up endpoint is disabled", async ({ request }) => {
    // The password is deliberately too short. Better Auth checks for disabled
    // sign-up before validating input, so this request is rejected either way
    // and can never create an account, even if sign-up is re-enabled.
    const res = await request.post("/api/auth/sign-up/email", {
      data: {
        name: "E2E Sign-up",
        email: `e2e-signup-${Date.now()}@example.invalid`,
        password: "short",
      },
    });

    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("EMAIL_PASSWORD_SIGN_UP_DISABLED");
  });

  test("the sign-up page no longer exists", async ({ browser }) => {
    test.skip(!hasCredentials, missingCredentialsMessage);

    // Logged in, so the proxy does not redirect to /login first.
    const context = await newLoggedInContext(browser);
    const res = await context.request.get("/auth/sign-up");
    expect(res.status()).toBe(404);
    await context.close();
  });
});
