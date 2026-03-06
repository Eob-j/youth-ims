import { getServerSideSession, canEditDataHelperFn } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { NediProgramsWrapper } from "./_components/nedi-programs-wrapper";

export const revalidate = 60;

export default async function NediProgramsPage() {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  const canEditData = canEditDataHelperFn(session.user.role as string);

  return <NediProgramsWrapper canEditData={canEditData} />;
}
