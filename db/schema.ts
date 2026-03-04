import { sql } from "drizzle-orm";
import {
  check,
  decimal,
  integer,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", {
    mode: "date",
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const youthPopulation = pgTable(
  "youth_population",
  {
    id: serial("id").primaryKey(),

    lga: varchar("lga", { length: 255 }).notNull(),
    year: integer("year").notNull(),

    totalPopulation: integer("total_population").notNull(),
    youthPopulation: integer("youth_population").notNull(),

    youthShare: decimal("youth_share", {
      precision: 5,
      scale: 2,
    }).generatedAlwaysAs(
      sql`ROUND(
            CASE 
              WHEN total_population = 0 THEN 0
              ELSE (youth_population::decimal / total_population) * 100
            END,
          2)`,
    ),

    maleYouth: integer("male_youth").notNull(),
    femaleYouth: integer("female_youth").notNull(),
    urbanYouth: integer("urban_youth").notNull(),
    ruralYouth: integer("rural_youth").notNull(),

    // ✅ Optimistic Locking
    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("unique_lga_year").on(table.lga, table.year),

    check(
      "youth_less_than_total",
      sql`${table.youthPopulation} <= ${table.totalPopulation}`,
    ),

    check(
      "gender_sum_check",
      sql`${table.maleYouth} + ${table.femaleYouth} = ${table.youthPopulation}`,
    ),

    check(
      "residence_sum_check",
      sql`${table.urbanYouth} + ${table.ruralYouth} = ${table.youthPopulation}`,
    ),
  ],
);

export const youthWithDisabilities = pgTable(
  "youth_with_disabilities",
  {
    id: serial("id").primaryKey(),

    ageGroup: varchar("age_group", { length: 20 }).notNull(),

    total: integer("total").notNull(),
    male: integer("male").notNull(),
    female: integer("female").notNull(),

    urban: integer("urban").notNull(),
    rural: integer("rural").notNull(),

    seeing: integer("seeing").notNull(),
    hearing: integer("hearing").notNull(),
    physical: integer("physical").notNull(),
    learning: integer("learning").notNull(),
    selfcare: integer("selfcare").notNull(),
    speech: integer("speech").notNull(),

    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    // Age Group integrity
    uniqueIndex("unique_age_group").on(table.ageGroup),
    // Gender integrity
    check("ywd_gender_sum_check", sql`male + female = total`),

    // Location integrity
    check("ywd_location_sum_check", sql`urban + rural = total`),
  ],
);

export const youthWithoutDisabilities = pgTable(
  "youth_without_disabilities",
  {
    id: serial("id").primaryKey(),

    ageGroup: varchar("age_group", { length: 20 }).notNull(),

    total: integer("total").notNull(),
    male: integer("male").notNull(),
    female: integer("female").notNull(),

    urban: integer("urban").notNull(),
    rural: integer("rural").notNull(),

    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    // Logical uniqueness (same reasoning as previous table)
    uniqueIndex("ywod_unique_age_group").on(table.ageGroup),

    // Gender integrity
    check("ywod_gender_sum_check", sql`male + female = total`),

    // Location integrity
    check("ywod_location_sum_check", sql`urban + rural = total`),
  ],
);

export const humanTrafficking = pgTable(
  "human_trafficking",
  {
    id: serial("id").primaryKey(),

    year: integer("year").notNull(),

    total: integer("total").notNull(),
    male: integer("male").notNull(),
    female: integer("female").notNull(),

    ageGroup: varchar("age_group", { length: 20 }).notNull(),

    lga: varchar("lga", { length: 100 }).notNull(),

    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    // Prevent duplicate records for same demographic slice
    uniqueIndex("ht_unique_year_lga_agegroup").on(
      table.year,
      table.lga,
      table.ageGroup,
    ),

    // Gender integrity
    check("ht_gender_sum_check", sql`male + female = total`),

    // Prevent negative values
    check(
      "ht_non_negative_check",
      sql`
          total >= 0 AND
          male >= 0 AND
          female >= 0
        `,
    ),
  ],
);

export const youthMigration = pgTable(
  "youth_migration",
  {
    id: serial("id").primaryKey(),

    year: integer("year").notNull(),

    total: integer("total").notNull(),
    male: integer("male").notNull(),
    female: integer("female").notNull(),

    origin: varchar("origin", { length: 100 }).notNull(),
    destination: varchar("destination", { length: 100 }).notNull(),

    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("ym_unique_year_origin_destination").on(
      table.year,
      table.origin,
      table.destination,
    ),

    check("ym_gender_sum_check", sql`male + female = total`),
    check(
      "ym_non_negative_check",
      sql`
          total >= 0 AND
          male >= 0 AND
          female >= 0
        `,
    ),
  ],
);

export const sportsFinancing = pgTable(
  "sports_financing",
  {
    id: serial("id").primaryKey(),

    associationName: varchar("association_name", {
      length: 255,
    }).notNull(),

    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),

    year: integer("year").notNull(),

    period: varchar("period", { length: 200 }).notNull(),

    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    // Logical uniqueness
    uniqueIndex("sf_unique_association_year_period").on(
      table.associationName,
      table.year,
      table.period,
    ),

    // Non-negative funding
    check("sf_non_negative_amount_check", sql`amount >= 0`),
  ],
);

