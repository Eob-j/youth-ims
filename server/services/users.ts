import { db } from "@/db";
import { users } from "@/auth-schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getUsers() {
  const session = await getServerSideSession();
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }
  const res = await auth.api.listUsers({
    query: {},
    headers: await headers(),
  });
  return res.users;
}
