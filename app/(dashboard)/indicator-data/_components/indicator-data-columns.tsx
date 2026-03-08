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
import type { IndicatorDataType } from "@/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Award,
  Building2,
  Edit,
  GraduationCap,
  MapPin,
  MoreHorizontal,
  Sprout,
  Target,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";

interface IndicatorDataColumnsProps {
  handleEdit: (item: IndicatorDataType) => void;
  handleDelete: (item: IndicatorDataType) => void;
  canManageActions: boolean;
}

function getOrganizationIcon(org: string) {
  switch (org) {
    case "NEDI":
      return Building2;
    case "PIA":
      return Award;
    case "GSI":
      return Sprout;
    case "NYSS":
      return Users;
    case "NSC":
      return Trophy;
    case "NYC":
      return Target;
    default:
      return Building2;
  }
}

function getOrganizationColor(org: string) {
  switch (org) {
    case "NEDI":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PIA":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "GSI":
      return "bg-green-100 text-green-800 border-green-200";
    case "NYSS":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "NSC":
      return "bg-red-100 text-red-800 border-red-200";
    case "NYC":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export const getColumns = ({
  handleEdit,
  handleDelete,
  canManageActions,
}: IndicatorDataColumnsProps): ColumnDef<IndicatorDataType>[] => {
  const columns: ColumnDef<IndicatorDataType>[] = [
    {
      accessorKey: "organization",
      header: "Organization",
      cell: ({ row }) => {
        const org = row.original.organization;
        const Icon = getOrganizationIcon(org);
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{org}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "year",
      header: "Year",
    },
    {
      accessorKey: "region",
      header: "Region",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="text-sm">{row.original.region}</span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className={
                category === "finance"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : category === "sport_financing"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : "bg-blue-100 text-blue-800 border-blue-200"
              }
            >
              {category === "finance"
                ? "Finance"
                : category === "sport_financing"
                  ? "Sport Financing"
                  : "Training"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "male",
      header: "Male",
      cell: ({ row }) => (
        <div className="text-center font-medium text-blue-600">
          {new Intl.NumberFormat().format(Number(row.original.male ?? 0))}
        </div>
      ),
    },
    {
      accessorKey: "female",
      header: "Female",
      cell: ({ row }) => (
        <div className="text-center font-medium text-pink-600">
          {new Intl.NumberFormat().format(Number(row.original.female ?? 0))}
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <div className="text-center font-bold text-gray-900 dark:text-white">
          {new Intl.NumberFormat().format(Number(row.original.total ?? 0))}
        </div>
      ),
    },
    {
      accessorKey: "indicator",
      header: "Indicator",
      cell: ({ row }) => (
        <div className="max-w-72 truncate" title={row.original.indicator}>
          {row.original.indicator}
        </div>
      ),
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
