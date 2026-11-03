"use client";

import { DataImportDialog } from "@/components/data-import-dialog";
import { NycParticipantsImportInstructions } from "@/feature/import-csv/instructions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { importNycParticipantsData } from "@/feature/import-csv/action";
import { useNycParticipantsStore } from "@/store/nyc-participants-store";
import { Plus } from "lucide-react";

export function NycActions() {
  const { createOpen, setCreateOpen } = useNycParticipantsStore();

  return (
    <div className="flex gap-2">
      <DataImportDialog tableName="nyc_participants" serverActionHander={importNycParticipantsData} instructions={<NycParticipantsImportInstructions />} />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Participant
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}
