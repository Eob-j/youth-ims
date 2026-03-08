import { getNycActivities } from "@/server/services/nyc-activities";
import { NycActivitiesClient } from "./nyc-activities-client";

interface NycActivitiesWrapperProps {
  canEditData: boolean;
}

export async function NycActivitiesWrapper({ canEditData }: NycActivitiesWrapperProps) {
  const data = await getNycActivities();
  return <NycActivitiesClient data={data} canEditData={canEditData} />;
}
