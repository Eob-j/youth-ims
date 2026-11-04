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
import { asc, desc, eq, sql } from "drizzle-orm";
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

// SUM() of no rows is NULL; COUNT/SUM results come back from Postgres as text.
const sumOf = (column: unknown) => sql<string>`coalesce(sum(${column}), 0)`;

export const getDashboardData = async (): Promise<DashboardData> => {
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }
  return loadDashboardData();
};

// Totals are summed in the database, so only small result sets are fetched
// rather than whole tables.
export async function loadDashboardData(): Promise<DashboardData> {
  const migrationDestination = sql<string>`coalesce(nullif(${youthMigration.destination}, ''), 'Unknown')`;

  const [
    [latestYearResult],
    [beneficiaries],
    [graduates],
    [nscCount],
    [disabilities],
    withoutDisRows,
    [migrationTotal],
    migrationByDestination,
    migrationByYear,
  ] = await Promise.all([
    db
      .select({ maxYear: sql<number | null>`max(${youthPopulation.year})` })
      .from(youthPopulation),
    db.select({ total: sumOf(nycActivities.beneficiaries) }).from(nycActivities),
    db.select({ total: sumOf(nyssPrograms.totalGraduates) }).from(nyssPrograms),
    db.select({ count: sql<string>`count(*)` }).from(nscParticipants),
    db
      .select({
        total: sumOf(youthWithDisabilities.total),
        seeing: sumOf(youthWithDisabilities.seeing),
        hearing: sumOf(youthWithDisabilities.hearing),
        physical: sumOf(youthWithDisabilities.physical),
        learning: sumOf(youthWithDisabilities.learning),
        selfcare: sumOf(youthWithDisabilities.selfcare),
        speech: sumOf(youthWithDisabilities.speech),
      })
      .from(youthWithDisabilities),
    // One small row per age group, which the chart needs anyway.
    db
      .select({
        ageGroup: youthWithoutDisabilities.ageGroup,
        total: youthWithoutDisabilities.total,
      })
      .from(youthWithoutDisabilities),
    db.select({ total: sumOf(youthMigration.total) }).from(youthMigration),
    db
      .select({ name: migrationDestination, value: sumOf(youthMigration.total) })
      .from(youthMigration)
      .groupBy(migrationDestination)
      .orderBy(desc(sumOf(youthMigration.total)), asc(migrationDestination))
      .limit(8),
    db
      .select({ year: youthMigration.year, value: sumOf(youthMigration.total) })
      .from(youthMigration)
      .groupBy(youthMigration.year)
      .orderBy(asc(youthMigration.year)),
  ]);

  const latestPopulationYear = latestYearResult?.maxYear ?? null;

  // One row per LGA for the latest year, which the chart needs anyway.
  const populationRows =
    latestPopulationYear === null
      ? []
      : await db
          .select({
            lga: youthPopulation.lga,
            youthPopulation: youthPopulation.youthPopulation,
            urbanYouth: youthPopulation.urbanYouth,
            ruralYouth: youthPopulation.ruralYouth,
          })
          .from(youthPopulation)
          .where(eq(youthPopulation.year, latestPopulationYear))
          .orderBy(youthPopulation.lga);

  return {
    latestPopulationYear,
    totalYouthPopulation: populationRows.reduce(
      (sum, row) => sum + toNumber(row.youthPopulation),
      0,
    ),
    totalBeneficiaries:
      toNumber(beneficiaries.total) +
      toNumber(graduates.total) +
      toNumber(nscCount.count),
    totalYouthWithDisabilities: toNumber(disabilities.total),
    totalYouthWithoutDisabilities: withoutDisRows.reduce(
      (sum, row) => sum + toNumber(row.total),
      0,
    ),
    totalYouthMigration: toNumber(migrationTotal.total),
    youthPopulationByLga: populationRows.map((row) => ({
      name: row.lga,
      value: toNumber(row.youthPopulation),
    })),
    youthByResidence: [
      {
        name: "Urban",
        value: populationRows.reduce((sum, row) => sum + toNumber(row.urbanYouth), 0),
      },
      {
        name: "Rural",
        value: populationRows.reduce((sum, row) => sum + toNumber(row.ruralYouth), 0),
      },
    ],
    youthWithDisabilitiesByType: [
      { name: "Seeing", value: toNumber(disabilities.seeing) },
      { name: "Hearing", value: toNumber(disabilities.hearing) },
      { name: "Physical", value: toNumber(disabilities.physical) },
      { name: "Learning", value: toNumber(disabilities.learning) },
      { name: "Self-care", value: toNumber(disabilities.selfcare) },
      { name: "Speech", value: toNumber(disabilities.speech) },
    ],
    youthWithoutDisabilitiesByAge: withoutDisRows.map((row) => ({
      name: row.ageGroup,
      value: toNumber(row.total),
    })),
    youthMigrationByDestination: migrationByDestination.map((row) => ({
      name: row.name,
      value: toNumber(row.value),
    })),
    youthMigrationByYear: migrationByYear.map((row) => ({
      year: String(row.year),
      value: toNumber(row.value),
    })),
  };
}
