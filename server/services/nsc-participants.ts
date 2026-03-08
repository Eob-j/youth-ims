"use server";

import { db } from "@/db";
import { nscParticipants, type NscParticipantsType } from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { asc, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getNscParticipants = async (): Promise<NscParticipantsType[]> => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  return await db
    .select()
    .from(nscParticipants)
    .orderBy(desc(nscParticipants.dateRegistered), asc(nscParticipants.name));
};
