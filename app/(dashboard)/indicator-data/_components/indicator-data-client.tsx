"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { organizationSummaries } from "@/lib/indicator-data";
import type { IndicatorDataType } from "@/db/schema";
import { useIndicatorDataStore } from "@/store/indicator-data-store";
import { BarChart3, Building2, PieChart, Target } from "lucide-react";
import { useMemo } from "react";
import { IndicatorDataActions } from "./indicator-data-actions";
import { IndicatorDataAnalytics } from "./indicator-data-analytics";
import { IndicatorDataDialogs } from "./indicator-data-dialogs";
import { IndicatorDataOrganizations } from "./indicator-data-organizations";
import { IndicatorDataOverview } from "./indicator-data-overview";
import { IndicatorDataTable } from "./indicator-data-table";

interface IndicatorDataClientProps {
  data: IndicatorDataType[];
  years: number[];
  canEditData: boolean;
}

export function IndicatorDataClient({ data, years, canEditData }: IndicatorDataClientProps) {
  const { selectedOrg, selectedYear, selectedCategory } = useIndicatorDataStore();

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return (
        (selectedOrg === "all" || item.organization === selectedOrg) &&
        (selectedYear === "all" || item.year.toString() === selectedYear) &&
        (selectedCategory === "all" || item.category === selectedCategory)
      );
    });
  }, [data, selectedCategory, selectedOrg, selectedYear]);

  const orgSummaryData = useMemo(
    () =>
      organizationSummaries.map((org, index) => ({
        name: org.name,
        fullName: org.fullName,
        beneficiaries: data
          .filter((item) => item.organization === org.name)
          .reduce((sum, item) => sum + Number(item.total ?? 0), 0),
        color: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#334155"][index],
      })),
    [data],
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">MoYS RF-NDP Indicator Data</h1>
          <p className="text-muted-foreground mt-1">National Enterprise Development Initiative & Partner Organizations</p>
        </div>
        {canEditData && <IndicatorDataActions />}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Data Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <IndicatorDataOverview data={filteredData} />
        </TabsContent>
        <TabsContent value="organizations">
          <IndicatorDataOrganizations data={data} />
        </TabsContent>
        <TabsContent value="analytics">
          <IndicatorDataAnalytics data={data} years={years} orgSummaryData={orgSummaryData} />
        </TabsContent>
        <TabsContent value="data">
          <IndicatorDataTable data={filteredData} years={years} canEditData={canEditData} />
        </TabsContent>
      </Tabs>
      {canEditData && <IndicatorDataDialogs />}
    </div>
  );
}

