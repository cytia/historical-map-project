import { create } from "zustand";

interface AppState {
  selectedUnitId: string | null;
  selectedCountyId: string | null;
  activeRegionId: string | null;
  hoveredRegionId: string | null;
  searchQuery: string;
  sidebarOpen: boolean;
  detailsOpen: boolean;
  seatsVisible: boolean;
  modernReferenceVisible: boolean;
  selectUnit: (id: string | null) => void;
  selectCounty: (countyId: string, parentId: string, regionId: string) => void;
  setActiveRegion: (id: string | null) => void;
  setHoveredRegion: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setDetailsOpen: (open: boolean) => void;
  setSeatsVisible: (visible: boolean) => void;
  setModernReferenceVisible: (visible: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedUnitId: null,
  selectedCountyId: null,
  activeRegionId: null,
  hoveredRegionId: null,
  searchQuery: "",
  sidebarOpen: false,
  detailsOpen: false,
  seatsVisible: true,
  modernReferenceVisible: true,
  selectUnit: (selectedUnitId) =>
    set({ selectedUnitId, selectedCountyId: null, detailsOpen: selectedUnitId !== null }),
  selectCounty: (selectedCountyId, selectedUnitId, activeRegionId) =>
    set({ selectedCountyId, selectedUnitId, activeRegionId, detailsOpen: true }),
  setActiveRegion: (activeRegionId) => set({
    activeRegionId,
    selectedUnitId: null,
    selectedCountyId: null,
    detailsOpen: false,
  }),
  setHoveredRegion: (hoveredRegionId) => set({ hoveredRegionId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setDetailsOpen: (detailsOpen) => set({ detailsOpen }),
  setSeatsVisible: (seatsVisible) => set({ seatsVisible }),
  setModernReferenceVisible: (modernReferenceVisible) =>
    set({ modernReferenceVisible }),
}));
