"use server";

import { db } from "@/db";
import { humanTrafficking } from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getHumanTrafficking = async () => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }
  const res = await db
    .select()
    .from(humanTrafficking)
    .orderBy(asc(humanTrafficking.year));
  return res;
};
