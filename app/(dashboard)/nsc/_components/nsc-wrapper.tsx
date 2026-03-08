import { getNscParticipants } from "@/server/services/nsc-participants";
import { NscClient } from "./nsc-client";

interface NscWrapperProps {
  canEditData: boolean;
}

export async function NscWrapper({ canEditData }: NscWrapperProps) {
  const data = await getNscParticipants();
  return <NscClient data={data} canEditData={canEditData} />;
}
