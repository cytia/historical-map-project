import { create } from "zustand";
import type {
  HierarchyScope,
  MapDisplayMode,
  MilitaryColorMode,
  SelectionDomain,
} from "./types";

interface AppState {
  selectedUnitId: string | null;
  selectedMilitaryUnitId: string | null;
  selectionDomain: SelectionDomain;
  selectedCountyId: string | null;
  activeRegionId: string | null;
  hoveredRegionId: string | null;
  searchQuery: string;
  sidebarOpen: boolean;
  detailsOpen: boolean;
  seatsVisible: boolean;
  militaryVisible: boolean;
  modernReferenceVisible: boolean;
  hierarchyScope: HierarchyScope;
  mapDisplayMode: MapDisplayMode;
  militaryColorMode: MilitaryColorMode;
  selectUnit: (id: string | null) => void;
  selectMilitaryUnit: (id: string | null, regionId: string | null) => void;
  selectCounty: (countyId: string, parentId: string, regionId: string) => void;
  resetSelection: () => void;
  setActiveRegion: (id: string | null) => void;
  setHoveredRegion: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setDetailsOpen: (open: boolean) => void;
  setSeatsVisible: (visible: boolean) => void;
  setMilitaryVisible: (visible: boolean) => void;
  setModernReferenceVisible: (visible: boolean) => void;
  setHierarchyScope: (scope: HierarchyScope) => void;
  setMapDisplayMode: (mode: MapDisplayMode) => void;
  setMilitaryColorMode: (mode: MilitaryColorMode) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedUnitId: null,
  selectedMilitaryUnitId: null,
  selectionDomain: "administrative",
  selectedCountyId: null,
  activeRegionId: null,
  hoveredRegionId: null,
  searchQuery: "",
  sidebarOpen: false,
  detailsOpen: false,
  seatsVisible: true,
  militaryVisible: false,
  modernReferenceVisible: true,
  hierarchyScope: "unit",
  mapDisplayMode: "administrative",
  militaryColorMode: "administrative",
  selectUnit: (selectedUnitId) =>
    set({ selectedUnitId, selectedMilitaryUnitId: null, selectionDomain: "administrative",
      selectedCountyId: null, detailsOpen: selectedUnitId !== null }),
  selectMilitaryUnit: (selectedMilitaryUnitId, activeRegionId) =>
    set({ selectedMilitaryUnitId, selectedUnitId: null, selectedCountyId: null,
      selectionDomain: "military", activeRegionId, detailsOpen: selectedMilitaryUnitId !== null }),
  selectCounty: (selectedCountyId, selectedUnitId, activeRegionId) =>
    set({ selectedCountyId, selectedUnitId, selectedMilitaryUnitId: null,
      selectionDomain: "administrative", activeRegionId, detailsOpen: true }),
  resetSelection: () => set({
    selectedUnitId: null,
    selectedMilitaryUnitId: null,
    selectionDomain: "administrative",
    selectedCountyId: null,
    activeRegionId: null,
    hoveredRegionId: null,
    detailsOpen: false,
  }),
  setActiveRegion: (activeRegionId) => set({
    activeRegionId,
    selectedUnitId: null,
    selectedMilitaryUnitId: null,
    selectionDomain: "administrative",
    selectedCountyId: null,
    detailsOpen: false,
  }),
  setHoveredRegion: (hoveredRegionId) => set({ hoveredRegionId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setDetailsOpen: (detailsOpen) => set({ detailsOpen }),
  setSeatsVisible: (seatsVisible) => set({ seatsVisible }),
  setMilitaryVisible: (militaryVisible) => set({ militaryVisible }),
  setModernReferenceVisible: (modernReferenceVisible) =>
    set({ modernReferenceVisible }),
  setHierarchyScope: (hierarchyScope) => set((state) => ({
    hierarchyScope,
    selectedCountyId: hierarchyScope === "overview" ? null : state.selectedCountyId,
  })),
  setMapDisplayMode: (mapDisplayMode) => set({ mapDisplayMode }),
  setMilitaryColorMode: (militaryColorMode) => set({ militaryColorMode }),
}));
