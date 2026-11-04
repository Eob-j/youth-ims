import { getServerSideSession } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { UserProfile } from "./user-profile";

export async function UserProfileWrapper() {
  // Same check as every page: a session with a verified email.
  const session = await getServerSideSession();
  if (!session) redirect("/login");
  return <UserProfile currentUser={session.user} />;
}
