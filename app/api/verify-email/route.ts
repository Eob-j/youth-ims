import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

// Old invite link, still in emails sent before /verify-email existed. It only
// forwards to the confirmation page, so opening it changes nothing.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) redirect("/invalid-token");
  redirect(`/verify-email?token=${encodeURIComponent(token)}`);
}
