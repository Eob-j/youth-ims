import "server-only";

import { db } from "@/db";
import { youthWithDisabilities } from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getYouthWithDisabilities = async () => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }
  const res = await db
    .select()
    .from(youthWithDisabilities)
    .orderBy(asc(youthWithDisabilities.ageGroup));
  return res;
};
