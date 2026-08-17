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
  selectedJimiUnitId: string | null;
  selectionDomain: SelectionDomain;
  selectedCountyId: string | null;
  activeRegionId: string | null;
  hoveredRegionId: string | null;
  hoveredMilitaryUnitId: string | null;
  hoveredJimiUnitId: string | null;
  searchQuery: string;
  sidebarOpen: boolean;
  detailsOpen: boolean;
  seatsVisible: boolean;
  militaryVisible: boolean;
  jimiVisible: boolean;
  boundariesVisible: boolean;
  hierarchyScope: HierarchyScope;
  mapDisplayMode: MapDisplayMode;
  militaryColorMode: MilitaryColorMode;
  selectUnit: (id: string | null) => void;
  selectMilitaryUnit: (id: string | null, regionId: string | null) => void;
  selectJimiUnit: (id: string | null, regionId: string | null) => void;
  selectCounty: (countyId: string, parentId: string, regionId: string) => void;
  resetSelection: () => void;
  setActiveRegion: (id: string | null) => void;
  setHoveredRegion: (id: string | null) => void;
  setHoveredMilitaryUnit: (id: string | null) => void;
  setHoveredJimiUnit: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setDetailsOpen: (open: boolean) => void;
  setSeatsVisible: (visible: boolean) => void;
  setMilitaryVisible: (visible: boolean) => void;
  setJimiVisible: (visible: boolean) => void;
  setBoundariesVisible: (visible: boolean) => void;
  setHierarchyScope: (scope: HierarchyScope) => void;
  setMapDisplayMode: (mode: MapDisplayMode) => void;
  setMilitaryColorMode: (mode: MilitaryColorMode) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedUnitId: null,
  selectedMilitaryUnitId: null,
  selectedJimiUnitId: null,
  selectionDomain: "administrative",
  selectedCountyId: null,
  activeRegionId: null,
  hoveredRegionId: null,
  hoveredMilitaryUnitId: null,
  hoveredJimiUnitId: null,
  searchQuery: "",
  sidebarOpen: false,
  detailsOpen: false,
  seatsVisible: true,
  militaryVisible: false,
  jimiVisible: false,
  boundariesVisible: true,
  hierarchyScope: "unit",
  mapDisplayMode: "administrative",
  militaryColorMode: "administrative",
  selectUnit: (selectedUnitId) =>
    set({ selectedUnitId, selectedMilitaryUnitId: null, selectedJimiUnitId: null,
      selectionDomain: "administrative", selectedCountyId: null,
      hoveredMilitaryUnitId: null, hoveredJimiUnitId: null,
      detailsOpen: selectedUnitId !== null }),
  selectMilitaryUnit: (selectedMilitaryUnitId, activeRegionId) =>
    set({ selectedMilitaryUnitId, selectedJimiUnitId: null, selectedUnitId: null,
      selectedCountyId: null, selectionDomain: "military", activeRegionId,
      hoveredJimiUnitId: null, detailsOpen: selectedMilitaryUnitId !== null }),
  selectJimiUnit: (selectedJimiUnitId, activeRegionId) =>
    set({ selectedJimiUnitId, selectedUnitId: null, selectedMilitaryUnitId: null,
      selectedCountyId: null, selectionDomain: "jimi", activeRegionId,
      hoveredMilitaryUnitId: null, hoveredJimiUnitId: null,
      detailsOpen: selectedJimiUnitId !== null }),
  selectCounty: (selectedCountyId, selectedUnitId, activeRegionId) =>
    set({ selectedCountyId, selectedUnitId, selectedMilitaryUnitId: null,
      selectedJimiUnitId: null, selectionDomain: "administrative", activeRegionId,
      hoveredMilitaryUnitId: null, hoveredJimiUnitId: null,
      detailsOpen: true }),
  resetSelection: () => set({
    selectedUnitId: null,
    selectedMilitaryUnitId: null,
    selectedJimiUnitId: null,
    selectionDomain: "administrative",
    selectedCountyId: null,
    activeRegionId: null,
    hoveredRegionId: null,
    hoveredMilitaryUnitId: null,
    hoveredJimiUnitId: null,
    detailsOpen: false,
  }),
  setActiveRegion: (activeRegionId) => set({
    activeRegionId,
    selectedUnitId: null,
    selectedMilitaryUnitId: null,
    selectedJimiUnitId: null,
    selectionDomain: "administrative",
    selectedCountyId: null,
    hoveredMilitaryUnitId: null,
    hoveredJimiUnitId: null,
    detailsOpen: false,
  }),
  setHoveredRegion: (hoveredRegionId) => set({ hoveredRegionId }),
  setHoveredMilitaryUnit: (hoveredMilitaryUnitId) => set({ hoveredMilitaryUnitId }),
  setHoveredJimiUnit: (hoveredJimiUnitId) => set({ hoveredJimiUnitId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setDetailsOpen: (detailsOpen) => set({ detailsOpen }),
  setSeatsVisible: (seatsVisible) => set({ seatsVisible }),
  setMilitaryVisible: (militaryVisible) => set({ militaryVisible }),
  setJimiVisible: (jimiVisible) => set({ jimiVisible }),
  setBoundariesVisible: (boundariesVisible) => set({ boundariesVisible }),
  setHierarchyScope: (hierarchyScope) => set((state) => ({
    hierarchyScope,
    selectedCountyId: hierarchyScope === "overview" ? null : state.selectedCountyId,
  })),
  setMapDisplayMode: (mapDisplayMode) => set({ mapDisplayMode }),
  setMilitaryColorMode: (militaryColorMode) => set({ militaryColorMode }),
}));
