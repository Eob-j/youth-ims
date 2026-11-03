"use server";

import { fail, ok } from "@/lib/action-result-helper";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const getCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }
  return {
    user: session.user,
  };
};

export const signOut = async () => {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/login");
};
