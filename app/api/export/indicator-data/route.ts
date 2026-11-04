export const runtime = "nodejs";

import { indicatorDataExportConfig } from "@/feature/export/config";
import { exportData, isExportFormat } from "@/lib/exporter/export-engine";
import { getServerSideSession } from "@/lib/auth-helper";
import { db } from "@/db";
import { indicatorData } from "@/db/schema";

export async function GET(req: Request) {
  const session = await getServerSideSession();
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "csv";
  if (!isExportFormat(format)) {
    return new Response(
      JSON.stringify({
        message: "Unsupported export format. Use csv, xlsx or pdf.",
      }),
      { status: 400 },
    );
  }

  try {
    const result = await exportData({
      queryFn: async () => {
        return await db.select().from(indicatorData);
      },
      config: indicatorDataExportConfig as any,
      format,
      name: "indicator-data",
    });

    return new Response(result.data as any, {
      headers: {
        "Content-Type": result.mime,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  } catch {
    return new Response(JSON.stringify({ message: "Export failed." }), {
      status: 500,
    });
  }
}
