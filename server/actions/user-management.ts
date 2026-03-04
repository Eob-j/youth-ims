"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getServerSideSession } from "@/lib/auth-helper";
import { fail, ok } from "@/lib/action-result-helper";
import { headers } from "next/headers";

type CreateUserInput = {
  name: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
};

export async function createUser(data: CreateUserInput) {
  const session = await getServerSideSession();

  if (!session) {
    return fail("Unauthorized");
  }

  if (session.user.role !== "admin") {
    return fail("Unauthorized");
  }

  try {
    const newUser = await auth.api.createUser({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role as "admin" | "data_entry" | "viewer",
      },
      headers: await headers(),
    });
    console.log(newUser);
    revalidatePath("/user-management");
    return ok(newUser);
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
          role: data.role as "admin" | "data_entry" | "viewer",
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
