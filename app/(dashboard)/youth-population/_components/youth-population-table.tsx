"use client";

import { DataTable } from "@/components/data-table";
import { getColumns } from "./youth-population-columns";
import { YouthPopulationDialogs } from "./youth-population-dialogs";

import type { YouthPopulationType } from "@/db/schema";
import { bulkDeleteYouthPopulation } from "@/server/actions/youth-population";
import { useYouthPopulationStore } from "@/store/youth-population-store";
import { toast } from "sonner";

interface YouthPopulationClientProps {
  youthPopulation: YouthPopulationType[];
  canEditData: boolean;
}

export function YouthPopulationTable({
  youthPopulation,
  canEditData,
}: YouthPopulationClientProps) {
  const { setSelectedItem, setEditOpen, setDeleteOpen } =
    useYouthPopulationStore();

  const handleEdit = (item: YouthPopulationType) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleBulkDelete = async (selectedRows: YouthPopulationType[]) => {
    const records = selectedRows.map((row) => ({
      id: row.id,
      version: row.version,
    }));
    const res = await bulkDeleteYouthPopulation(records);
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
        data={youthPopulation}
        searchKey="lga"
        enableRowSelection={canEditData}
        onBulkDelete={handleBulkDelete}
        exportRoute="youth-population"
      />

      <YouthPopulationDialogs />
    </>
  );
}
