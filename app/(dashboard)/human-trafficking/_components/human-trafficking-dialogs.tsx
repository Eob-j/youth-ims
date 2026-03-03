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
import { humanTraffickingSchema } from "@/lib/validations/human-trafficking";
import { useHumanTraffickingStore } from "@/store/human-trafficking-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { HumanTraffickingForm } from "./human-trafficking-form";
import {
  createHumanTrafficking,
  deleteHumanTrafficking,
  updateHumanTrafficking,
} from "@/server/actions/human-trafficking";
import { Loader } from "lucide-react";

export function HumanTraffickingDialogs() {
  const { selectedItem } = useHumanTraffickingStore();
  return (
    <>
      <HumanTraffickingCreateDialog />
      <HumanTraffickingEditDialog key={selectedItem?.id} />
      <HumanTraffickingDeleteDialog />
    </>
  );
}

function HumanTraffickingCreateDialog() {
  const { createOpen, setCreateOpen } = useHumanTraffickingStore();
  const form = useForm<z.infer<typeof humanTraffickingSchema>>({
    resolver: zodResolver(humanTraffickingSchema),
    defaultValues: {
      year: "",
      total: "",
      male: "",
      female: "",
      lga: "",
      ageGroup: "",
    },
  });
  async function onSubmit(data: z.infer<typeof humanTraffickingSchema>) {
    const res = await createHumanTrafficking({
      ageGroup: data.ageGroup,
      total: Number(data.total),
      male: Number(data.male),
      female: Number(data.female),
      lga: data.lga,
      year: Number(data.year),
    });
    if (res.success) {
      toast.success("Human trafficking record added successfully.", {
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
              <DialogTitle>Add New Human Trafficking Entry</DialogTitle>
              <DialogDescription>
                Fill in the details for the new human trafficking entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <HumanTraffickingForm />
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

const humanTraffickingUpdateSchema = z.object({
  ...humanTraffickingSchema.shape,
  id: z.number(),
  version: z.number(),
});

function HumanTraffickingEditDialog() {
  const { editOpen, setEditOpen, selectedItem } = useHumanTraffickingStore();
  const form = useForm<z.infer<typeof humanTraffickingUpdateSchema>>({
    resolver: zodResolver(humanTraffickingUpdateSchema),
    defaultValues: {
      id: selectedItem?.id,
      lga: selectedItem?.lga,
      year: selectedItem?.year.toString(),
      total: selectedItem?.total.toString(),
      male: selectedItem?.male.toString(),
      female: selectedItem?.female.toString(),
      ageGroup: selectedItem?.ageGroup,
      version: selectedItem?.version,
    },
  });
  async function onSubmit(data: z.infer<typeof humanTraffickingUpdateSchema>) {
    const res = await updateHumanTrafficking({
      id: data?.id,
      ageGroup: data.ageGroup,
      total: Number(data.total),
      male: Number(data.male),
      female: Number(data.female),
      lga: data.lga,
      year: Number(data.year),
      version: data?.version,
    });
    if (res.success) {
      toast.success("Human trafficking record edited successfully.", {
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
              <DialogTitle>Edit Human Trafficking Entry</DialogTitle>
              <DialogDescription>
                Update the details for this human trafficking entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <HumanTraffickingForm />
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

function HumanTraffickingDeleteDialog() {
  const { deleteOpen, setDeleteOpen, selectedItem, setSelectedItem } =
    useHumanTraffickingStore();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!selectedItem) return;
    setIsDeleting(true);
    const res = await deleteHumanTrafficking({
      id: selectedItem.id,
      version: selectedItem.version,
    });
    if (res.success) {
      toast.success("Human trafficking record deleted successfully.", {
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
            This will permanently delete the entry for &quot;
            {selectedItem?.lga}&quot; in {selectedItem?.year}. This action
            cannot be undone.
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
