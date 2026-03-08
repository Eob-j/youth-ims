"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NycActivitiesType } from "@/db/schema";
import { Building2, Calendar, Globe, PieChart, TrendingUp } from "lucide-react";
import { NycActivitiesActions } from "./nyc-activities-actions";
import { NycActivitiesAnalytics } from "./nyc-activities-analytics";
import { NycActivitiesDialogs } from "./nyc-activities-dialogs";
import { NycActivitiesOrganizations } from "./nyc-activities-organizations";
import { NycActivitiesOverview } from "./nyc-activities-overview";
import { NycActivitiesTable } from "./nyc-activities-table";

interface NycActivitiesClientProps {
  data: NycActivitiesType[];
  canEditData: boolean;
}

export function NycActivitiesClient({ data, canEditData }: NycActivitiesClientProps) {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">NYC Activities</h1>
          <p className="text-muted-foreground">National Youth Council activities and beneficiaries dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://nyc.gm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <Globe className="mr-2 h-4 w-4" />
            Visit NYC Website
          </a>
          {canEditData && <NycActivitiesActions />}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <NycActivitiesOverview data={data} />
        </TabsContent>
        <TabsContent value="analytics">
          <NycActivitiesAnalytics data={data} />
        </TabsContent>
        <TabsContent value="organizations">
          <NycActivitiesOrganizations />
        </TabsContent>
        <TabsContent value="activities">
          <NycActivitiesTable data={data} canEditData={canEditData} />
        </TabsContent>
      </Tabs>

      {canEditData && <NycActivitiesDialogs />}
    </div>
  );
}
