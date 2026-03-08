"use server";

import { db } from "@/db";
import { nycActivities, type NycActivitiesType } from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getNycActivities = async (): Promise<NycActivitiesType[]> => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  return await db.select().from(nycActivities).orderBy(desc(nycActivities.year));
};
