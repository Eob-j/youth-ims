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
import type { NscParticipantsType } from "@/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

interface NscColumnsProps {
  handleEdit: (item: NscParticipantsType) => void;
  handleDelete: (item: NscParticipantsType) => void;
  canManageActions: boolean;
}

export const getColumns = ({
  handleEdit,
  handleDelete,
  canManageActions,
}: NscColumnsProps): ColumnDef<NscParticipantsType>[] => {
  const columns: ColumnDef<NscParticipantsType>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "age",
      header: "Age",
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => (
        <Badge variant={row.original.gender === "Male" ? "default" : "secondary"}>
          {row.original.gender}
        </Badge>
      ),
    },
    {
      accessorKey: "region",
      header: "Region",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div className="max-w-40 truncate">{row.original.category}</div>,
    },
    {
      accessorKey: "sport",
      header: "Sport",
    },
    {
      accessorKey: "level",
      header: "Level",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === "Active" ? "default" : status === "Inactive" ? "secondary" : "outline"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "achievements",
      header: "Achievements",
      cell: ({ row }) => {
        const achievements = row.original.achievements ?? "";
        return (
          <div className="max-w-64 truncate" title={achievements}>
            {achievements || "None"}
          </div>
        );
      },
    },
    {
      accessorKey: "dateRegistered",
      header: "Date Registered",
      cell: ({ row }) => {
        const value = row.original.dateRegistered;
        return value ? new Date(value).toISOString().split("T")[0] : "-";
      },
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => row.original.contact || "-",
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
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(item)}
              >
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
