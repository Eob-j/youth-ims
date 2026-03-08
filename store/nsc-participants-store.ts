import { create } from "zustand";
import type { NscParticipantsType } from "@/db/schema";

interface NscParticipantsStore {
  selectedItem: NscParticipantsType | null;
  setSelectedItem: (item: NscParticipantsType | null) => void;

  createOpen: boolean;
  editOpen: boolean;
  deleteOpen: boolean;

  selectedRegion: string;
  selectedCategory: string;
  selectedStatus: string;

  setCreateOpen: (open: boolean) => void;
  setEditOpen: (open: boolean) => void;
  setDeleteOpen: (open: boolean) => void;

  setSelectedRegion: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  setSelectedStatus: (value: string) => void;
}

export const useNscParticipantsStore = create<NscParticipantsStore>((set) => ({
  selectedItem: null,
  createOpen: false,
  editOpen: false,
  deleteOpen: false,

  selectedRegion: "all",
  selectedCategory: "all",
  selectedStatus: "all",

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

  setSelectedRegion: (value) => set({ selectedRegion: value }),
  setSelectedCategory: (value) => set({ selectedCategory: value }),
  setSelectedStatus: (value) => set({ selectedStatus: value }),
}));
