"use client";

import { DataImportDialog } from "@/components/data-import-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { importNediProgramsData } from "@/feature/import-csv/action";
import { useNediProgramsStore } from "@/store/nedi-programs-store";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Globe, PlusCircle } from "lucide-react";

export function NediProgramsActions() {
  const { createOpen, setCreateOpen } = useNediProgramsStore();

  return (
    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <a
          href="https://nedi.gm"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          Visit NEDI Website
        </a>
      </Button>
      <DataImportDialog
        tableName="nedi_programs"
        serverActionHander={importNediProgramsData}
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
