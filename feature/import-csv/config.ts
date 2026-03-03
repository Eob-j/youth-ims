import { z } from "zod";
import {
  humanTrafficking,
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
