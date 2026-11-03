import "server-only";

import { db } from "@/db";
import { nyssPrograms } from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { asc, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getNyssPrograms = async () => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  return await db
    .select()
    .from(nyssPrograms)
    .orderBy(desc(nyssPrograms.year), asc(nyssPrograms.programName));
};

