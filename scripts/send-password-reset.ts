// Fallback for when no admin can trigger a reset from the UI (e.g. the only
// admin forgot their password). Requires server access and the .env file.
//
// Usage: pnpm reset-password <email>
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: pnpm reset-password <email>");
    process.exit(1);
  }

  // Imported after dotenv so env validation sees the loaded variables.
  const { auth } = await import("@/lib/auth");

  await auth.api.requestPasswordReset({
    body: { email, redirectTo: "/reset-password" },
  });

  console.log(`If ${email} belongs to a user, a reset link has been sent.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
