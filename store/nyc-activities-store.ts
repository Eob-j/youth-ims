import { create } from "zustand";
import type { NycActivitiesType } from "@/db/schema";

interface NycActivitiesStore {
  selectedItem: NycActivitiesType | null;
  setSelectedItem: (item: NycActivitiesType | null) => void;

  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;

  editOpen: boolean;
  setEditOpen: (open: boolean) => void;

  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;

  selectedCategory: string;
  setSelectedCategory: (value: string) => void;

  selectedRegion: string;
  setSelectedRegion: (value: string) => void;

  selectedYear: string;
  setSelectedYear: (value: string) => void;

  selectedOrgRegion: string;
  setSelectedOrgRegion: (value: string) => void;
}

export const useNycActivitiesStore = create<NycActivitiesStore>((set) => ({
  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),

  createOpen: false,
  setCreateOpen: (open) => set({ createOpen: open }),

  editOpen: false,
  setEditOpen: (open) => set({ editOpen: open }),

  deleteOpen: false,
  setDeleteOpen: (open) => set({ deleteOpen: open }),

  selectedCategory: "all",
  setSelectedCategory: (value) => set({ selectedCategory: value }),

  selectedRegion: "all",
  setSelectedRegion: (value) => set({ selectedRegion: value }),

  selectedYear: "all",
  setSelectedYear: (value) => set({ selectedYear: value }),

  selectedOrgRegion: "all",
  setSelectedOrgRegion: (value) => set({ selectedOrgRegion: value }),
}));
