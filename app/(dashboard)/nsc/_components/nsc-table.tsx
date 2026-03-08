"use client";

import { DataTable } from "@/components/data-table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { NscParticipantsType } from "@/db/schema";
import { bulkDeleteNscParticipants } from "@/server/actions/nsc-participants";
import { useNscParticipantsStore } from "@/store/nsc-participants-store";
import { toast } from "sonner";
import { getColumns } from "./nsc-columns";

interface NscTableProps {
  data: NscParticipantsType[];
  canEditData: boolean;
}

export function NscTable({ data, canEditData }: NscTableProps) {
  const {
    setSelectedItem,
    setEditOpen,
    setDeleteOpen,
    selectedRegion,
    selectedCategory,
    selectedStatus,
    setSelectedRegion,
    setSelectedCategory,
    setSelectedStatus,
  } = useNscParticipantsStore();

  const filteredData = data.filter((item) => {
    return (
      (selectedRegion === "all" || item.region === selectedRegion) &&
      (selectedCategory === "all" || item.category === selectedCategory) &&
      (selectedStatus === "all" || item.status === selectedStatus)
    );
  });

  const handleEdit = (item: NscParticipantsType) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleBulkDelete = async (selectedRows: NscParticipantsType[]) => {
    const res = await bulkDeleteNscParticipants(
      selectedRows.map((row) => ({ id: row.id, version: row.version })),
    );
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

  const regions = [...new Set(data.map((item) => item.region))].sort();
  const categories = [...new Set(data.map((item) => item.category))].sort();

  return (
    <>
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="region-filter">Region:</Label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger id="region-filter" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="category-filter">Category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category-filter" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter">Status:</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger id="status-filter" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="name"
        searchPlaceholder="Search participant..."
        enableRowSelection={canEditData}
        onBulkDelete={handleBulkDelete}
        exportRoute="nsc-participants"
      />
    </>
  );
}
