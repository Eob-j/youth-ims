import { sql } from "drizzle-orm";
import {
  check,
  date,
  decimal,
  integer,
  pgEnum,
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

export const nscGenderEnum = pgEnum("nsc_gender", ["Male", "Female"]);
export const nscStatusEnum = pgEnum("nsc_status", [
  "Active",
  "Inactive",
  "Retired",
]);

export const nscParticipants = pgTable(
  "nsc_participants",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    age: integer("age").notNull().default(0),
    gender: nscGenderEnum().notNull(),
    region: varchar("region", { length: 100 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    sport: varchar("sport", { length: 150 }).notNull(),
    level: varchar("level", { length: 100 }).notNull(),
    status: nscStatusEnum().notNull().default("Active"),
    achievements: varchar("achievements", { length: 2000 }),
    dateRegistered: date("date_registered").notNull(),
    contact: varchar("contact", { length: 255 }),
    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    check("nsc_participants_age_non_negative_check", sql`${table.age} >= 0`),
  ],
);

export const nycParticipants = pgTable(
  "nyc_participants",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    age: integer("age").notNull().default(0),
    gender: nscGenderEnum().notNull(),
    region: varchar("region", { length: 100 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    sport: varchar("sport", { length: 150 }).notNull(),
    level: varchar("level", { length: 100 }).notNull(),
    status: nscStatusEnum().notNull().default("Active"),
    achievements: varchar("achievements", { length: 2000 }),
    dateRegistered: date("date_registered").notNull(),
    contact: varchar("contact", { length: 255 }),
    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    check("nyc_participants_age_non_negative_check", sql`${table.age} >= 0`),
  ],
);

export const nycActivitiesStatusEnum = pgEnum("nyc_activities_status", [
  "Completed",
  "Ongoing",
  "Planned",
]);

export const nycActivities = pgTable(
  "nyc_activities",
  {
    id: serial("id").primaryKey(),
    activityName: varchar("activity_name", { length: 255 }).notNull(),
    category: varchar("category", { length: 150 }).notNull(),
    region: varchar("region", { length: 100 }).notNull(),
    year: integer("year").notNull(),
    beneficiaries: integer("beneficiaries").notNull().default(0),
    male: integer("male").notNull().default(0),
    female: integer("female").notNull().default(0),
    fundingPartner: varchar("funding_partner", { length: 255 }).notNull(),
    description: varchar("description", { length: 2000 }).notNull(),
    status: nycActivitiesStatusEnum().notNull().default("Planned"),
    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    check(
      "nyc_activities_non_negative_check",
      sql`
        ${table.beneficiaries} >= 0 AND
        ${table.male} >= 0 AND
        ${table.female} >= 0
      `,
    ),
  ],
);

export const piaStudents = pgTable(
  "pia_students",
  {
    id: serial("id").primaryKey(),

    department: varchar("department", { length: 255 }).notNull(),
    year: varchar("year", { length: 50 }).notNull(),

    male: integer("male").notNull(),
    female: integer("female").notNull(),
    enrolled: integer("enrolled").notNull(),
    graduated: integer("graduated").notNull(),
    version: integer("version").notNull().default(1),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("pia_students_unique_department_year").on(
      table.department,
      table.year,
    ),
    check(
      "pia_students_non_negative_check",
      sql`
        male >= 0 AND
        female >= 0 AND
        enrolled >= 0 AND
        graduated >= 0
      `,
    ),
    check(
      "pia_students_gender_sum_check",
      sql`${table.male} + ${table.female} = ${table.enrolled}`,
    ),
    check(
      "pia_students_graduated_check",
      sql`${table.graduated} <= ${table.enrolled}`,
    ),
  ],
);

export const statusEnum = pgEnum("status", [
  "Planned",
  "Ongoing",
  "Completed",
  "Operational",
]);

export const nediPrograms = pgTable(
  "nedi_programs",
  {
    id: serial("id").primaryKey(),
    programName: varchar("program_name", { length: 255 }).notNull(),
    targetGroup: varchar("target_group", { length: 255 }).notNull(),
    beneficiaries: integer("beneficiaries"),
    serviceType: varchar("service_type", { length: 255 }).notNull(),
    description: varchar("description", { length: 1000 }).notNull(),
    status: statusEnum().notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    maleParticipants: integer("male_participants"),
    femaleParticipants: integer("female_participants"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    implementingPartner: varchar("implementing_partner", {
      length: 255,
    }).notNull(),
    fundingSource: varchar("funding_source", {
      length: 255,
    }).notNull(),
    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("nedi_unique_program_instance").on(
      table.programName,
      table.startDate,
      table.location,
    ),
  ],
);

export const nyssPrograms = pgTable(
  "nyss_programs",
  {
    id: serial("id").primaryKey(),
    programName: varchar("program_name", { length: 255 }).notNull(),
    institution: varchar("institution", { length: 255 }),
    year: integer("year").notNull(),
    region: varchar("region", { length: 255 }),
    sector: varchar("sector", { length: 255 }),
    totalGraduates: integer("total_graduates"),
    maleGraduates: integer("male_graduates"),
    femaleGraduates: integer("female_graduates"),
    employmentRate: decimal("employment_rate", { precision: 5, scale: 2 }),
    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    check(
      "nyss_programs_non_negative_check",
      sql`
      coalesce(${table.totalGraduates}, 0) >= 0 AND
      coalesce(${table.maleGraduates}, 0) >= 0 AND
      coalesce(${table.femaleGraduates}, 0) >= 0
    `,
    ),
  ],
);

export const nyssGraduates = pgTable(
  "nyss_graduates",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    age: integer("age").notNull(),
    gender: varchar("gender", { length: 255 }).notNull(),
    region: varchar("region", { length: 255 }).notNull(),
    trainingProgram: varchar("training_program", { length: 255 }).notNull(),
    graduationYear: varchar("graduation_year", { length: 4 }).notNull(),
    employmentStatus: varchar("employment_status", { length: 255 }).notNull(),
    sector: varchar("sector", { length: 255 }).notNull(),
    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    check("nyss_graduates_non_negative_age_check", sql`${table.age} >= 0`),
  ],
);

export const indicatorData = pgTable(
  "indicator_data",
  {
    id: serial("id").primaryKey(),
    organization: varchar("organization", { length: 1000 }).notNull(),
    indicator: varchar("indicator", { length: 1000 }).notNull(),
    year: integer("year").notNull(),
    region: varchar("region", { length: 100 }).notNull(),
    male: integer("male").notNull(),
    female: integer("female").notNull(),
    total: integer("total").notNull(),
    referenceSource: varchar("reference_source", { length: 1000 }).notNull(),
    category: varchar("category", { length: 1000 }).notNull(),
    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    check(
      "indicator_data_non_negative_check",
      sql`
      ${table.male} >= 0 AND
      ${table.female} >= 0 AND
      ${table.total} >= 0
    `,
    ),
    check(
      "indicator_data_total_sum_check",
      sql`${table.male} + ${table.female} = ${table.total}`,
    ),
  ],
);

export type SportsFinancingType = typeof sportsFinancing.$inferSelect;
export type NscParticipantsType = typeof nscParticipants.$inferSelect;
export type NycParticipantsType = typeof nycParticipants.$inferSelect;
export type NycActivitiesType = typeof nycActivities.$inferSelect;
export type PiaStudentsType = typeof piaStudents.$inferSelect;
export type NediProgramsType = typeof nediPrograms.$inferSelect;
export type NyssProgramsType = typeof nyssPrograms.$inferSelect;
export type NyssGraduatesType = typeof nyssGraduates.$inferSelect;
export type IndicatorDataType = typeof indicatorData.$inferSelect;

export type YouthMigrationType = typeof youthMigration.$inferSelect;
export type HumanTraffickingType = typeof humanTrafficking.$inferSelect;

export type YouthWithoutDisabilitiesType =
  typeof youthWithoutDisabilities.$inferSelect;
export type YouthPopulationType = typeof youthPopulation.$inferSelect;
export type YouthWithDisabilitiesType =
  typeof youthWithDisabilities.$inferSelect;
