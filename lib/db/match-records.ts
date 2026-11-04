import "server-only";

import type { RecordRef } from "@/lib/validations/action-input";
import { and, eq, or, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

// A WHERE condition matching any of the given records by id and version, so
// a bulk delete is one query and still skips records edited meanwhile.
// Refuses an empty list: or() of nothing is no condition, which would match
// every row.
export function matchRecords(
  table: { id: PgColumn; version: PgColumn },
  records: RecordRef[],
): SQL {
  if (records.length === 0) {
    throw new Error("matchRecords needs at least one record");
  }
  return or(
    ...records.map((record) =>
      and(eq(table.id, record.id), eq(table.version, record.version)),
    ),
  )!;
}
