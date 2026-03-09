import { canEditDataHelperFn, getServerSideSession } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { UserManagementWrapper } from "./_components/user-management-wrapper";

export default async function UserManagementPage() {
  const session = await getServerSideSession();
  if (!session) redirect("/login");
  const isAdmin = session.user.role === "admin";

  if (!isAdmin) {
    return (
      <div className="flex w-full h-[75vh] items-center justify-center flex-col">
        <h3 className="text-destructive text-2xl">Access Denied</h3>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }
  const canEditData = canEditDataHelperFn(session.user.role as string);
  return <UserManagementWrapper canEditData={canEditData} />;
}
