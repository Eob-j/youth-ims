"use client";

import { DataTable } from "@/components/data-table";
import { getColumns } from "./user-management-columns";
import { UserManagementDialogs } from "./user-management-dialogs";

import type { userType } from "@/auth-schema";
import { useUserManagementStore } from "@/store/user-management-store";
import { toast } from "sonner";
import { bulkDeleteUsers } from "@/server/actions/user-management";

interface UserManagementTableProps {
  users: userType[];
  canEditData: boolean;
}

export function UserManagementTable({
  users,
  canEditData,
}: UserManagementTableProps) {
  const { setSelectedItem, setEditOpen, setDeleteOpen } =
    useUserManagementStore();

  const handleEdit = (item: userType) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleBulkDelete = async (selectedRows: userType[]) => {
    console.log(selectedRows);
    const records = selectedRows.map((row) => ({
      id: row.id,
    }));
    const res = await bulkDeleteUsers(records);
    if (res.success) {
      toast.success("Success", {
        description: `${res.deleted} record${res.deleted === 1 ? "" : "s"} deleted successfully.`,
        richColors: true,
      });
    } else {
      toast.error("Error", {
        description: res.message,
        richColors: true,
      });
    }
  };

  const columns = getColumns({
    handleEdit,
    canManageActions: canEditData,
    handleDelete: (item) => {
      setSelectedItem(item);
      setDeleteOpen(true);
    },
  });

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        enableRowSelection={canEditData}
        exportRoute="user-management"
        onBulkDelete={handleBulkDelete}
      />

      <UserManagementDialogs />
    </>
  );
}
