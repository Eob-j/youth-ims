import { headers } from "next/headers";
import { auth } from "../auth";
import { cache } from "react";

export const getServerSideSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.emailVerified) {
    return null;
  }

  return session;
});

// The session of a user allowed to change data (admin or data_entry), or null.
// Use this in every action that creates, updates, deletes or imports data;
// viewers can still read through getServerSideSession.
export const getEditorSession = cache(async () => {
  const session = await getServerSideSession();

  if (!session || !canEditDataHelperFn(session.user.role as string)) {
    return null;
  }

  return session;
});

export function canEditDataHelperFn(role: string) {
  return role === "admin" || role === "dataEntry" || role === "data_entry";
}
