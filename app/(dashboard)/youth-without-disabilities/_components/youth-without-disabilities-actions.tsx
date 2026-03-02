"use client";
import { DataImportDialog } from "@/components/data-import-dialog";
import { Dialog } from "@/components/ui/dialog";
import { useYouthWithoutDisabilitiesStore } from "@/store/youth-without-disabilities-store";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
// import { importYouthWithoutDisabilitiesData } from "@/feature/import-csv/action";

export function YouthWithoutDisabilitiesActions() {
  const { createOpen, setCreateOpen } = useYouthWithoutDisabilitiesStore();
  return (
    <div className="flex gap-2">
      {/* <DataImportDialog
        tableName="youth_without_disabilities"
        serverActionHander={importYouthWithoutDisabilitiesData}
      /> */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-1" variant="default">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Entry
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}
