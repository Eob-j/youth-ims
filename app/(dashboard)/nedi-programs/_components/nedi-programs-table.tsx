"use client";

import { DataTable } from "@/components/data-table";
import { getColumns } from "./nedi-programs-columns";
import { NediProgramsDialogs } from "./nedi-programs-dialogs";
import type { NediProgramsType } from "@/db/schema";
import { bulkDeleteNediPrograms } from "@/server/actions/nedi-programs";
import { useNediProgramsStore } from "@/store/nedi-programs-store";
import { toast } from "sonner";

interface NediProgramsTableProps {
  nediPrograms: NediProgramsType[];
  canEditData: boolean;
}

export function NediProgramsTable({
  nediPrograms,
  canEditData,
}: NediProgramsTableProps) {
  const { setSelectedItem, setEditOpen, setDeleteOpen } =
    useNediProgramsStore();

  const handleEdit = (item: NediProgramsType) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleBulkDelete = async (selectedRows: NediProgramsType[]) => {
    const records = selectedRows.map((row) => ({
      id: row.id,
      version: row.version,
    }));
    const res = await bulkDeleteNediPrograms(records);
    if (res.success) {
      toast.success("Success", {
        description: `${res.data.deleted} record${res.data.deleted === 1 ? "" : "s"} deleted successfully.`,
        richColors: true,
      });
    } else {
      toast.error("Error", {
        description: res.error,
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
        data={nediPrograms}
        searchKey="programName"
        enableRowSelection={canEditData}
        onBulkDelete={handleBulkDelete}
        exportRoute="nedi-programs"
      />

      <NediProgramsDialogs />
    </>
  );
}
