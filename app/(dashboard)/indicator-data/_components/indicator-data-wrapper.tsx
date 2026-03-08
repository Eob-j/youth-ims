import { getIndicatorData } from "@/server/services/indicator-data";
import { IndicatorDataClient } from "./indicator-data-client";

interface IndicatorDataWrapperProps {
  canEditData: boolean;
}

export async function IndicatorDataWrapper({ canEditData }: IndicatorDataWrapperProps) {
  const { data, years } = await getIndicatorData();
  return <IndicatorDataClient data={data} years={years} canEditData={canEditData} />;
}
