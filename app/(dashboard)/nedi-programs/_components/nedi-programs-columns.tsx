"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NediProgramsType } from "@/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

interface NediProgramsColumnsProps {
  handleEdit: (item: NediProgramsType) => void;
  handleDelete: (item: NediProgramsType) => void;
  canManageActions: boolean;
}

export const getColumns = ({
  handleEdit,
  handleDelete,
  canManageActions,
}: NediProgramsColumnsProps): ColumnDef<NediProgramsType>[] => {
  const columns: ColumnDef<NediProgramsType>[] = [
    {
      accessorKey: "programName",
      header: "Program Name",
      cell: ({ row }) => {
        const name = row.getValue("programName") as string;
        return (
          <div className="max-w-48 truncate" title={name}>
            {name}
          </div>
        );
      },
    },
    {
      accessorKey: "targetGroup",
      header: "Target Group",
    },
    {
      accessorKey: "beneficiaries",
      header: "Beneficiaries",
      cell: ({ row }) => {
        const count = row.getValue("beneficiaries") as number;
        return count > 0 ? new Intl.NumberFormat().format(count) : "-";
      },
    },
    {
      accessorKey: "serviceType",
      header: "Service Type",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${status === "Completed" ? "bg-green-100 text-green-800" : ""}
            ${status === "Ongoing" ? "bg-blue-100 text-blue-800" : ""}
            ${status === "Operational" ? "bg-purple-100 text-purple-800" : ""}
            ${status === "Planned" ? "bg-yellow-100 text-yellow-800" : ""}
          `}
          >
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "implementingPartner",
      header: "Partner",
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => {
        const date = row.getValue("startDate") as string;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => {
        const date = row.getValue("endDate") as string;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
  ];

  if (canManageActions) {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    });
  }

  return columns;
};
