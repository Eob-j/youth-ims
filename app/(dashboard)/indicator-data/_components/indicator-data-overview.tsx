"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IndicatorDataType } from "@/db/schema";
import { DollarSign, GraduationCap, MapPin, Trophy, Users } from "lucide-react";

interface IndicatorDataOverviewProps {
  data: IndicatorDataType[];
}

export function IndicatorDataOverview({ data }: IndicatorDataOverviewProps) {
  const totalBeneficiaries = data.reduce((sum, item) => sum + Number(item.total ?? 0), 0);
  const uniqueRegions = new Set(data.map((item) => item.region)).size;
  const financeTotal = data.filter((item) => item.category === "finance").reduce((sum, item) => sum + Number(item.total ?? 0), 0);
  const trainingTotal = data
    .filter((item) => item.category === "training")
    .reduce((sum, item) => sum + Number(item.total ?? 0), 0);
  const sportFinancingTotal = data
    .filter((item) => item.category === "sport_financing")
    .reduce((sum, item) => sum + Number(item.total ?? 0), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Beneficiaries</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBeneficiaries.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Across all programs</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Finance Access</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{financeTotal.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Youth with business finance</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Training Graduates</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{trainingTotal.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Skills & entrepreneurship</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sport Financing</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sportFinancingTotal.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Sport financing beneficiaries</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Regional Coverage</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueRegions}</div>
          <p className="text-xs text-muted-foreground">Regions covered</p>
        </CardContent>
      </Card>
    </div>
  );
}

