"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signIn = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error) {
    const e = error as Error;

    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};

export const signOut = async () => {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/login");
};
