import { canEditDataHelperFn, getServerSideSession } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { IndicatorDataWrapper } from "./_components/indicator-data-wrapper";

export const revalidate = 60;

export default async function IndicatorDataPage() {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  const canEditData = canEditDataHelperFn(session.user.role as string);
  return <IndicatorDataWrapper canEditData={canEditData} />;
}
