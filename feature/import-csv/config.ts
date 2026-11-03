import { z } from "zod";
import {
  humanTrafficking,
  nediPrograms,
  nycParticipants,
  nscParticipants,
  nycActivities,
  nyssGraduates,
  nyssPrograms,
  youthMigration,
  youthPopulation,
  youthWithDisabilities,
  youthWithoutDisabilities,
} from "@/db/schema";
import { toIsoDate } from "@/lib/importer/parse-file";
import { ColumnDefinition, ImportConfig } from "@/lib/importer/types";

// For tables where the database requires total = male + female: the file may
// leave Total out and it is filled in.
const totalOfMaleAndFemale: ColumnDefinition = {
  type: "computed-if-missing",
  compute: (row: any) => Number(row.male) + Number(row.female),
};

export const youthPopulationImportConfig: ImportConfig<any> = {
  table: youthPopulation,

  conflictStrategy: "error",

  // Same labels and order as the table in the UI. Files may use either the
  // label ("Total Population") or the key ("totalPopulation").
  columns: {
    lga: { type: "required", header: "LGA" },
    totalPopulation: { type: "required", header: "Total Population" },

    // Always male + female youth, so it can be left out of the file.
    youthPopulation: {
      type: "computed-if-missing",
      header: "Youth Population",
      compute: (row: any) => Number(row.maleYouth) + Number(row.femaleYouth),
    },

    maleYouth: { type: "required", header: "Male Youth" },
    femaleYouth: { type: "required", header: "Female Youth" },
    urbanYouth: { type: "required", header: "Urban Youth" },
    ruralYouth: { type: "required", header: "Rural Youth" },

    year: {
      type: "required",
      header: "Year",
      compute: () => new Date().getFullYear(),
    },

    youthShare: {
      type: "computed",
      header: "Youth Share (%)",
      compute: (row: any) => {
        if (!row.totalPopulation) return 0;
        return ((row.youthPopulation / row.totalPopulation) * 100).toFixed(2);
      },
    },
  },

  schema: z.object({
    lga: z.string(),
    year: z.int(),
    totalPopulation: z.int(),
    youthPopulation: z.int(),
    maleYouth: z.int(),
    femaleYouth: z.int(),
    urbanYouth: z.int(),
    ruralYouth: z.int(),
  }),
};

export const youthWithDisabilitiesImportConfig: ImportConfig<any> = {
  table: youthWithDisabilities,

  conflictStrategy: "error",

  // Same labels and order as the table in the UI.
  columns: {
    ageGroup: { type: "required", header: "Age Group" },
    total: { ...totalOfMaleAndFemale, header: "Total" },
    male: { type: "required", header: "Male" },
    female: { type: "required", header: "Female" },
    urban: { type: "required", header: "Urban" },
    rural: { type: "required", header: "Rural" },
    seeing: { type: "required", header: "Seeing" },
    hearing: { type: "required", header: "Hearing" },
    physical: { type: "required", header: "Physical" },
    learning: { type: "required", header: "Learning" },
    selfcare: { type: "required", header: "Self-care" },
    speech: { type: "required", header: "Speech" },
  },

  schema: z.object({
    ageGroup: z.string(),
    total: z.int(),
    male: z.int(),
    female: z.int(),
    urban: z.int(),
    rural: z.int(),
    seeing: z.int(),
    hearing: z.int(),
    physical: z.int(),
    learning: z.int(),
    selfcare: z.int(),
    speech: z.int(),
  }),
};
// todo implement a more robust validation for this youth import config

export const youthWithoutDisabilitiesImportConfig: ImportConfig<any> = {
  table: youthWithoutDisabilities,

  conflictStrategy: "error",

  // Same labels and order as the table in the UI.
  columns: {
    ageGroup: { type: "required", header: "Age Group" },
    total: { ...totalOfMaleAndFemale, header: "Total" },
    male: { type: "required", header: "Male" },
    female: { type: "required", header: "Female" },
    urban: { type: "required", header: "Urban" },
    rural: { type: "required", header: "Rural" },
  },

  schema: z.object({
    ageGroup: z.string(),
    total: z.int(),
    male: z.int(),
    female: z.int(),
    urban: z.int(),
    rural: z.int(),
  }),
};

export const humanTraffickingImportConfig: ImportConfig<any> = {
  table: humanTrafficking,

  conflictStrategy: "error",

  // Same labels and order as the table in the UI.
  columns: {
    year: { type: "required", header: "Year" },
    total: { ...totalOfMaleAndFemale, header: "Total" },
    male: { type: "required", header: "Male" },
    female: { type: "required", header: "Female" },
    ageGroup: { type: "required", header: "Age Group" },
    lga: { type: "required", header: "LGA" },
  },

  schema: z.object({
    lga: z.string(),
    year: z.int(),
    total: z.int(),
    male: z.int(),
    female: z.int(),
    ageGroup: z.string(),
  }),
};

