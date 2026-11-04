"use server";

import { consumeInviteToken } from "@/lib/invite-tokens";
import { redirect } from "next/navigation";

// Called by the "Confirm my email" button on /verify-email. Public: the
// random invite token is what proves the request came from the invite email.
export async function confirmEmail(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const verified = await consumeInviteToken(token);
  redirect(verified ? "/email-verified-success" : "/invalid-token");
}
