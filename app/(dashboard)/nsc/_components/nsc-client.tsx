"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NscParticipantsType } from "@/db/schema";
import { Globe, PieChart, Table2, Trophy } from "lucide-react";
import { NscActions } from "./nsc-actions";
import { NscAnalytics } from "./nsc-analytics";
import { NscDialogs } from "./nsc-dialogs";
import { NscStatistics } from "./nsc-statistics";
import { NscTable } from "./nsc-table";

interface NscClientProps {
  data: NscParticipantsType[];
  canEditData: boolean;
}

export function NscClient({ data, canEditData }: NscClientProps) {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">NSC</h1>
          <p className="text-muted-foreground">National Sports Council comprehensive data and management system</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://nsc.gm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <Globe className="mr-2 h-4 w-4" />
            Visit NSC Website
          </a>
          {canEditData && <NscActions />}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Regional Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <NscAnalytics data={data} />
        </TabsContent>
        <TabsContent value="participants">
          <NscTable data={data} canEditData={canEditData} />
        </TabsContent>
        <TabsContent value="statistics">
          <NscStatistics data={data} />
        </TabsContent>
      </Tabs>

      {canEditData && <NscDialogs />}
    </div>
  );
}
