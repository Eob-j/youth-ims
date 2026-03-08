import { create } from "zustand";
import type { IndicatorDataType } from "@/db/schema";

interface IndicatorDataStore {
  selectedItem: IndicatorDataType | null;
  setSelectedItem: (item: IndicatorDataType | null) => void;

  createOpen: boolean;
  editOpen: boolean;
  deleteOpen: boolean;

  selectedOrg: string;
  selectedYear: string;
  selectedCategory: string;

  setCreateOpen: (open: boolean) => void;
  setEditOpen: (open: boolean) => void;
  setDeleteOpen: (open: boolean) => void;

  setSelectedOrg: (value: string) => void;
  setSelectedYear: (value: string) => void;
  setSelectedCategory: (value: string) => void;
}

export const useIndicatorDataStore = create<IndicatorDataStore>((set) => ({
  selectedItem: null,
  createOpen: false,
  editOpen: false,
  deleteOpen: false,

  selectedOrg: "all",
  selectedYear: "all",
  selectedCategory: "all",

  setSelectedItem: (item) => set({ selectedItem: item }),
  setCreateOpen: (open) => set({ createOpen: open }),
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

  setSelectedOrg: (value) => set({ selectedOrg: value }),
  setSelectedYear: (value) => set({ selectedYear: value }),
  setSelectedCategory: (value) => set({ selectedCategory: value }),
}));
