import { create } from "zustand";
import type { YouthWithoutDisabilitiesType } from "@/db/schema";

interface YouthWithoutDisabilitiesStore {
  data: YouthWithoutDisabilitiesType[];
  selectedItem: YouthWithoutDisabilitiesType | null;

  setData: (data: YouthWithoutDisabilitiesType[]) => void;
  setSelectedItem: (item: YouthWithoutDisabilitiesType | null) => void;

  editOpen: boolean;
  deleteOpen: boolean;
  createOpen: boolean;

  setEditOpen: (open: boolean) => void;
  setDeleteOpen: (open: boolean) => void;
  setCreateOpen: (open: boolean) => void;
}

export const useYouthWithoutDisabilitiesStore =
  create<YouthWithoutDisabilitiesStore>((set) => ({
    data: [],
    selectedItem: null,
    editOpen: false,
    deleteOpen: false,
    createOpen: false,

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
  }));
