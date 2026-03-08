"use client";

import { DataTable } from "@/components/data-table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IndicatorDataType } from "@/db/schema";
import { bulkDeleteIndicatorData } from "@/server/actions/indicator-data";
import { useIndicatorDataStore } from "@/store/indicator-data-store";
import { toast } from "sonner";
import { getColumns } from "./indicator-data-columns";

interface IndicatorDataTableProps {
  data: IndicatorDataType[];
  years: number[];
  canEditData: boolean;
}

export function IndicatorDataTable({
  data,
  years,
  canEditData,
}: IndicatorDataTableProps) {
  const {
    setSelectedItem,
    setEditOpen,
    setDeleteOpen,
    selectedOrg,
    selectedYear,
    selectedCategory,
    setSelectedOrg,
    setSelectedYear,
    setSelectedCategory,
  } = useIndicatorDataStore();

  const handleEdit = (item: IndicatorDataType) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleBulkDelete = async (selectedRows: IndicatorDataType[]) => {
    const res = await bulkDeleteIndicatorData(
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

  return (
    <>
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="org-filter">Organization:</Label>
          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger id="org-filter" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="NEDI">NEDI</SelectItem>
              <SelectItem value="PIA">PIA</SelectItem>
              <SelectItem value="GSI">GSI</SelectItem>
              <SelectItem value="NYSS">NYSS</SelectItem>
              <SelectItem value="NSC">NSC</SelectItem>
              <SelectItem value="NYC">NYC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="year-filter">Year:</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger id="year-filter" className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="category-filter">Category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category-filter" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="sport_financing">Sport Financing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchKey="region"
        searchPlaceholder="Search region..."
        enableRowSelection={canEditData}
        onBulkDelete={handleBulkDelete}
        exportRoute="indicator-data"
      />
    </>
  );
}
