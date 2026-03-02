"use server";

import { db } from "@/db";
import { youthWithoutDisabilities } from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getYouthWithoutDisabilities = async () => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }
  const res = await db
    .select()
    .from(youthWithoutDisabilities)
    .orderBy(asc(youthWithoutDisabilities.ageGroup));
  return res;
};
