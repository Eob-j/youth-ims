"use client";

import { DataTable } from "@/components/data-table";
import { getColumns } from "./youth-without-disabilities-columns";
import { YouthWithoutDisabilitiesDialogs } from "./youth-without-disabilities-dialogs";

import type { YouthWithoutDisabilitiesType } from "@/db/schema";
import { useYouthWithoutDisabilitiesStore } from "@/store/youth-without-disabilities-store";
import { bulkDeleteYouthWithoutDisabilities } from "@/server/actions/youth-without-disabilities";
import { toast } from "sonner";

interface YouthWithoutDisabilitiesClientProps {
  youthWithoutDisabilities: YouthWithoutDisabilitiesType[];
  canEditData: boolean;
}

export function YouthWithoutDisabilitiesTable({
  youthWithoutDisabilities,
  canEditData,
}: YouthWithoutDisabilitiesClientProps) {
  const { setSelectedItem, setEditOpen, setDeleteOpen } =
    useYouthWithoutDisabilitiesStore();

  const handleEdit = (item: YouthWithoutDisabilitiesType) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleBulkDelete = async (
    selectedRows: YouthWithoutDisabilitiesType[],
  ) => {
    const records = selectedRows.map((row) => ({
      id: row.id,
      version: row.version,
    }));
    const res = await bulkDeleteYouthWithoutDisabilities(records);
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
        data={youthWithoutDisabilities}
        searchKey="ageGroup"
        enableRowSelection={canEditData}
        onBulkDelete={handleBulkDelete}
        exportRoute="youth-without-disabilities"
      />

      <YouthWithoutDisabilitiesDialogs />
    </>
  );
}
