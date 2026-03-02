"use client";
import { DataImportDialog } from "@/components/data-import-dialog";
import { Dialog } from "@/components/ui/dialog";
import { useYouthWithDisabilitiesStore } from "@/store/youth-with-disabilities-store";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { importYouthWithDisabilitiesData } from "@/feature/import-csv/action";

export function YouthWithDisabilitiesActions() {
  const { createOpen, setCreateOpen } = useYouthWithDisabilitiesStore();
  return (
    <div className="flex gap-2">
      <DataImportDialog
        tableName="youth_with_disabilities"
        serverActionHander={importYouthWithDisabilitiesData}
      />
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
