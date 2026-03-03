"use client";

import { DataTable } from "@/components/data-table";
import { getColumns } from "./human-trafficking-columns";
import { HumanTraffickingDialogs } from "./human-trafficking-dialogs";

import type { HumanTraffickingType } from "@/db/schema";
import { useHumanTraffickingStore } from "@/store/human-trafficking-store";
import { bulkDeleteHumanTrafficking } from "@/server/actions/human-trafficking";
import { toast } from "sonner";

interface HumanTraffickingClientProps {
  humanTrafficking: HumanTraffickingType[];
  canEditData: boolean;
}

export function HumanTraffickingTable({
  humanTrafficking,
  canEditData,
}: HumanTraffickingClientProps) {
  const { setSelectedItem, setEditOpen, setDeleteOpen } =
    useHumanTraffickingStore();

  const handleEdit = (item: HumanTraffickingType) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleBulkDelete = async (selectedRows: HumanTraffickingType[]) => {
    const records = selectedRows.map((row) => ({
      id: row.id,
      version: row.version,
    }));
    const res = await bulkDeleteHumanTrafficking(records);
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
        data={humanTrafficking}
        searchKey="ageGroup"
        enableRowSelection={canEditData}
        onBulkDelete={handleBulkDelete}
        exportRoute="youth-without-disabilities"
      />

      <HumanTraffickingDialogs />
    </>
  );
}