export const nediPrograms = pgTable(
  "nedi_programs",
  {
    id: varchar("id", { length: 50 }).primaryKey(),

    programName: varchar("program_name", { length: 255 }).notNull(),

    targetGroup: varchar("target_group", { length: 255 }).notNull(),

    beneficiaries: integer("beneficiaries").notNull(),

    serviceType: varchar("service_type", { length: 255 }).notNull(),

    description: varchar("description", { length: 1000 }).notNull(),

    status: varchar("status", { length: 50 }).notNull(),

    location: varchar("location", { length: 255 }).notNull(),

    maleParticipants: integer("male_participants"),
    femaleParticipants: integer("female_participants"),

    startDate: varchar("start_date", { length: 50 }).notNull(),
    endDate: varchar("end_date", { length: 50 }),

    implementingPartner: varchar("implementing_partner", {
      length: 255,
    }),

    fundingSource: varchar("funding_source", {
      length: 255,
    }),

    version: integer("version").notNull().default(1),
  },
  (table) => {
    return {
      // Logical uniqueness of a program instance
      uniqueProgramInstance: uniqueIndex("nedi_unique_program_instance").on(
        table.programName,
        table.startDate,
        table.location,
      ),

      // Prevent negative values
      nonNegativeCheck: check(
        "nedi_non_negative_check",
        sql`
          beneficiaries >= 0 AND
          (male_participants IS NULL OR male_participants >= 0) AND
          (female_participants IS NULL OR female_participants >= 0)
        `,
      ),

      // If both male and female provided, must equal beneficiaries
      participantSumCheck: check(
        "nedi_participant_sum_check",
        sql`
          (
            male_participants IS NULL OR
            female_participants IS NULL
          )
          OR
          (male_participants + female_participants = beneficiaries)
        `,
      ),

      // End date must not be before start date
      dateOrderCheck: check(
        "nedi_date_order_check",
        sql`
          end_date IS NULL
          OR
          end_date >= start_date
        `,
      ),

      // Restrict allowed status values
      validStatusCheck: check(
        "nedi_valid_status_check",
        sql`
          status IN (
            'Planned',
            'Ongoing',
            'Completed',
            'Suspended',
            'Cancelled'
          )
        `,
      ),
    };
  },
);

export type SportsFinancingType = typeof sportsFinancing.$inferSelect;

export type YouthMigrationType = typeof youthMigration.$inferSelect;
export type HumanTraffickingType = typeof humanTrafficking.$inferSelect;

export type YouthWithoutDisabilitiesType =
  typeof youthWithoutDisabilities.$inferSelect;
export type YouthPopulationType = typeof youthPopulation.$inferSelect;
export type YouthWithDisabilitiesType =
  typeof youthWithDisabilities.$inferSelect;
