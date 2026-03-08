import { canEditDataHelperFn, getServerSideSession } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { NscWrapper } from "./_components/nsc-wrapper";

export const revalidate = 60;

export default async function NscPage() {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  const canEditData = canEditDataHelperFn(session.user.role as string);
  return <NscWrapper canEditData={canEditData} />;
}
