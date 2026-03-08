"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registeredOrgsSummary, registeredYouthOrgsData } from "@/lib/registered-orgs-data";
import { useNycActivitiesStore } from "@/store/nyc-activities-store";

export function NycActivitiesOrganizations() {
  const { selectedOrgRegion, setSelectedOrgRegion } = useNycActivitiesStore();

  const regions = [...new Set(registeredYouthOrgsData.map((org) => org.region))].sort();
  const filtered =
    selectedOrgRegion === "all"
      ? registeredYouthOrgsData
      : registeredYouthOrgsData.filter((org) => org.region === selectedOrgRegion);

  const countsByRegion = Object.entries(registeredOrgsSummary.byRegion);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registered Youth Organizations</CardTitle>
          <CardDescription>
            Total of {registeredOrgsSummary.totalRegistered} organizations across all regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {countsByRegion.map(([region, count]) => (
              <div key={region} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-600 mt-1">{region}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization Filter</CardTitle>
          <CardDescription>Filter organizations by region</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="org-region-filter">Region:</Label>
            <Select value={selectedOrgRegion} onValueChange={setSelectedOrgRegion}>
              <SelectTrigger id="org-region-filter" className="w-44">
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

          <div className="text-sm text-muted-foreground">
            Showing {filtered.length.toLocaleString()} organization
            {filtered.length === 1 ? "" : "s"}.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
