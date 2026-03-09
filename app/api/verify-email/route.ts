import { users, verifications } from "@/auth-schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    redirect("/invalid-token");
  }

  // check if token is exist in the database
  const record = await db
    .select()
    .from(verifications)
    .where(eq(verifications.value, token))
    .limit(1);

  if (record.length < 1 || (record && record[0].expiresAt < new Date())) {
    return redirect("/invalid-token"); // expired or fake
  }

  await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, record[0].identifier));

  await db
    .delete(verifications)
    .where(eq(verifications.identifier, record[0].identifier));
  redirect("/email-verified-success");
}
