"use client";

import { DataImportDialog } from "@/components/data-import-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { importNycActivitiesData } from "@/feature/import-csv/action";
import { useNycActivitiesStore } from "@/store/nyc-activities-store";
import { PlusCircle } from "lucide-react";

export function NycActivitiesActions() {
  const { createOpen, setCreateOpen } = useNycActivitiesStore();

  return (
    <div className="flex gap-2">
      <DataImportDialog tableName="nyc_activities" serverActionHander={importNycActivitiesData} />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Activity
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}
