"use server";

import { importSpreadsheet } from "@/lib/importer/import-engine";
import {
  humanTraffickingImportConfig,
  nediProgramsImportConfig,
  nyssGraduatesImportConfig,
  nyssProgramsImportConfig,
  youthMigrationImportConfig,
  youthPopulationImportConfig,
  youthWithDisabilitiesImportConfig,
  youthWithoutDisabilitiesImportConfig,
} from "./config";
import { importIndicatorData as importIndicatorDataAction } from "@/server/actions/indicator-data";
import { importNycParticipantsData as importNycParticipantsDataAction } from "@/server/actions/nyc-participants";
import { importNscParticipantsData as importNscParticipantsDataAction } from "@/server/actions/nsc-participants";
import { importNycActivitiesData as importNycActivitiesDataAction } from "@/server/actions/nyc-activities";

export async function importYouthPoplationData(formData: FormData) {
  const file = formData.get("file") as File;

  return importSpreadsheet({
    file,
    config: youthPopulationImportConfig,
    path: "/youth-population",
  });
}

export async function importYouthWithDisabilitiesData(formData: FormData) {
  const file = formData.get("file") as File;

  return importSpreadsheet({
    file,
    config: youthWithDisabilitiesImportConfig,
    path: "/youth-with-disabilities",
  });
}

export async function importYouthWithoutDisabilitiesData(formData: FormData) {
  const file = formData.get("file") as File;

  return importSpreadsheet({
    file,
    config: youthWithoutDisabilitiesImportConfig,
    path: "/youth-without-disabilities",
  });
}

export async function importHumanTraffickingData(formData: FormData) {
  const file = formData.get("file") as File;

  return importSpreadsheet({
    file,
    config: humanTraffickingImportConfig,
    path: "/human-trafficking",
  });
}

export async function importYouthMigrationData(formData: FormData) {
  const file = formData.get("file") as File;

  return importSpreadsheet({
    file,
    config: youthMigrationImportConfig,
    path: "/youth-migration",
  });
}

export async function importNediProgramsData(formData: FormData) {
  const file = formData.get("file") as File;

  return importSpreadsheet({
    file,
    config: nediProgramsImportConfig,
    path: "/nedi-programs",
  });
}

export async function importNyssProgramsData(formData: FormData) {
  const file = formData.get("file") as File;

  return importSpreadsheet({
    file,
    config: nyssProgramsImportConfig,
    path: "/nyss",
  });
}

export async function importNyssGraduatesData(formData: FormData) {
  const file = formData.get("file") as File;

  return importSpreadsheet({
    file,
    config: nyssGraduatesImportConfig,
    path: "/nyss",
  });
}

export async function importIndicatorData(formData: FormData) {
  return importIndicatorDataAction(formData);
}

export async function importNscParticipantsData(formData: FormData) {
  return importNscParticipantsDataAction(formData);
}

export async function importNycParticipantsData(formData: FormData) {
  return importNycParticipantsDataAction(formData);
}

export async function importNycActivitiesData(formData: FormData) {
  return importNycActivitiesDataAction(formData);
}
