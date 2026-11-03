export const runtime = "nodejs";

import { db } from "@/db";
import { humanTrafficking } from "@/db/schema";
import { humanTraffickingExportConfig } from "@/feature/export/config";
import { exportData } from "@/lib/exporter/export-engine";
import { getServerSideSession } from "@/lib/auth-helper";

export async function GET(req: Request) {
  const session = await getServerSideSession();
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") as "csv" | "xlsx" | "pdf";
  try {
    const result = await exportData({
      queryFn: async () => db.select().from(humanTrafficking),
      config: humanTraffickingExportConfig as any,
      format,
    });

    return new Response(result.data as any, {
      headers: {
        "Content-Type": result.mime,
        "Content-Disposition": `attachment; filename=${result.filename}`,
      },
    });
  } catch {
    return new Response(JSON.stringify({ message: "Export failed." }), {
      status: 500,
    });
  }
}
