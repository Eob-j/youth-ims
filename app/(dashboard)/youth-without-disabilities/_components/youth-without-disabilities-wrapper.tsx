import { getYouthWithoutDisabilities } from "@/server/services/youth-without-disabilities";
import { Suspense } from "react";
import { YouthWithoutDisabilitiesActions } from "./youth-without-disabilities-actions";
import { YouthWithoutDisabilitiesTable } from "./youth-without-disabilities-table";
import { YouthWithoutDisabilitiesTableSkeleton } from "./youth-without-disabilities-table-skeleton";

interface Props {
  canEditData: boolean;
}

export async function YouthWithoutDisabilitiesWrapper({ canEditData }: Props) {
  const data = await getYouthWithoutDisabilities();
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Youths With Disabilities Data</h1>
        {canEditData && <YouthWithoutDisabilitiesActions />}
      </div>

      <Suspense fallback={<YouthWithoutDisabilitiesTableSkeleton />}>
        <YouthWithoutDisabilitiesTable
          canEditData={canEditData}
          youthWithoutDisabilities={data}
        />
      </Suspense>
    </div>
  );
}
