import "server-only";

import { db } from "@/db";
import { youthMigration } from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getYouthMigration = async () => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }
  const res = await db
    .select()
    .from(youthMigration)
    .orderBy(asc(youthMigration.year));
  return res;
};
