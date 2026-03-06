import { getNediPrograms } from "@/server/services/nedi-programs";
import { Suspense } from "react";
import { NediProgramsActions } from "./nedi-programs-actions";
import { NediProgramsTable } from "./nedi-programs-table";
import { NediProgramsTableSkeleton } from "./nedi-programs-table-skeleton";
import { NediProgramsType } from "@/db/schema";

interface Props {
  canEditData: boolean;
}

export async function NediProgramsWrapper({ canEditData }: Props) {
  const data = await getNediPrograms();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">NEDI Programs</h1>
          <p className="text-muted-foreground">
            National Enterprise Development Initiative
          </p>
        </div>
        {canEditData && <NediProgramsActions />}
      </div>

      <Suspense fallback={<NediProgramsTableSkeleton />}>
        <NediProgramsTable canEditData={canEditData} nediPrograms={data} />
      </Suspense>
    </div>
  );
}
