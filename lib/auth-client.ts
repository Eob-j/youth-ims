import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, adminClient } from "better-auth/client/plugins";
import { env } from "@/env";
import type { auth } from "./auth";
import { ac, admin, data_entry, viewer } from "./permissions";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({
      ac,
      roles: {
        admin,
        data_entry,
        viewer,
      },
    }),
  ],
});
