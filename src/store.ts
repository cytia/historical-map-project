import { create } from "zustand";

interface AppState {
  selectedUnitId: string | null;
  searchQuery: string;
  sidebarOpen: boolean;
  detailsOpen: boolean;
  selectUnit: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setDetailsOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedUnitId: null,
  searchQuery: "",
  sidebarOpen: false,
  detailsOpen: false,
  selectUnit: (selectedUnitId) =>
    set({ selectedUnitId, detailsOpen: selectedUnitId !== null }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setDetailsOpen: (detailsOpen) => set({ detailsOpen }),
}));

