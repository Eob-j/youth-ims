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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { indicatorDataSchema } from "@/lib/validations/indicator-data";
import { useIndicatorDataStore } from "@/store/indicator-data-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { createIndicatorData, deleteIndicatorData, updateIndicatorData } from "@/server/actions/indicator-data";
import { IndicatorDataForm } from "./indicator-data-form";

export function IndicatorDataDialogs() {
  const { selectedItem } = useIndicatorDataStore();

  return (
    <>
      <IndicatorDataCreateDialog />
      <IndicatorDataEditDialog key={selectedItem?.id} />
      <IndicatorDataDeleteDialog />
    </>
  );
}

function IndicatorDataCreateDialog() {
  const { createOpen, setCreateOpen } = useIndicatorDataStore();
  const form = useForm<z.infer<typeof indicatorDataSchema>>({
    resolver: zodResolver(indicatorDataSchema),
    defaultValues: {
      organization: undefined,
      indicator: "",
      year: "",
      region: undefined,
      male: "0",
      female: "0",
      referenceSource: "",
      category: undefined,
    },
  });

  async function onSubmit(data: z.infer<typeof indicatorDataSchema>) {
    const res = await createIndicatorData({
      organization: data.organization,
      indicator: data.indicator,
      year: Number(data.year),
      region: data.region,
      male: Number(data.male),
      female: Number(data.female),
      referenceSource: data.referenceSource,
      category: data.category,
    });

    if (res.success) {
      toast.success("Indicator data added successfully.", { richColors: true });
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
              <DialogTitle>Add New Indicator Data</DialogTitle>
              <DialogDescription>Fill in the details for the new indicator entry.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <IndicatorDataForm />
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

const indicatorDataUpdateSchema = z.object({
  ...indicatorDataSchema.shape,
  id: z.number(),
  version: z.number(),
});

function IndicatorDataEditDialog() {
  const { editOpen, setEditOpen, selectedItem } = useIndicatorDataStore();
  const form = useForm<z.infer<typeof indicatorDataUpdateSchema>>({
    resolver: zodResolver(indicatorDataUpdateSchema),
    defaultValues: {
      id: selectedItem?.id ?? 0,
      version: selectedItem?.version ?? 1,
      organization: selectedItem?.organization,
      indicator: selectedItem?.indicator ?? "",
      year: String(selectedItem?.year ?? ""),
      region: (selectedItem?.region as any) ?? undefined,
      male: String(selectedItem?.male ?? 0),
      female: String(selectedItem?.female ?? 0),
      referenceSource: selectedItem?.referenceSource ?? "",
      category: selectedItem?.category,
    },
  });

  async function onSubmit(data: z.infer<typeof indicatorDataUpdateSchema>) {
    const res = await updateIndicatorData({
      id: data.id,
      organization: data.organization,
      indicator: data.indicator,
      year: Number(data.year),
      region: data.region,
      male: Number(data.male),
      female: Number(data.female),
      referenceSource: data.referenceSource,
      category: data.category,
      version: data.version,
    });

    if (res.success) {
      toast.success("Indicator data updated successfully.", { richColors: true });
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
              <DialogTitle>Edit Indicator Data</DialogTitle>
              <DialogDescription>Update the details for this indicator entry.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <IndicatorDataForm />
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

function IndicatorDataDeleteDialog() {
  const { deleteOpen, setDeleteOpen, selectedItem, setSelectedItem } = useIndicatorDataStore();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!selectedItem) return;

    setIsDeleting(true);
    const res = await deleteIndicatorData({
      id: selectedItem.id,
      version: selectedItem.version,
    });

    if (res.success) {
      toast.success("Indicator data deleted successfully.", { richColors: true });
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
            This will permanently delete the indicator entry for &quot;{selectedItem?.organization}&quot;.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
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

