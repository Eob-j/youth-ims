"use server";

import { users } from "@/auth-schema";
import { db } from "@/db";
import { fail, ok } from "@/lib/action-result-helper";
import { auth } from "@/lib/auth";
import { getServerSideSession } from "@/lib/auth-helper";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateCurrentUserProfile(data: { name: string }) {
  const session = await getServerSideSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const trimmedName = data.name.trim();
  if (trimmedName.length < 2) {
    return fail("Name must be at least 2 characters.");
  }

  try {
    await db
      .update(users)
      .set({
        name: trimmedName,
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/profile");
    return ok({ name: trimmedName });
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating your profile.");
  }
}

export async function updateCurrentUserPassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await getServerSideSession();
  if (!session) {
    return fail("Unauthorized");
  }

  if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
    return fail("All password fields are required.");
  }

  if (data.newPassword.length < 8) {
    return fail("New password must be at least 8 characters.");
  }

  if (data.newPassword.length > 20) {
    return fail("New password must be at most 20 characters.");
  }

  if (data.newPassword !== data.confirmPassword) {
    return fail("New password and confirmation do not match.");
  }

  if (data.currentPassword === data.newPassword) {
    return fail("New password must be different from current password.");
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });

    return ok({ success: true });
  } catch (error) {
    console.error(error);
    return fail("Unable to change password. Check your current password and try again.");
  }
}
