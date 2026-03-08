"use client";

import { DataImportDialog } from "@/components/data-import-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { importNyssProgramsData } from "@/feature/import-csv/action";
import { useNyssProgramsStore } from "@/store/nyss-programs-store";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Globe, PlusCircle } from "lucide-react";

export function NyssProgramsActions() {
  const { createOpen, setCreateOpen } = useNyssProgramsStore();

  return (
    <div className="flex gap-2 justify-self-end">
      <Button variant="outline" asChild>
        <a
          href="https://nyss.gov.gm"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          Visit NYSS Website
        </a>
      </Button>
      <DataImportDialog
        tableName="nyss_programs"
        serverActionHander={importNyssProgramsData}
      />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-1" variant="default">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Program
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}
