import "server-only";

import { db } from "@/db";
import { nycParticipants, type NycParticipantsType } from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { asc, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getNycParticipants = async (): Promise<NycParticipantsType[]> => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  return await db
    .select()
    .from(nycParticipants)
    .orderBy(desc(nycParticipants.dateRegistered), asc(nycParticipants.name));
};
