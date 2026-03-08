"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { NycActivitiesType } from "@/db/schema";
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface NycActivitiesAnalyticsProps {
  data: NycActivitiesType[];
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
];

function safeNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

export function NycActivitiesAnalytics({ data }: NycActivitiesAnalyticsProps) {
  const years = [...new Set(data.map((item) => item.year))].sort(
    (a, b) => a - b,
  );
  const yearlyData = years.map((year) => ({
    year: String(year),
    activities: data.filter((item) => item.year === year).length,
    beneficiaries: data
      .filter((item) => item.year === year)
      .reduce((sum, item) => sum + safeNumber(item.beneficiaries), 0),
  }));

  const categories = [...new Set(data.map((item) => item.category))];
  const categoryData = categories.map((category) => ({
    name: category,
    value: data
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + safeNumber(item.beneficiaries), 0),
  }));

  const totalMale = data.reduce((sum, item) => sum + safeNumber(item.male), 0);
  const totalFemale = data.reduce(
    (sum, item) => sum + safeNumber(item.female),
    0,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activities Implemented and Total People Reached</CardTitle>
          <CardDescription>Summary by year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Year</th>
                  <th className="text-center p-4 font-semibold">
                    No. of Activities Implemented
                  </th>
                  <th className="text-center p-4 font-semibold">
                    Total Beneficiaries
                  </th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map((item) => (
                  <tr key={item.year} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{item.year}</td>
                    <td className="p-4 text-center font-bold text-blue-600">
                      {item.activities}
                    </td>
                    <td className="p-4 text-center font-bold text-green-600">
                      {item.beneficiaries.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="p-4">Total</td>
                  <td className="p-4 text-center text-blue-600">
                    {yearlyData.reduce((sum, item) => sum + item.activities, 0)}
                  </td>
                  <td className="p-4 text-center text-green-600">
                    {yearlyData
                      .reduce((sum, item) => sum + item.beneficiaries, 0)
                      .toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activities by Category</CardTitle>
            <CardDescription>Distribution by beneficiaries</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: 8, fontSize: "12px" }}
                />
                <Tooltip
                  formatter={(value) => safeNumber(value).toLocaleString()}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Male vs Female participation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Male", value: totalMale },
                    { name: "Female", value: totalFemale },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label={false}
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#EC4899" />
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: 8, fontSize: "12px" }}
                />
                <Tooltip
                  formatter={(value) => safeNumber(value).toLocaleString()}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
