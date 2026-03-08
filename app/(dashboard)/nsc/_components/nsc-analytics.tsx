"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { NscParticipantsType } from "@/db/schema";
import { Trophy, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface NscAnalyticsProps {
  data: NscParticipantsType[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function NscAnalytics({ data }: NscAnalyticsProps) {
  const totalParticipants = data.length;
  const professionalCount = data.filter((item) => item.category === "Professional").length;
  const nationalTeamCount = data.filter((item) => item.category === "National Team").length;
  const internationalCount = data.filter((item) => item.category === "International-based").length;

  const regions = [...new Set(data.map((item) => item.region))];
  const regionalData = regions.map((region) => {
    const rows = data.filter((item) => item.region === region);
    return {
      region,
      male: rows.filter((item) => item.gender === "Male").length,
      female: rows.filter((item) => item.gender === "Female").length,
    };
  });

  const categoryNames = [
    "Amateur",
    "Professional",
    "Paralympic",
    "Student Athlete",
    "National Team",
    "International-based",
  ];

  const categoryData = categoryNames.map((category) => ({
    name: category,
    value: data.filter((item) => item.category === category).length,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Registered participants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professional</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professionalCount}</div>
            <p className="text-xs text-muted-foreground">Professional athletes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">National Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nationalTeamCount}</div>
            <p className="text-xs text-muted-foreground">National team members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">International</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internationalCount}</div>
            <p className="text-xs text-muted-foreground">International-based</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
            <CardDescription>Participants by region and gender</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={regionalData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" tickMargin={8} />
                <YAxis />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
                <Bar dataKey="male" fill="#0088FE" name="Male" />
                <Bar dataKey="female" fill="#FF8042" name="Female" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Participants by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={105} label={false}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 8, fontSize: "12px" }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
