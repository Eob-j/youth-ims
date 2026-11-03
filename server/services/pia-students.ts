import "server-only";

import { db } from "@/db";
import { piaStudents } from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { asc, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getPiaStudents = async () => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  return await db
    .select()
    .from(piaStudents)
    .orderBy(desc(piaStudents.year), asc(piaStudents.department));
};
