"use client";

import { DataImportDialog } from "@/components/data-import-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { importIndicatorData } from "@/feature/import-csv/action";
import { useIndicatorDataStore } from "@/store/indicator-data-store";
import { PlusCircle } from "lucide-react";

export function IndicatorDataActions() {
  const { createOpen, setCreateOpen } = useIndicatorDataStore();

  return (
    <div className="flex gap-2">
      <DataImportDialog tableName="indicator_data" serverActionHander={importIndicatorData} />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Indicator
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}
