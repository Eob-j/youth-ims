"use client";
import { CanEditWrapper } from "@/components/can-edit-wrapper";
import { DataImportDialog } from "@/components/data-import-dialog";
import { Dialog } from "@/components/ui/dialog";
import { useYouthPopulationStore } from "@/store/youth-population-store";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { importYouthPoplationData } from "@/feature/import-csv/action";

export default function YouthPopulationActions() {
  const { createOpen, setCreateOpen } = useYouthPopulationStore();
  return (
    <div className="flex gap-2">
      <DataImportDialog
        tableName="youth_population"
        serverActionHander={importYouthPoplationData}
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
