"use server";

import { importSpreadsheet } from "@/lib/importer/import-engine";
import {
  youthPopulationImportConfig,
  youthWithDisabilitiesImportConfig,
  youthWithoutDisabilitiesImportConfig,
} from "./config";

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