export const youthMigrationImportConfig: ImportConfig<any> = {
  table: youthMigration,

  conflictStrategy: "error",

  // Same labels and order as the table in the UI.
  columns: {
    year: { type: "required", header: "Year" },
    total: { ...totalOfMaleAndFemale, header: "Total" },
    male: { type: "required", header: "Male" },
    female: { type: "required", header: "Female" },
    origin: { type: "required", header: "Origin" },
    destination: { type: "required", header: "Destination" },
  },

  schema: z.object({
    year: z.int(),
    total: z.int(),
    male: z.int(),
    female: z.int(),
    origin: z.string(),
    destination: z.string(),
  }),
};

function normalizeInt(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeOptionalInt(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return normalizeInt(value);
}

function normalizeStatus(value: unknown) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  switch (normalized) {
    case "planned":
      return "Planned";
    case "ongoing":
      return "Ongoing";
    case "completed":
      return "Completed";
    case "operational":
      return "Operational";
    default:
      return String(value ?? "").trim();
  }
}

export const nediProgramsImportConfig: ImportConfig<any> = {
  table: nediPrograms,

  conflictStrategy: "error",

  // Same labels and order as the table in the UI, then the columns the table
  // does not show.
  columns: {
    programName: {
      type: "required",
      header: "Program Name",
      transform: (value) => String(value ?? "").trim(),
    },
    targetGroup: {
      type: "required",
      header: "Target Group",
      transform: (value) => String(value ?? "").trim(),
    },
    beneficiaries: {
      type: "required",
      header: "Beneficiaries",
      transform: normalizeInt,
    },
    serviceType: {
      type: "required",
      header: "Service Type",
      transform: (value) => String(value ?? "").trim(),
    },
    status: {
      type: "required",
      header: "Status",
      transform: normalizeStatus,
    },
    location: {
      type: "required",
      header: "Location",
      transform: (value) => String(value ?? "").trim(),
    },
    implementingPartner: {
      type: "required",
      header: "Partner",
      transform: (value) => String(value ?? "").trim(),
    },
    startDate: {
      type: "required",
      header: "Start Date",
      transform: toIsoDate,
    },
    endDate: {
      type: "optional",
      header: "End Date",
      transform: toIsoDate,
    },
    description: {
      type: "required",
      header: "Description",
      transform: (value) => String(value ?? "").trim(),
    },
    maleParticipants: {
      type: "optional",
      header: "Male Participants",
      transform: normalizeOptionalInt,
    },
    femaleParticipants: {
      type: "optional",
      header: "Female Participants",
      transform: normalizeOptionalInt,
    },
    fundingSource: {
      type: "required",
      header: "Funding Source",
      transform: (value) => String(value ?? "").trim(),
    },
  },

  schema: z.object({
    programName: z.string().min(1),
    targetGroup: z.string().min(1),
    beneficiaries: z.number().int().nonnegative(),
    serviceType: z.string().min(1),
    description: z.string().min(1),
    status: z.enum(["Planned", "Ongoing", "Completed", "Operational"]),
    location: z.string().min(1),
    maleParticipants: z.number().int().nonnegative().nullable().optional(),
    femaleParticipants: z.number().int().nonnegative().nullable().optional(),
    startDate: z.string(),
    endDate: z.string().nullable().optional(),
    implementingPartner: z.string().min(1),
    fundingSource: z.string().min(1),
  }),
};

export const nyssProgramsImportConfig: ImportConfig<any> = {
  table: nyssPrograms,
  conflictStrategy: "error",
  // Same labels and order as the table in the UI.
  columns: {
    programName: {
      type: "required",
      header: "Program Name",
      transform: (value) => String(value ?? "").trim(),
    },
    institution: {
      type: "required",
      header: "Institution",
      transform: (value) => String(value ?? "").trim(),
    },
    year: {
      type: "required",
      header: "Year",
      transform: normalizeInt,
    },
    region: {
      type: "required",
      header: "Region",
      transform: (value) => String(value ?? "").trim(),
    },
    sector: {
      type: "required",
      header: "Sector",
      transform: (value) => String(value ?? "").trim(),
    },
    totalGraduates: {
      type: "optional",
      header: "Total",
      transform: normalizeInt,
    },
    maleGraduates: {
      type: "optional",
      header: "Male",
      transform: normalizeInt,
    },
    femaleGraduates: {
      type: "optional",
      header: "Female",
      transform: normalizeInt,
    },
    employmentRate: {
      type: "optional",
      header: "Employment %",
      transform: (value) => String(Number(value ?? 0)),
    },
  },
  schema: z.object({
    programName: z.string().min(1),
    institution: z.string().min(1),
    year: z.number().int(),
    region: z.string().min(1),
    sector: z.string().min(1),
    totalGraduates: z.number().int().optional(),
    maleGraduates: z.number().int().optional(),
    femaleGraduates: z.number().int().optional(),
    employmentRate: z.string().optional(),
  }),
};

