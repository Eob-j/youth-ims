"use client";

import { DataImportDialog } from "@/components/data-import-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { importNscParticipantsData } from "@/feature/import-csv/action";
import { useNscParticipantsStore } from "@/store/nsc-participants-store";
import { Plus } from "lucide-react";

export function NscActions() {
  const { createOpen, setCreateOpen } = useNscParticipantsStore();

  return (
    <div className="flex gap-2">
      <DataImportDialog tableName="nsc_participants" serverActionHander={importNscParticipantsData} />
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
