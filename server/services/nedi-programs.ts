"use server";

import { db } from "@/db";
import { nediPrograms } from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getNediPrograms = async () => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  return await db
    .select()
    .from(nediPrograms)
    .orderBy(asc(nediPrograms.programName));
};
