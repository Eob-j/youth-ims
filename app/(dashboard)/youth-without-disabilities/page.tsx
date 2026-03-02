import { getServerSideSession, canEditDataHelperFn } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { YouthWithoutDisabilitiesWrapper } from "./_components/youth-without-disabilities-wrapper";

export const revalidate = 60;
export default async function YouthWithoutDisabilitiesPage() {
  const session = await getServerSideSession();
  if (!session) redirect("/login");
  const canEditData = canEditDataHelperFn(session.user.role as string);
  return <YouthWithoutDisabilitiesWrapper canEditData={canEditData} />;
}
