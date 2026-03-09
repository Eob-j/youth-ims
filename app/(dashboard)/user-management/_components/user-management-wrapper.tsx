import { getYouthWithoutDisabilities } from "@/server/services/youth-without-disabilities";
import { Suspense } from "react";
import { UserManagementActions } from "./user-management-actions";
import { UserManagementTable } from "./user-management-table";
import { UserManagementTableSkeleton } from "./user-management-table-skeleton";
import { getUsers } from "@/server/services/users";

interface Props {
  canEditData: boolean;
}

export async function UserManagementWrapper({ canEditData }: Props) {
  const data = await getUsers();
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        {canEditData && <UserManagementActions />}
      </div>

      <Suspense fallback={<UserManagementTableSkeleton />}>
        <UserManagementTable canEditData={canEditData} users={data} />
      </Suspense>
    </div>
  );
}
