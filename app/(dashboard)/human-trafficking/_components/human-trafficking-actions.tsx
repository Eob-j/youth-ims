"use client";
import { DataImportDialog } from "@/components/data-import-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { importHumanTraffickingData } from "@/feature/import-csv/action";
import { useHumanTraffickingStore } from "@/store/human-trafficking-store";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { PlusCircle } from "lucide-react";

export function HumanTraffickingActions() {
  const { createOpen, setCreateOpen } = useHumanTraffickingStore();
  return (
    <div className="flex gap-2">
      <DataImportDialog
        tableName="human_trafficking"
        serverActionHander={importHumanTraffickingData}
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
