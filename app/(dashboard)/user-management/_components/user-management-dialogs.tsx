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
import { userSchema } from "@/lib/validations/user-management";
import { useUserManagementStore } from "@/store/user-management-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import z, { email } from "zod";
import { UserManagementForm } from "./user-management-form";
import {
  createUser,
  deleteUser,
  updateUser,
} from "@/server/actions/user-management";
import { Loader } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { UserManagementUpdateForm } from "./user-management-update-form";

export function UserManagementDialogs() {
  const { selectedItem } = useUserManagementStore();
  return (
    <>
      <UserCreateDialog />
      <UserEditDialog key={selectedItem?.id} />
      <UserDeleteDialog />
    </>
  );
}

function UserCreateDialog() {
  const { createOpen, setCreateOpen } = useUserManagementStore();
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    },
  });
  async function onSubmit(data: z.infer<typeof userSchema>) {
    const res = await createUser(data);
    if (res.success) {
      toast.success("User created successfully.", {
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
      <DialogContent className="sm:max-w-125">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with specific role permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <UserManagementForm />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <div className="flex items-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Save User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required"),
  role: z.string().min(1, "Role is required"),
  id: z.string(),
});

function UserEditDialog() {
  const { editOpen, setEditOpen, selectedItem } = useUserManagementStore();
  const form = useForm<z.infer<typeof userUpdateSchema>>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      name: selectedItem?.name,
      email: selectedItem?.email,
      role: selectedItem?.role as "admin" | "data_entry" | "viewer",
      id: selectedItem?.id,
    },
  });
  async function onSubmit(data: z.infer<typeof userUpdateSchema>) {
    const res = await updateUser({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
    if (res.success) {
      toast.success("User edited successfully.", {
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
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update the details for this user.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <UserManagementUpdateForm />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <div className="flex items-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </div>
                ) : (
                  "Update User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function UserDeleteDialog() {
  const { deleteOpen, setDeleteOpen, selectedItem, setSelectedItem } =
    useUserManagementStore();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!selectedItem) return;
    setIsDeleting(true);
    const res = await deleteUser({
      id: selectedItem.id,
    });
    if (res.success) {
      toast.success("User deleted successfully.", {
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
            This will permanently delete the user &quot;
            {selectedItem?.name}&quot;. This action cannot be undone.
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
