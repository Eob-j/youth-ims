import { getYouthWithoutDisabilities } from "@/server/services/youth-without-disabilities";
import { Suspense } from "react";
import { HumanTraffickingActions } from "./human-trafficking-actions";
import { HumanTraffickingTable } from "./human-trafficking-table";
import { HumanTraffickingTableSkeleton } from "./human-trafficking-table-skeleton";
import { getHumanTrafficking } from "@/server/services/human-trafficking";

interface Props {
  canEditData: boolean;
}

export async function HumanTraffickingWrapper({ canEditData }: Props) {
  const data = await getHumanTrafficking();
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Human Trafficking Data</h1>
        {canEditData && <HumanTraffickingActions />}
      </div>

      <Suspense fallback={<HumanTraffickingTableSkeleton />}>
        <HumanTraffickingTable
          canEditData={canEditData}
          humanTrafficking={data}
        />
      </Suspense>
    </div>
  );
}
