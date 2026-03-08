"use client";

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
import { nycActivitySchema } from "@/lib/validations/nyc-activities";
import { useNycActivitiesStore } from "@/store/nyc-activities-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  createNycActivity,
  deleteNycActivity,
  updateNycActivity,
} from "@/server/actions/nyc-activities";
import { NycActivitiesForm } from "./nyc-activities-form";

export function NycActivitiesDialogs() {
  const { selectedItem } = useNycActivitiesStore();

  return (
    <>
      <NycActivitiesCreateDialog />
      <NycActivitiesEditDialog key={selectedItem?.id} />
      <NycActivitiesDeleteDialog />
    </>
  );
}

function NycActivitiesCreateDialog() {
  const { createOpen, setCreateOpen } = useNycActivitiesStore();
  const form = useForm<z.infer<typeof nycActivitySchema>>({
    resolver: zodResolver(nycActivitySchema),
    defaultValues: {
      activityName: "",
      category: "Leadership Development",
      region: "GBA",
      year: String(new Date().getFullYear()),
      beneficiaries: "0",
      male: "0",
      female: "0",
      fundingPartner: "UNDP",
      description: "",
      status: "Planned",
    },
  });

  async function onSubmit(data: z.infer<typeof nycActivitySchema>) {
    const res = await createNycActivity({
      activityName: data.activityName,
      category: data.category,
      region: data.region,
      year: Number(data.year),
      beneficiaries: Number(data.beneficiaries),
      male: Number(data.male),
      female: Number(data.female),
      fundingPartner: data.fundingPartner,
      description: data.description,
      status: data.status,
    });

    if (res.success) {
      toast.success("Activity added successfully.", { richColors: true });
      form.reset();
      setCreateOpen(false);
    } else {
      toast.error(res.error, { richColors: true });
    }
  }

  return (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New NYC Activity</DialogTitle>
              <DialogDescription>Enter activity details below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <NycActivitiesForm />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <div className="flex items-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Save Activity"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

const NycActivityUpdateSchema = z.object({
  ...nycActivitySchema.shape,
  id: z.number(),
  version: z.number(),
});

function NycActivitiesEditDialog() {
  const { editOpen, setEditOpen, selectedItem } = useNycActivitiesStore();
  const form = useForm<z.infer<typeof NycActivityUpdateSchema>>({
    resolver: zodResolver(NycActivityUpdateSchema),
    defaultValues: {
      id: selectedItem?.id,
      version: selectedItem?.version,
      activityName: selectedItem?.activityName ?? "",
      category: (selectedItem?.category as any) ?? "Leadership Development",
      region: (selectedItem?.region as any) ?? "GBA",
      year: String(selectedItem?.year ?? new Date().getFullYear()),
      beneficiaries: String(selectedItem?.beneficiaries ?? 0),
      male: String(selectedItem?.male ?? 0),
      female: String(selectedItem?.female ?? 0),
      fundingPartner: (selectedItem?.fundingPartner as any) ?? "UNDP",
      description: selectedItem?.description ?? "",
      status: selectedItem?.status ?? "Planned",
    },
  });

  async function onSubmit(data: z.infer<typeof NycActivityUpdateSchema>) {
    const res = await updateNycActivity({
      id: data.id,
      version: data.version,
      activityName: data.activityName,
      category: data.category,
      region: data.region,
      year: Number(data.year),
      beneficiaries: Number(data.beneficiaries),
      male: Number(data.male),
      female: Number(data.female),
      fundingPartner: data.fundingPartner,
      description: data.description,
      status: data.status,
    });

    if (res.success) {
      toast.success("Activity updated successfully.", { richColors: true });
      form.reset();
      setEditOpen(false);
    } else {
      toast.error(res.error, { richColors: true });
    }
  }

  return (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit NYC Activity</DialogTitle>
              <DialogDescription>Update activity details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <NycActivitiesForm />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <div className="flex items-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </div>
                ) : (
                  "Update Activity"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function NycActivitiesDeleteDialog() {
  const { deleteOpen, setDeleteOpen, selectedItem, setSelectedItem } =
    useNycActivitiesStore();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!selectedItem) return;
    setIsDeleting(true);

    const res = await deleteNycActivity({
      id: selectedItem.id,
      version: selectedItem.version,
    });

    if (res.success) {
      toast.success("Activity deleted successfully.", { richColors: true });
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
            This will permanently delete &quot;{selectedItem?.activityName}&quot;.
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
