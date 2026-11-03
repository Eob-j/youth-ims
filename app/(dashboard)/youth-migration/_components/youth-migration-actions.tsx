"use client";
import { DataImportDialog } from "@/components/data-import-dialog";
import { YouthMigrationImportInstructions } from "@/feature/import-csv/instructions";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useYouthMigrationStore } from "@/store/youth-migration-store";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { PlusCircle } from "lucide-react";
import { importYouthMigrationData } from "@/feature/import-csv/action";

export function YouthMigrationActions() {
  const { createOpen, setCreateOpen } = useYouthMigrationStore();
  return (
    <div className="flex gap-2">
      <DataImportDialog
        tableName="youth_migration"
        serverActionHander={importYouthMigrationData}
        instructions={<YouthMigrationImportInstructions />}
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
