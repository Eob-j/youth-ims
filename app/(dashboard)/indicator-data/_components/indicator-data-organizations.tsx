"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { organizationSummaries } from "@/lib/indicator-data";
import type { IndicatorDataType } from "@/db/schema";
import { Award, Building2, Sprout, Target, Trophy, Users } from "lucide-react";

interface IndicatorDataOrganizationsProps {
  data: IndicatorDataType[];
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

function getColorClasses(color: string) {
  switch (color) {
    case "blue":
      return "bg-blue-100 text-blue-600";
    case "purple":
      return "bg-purple-100 text-purple-600";
    case "green":
      return "bg-green-100 text-green-600";
    case "orange":
      return "bg-orange-100 text-orange-600";
    case "red":
      return "bg-red-100 text-red-600";
    default:
      return "bg-indigo-100 text-indigo-600";
  }
}

export function IndicatorDataOrganizations({
  data,
}: IndicatorDataOrganizationsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {organizationSummaries.map((org) => {
        const Icon = getOrganizationIcon(org.name);
        const orgData = data.filter((item) => item.organization === org.name);
        const financeCount = orgData
          .filter((item) => item.category === "finance")
          .reduce((sum, item) => sum + Number(item.total ?? 0), 0);
        const trainingCount = orgData
          .filter((item) => item.category === "training")
          .reduce((sum, item) => sum + Number(item.total ?? 0), 0);
        const sportFinancingCount = orgData
          .filter((item) => item.category === "sport_financing")
          .reduce((sum, item) => sum + Number(item.total ?? 0), 0);

        return (
          <Card key={org.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${getColorClasses(org.color).split(" ")[0]}`}
                  >
                    <Icon
                      className={`h-6 w-6 ${getColorClasses(org.color).split(" ")[1]}`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {org.fullName}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{org.description}</p>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {orgData
                      .reduce((sum, item) => sum + Number(item.total ?? 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-100">
                    Total
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {financeCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Finance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {trainingCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Training</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {sportFinancingCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Sport</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
