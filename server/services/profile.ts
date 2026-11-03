import "server-only";

import { db } from "@/db";
import { users } from "@/auth-schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: "admin" | "data_entry" | "viewer";
  createdAt: Date;
  updatedAt: Date;
}

export async function getCurrentProfile(): Promise<ProfileData> {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!row) {
    redirect("/login");
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: (row.role as "admin" | "data_entry" | "viewer") ?? "viewer",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
