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
import { ImportConfig } from "@/lib/importer/types";

export const youthPopulationImportConfig: ImportConfig<any> = {
  table: youthPopulation,

  conflictStrategy: "error",

  columns: {
    lga: { type: "required" },

    year: {
      type: "computed-if-missing",
      compute: () => new Date().getFullYear(),
    },

    totalPopulation: { type: "required" },
    youthPopulation: { type: "required" },

    maleYouth: { type: "required" },
    femaleYouth: { type: "required" },
    urbanYouth: { type: "required" },
    ruralYouth: { type: "required" },

    youthShare: {
      type: "computed",
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

  columns: {
    ageGroup: { type: "required" },
    total: { type: "required" },
    male: { type: "required" },
    female: { type: "required" },
    urban: { type: "required" },
    rural: { type: "required" },
    seeing: { type: "required" },
    hearing: { type: "required" },
    physical: { type: "required" },
    learning: { type: "required" },
    selfcare: { type: "required" },
    speech: { type: "required" },
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

  columns: {
    ageGroup: { type: "required" },
    total: { type: "required" },
    male: { type: "required" },
    female: { type: "required" },
    urban: { type: "required" },
    rural: { type: "required" },
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

  columns: {
    lga: { type: "required" },
    year: { type: "required" },
    total: { type: "required" },
    male: { type: "required" },
    female: { type: "required" },
    ageGroup: { type: "required" },
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

  columns: {
    year: { type: "required" },
    total: { type: "required" },
    male: { type: "required" },
    female: { type: "required" },
    origin: { type: "required" },
    destination: { type: "required" },
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

function normalizeDate(value: unknown) {
  console.log(value);

  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    return value;
  }

  const date = new Date(String(value));
  console.log(date);
  return date;
  // return Number.isNaN(date.getTime()) ? value : date;
}

export const nediProgramsImportConfig: ImportConfig<any> = {
  table: nediPrograms,

  conflictStrategy: "error",

  columns: {
    programName: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    targetGroup: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    beneficiaries: {
      type: "required",
      transform: normalizeInt,
    },
    serviceType: {
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
    location: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    maleParticipants: {
      type: "optional",
      transform: normalizeOptionalInt,
    },
    femaleParticipants: {
      type: "optional",
      transform: normalizeOptionalInt,
    },
    startDate: {
      type: "required",
      transform: (value) => {
        console.log(value);
        return value;
      },
    },
    endDate: {
      type: "optional",
      transform: normalizeDate,
    },
    implementingPartner: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    fundingSource: {
      type: "required",
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
    startDate: z.any(),
    endDate: z.any().nullable().optional(),
    implementingPartner: z.string().min(1),
    fundingSource: z.string().min(1),
  }),
};

export const nyssProgramsImportConfig: ImportConfig<any> = {
  table: nyssPrograms,
  conflictStrategy: "error",
  columns: {
    programName: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    institution: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    year: {
      type: "required",
      transform: normalizeInt,
    },
    region: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    sector: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    totalGraduates: {
      type: "optional",
      transform: normalizeInt,
    },
    maleGraduates: {
      type: "optional",
      transform: normalizeInt,
    },
    femaleGraduates: {
      type: "optional",
      transform: normalizeInt,
    },
    employmentRate: {
      type: "optional",
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
    trainingProgram: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    graduationYear: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    employmentStatus: {
      type: "required",
      transform: (value) => String(value ?? "").trim(),
    },
    sector: {
      type: "required",
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
