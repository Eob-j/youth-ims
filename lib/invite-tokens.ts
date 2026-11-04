import "server-only";

import { users, verifications } from "@/auth-schema";
import { db } from "@/db";
import crypto from "crypto";
import { eq, inArray } from "drizzle-orm";

// Invite tokens share the verifications table with Better Auth, whose rows
// use identifiers such as "reset-password:<token>". Invite rows are tagged
// "invite:<userId>" and only tagged rows are ever matched, so a request can
// never find (and delete) one of Better Auth's rows.
const PREFIX = "invite:";
const TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// Invites sent before tagging used the bare user id as the identifier. They
// expire within 24 hours, after which this fallback can be removed.
const identifiersFor = (userId: string) => [`${PREFIX}${userId}`, userId];

function userIdOf(identifier: string) {
  if (identifier.startsWith(PREFIX)) return identifier.slice(PREFIX.length);
  // A legacy bare user id never contains ":"; Better Auth's identifiers do.
  return identifier.includes(":") ? null : identifier;
}

export async function deleteInviteTokens(userId: string) {
  await db
    .delete(verifications)
    .where(inArray(verifications.identifier, identifiersFor(userId)));
}

// Replaces any invite token the user has with a new one.
export async function createInviteToken(userId: string) {
  await deleteInviteTokens(userId);
  const value = crypto.randomBytes(32).toString("hex");
  await db.insert(verifications).values({
    id: crypto.randomBytes(32).toString("hex"),
    identifier: `${PREFIX}${userId}`,
    value,
    expiresAt: new Date(Date.now() + TTL_MS),
  });
  return value;
}

// The user's current invite token if it is still valid, otherwise a new one.
export async function getOrCreateInviteToken(userId: string) {
  const [row] = await db
    .select()
    .from(verifications)
    .where(inArray(verifications.identifier, identifiersFor(userId)))
    .limit(1);
  if (row && row.expiresAt > new Date()) return row.value;
  return createInviteToken(userId);
}

// Marks the invited user's email as verified and removes their invite tokens.
// Returns false if the token is malformed, unknown, expired or not an invite.
export async function consumeInviteToken(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;

  const rows = await db
    .select()
    .from(verifications)
    .where(eq(verifications.value, token));
  const row = rows.find((r) => userIdOf(r.identifier) !== null);
  if (!row) return false;

  const userId = userIdOf(row.identifier)!;
  if (row.expiresAt < new Date()) {
    await deleteInviteTokens(userId);
    return false;
  }

  const updated = await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, userId))
    .returning({ id: users.id });
  await deleteInviteTokens(userId);
  return updated.length > 0;
}
