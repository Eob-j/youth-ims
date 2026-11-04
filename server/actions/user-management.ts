"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getServerSideSession } from "@/lib/auth-helper";
import { fail, ok } from "@/lib/action-result-helper";
import { headers } from "next/headers";
import { Role } from "@/lib/types";
import { db } from "@/db";
import { users } from "@/auth-schema";
import { env } from "@/env";
import { escapeHtml } from "@/lib/escape-html";
import { generatePassword } from "@/lib/generate-password";
import {
  createInviteToken,
  getOrCreateInviteToken,
} from "@/lib/invite-tokens";
import { transporter } from "@/lib/nodemailer/client";
import { invalidInput } from "@/lib/validations/action-input";
import { userSchema } from "@/lib/validations/user-management";
import { eq } from "drizzle-orm";
import z from "zod";

type CreateUserInput = z.infer<typeof userSchema>;

// Creates the user with a generated password and returns it once, so the
// admin can pass it on. It is not stored anywhere in plain text.
export async function createUser(input: CreateUserInput) {
  const session = await getServerSideSession();

  if (!session) {
    return fail("Unauthorized");
  }

  if (session.user.role !== "admin") {
    return fail("Unauthorized");
  }

  const parsed = userSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const requestHeaders = await headers();
    const password = generatePassword();

    const newUser = await auth.api.createUser({
      body: {
        email: data.email,
        password,
        name: data.name,
        role: data.role as Role,
      },
      headers: requestHeaders,
    });

    const token = await createInviteToken(newUser.user.id);
    await sendInviteEmail({
      email: newUser.user.email,
      token,
      name: newUser.user.name,
    });

    revalidatePath("/user-management");
    return ok({ email: newUser.user.email, password });
  } catch (error) {
    console.error(error);
    return fail("An error occurred while creating the user.");
  }
}

type UpdateUserInput = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const updateUserSchema = userSchema.extend({ id: z.string().min(1) });
const userRefSchema = z.object({ id: z.string().min(1) });

// Admins cannot delete or demote themselves. Every admin action is taken by
// an admin, so this guarantees at least one admin always remains.
export async function updateUser(input: UpdateUserInput) {
  const session = await getServerSideSession();

  if (!session) {
    return fail("Unauthorized");
  }

  if (session.user.role !== "admin") {
    return fail("Unauthorized");
  }

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  if (data.id === session.user.id && data.role !== "admin") {
    return fail(
      "You cannot remove your own admin role. Ask another admin to change it.",
    );
  }

  try {
    const [current] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, data.id))
      .limit(1);

    if (!current) {
      return fail("User not found.");
    }

    // A new address has not been confirmed, so the user must verify it again
    // (which also keeps them out until they do).
    const emailChanged =
      current.email.toLowerCase() !== data.email.toLowerCase();

    await auth.api.adminUpdateUser({
      body: {
        userId: data.id,
        data: {
          name: data.name,
          email: data.email,
          role: data.role as Role,
          ...(emailChanged && { emailVerified: false }),
        },
      },
      headers: await headers(),
    });
    revalidatePath("/user-management");

    if (emailChanged) {
      try {
        // Replaces the old invite, so a link sent to the old address stops
        // working.
        const token = await createInviteToken(data.id);
        await sendInviteEmail({
          email: data.email,
          token,
          name: data.name,
        });
      } catch (error) {
        console.error(error);
        return fail(
          "User updated, but the invite email to the new address could not be sent. Use Send Invite to try again.",
        );
      }
    }

    return ok({ emailChanged });
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating the user.");
  }
}

type DeleteUserInput = {
  id: string;
};

export async function deleteUser(input: DeleteUserInput) {
  const session = await getServerSideSession();

  if (!session) {
    return fail("Unauthorized");
  }

  if (session.user.role !== "admin") {
    return fail("Unauthorized");
  }

  const parsed = userRefSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  if (data.id === session.user.id) {
    return fail("You cannot delete your own account.");
  }

  try {
    const deletedUser = await auth.api.removeUser({
      body: {
        userId: data.id,
      },
      headers: await headers(),
    });
    revalidatePath("/user-management");
    return ok(deletedUser);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the user.");
  }
}

type BulkDeleteUsersInput = {
  id: string;
}[];
export async function bulkDeleteUsers(input: BulkDeleteUsersInput) {
  const session = await getServerSideSession();

  if (!session) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (session.user.role !== "admin") {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const parsed = z.array(userRefSchema).max(1000).safeParse(input);
  if (!parsed.success) {
    return { success: false, message: invalidInput(parsed.error) };
  }
  const data = parsed.data;

  if (data.length === 0) {
    return {
      success: false,
      message: "No records provided for deletion.",
    };
  }

  // Checked before deleting anything, so a selection that includes the
  // current admin is not partly deleted.
  if (data.some((obj) => obj.id === session.user.id)) {
    return {
      success: false,
      message:
        "Your own account is selected. Unselect it to delete the others.",
    };
  }

  try {
    for (const obj of data) {
      await auth.api.removeUser({
        body: {
          userId: obj.id,
        },
        headers: await headers(),
      });
    }
    revalidatePath("/user-management");
    return {
      success: true,
      message: "User(s) deleted successfully.",
      deleted: data.length,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "An error occurred while deleting the users.",
    };
  }
}

export async function sendPasswordResetEmail(userId: string) {
  const session = await getServerSideSession();

  if (!session) {
    return fail("Unauthorized");
  }

  if (session.user.role !== "admin") {
    return fail("Unauthorized");
  }

  if (session.user.id === userId) {
    return fail(
      "You cannot reset your own password here. Use the Security tab on your profile instead.",
    );
  }

  try {
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return fail("User not found.");
    }

    await auth.api.requestPasswordReset({
      body: {
        email: user.email,
        redirectTo: "/reset-password",
      },
    });

    return ok("Password reset email sent.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while sending the password reset email.");
  }
}


async function sendInviteEmail({
  email,
  token,
  name,
}: {
  email: string;
  token: string;
  name: string;
}) {
  // Same base URL as Better Auth's reset links, so one setting controls both.
  const baseUrl = env.BETTER_AUTH_URL.replace(/\/+$/, "");
  // Opens a page with a confirm button; the link alone verifies nothing.
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `${env.EMAIL_SENDER_NAME} <${env.GMAIL_USER}>`,
    to: email,
    subject: "You have been invited to join the Gambia Youth Data Dashboard",
    html: `
    <p>Hi ${escapeHtml(name)}, you've been invited to join the platform.</p>
    <a href="${verifyUrl}">Click here to verify your email & get started</a>
    <p>This link expires in 24 hours.</p>
  `, // HTML version of the message
  });
}

export async function retrySendInviteEmail(userId: string) {
  const session = await getServerSideSession();

  if (!session) {
    return fail("Unauthorized");
  }

  if (session.user.role !== "admin") {
    return fail("Unauthorized");
  }

  try {
    // Look up the recipient rather than trusting the caller, so the link can
    // only ever go to the user's own address.
    const [user] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return fail("User not found.");
    }

    // Resend the current invite if it is still valid, otherwise a new one.
    const token = await getOrCreateInviteToken(userId);
    await sendInviteEmail({
      email: user.email,
      token,
      name: user.name,
    });
    return ok("Invitation sent successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while sending the email.");
  }
}
