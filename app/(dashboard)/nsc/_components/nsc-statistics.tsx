"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { NscParticipantsType } from "@/db/schema";

interface NscStatisticsProps {
  data: NscParticipantsType[];
}

const categories = [
  "Amateur",
  "Professional",
  "Paralympic",
  "Student Athlete",
  "National Team",
  "International-based",
];

export function NscStatistics({ data }: NscStatisticsProps) {
  const regions = [...new Set(data.map((item) => item.region))].sort();

  const regionalStats = regions.map((region) => {
    const regionRows = data.filter((item) => item.region === region);
    const categoryBreakdown = categories.map((category) => {
      const categoryRows = regionRows.filter(
        (item) => item.category === category,
      );
      return {
        male: categoryRows.filter((item) => item.gender === "Male").length,
        female: categoryRows.filter((item) => item.gender === "Female").length,
      };
    });

    return {
      region,
      breakdown: categoryBreakdown,
      total: regionRows.length,
    };
  });

  const totals = categories.map((category) => {
    const rows = data.filter((item) => item.category === category);
    return {
      male: rows.filter((item) => item.gender === "Male").length,
      female: rows.filter((item) => item.gender === "Female").length,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Statistics</CardTitle>
        <CardDescription>
          Comprehensive breakdown by region and category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Region</th>
                {categories.map((category) => (
                  <th
                    key={category}
                    className="border p-2 text-center"
                    colSpan={2}
                  >
                    {category}
                  </th>
                ))}
                <th className="border p-2 text-center">Total</th>
              </tr>
              <tr className="bg-muted/60">
                <th className="border p-2" />
                {categories.flatMap((category) => [
                  <th key={`${category}-m`} className="border p-2 text-xs">
                    M
                  </th>,
                  <th key={`${category}-f`} className="border p-2 text-xs">
                    F
                  </th>,
                ])}
                <th className="border p-2" />
              </tr>
            </thead>
            <tbody>
              {regionalStats.map((stat) => (
                <tr key={stat.region} className="hover:bg-muted/40">
                  <td className="border p-2 font-medium">{stat.region}</td>
                  {stat.breakdown.flatMap((entry, idx) => [
                    <td
                      key={`${stat.region}-${idx}-m`}
                      className="border p-2 text-center"
                    >
                      {entry.male}
                    </td>,
                    <td
                      key={`${stat.region}-${idx}-f`}
                      className="border p-2 text-center"
                    >
                      {entry.female}
                    </td>,
                  ])}
                  <td className="border p-2 text-center font-bold">
                    {stat.total}
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="border p-2">TOTAL</td>
                {totals.flatMap((entry, idx) => [
                  <td key={`total-${idx}-m`} className="border p-2 text-center">
                    {entry.male}
                  </td>,
                  <td key={`total-${idx}-f`} className="border p-2 text-center">
                    {entry.female}
                  </td>,
                ])}
                <td className="border p-2 text-center text-lg">
                  {data.length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
