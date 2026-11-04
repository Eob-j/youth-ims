"use server";

import crypto from "crypto";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getServerSideSession } from "@/lib/auth-helper";
import { fail, ok } from "@/lib/action-result-helper";
import { headers } from "next/headers";
import { Role } from "@/lib/types";
import { db } from "@/db";
import { users, verifications } from "@/auth-schema";
import { env } from "@/env";
import { generatePassword } from "@/lib/generate-password";
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

    const tokenData = await generateAndStoreToken({ userId: newUser.user.id });
    await sendInviteEmail({
      email: newUser.user.email,
      token: tokenData.value,
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

export async function updateUser(data: UpdateUserInput) {
  const session = await getServerSideSession();

  if (!session) {
    return fail("Unauthorized");
  }

  if (session.user.role !== "admin") {
    return fail("Unauthorized");
  }

  try {
    const updatedUser = await auth.api.adminUpdateUser({
      body: {
        userId: data.id,
        data: {
          name: data.name,
          email: data.email,
          role: data.role as Role,
        },
      },
      headers: await headers(),
    });

    revalidatePath("/user-management");
    return ok(updatedUser);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating the user.");
  }
}

type DeleteUserInput = {
  id: string;
};

export async function deleteUser(data: DeleteUserInput) {
  const session = await getServerSideSession();

  if (!session) {
    return fail("Unauthorized");
  }

  if (session.user.role !== "admin") {
    return fail("Unauthorized");
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
export async function bulkDeleteUsers(data: BulkDeleteUsersInput) {
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

  if (data.length === 0) {
    return {
      success: false,
      message: "No records provided for deletion.",
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

async function generateAndStoreToken({ userId }: { userId: string }) {
  const tokenSecret = crypto.randomBytes(32).toString("hex");
  const tokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
  const data = await db
    .insert(verifications)
    .values({
      identifier: userId,
      value: tokenSecret,
      expiresAt: tokenExpires,
      id: crypto.randomBytes(32).toString("hex"),
    })
    .returning();
  return data[0];
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
  const verifyUrl = `${baseUrl}/api/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `${env.EMAIL_SENDER_NAME} <${env.GMAIL_USER}>`,
    to: email,
    subject: "You have been invited to join the Gambia Youth Data Dashboard",
    html: `
    <p>Hi ${name}, you've been invited to join the platform.</p>
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

    // check if the user has an associated token
    let [record] = await db
      .select()
      .from(verifications)
      .where(eq(verifications.identifier, userId))
      .limit(1);
    // check if the token is expired
    if (!record || record.expiresAt < new Date()) {
      await db
        .delete(verifications)
        .where(eq(verifications.identifier, userId))
        .returning();
      record = await generateAndStoreToken({ userId });
    }
    await sendInviteEmail({
      email: user.email,
      token: record.value,
      name: user.name,
    });
    return ok("Invitation sent successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while sending the email.");
  }
}
