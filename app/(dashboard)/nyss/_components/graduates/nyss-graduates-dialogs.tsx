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
import { nyssGraduateSchema } from "@/lib/validations/nyss-graduates";
import { useNyssGraduatesStore } from "@/store/nyss-graduates-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  createNyssGraduate,
  deleteNyssGraduate,
  updateNyssGraduate,
} from "@/server/actions/nyss-graduates";
import { NyssGraduatesForm } from "./nyss-graduates-form";

export function NyssGraduatesDialogs() {
  const { selectedItem } = useNyssGraduatesStore();
  return (
    <>
      <NyssGraduatesCreateDialog />
      <NyssGraduatesEditDialog key={selectedItem?.id} />
      <NyssGraduatesDeleteDialog />
    </>
  );
}

function NyssGraduatesCreateDialog() {
  const { createOpen, setCreateOpen } = useNyssGraduatesStore();
  const form = useForm<z.infer<typeof nyssGraduateSchema>>({
    resolver: zodResolver(nyssGraduateSchema),
    defaultValues: {
      name: "",
      age: "0",
      gender: "Male",
      region: "",
      trainingProgram: "",
      graduationYear: String(new Date().getFullYear()),
      employmentStatus: "Employed",
      sector: "",
    },
  });

  async function onSubmit(data: z.infer<typeof nyssGraduateSchema>) {
    const res = await createNyssGraduate({
      name: data.name,
      age: Number(data.age),
      gender: data.gender,
      region: data.region,
      trainingProgram: data.trainingProgram,
      graduationYear: data.graduationYear,
      employmentStatus: data.employmentStatus,
      sector: data.sector,
    });

    if (res.success) {
      toast.success("NYSS graduate added successfully.", { richColors: true });
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
              <DialogTitle>Add NYSS Graduate</DialogTitle>
              <DialogDescription>
                Fill in the details for the graduate entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <NyssGraduatesForm />
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

const NyssGraduatesUpdateSchema = z.object({
  ...nyssGraduateSchema.shape,
  id: z.number(),
  version: z.number(),
});

function NyssGraduatesEditDialog() {
  const { editOpen, setEditOpen, selectedItem } = useNyssGraduatesStore();
  const form = useForm<z.infer<typeof NyssGraduatesUpdateSchema>>({
    resolver: zodResolver(NyssGraduatesUpdateSchema),
    defaultValues: {
      id: selectedItem?.id,
      name: selectedItem?.name ?? "",
      age: String(selectedItem?.age ?? 0),
      gender: (selectedItem?.gender as "Male" | "Female") ?? "Male",
      region: selectedItem?.region ?? "",
      trainingProgram: selectedItem?.trainingProgram ?? "",
      graduationYear: selectedItem?.graduationYear ?? "",
      version: selectedItem?.version ?? 0,
      employmentStatus:
        (selectedItem?.employmentStatus as
          | "Employed"
          | "Self-Employed"
          | "Seeking Employment"
          | "Further Education") ?? "Employed",
      sector: selectedItem?.sector ?? "",
    },
  });

  async function onSubmit(data: z.infer<typeof NyssGraduatesUpdateSchema>) {
    const res = await updateNyssGraduate({
      id: data.id,
      name: data.name,
      age: Number(data.age),
      gender: data.gender,
      region: data.region,
      trainingProgram: data.trainingProgram,
      graduationYear: data.graduationYear,
      employmentStatus: data.employmentStatus,
      sector: data.sector,
      version: data.version,
    });

    if (res.success) {
      toast.success("NYSS graduate edited successfully.", { richColors: true });
      form.reset();
      setEditOpen(false);
    } else {
      toast.error(res.error, { richColors: true });
    }
  }

  return (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="sm:max-w-150">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit NYSS Graduate</DialogTitle>
              <DialogDescription>
                Update the details for this graduate entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <NyssGraduatesForm />
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

function NyssGraduatesDeleteDialog() {
  const { deleteOpen, setDeleteOpen, selectedItem, setSelectedItem } =
    useNyssGraduatesStore();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!selectedItem) return;
    setIsDeleting(true);
    const res = await deleteNyssGraduate({
      id: selectedItem.id,
      version: selectedItem.version,
    });
    if (res.success) {
      toast.success("NYSS graduate deleted successfully.", {
        richColors: true,
      });
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
            This will permanently delete graduate &quot;{selectedItem?.name}
            &quot;.
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
