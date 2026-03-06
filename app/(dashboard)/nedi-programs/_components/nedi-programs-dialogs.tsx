import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { nediProgramsSchema } from "@/lib/validations/nedi-programs";
import { useNediProgramsStore } from "@/store/nedi-programs-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { NediProgramsForm } from "./nedi-programs-form";
import {
  createNediProgram,
  deleteNediProgram,
  updateNediProgram,
} from "@/server/actions/nedi-programs";
import { Loader } from "lucide-react";

export function NediProgramsDialogs() {
  const { selectedItem } = useNediProgramsStore();
  return (
    <>
      <NediProgramsCreateDialog />
      <NediProgramsEditDialog key={selectedItem?.id} />
      <NediProgramsDeleteDialog />
    </>
  );
}

function NediProgramsCreateDialog() {
  const { createOpen, setCreateOpen } = useNediProgramsStore();
  const form = useForm<z.infer<typeof nediProgramsSchema>>({
    resolver: zodResolver(nediProgramsSchema),
    defaultValues: {
      programName: "",
      targetGroup: "",
      beneficiaries: "",
      description: "",
      location: "",
      maleParticipants: "",
      femaleParticipants: "",
      startDate: "",
      endDate: "",
      implementingPartner: "",
      fundingSource: "",
    },
  });

  async function onSubmit(data: z.infer<typeof nediProgramsSchema>) {
    const res = await createNediProgram({
      programName: data.programName,
      targetGroup: data.targetGroup,
      beneficiaries: Number(data.beneficiaries),
      serviceType: data.serviceType,
      description: data.description,
      status: data.status,
      location: data.location,
      maleParticipants: data.maleParticipants
        ? Number(data.maleParticipants)
        : null,
      femaleParticipants: data.femaleParticipants
        ? Number(data.femaleParticipants)
        : null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      implementingPartner: data.implementingPartner,
      fundingSource: data.fundingSource,
    });
    if (res.success) {
      toast.success("NEDI program added successfully.", {
        richColors: true,
      });
      form.reset();
      setCreateOpen(false);
    } else {
      toast.error(res.error, {
        richColors: true,
      });
    }
  }

  return (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogContent className="sm:max-w-150">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New NEDI Program</DialogTitle>
              <DialogDescription>
                Fill in the details for the new program entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <NediProgramsForm />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <div className="flex items-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Save Entry"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

const NediProgramsUpdateSchema = z.object({
  ...nediProgramsSchema.shape,
  id: z.number(),
});

function NediProgramsEditDialog() {
  const { editOpen, setEditOpen, selectedItem } = useNediProgramsStore();
  const form = useForm<z.infer<typeof NediProgramsUpdateSchema>>({
    resolver: zodResolver(NediProgramsUpdateSchema),
    defaultValues: {
      id: selectedItem?.id,
      programName: selectedItem?.programName,
      targetGroup: selectedItem?.targetGroup,
      beneficiaries: String(selectedItem?.beneficiaries ?? 0),
      serviceType: selectedItem?.serviceType,
      description: selectedItem?.description,
      status: selectedItem?.status,
      location: selectedItem?.location,
      maleParticipants:
        selectedItem?.maleParticipants === null ||
        selectedItem?.maleParticipants === undefined
          ? ""
          : String(selectedItem?.maleParticipants),
      femaleParticipants:
        selectedItem?.femaleParticipants === null ||
        selectedItem?.femaleParticipants === undefined
          ? ""
          : String(selectedItem?.femaleParticipants),
      startDate: selectedItem?.startDate,
      endDate: selectedItem?.endDate || "",
      implementingPartner: selectedItem?.implementingPartner || "",
      fundingSource: selectedItem?.fundingSource || "",
    },
  });

  async function onSubmit(data: z.infer<typeof NediProgramsUpdateSchema>) {
    const res = await updateNediProgram({
      id: data.id,
      programName: data.programName,
      targetGroup: data.targetGroup,
      beneficiaries: Number(data.beneficiaries),
      serviceType: data.serviceType,
      description: data.description,
      status: data.status,
      location: data.location,
      maleParticipants: data.maleParticipants
        ? Number(data.maleParticipants)
        : null,
      femaleParticipants: data.femaleParticipants
        ? Number(data.femaleParticipants)
        : null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      implementingPartner: data.implementingPartner,
      fundingSource: data.fundingSource,
      version: selectedItem?.version || 0,
    });
    if (res.success) {
      toast.success("NEDI program edited successfully.", {
        richColors: true,
      });
      form.reset();
      setEditOpen(false);
    } else {
      toast.error(res.error, {
        richColors: true,
      });
    }
  }

  return (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="sm:max-w-150">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit NEDI Program</DialogTitle>
              <DialogDescription>
                Update the details for this program entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <NediProgramsForm />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <div className="flex items-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </div>
                ) : (
                  "Update Entry"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function NediProgramsDeleteDialog() {
  const { deleteOpen, setDeleteOpen, selectedItem, setSelectedItem } =
    useNediProgramsStore();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!selectedItem) return;
    setIsDeleting(true);
    const res = await deleteNediProgram({
      id: selectedItem.id,
      version: selectedItem.version,
    });
    if (res.success) {
      toast.success("NEDI program deleted successfully.", {
        richColors: true,
      });
      setIsDeleting(false);
      setDeleteOpen(false);
      setSelectedItem(null);
    } else {
      toast.error(res.error, {
        richColors: true,
      });
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the program &quot;
            {selectedItem?.programName}&quot;. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? (
              <div className="flex items-center">
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </div>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
