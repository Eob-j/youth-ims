import "server-only";

import { db } from "@/db";
import { sportsFinancing } from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getsportsFinancing = async () => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }
  const res = await db
    .select()
    .from(sportsFinancing)
    .orderBy(asc(sportsFinancing.year));
  return res;
};
