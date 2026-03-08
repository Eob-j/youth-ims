"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { NycActivitiesType } from "@/db/schema";
import { Calendar, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface NycActivitiesOverviewProps {
  data: NycActivitiesType[];
}

function safeNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

export function NycActivitiesOverview({ data }: NycActivitiesOverviewProps) {
  const totalActivities = data.length;
  const totalBeneficiaries = data.reduce((sum, item) => sum + safeNumber(item.beneficiaries), 0);
  const totalMale = data.reduce((sum, item) => sum + safeNumber(item.male), 0);
  const totalFemale = data.reduce((sum, item) => sum + safeNumber(item.female), 0);

  const years = [...new Set(data.map((item) => item.year))].sort((a, b) => a - b);
  const yearlyData = years.map((year) => ({
    year: String(year),
    activities: data.filter((item) => item.year === year).length,
    beneficiaries: data
      .filter((item) => item.year === year)
      .reduce((sum, item) => sum + safeNumber(item.beneficiaries), 0),
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-muted-foreground">Across all programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beneficiaries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBeneficiaries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Youth reached</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Male Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalMale.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalBeneficiaries > 0 ? Math.round((totalMale / totalBeneficiaries) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Female Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{totalFemale.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalBeneficiaries > 0 ? Math.round((totalFemale / totalBeneficiaries) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yearly Activity Trends</CardTitle>
          <CardDescription>Activities and beneficiaries by year</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={yearlyData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" interval={0} tickMargin={8} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: 8 }} />
              <Bar yAxisId="left" dataKey="activities" fill="#3B82F6" name="Activities" />
              <Bar yAxisId="right" dataKey="beneficiaries" fill="#10B981" name="Beneficiaries" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
