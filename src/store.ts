import { create } from "zustand";
import type { CountyDisplayScope } from "./types";

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
  countyDisplayScope: CountyDisplayScope;
  selectUnit: (id: string | null) => void;
  selectCounty: (countyId: string, parentId: string, regionId: string) => void;
  resetSelection: () => void;
  setActiveRegion: (id: string | null) => void;
  setHoveredRegion: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setDetailsOpen: (open: boolean) => void;
  setSeatsVisible: (visible: boolean) => void;
  setModernReferenceVisible: (visible: boolean) => void;
  setCountyDisplayScope: (scope: CountyDisplayScope) => void;
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
  countyDisplayScope: "prefecture",
  selectUnit: (selectedUnitId) =>
    set({ selectedUnitId, selectedCountyId: null, detailsOpen: selectedUnitId !== null }),
  selectCounty: (selectedCountyId, selectedUnitId, activeRegionId) =>
    set({ selectedCountyId, selectedUnitId, activeRegionId, detailsOpen: true }),
  resetSelection: () => set({
    selectedUnitId: null,
    selectedCountyId: null,
    activeRegionId: null,
    hoveredRegionId: null,
    detailsOpen: false,
  }),
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
  setCountyDisplayScope: (countyDisplayScope) => set({ countyDisplayScope }),
}));
