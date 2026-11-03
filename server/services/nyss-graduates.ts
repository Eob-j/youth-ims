import "server-only";

import { db } from "@/db";
import { nyssGraduates } from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { asc, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getNyssGraduates = async () => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  return await db
    .select()
    .from(nyssGraduates)
    .orderBy(desc(nyssGraduates.graduationYear), asc(nyssGraduates.name));
};

