import { create } from "zustand";
import type { userType } from "@/auth-schema";

interface UserManagementStore {
  data: userType[];
  selectedItem: userType | null;

  setData: (data: userType[]) => void;
  setSelectedItem: (item: userType | null) => void;

  editOpen: boolean;
  deleteOpen: boolean;
  createOpen: boolean;
  resetPasswordOpen: boolean;

  setEditOpen: (open: boolean) => void;
  setDeleteOpen: (open: boolean) => void;
  setCreateOpen: (open: boolean) => void;
  setResetPasswordOpen: (open: boolean) => void;
}

export const useUserManagementStore = create<UserManagementStore>((set) => ({
  data: [],
  selectedItem: null,
  editOpen: false,
  deleteOpen: false,
  createOpen: false,
  resetPasswordOpen: false,

  setData: (data) => set({ data }),
  setSelectedItem: (item) => {
    set({ selectedItem: item });
  },

  setEditOpen: (open) =>
    set((state) => ({
      editOpen: open,
      selectedItem: open ? state.selectedItem : null,
    })),

  setDeleteOpen: (open) =>
    set((state) => ({
      deleteOpen: open,
      selectedItem: open ? state.selectedItem : null,
    })),
  setCreateOpen: (open) => set({ createOpen: open }),
  setResetPasswordOpen: (open) =>
    set((state) => ({
      resetPasswordOpen: open,
      selectedItem: open ? state.selectedItem : null,
    })),
}));
