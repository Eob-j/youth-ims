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
import { nyssProgramSchema } from "@/lib/validations/nyss-programs";
import { useNyssProgramsStore } from "@/store/nyss-programs-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  createNyssProgram,
  deleteNyssProgram,
  updateNyssProgram,
} from "@/server/actions/nyss-programs";
import { NyssProgramsForm } from "./nyss-programs-form";

export function NyssProgramsDialogs() {
  const { selectedItem } = useNyssProgramsStore();
  return (
    <>
      <NyssProgramsCreateDialog />
      <NyssProgramsEditDialog key={selectedItem?.id} />
      <NyssProgramsDeleteDialog />
    </>
  );
}

function NyssProgramsCreateDialog() {
  const { createOpen, setCreateOpen } = useNyssProgramsStore();
  const form = useForm<z.infer<typeof nyssProgramSchema>>({
    resolver: zodResolver(nyssProgramSchema),
    defaultValues: {
      programName: "",
      institution: "",
      year: "",
      region: "",
      sector: "",
      totalGraduates: "0",
      maleGraduates: "0",
      femaleGraduates: "0",
      employmentRate: "0",
    },
  });

  async function onSubmit(data: z.infer<typeof nyssProgramSchema>) {
    const res = await createNyssProgram({
      programName: data.programName,
      institution: data.institution,
      year: Number(data.year),
      region: data.region,
      sector: data.sector,
      totalGraduates: Number(data.totalGraduates),
      maleGraduates: Number(data.maleGraduates),
      femaleGraduates: Number(data.femaleGraduates),
      employmentRate: String(Number(data.employmentRate)),
    });

    if (res.success) {
      toast.success("NYSS program added successfully.", { richColors: true });
      form.reset();
      setCreateOpen(false);
    } else {
      toast.error(res.error, { richColors: true });
    }
  }

  return (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogContent className="sm:max-w-150">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New NYSS Program</DialogTitle>
              <DialogDescription>
                Fill in the details for the new program entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <NyssProgramsForm />
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

const NyssProgramsUpdateSchema = z.object({
  ...nyssProgramSchema.shape,
  id: z.number(),
  version: z.number(),
});

function NyssProgramsEditDialog() {
  const { editOpen, setEditOpen, selectedItem } = useNyssProgramsStore();
  const form = useForm<z.infer<typeof NyssProgramsUpdateSchema>>({
    resolver: zodResolver(NyssProgramsUpdateSchema),
    defaultValues: {
      id: selectedItem?.id,
      programName: selectedItem?.programName ?? "",
      institution: selectedItem?.institution ?? "",
      year: String(selectedItem?.year ?? ""),
      region: selectedItem?.region ?? "",
      sector: selectedItem?.sector ?? "",
      totalGraduates: String(selectedItem?.totalGraduates ?? 0),
      maleGraduates: String(selectedItem?.maleGraduates ?? 0),
      femaleGraduates: String(selectedItem?.femaleGraduates ?? 0),
      employmentRate: String(selectedItem?.employmentRate ?? 0),
    },
  });

  const onSubmit = async (data: z.infer<typeof NyssProgramsUpdateSchema>) => {
    const res = await updateNyssProgram({
      id: data.id,
      programName: data.programName,
      institution: data.institution,
      year: Number(data.year),
      region: data.region,
      sector: data.sector,
      totalGraduates: Number(data.totalGraduates),
      maleGraduates: Number(data.maleGraduates),
      femaleGraduates: Number(data.femaleGraduates),
      employmentRate: String(Number(data.employmentRate)),
      version: data.version,
    });

    if (res.success) {
      toast.success("NYSS program edited successfully.", { richColors: true });
      form.reset();
      setEditOpen(false);
    } else {
      toast.error(res.error, { richColors: true });
    }
  };

  return (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="sm:max-w-150">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit NYSS Program</DialogTitle>
              <DialogDescription>
                Update the details for this program entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <NyssProgramsForm />
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

function NyssProgramsDeleteDialog() {
  const { deleteOpen, setDeleteOpen, selectedItem, setSelectedItem } =
    useNyssProgramsStore();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!selectedItem) return;
    setIsDeleting(true);
    const res = await deleteNyssProgram({
      id: selectedItem.id,
      version: selectedItem.version,
    });
    if (res.success) {
      toast.success("NYSS program deleted successfully.", { richColors: true });
      setDeleteOpen(false);
      setSelectedItem(null);
    } else {
      toast.error(res.error, { richColors: true });
    }
    setIsDeleting(false);
  }

  return (
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the program &quot;
            {selectedItem?.programName}&quot;.
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
