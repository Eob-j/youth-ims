"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { YouthWithoutDisabilitiesType } from "@/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

interface YouthWithoutDisabilitiesColumnsProps {
  handleEdit: (item: YouthWithoutDisabilitiesType) => void;
  handleDelete: (item: YouthWithoutDisabilitiesType) => void;
  canManageActions: boolean;
}

export const getColumns = ({
  handleEdit,
  handleDelete,
  canManageActions,
}: YouthWithoutDisabilitiesColumnsProps): ColumnDef<YouthWithoutDisabilitiesType>[] => {
  const columns: ColumnDef<YouthWithoutDisabilitiesType>[] = [
    {
      accessorKey: "ageGroup",
      header: "Age Group",
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        return new Intl.NumberFormat().format(row.getValue("total"));
      },
    },
    {
      accessorKey: "male",
      header: "Male",
      cell: ({ row }) => {
        return new Intl.NumberFormat().format(row.getValue("male"));
      },
    },
    {
      accessorKey: "female",
      header: "Female",
      cell: ({ row }) => {
        return new Intl.NumberFormat().format(row.getValue("female"));
      },
    },
    {
      accessorKey: "urban",
      header: "Urban",
      cell: ({ row }) => {
        return new Intl.NumberFormat().format(row.getValue("urban"));
      },
    },
    {
      accessorKey: "rural",
      header: "Rural",
      cell: ({ row }) => {
        return new Intl.NumberFormat().format(row.getValue("rural"));
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
