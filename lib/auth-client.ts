import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, adminClient } from "better-auth/client/plugins";
import type { auth } from "./auth";
import { ac, admin, data_entry, viewer } from "./permissions";

// No baseURL: the auth API is served from the same origin as the app, so Better
// Auth falls back to window.location.origin in the browser. Passing a
// NEXT_PUBLIC_* URL here would bake the build machine's value into the bundle.
export const authClient = createAuthClient({
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
