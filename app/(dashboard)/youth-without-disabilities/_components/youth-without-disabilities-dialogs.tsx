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
import { youthWithoutDisabilitiesSchema } from "@/lib/validations/youth-without-disablilties";
import { useYouthWithoutDisabilitiesStore } from "@/store/youth-without-disabilities-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { YouthWithoutDisabilitiesForm } from "./youth-without-disabilities-form";
import {
  createYouthWithoutDisabilities,
  deleteYouthWithoutDisabilities,
  updateYouthWithoutDisabilities,
} from "@/server/actions/youth-without-disabilities";
import { Loader } from "lucide-react";

export function YouthWithoutDisabilitiesDialogs() {
  const { selectedItem } = useYouthWithoutDisabilitiesStore();
  return (
    <>
      <YouthWithoutDisabilitiesCreateDialog />
      <YouthWithoutDisabilitiesEditDialog key={selectedItem?.id} />
      <YouthWithoutDisabilitiesDeleteDialog />
    </>
  );
}

function YouthWithoutDisabilitiesCreateDialog() {
  const { createOpen, setCreateOpen } = useYouthWithoutDisabilitiesStore();
  const form = useForm<z.infer<typeof youthWithoutDisabilitiesSchema>>({
    resolver: zodResolver(youthWithoutDisabilitiesSchema),
    defaultValues: {
      ageGroup: "",
      total: "",
      male: "",
      female: "",
      urban: "",
      rural: "",
    },
  });
  async function onSubmit(
    data: z.infer<typeof youthWithoutDisabilitiesSchema>,
  ) {
    const res = await createYouthWithoutDisabilities({
      ageGroup: data.ageGroup,
      total: Number(data.total),
      male: Number(data.male),
      female: Number(data.female),
      urban: Number(data.urban),
      rural: Number(data.rural),
    });
    if (res.success) {
      toast.success("Youth without disability added successfully.", {
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
              <DialogTitle>Add New Youth Without Disability Entry</DialogTitle>
              <DialogDescription>
                Fill in the details for the new youth without disability entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <YouthWithoutDisabilitiesForm />
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

const youthWithoutDisabilitiesUpdateSchema = z.object({
  ...youthWithoutDisabilitiesSchema.shape,
  id: z.number(),
  version: z.number(),
});

function YouthWithoutDisabilitiesEditDialog() {
  const { editOpen, setEditOpen, selectedItem } =
    useYouthWithoutDisabilitiesStore();
  const form = useForm<z.infer<typeof youthWithoutDisabilitiesUpdateSchema>>({
    resolver: zodResolver(youthWithoutDisabilitiesUpdateSchema),
    defaultValues: {
      ageGroup: selectedItem?.ageGroup,
      total: selectedItem?.total.toString(),
      male: selectedItem?.male.toString(),
      female: selectedItem?.female.toString(),
      urban: selectedItem?.urban.toString(),
      rural: selectedItem?.rural.toString(),
      id: selectedItem?.id,
      version: selectedItem?.version,
    },
  });
  async function onSubmit(
    data: z.infer<typeof youthWithoutDisabilitiesUpdateSchema>,
  ) {
    const res = await updateYouthWithoutDisabilities({
      id: data.id,
      ageGroup: data.ageGroup,
      total: Number(data.total),
      male: Number(data.male),
      female: Number(data.female),
      urban: Number(data.urban),
      rural: Number(data.rural),
      version: data.version,
    });
    if (res.success) {
      toast.success("Youth without disability edited successfully.", {
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
              <DialogTitle>Edit Youth Without Disability Entry</DialogTitle>
              <DialogDescription>
                Update the details for this youth without disability entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <YouthWithoutDisabilitiesForm />
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

function YouthWithoutDisabilitiesDeleteDialog() {
  const { deleteOpen, setDeleteOpen, selectedItem, setSelectedItem } =
    useYouthWithoutDisabilitiesStore();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!selectedItem) return;
    setIsDeleting(true);
    const res = await deleteYouthWithoutDisabilities({
      id: selectedItem.id,
      version: selectedItem.version,
    });
    if (res.success) {
      toast.success("Youth without disability deleted successfully.", {
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
            This will permanently delete the entry for the Age Group &quot;
            {selectedItem?.ageGroup}&quot;. This action cannot be undone.
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
