"use server";

import { db } from "@/db";
import { indicatorData, type IndicatorDataType } from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getIndicatorData = async (): Promise<{
  data: IndicatorDataType[];
  years: number[];
}> => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  const data = await db.select().from(indicatorData).orderBy(desc(indicatorData.year));
  const years = [...new Set(data.map((row) => row.year))].sort((a, b) => b - a);

  return { data, years };
};
