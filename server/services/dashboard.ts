import "server-only";

import { db } from "@/db";
import {
  nscParticipants,
  nycActivities,
  nyssPrograms,
  youthMigration,
  youthPopulation,
  youthWithDisabilities,
  youthWithoutDisabilities,
} from "@/db/schema";
import { getServerSideSession } from "@/lib/auth-helper";
import { desc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

export interface DashboardChartDatum {
  name: string;
  value: number;
}

export interface DashboardYearlyDatum {
  year: string;
  value: number;
}

export interface DashboardData {
  latestPopulationYear: number | null;
  totalYouthPopulation: number;
  totalBeneficiaries: number;
  totalYouthWithDisabilities: number;
  totalYouthWithoutDisabilities: number;
  totalYouthMigration: number;
  youthPopulationByLga: DashboardChartDatum[];
  youthByResidence: DashboardChartDatum[];
  youthWithDisabilitiesByType: DashboardChartDatum[];
  youthWithoutDisabilitiesByAge: DashboardChartDatum[];
  youthMigrationByDestination: DashboardChartDatum[];
  youthMigrationByYear: DashboardYearlyDatum[];
}

function toNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  const [
    latestYearResult,
    beneficiariesRows,
    nyssRows,
    nscCountRows,
    withDisRows,
    withoutDisRows,
    migrationRows,
  ] = await Promise.all([
    db
      .select({ maxYear: sql<number>`max(${youthPopulation.year})` })
      .from(youthPopulation),
    db.select({ beneficiaries: nycActivities.beneficiaries }).from(nycActivities),
    db.select({ totalGraduates: nyssPrograms.totalGraduates }).from(nyssPrograms),
    db.select({ count: sql<number>`count(*)` }).from(nscParticipants),
    db.select().from(youthWithDisabilities),
    db.select().from(youthWithoutDisabilities),
    db.select().from(youthMigration).orderBy(desc(youthMigration.year)),
  ]);

  const latestPopulationYear = latestYearResult[0]?.maxYear ?? null;

  const populationRows =
    latestPopulationYear === null
      ? []
      : await db
          .select()
          .from(youthPopulation)
          .where(eq(youthPopulation.year, latestPopulationYear))
          .orderBy(youthPopulation.lga);

  const totalYouthPopulation = populationRows.reduce(
    (sum, row) => sum + toNumber(row.youthPopulation),
    0,
  );

  const totalBeneficiaries =
    beneficiariesRows.reduce((sum, row) => sum + toNumber(row.beneficiaries), 0) +
    nyssRows.reduce((sum, row) => sum + toNumber(row.totalGraduates), 0) +
    toNumber(nscCountRows[0]?.count);

  const totalYouthWithDisabilities = withDisRows.reduce(
    (sum, row) => sum + toNumber(row.total),
    0,
  );

  const totalYouthWithoutDisabilities = withoutDisRows.reduce(
    (sum, row) => sum + toNumber(row.total),
    0,
  );

  const totalYouthMigration = migrationRows.reduce(
    (sum, row) => sum + toNumber(row.total),
    0,
  );

  const youthPopulationByLga = populationRows.map((row) => ({
    name: row.lga,
    value: toNumber(row.youthPopulation),
  }));

  const youthByResidence = [
    {
      name: "Urban",
      value: populationRows.reduce((sum, row) => sum + toNumber(row.urbanYouth), 0),
    },
    {
      name: "Rural",
      value: populationRows.reduce((sum, row) => sum + toNumber(row.ruralYouth), 0),
    },
  ];

  const youthWithDisabilitiesByType: DashboardChartDatum[] = [
    {
      name: "Seeing",
      value: withDisRows.reduce((sum, row) => sum + toNumber(row.seeing), 0),
    },
    {
      name: "Hearing",
      value: withDisRows.reduce((sum, row) => sum + toNumber(row.hearing), 0),
    },
    {
      name: "Physical",
      value: withDisRows.reduce((sum, row) => sum + toNumber(row.physical), 0),
    },
    {
      name: "Learning",
      value: withDisRows.reduce((sum, row) => sum + toNumber(row.learning), 0),
    },
    {
      name: "Self-care",
      value: withDisRows.reduce((sum, row) => sum + toNumber(row.selfcare), 0),
    },
    {
      name: "Speech",
      value: withDisRows.reduce((sum, row) => sum + toNumber(row.speech), 0),
    },
  ];

  const youthWithoutDisabilitiesByAge = withoutDisRows.map((row) => ({
    name: row.ageGroup,
    value: toNumber(row.total),
  }));

  const destinationMap = new Map<string, number>();
  for (const row of migrationRows) {
    const key = row.destination || "Unknown";
    destinationMap.set(key, (destinationMap.get(key) ?? 0) + toNumber(row.total));
  }

  const youthMigrationByDestination = [...destinationMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const yearMap = new Map<number, number>();
  for (const row of migrationRows) {
    yearMap.set(row.year, (yearMap.get(row.year) ?? 0) + toNumber(row.total));
  }

  const youthMigrationByYear = [...yearMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, value]) => ({ year: String(year), value }));

  return {
    latestPopulationYear,
    totalYouthPopulation,
    totalBeneficiaries,
    totalYouthWithDisabilities,
    totalYouthWithoutDisabilities,
    totalYouthMigration,
    youthPopulationByLga,
    youthByResidence,
    youthWithDisabilitiesByType,
    youthWithoutDisabilitiesByAge,
    youthMigrationByDestination,
    youthMigrationByYear,
  };
};
