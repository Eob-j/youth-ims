import { canEditDataHelperFn, getServerSideSession } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { NycActivitiesWrapper } from "./_components/nyc-activities-wrapper";

export const revalidate = 60;

export default async function NycActivitiesPage() {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  const canEditData = canEditDataHelperFn(session.user.role as string);
  return <NycActivitiesWrapper canEditData={canEditData} />;
}
