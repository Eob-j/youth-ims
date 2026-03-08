"use client";

import { DataTable } from "@/components/data-table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { NycActivitiesType } from "@/db/schema";
import { bulkDeleteNycActivities } from "@/server/actions/nyc-activities";
import { useNycActivitiesStore } from "@/store/nyc-activities-store";
import { toast } from "sonner";
import { getColumns } from "./nyc-activities-columns";

interface NycActivitiesTableProps {
  data: NycActivitiesType[];
  canEditData: boolean;
}

export function NycActivitiesTable({ data, canEditData }: NycActivitiesTableProps) {
  const {
    setSelectedItem,
    setEditOpen,
    setDeleteOpen,
    selectedCategory,
    selectedRegion,
    selectedYear,
    setSelectedCategory,
    setSelectedRegion,
    setSelectedYear,
  } = useNycActivitiesStore();

  const filteredData = data.filter((item) => {
    return (
      (selectedCategory === "all" || item.category === selectedCategory) &&
      (selectedRegion === "all" || item.region === selectedRegion) &&
      (selectedYear === "all" || String(item.year) === selectedYear)
    );
  });

  const handleEdit = (item: NycActivitiesType) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleBulkDelete = async (selectedRows: NycActivitiesType[]) => {
    const res = await bulkDeleteNycActivities(
      selectedRows.map((row) => ({ id: row.id, version: row.version })),
    );

    if (res.success) {
      toast.success("Success", {
        description: `${res.data.deleted} record${res.data.deleted === 1 ? "" : "s"} deleted successfully.`,
        richColors: true,
      });
    } else {
      toast.error("Error", { description: res.error, richColors: true });
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

  const categories = [...new Set(data.map((item) => item.category))].sort();
  const regions = [...new Set(data.map((item) => item.region))].sort();
  const years = [...new Set(data.map((item) => String(item.year)))].sort((a, b) => Number(b) - Number(a));

  return (
    <>
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="category-filter">Category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category-filter" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="region-filter">Region:</Label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger id="region-filter" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
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
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="activityName"
        searchPlaceholder="Search activity..."
        enableRowSelection={canEditData}
        onBulkDelete={handleBulkDelete}
        exportRoute="nyc-activities"
      />
    </>
  );
}
