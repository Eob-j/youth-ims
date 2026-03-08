"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { IndicatorDataType } from "@/db/schema";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface IndicatorDataAnalyticsProps {
  data: IndicatorDataType[];
  years: number[];
  orgSummaryData: Array<{
    name: string;
    fullName: string;
    beneficiaries: number;
    color: string;
  }>;
}

export function IndicatorDataAnalytics({ data, years, orgSummaryData }: IndicatorDataAnalyticsProps) {
  const financeTotal = data.filter((item) => item.category === "finance").reduce((sum, item) => sum + Number(item.total ?? 0), 0);
  const trainingTotal = data.filter((item) => item.category === "training").reduce((sum, item) => sum + Number(item.total ?? 0), 0);
  const sportFinancingTotal = data
    .filter((item) => item.category === "sport_financing")
    .reduce((sum, item) => sum + Number(item.total ?? 0), 0);

  const yearlyData = years.map((year) => ({
    year: year.toString(),
    NEDI: data.filter((item) => item.organization === "NEDI" && item.year === year).reduce((sum, item) => sum + Number(item.total ?? 0), 0),
    PIA: data.filter((item) => item.organization === "PIA" && item.year === year).reduce((sum, item) => sum + Number(item.total ?? 0), 0),
    GSI: data.filter((item) => item.organization === "GSI" && item.year === year).reduce((sum, item) => sum + Number(item.total ?? 0), 0),
    NYSS: data.filter((item) => item.organization === "NYSS" && item.year === year).reduce((sum, item) => sum + Number(item.total ?? 0), 0),
    NSC: data.filter((item) => item.organization === "NSC" && item.year === year).reduce((sum, item) => sum + Number(item.total ?? 0), 0),
    NYC: data.filter((item) => item.organization === "NYC" && item.year === year).reduce((sum, item) => sum + Number(item.total ?? 0), 0),
  }));

  const categoryData = [
    { name: "Finance Access", value: financeTotal, color: "#10B981" },
    { name: "Training Programs", value: trainingTotal, color: "#3B82F6" },
    { name: "Sport Financing", value: sportFinancingTotal, color: "#DC2626" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Yearly Performance Trends</CardTitle>
          <CardDescription>Beneficiaries by organization and year</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={yearlyData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tickMargin={8} />
              <YAxis />
              <Tooltip formatter={(value) => new Intl.NumberFormat().format(Number(value ?? 0))} />
              <Legend wrapperStyle={{ paddingTop: 8 }} />
              <Bar dataKey="NEDI" fill="#3B82F6" name="NEDI" />
              <Bar dataKey="PIA" fill="#8B5CF6" name="PIA" />
              <Bar dataKey="GSI" fill="#10B981" name="GSI" />
              <Bar dataKey="NYSS" fill="#F59E0B" name="NYSS" />
              <Bar dataKey="NSC" fill="#DC2626" name="NSC" />
              <Bar dataKey="NYC" fill="#334155" name="NYC" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization Distribution</CardTitle>
            <CardDescription>Total beneficiaries by organization</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={orgSummaryData} dataKey="beneficiaries" nameKey="name" outerRadius={95} label={false}>
                  {orgSummaryData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 8, fontSize: "12px" }} />
                <Tooltip formatter={(value) => new Intl.NumberFormat().format(Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Finance vs Training vs Sport Financing</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={95} label={false}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 8, fontSize: "12px" }} />
                <Tooltip formatter={(value) => new Intl.NumberFormat().format(Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

