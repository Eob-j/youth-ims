"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NycActivitiesType } from "@/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MapPin, MoreHorizontal, Trash2 } from "lucide-react";

interface NycActivitiesColumnsProps {
  handleEdit: (item: NycActivitiesType) => void;
  handleDelete: (item: NycActivitiesType) => void;
  canManageActions: boolean;
}

function getStatusBadge(status: string) {
  if (status === "Completed") return "default" as const;
  if (status === "Ongoing") return "secondary" as const;
  return "outline" as const;
}

export const getColumns = ({
  handleEdit,
  handleDelete,
  canManageActions,
}: NycActivitiesColumnsProps): ColumnDef<NycActivitiesType>[] => {
  const columns: ColumnDef<NycActivitiesType>[] = [
    {
      id: "number",
      header: "No.",
      cell: ({ row }) => <div className="text-center font-medium">{row.index + 1}</div>,
    },
    {
      accessorKey: "activityName",
      header: "Activity",
      cell: ({ row }) => <div className="font-medium max-w-md truncate">{row.original.activityName}</div>,
    },
    {
      accessorKey: "region",
      header: "Coverage",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-gray-500" />
          <span className="text-sm">{row.original.region}</span>
        </div>
      ),
    },
    {
      accessorKey: "year",
      header: "Year",
    },
    {
      accessorKey: "beneficiaries",
      header: "Output",
      cell: ({ row }) => (
        <div className="text-center font-bold text-gray-900">
          {Number(row.original.beneficiaries ?? 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "fundingPartner",
      header: "Funder",
      cell: ({ row }) => <Badge variant="outline">{row.original.fundingPartner}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant={getStatusBadge(row.original.status)}>{row.original.status}</Badge>,
    },
  ];

  if (canManageActions) {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
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
              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return columns;
};