export const nyssGraduatesImportConfig: ImportConfig<any> = {
  table: nyssGraduates,
  conflictStrategy: "error",
  // Same labels and order as the table in the UI.
  columns: {
    name: {
      type: "required",
      header: "Name",
      transform: (value) => String(value ?? "").trim(),
    },
    age: {
      type: "required",
      header: "Age",
      transform: normalizeInt,
    },
    gender: {
      type: "required",
      header: "Gender",
      transform: (value) => String(value ?? "").trim(),
    },
    region: {
      type: "required",
      header: "Region",
      transform: (value) => String(value ?? "").trim(),
    },
    trainingProgram: {
      type: "required",
      header: "Training Program",
      transform: (value) => String(value ?? "").trim(),
    },
    graduationYear: {
      type: "required",
      header: "Graduation Year",
      transform: (value) => String(value ?? "").trim(),
    },
    employmentStatus: {
      type: "required",
      header: "Employment Status",
      transform: (value) => String(value ?? "").trim(),
    },
    sector: {
      type: "required",
      header: "Sector",
      transform: (value) => String(value ?? "").trim(),
    },
  },
  schema: z.object({
    name: z.string().min(1),
    age: z.number().int(),
    gender: z.string().min(1),
    region: z.string().min(1),
    trainingProgram: z.string().min(1),
    graduationYear: z.string().min(1),
    employmentStatus: z.string().min(1),
    sector: z.string().min(1),
  }),
};

export const nscParticipantsImportConfig: ImportConfig<any> = {
  table: nscParticipants,
  conflictStrategy: "error",
  columns: {
    name: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    age: {
      type: "required",
      transform: normalizeInt,
    },
    gender: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    region: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    category: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    sport: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    level: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    status: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    achievements: {
      type: "optional",
      transform: (value) => String(value ?? "").trim() || null,
    },
    dateRegistered: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    contact: {
      type: "optional",
      transform: (value) => String(value ?? "").trim() || null,
    },
  },
  schema: z.object({
    name: z.string().min(1),
    age: z.number().int(),
    gender: z.string().min(1),
    region: z.string().min(1),
    category: z.string().min(1),
    sport: z.string().min(1),
    level: z.string().min(1),
    status: z.string().min(1),
    achievements: z.string().nullable().optional(),
    dateRegistered: z.string().min(1),
    contact: z.string().nullable().optional(),
  }),
};

export const nycParticipantsImportConfig: ImportConfig<any> = {
  table: nycParticipants,
  conflictStrategy: "error",
  columns: {
    name: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    age: {
      type: "required",
      transform: normalizeInt,
    },
    gender: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    region: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    category: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    sport: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    level: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    status: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    achievements: {
      type: "optional",
      transform: (value) => String(value ?? "").trim() || null,
    },
    dateRegistered: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    contact: {
      type: "optional",
      transform: (value) => String(value ?? "").trim() || null,
    },
  },
  schema: z.object({
    name: z.string().min(1),
    age: z.number().int(),
    gender: z.string().min(1),
    region: z.string().min(1),
    category: z.string().min(1),
    sport: z.string().min(1),
    level: z.string().min(1),
    status: z.string().min(1),
    achievements: z.string().nullable().optional(),
    dateRegistered: z.string().min(1),
    contact: z.string().nullable().optional(),
  }),
};

export const nycActivitiesImportConfig: ImportConfig<any> = {
  table: nycActivities,
  conflictStrategy: "error",
  columns: {
    activityName: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    category: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    region: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    year: {
      type: "required",
      transform: normalizeInt,
    },
    beneficiaries: {
      type: "required",
      transform: normalizeInt,
    },
    male: {
      type: "required",
      transform: normalizeInt,
    },
    female: {
      type: "required",
      transform: normalizeInt,
    },
    fundingPartner: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    description: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    status: {
      type: "required",
      transform: normalizeStatus,
    },
  },
  schema: z.object({
    activityName: z.string().min(1),
    category: z.string().min(1),
    region: z.string().min(1),
    year: z.number().int(),
    beneficiaries: z.number().int(),
    male: z.number().int(),
    female: z.number().int(),
    fundingPartner: z.string().min(1),
    description: z.string().min(1),
    status: z.enum(["Planned", "Ongoing", "Completed"]),
  }),
};
