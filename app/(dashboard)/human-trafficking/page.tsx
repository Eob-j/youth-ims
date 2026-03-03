import { getServerSideSession, canEditDataHelperFn } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { HumanTraffickingWrapper } from "./_components/human-trafficking-wrapper";

export const revalidate = 60;
export default async function HumanTraffickingPage() {
  const session = await getServerSideSession();
  if (!session) redirect("/login");
  const canEditData = canEditDataHelperFn(session.user.role as string);
  return <HumanTraffickingWrapper canEditData={canEditData} />;
}
