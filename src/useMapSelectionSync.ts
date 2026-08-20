import { useEffect, type RefObject } from "react";
import type { Map } from "maplibre-gl";
import { getTopLevelUnitId, getUnitRegionId } from "./data";
import { setBoundarySelection } from "./boundaryLayers";
import { setNationScope } from "./nationLayer";
import {
  focusMapSelection,
  updateMapCountySelection,
  updateMapHierarchySelection,
} from "./mapSelection";
import { setLayerVisibility } from "./mapLayerVisibility";
import { setJimiSelection, setJimiVisibility } from "./jimiLayers";
import { applyMapPointFocus } from "./mapPointFocus";
import { seatLayerIds } from "./seatLayers";
import { setMilitarySelection, setMilitaryVisibility } from "./militaryLayers";
import type { MapDisplayMode, MilitaryColorMode } from "./types";

interface MapSelectionSyncOptions {
  mapRef: RefObject<Map | null>;
  selectedUnitId: string | null;
  selectedMilitaryUnitId: string | null;
  selectedJimiUnitId: string | null;
  selectedCountyId: string | null;
  activeRegionId: string | null;
  hoveredRegionId: string | null;
  hoveredMilitaryUnitId: string | null;
  hoveredJimiUnitId: string | null;
  mapDisplayMode: MapDisplayMode;
  militaryColorMode: MilitaryColorMode;
  seatsVisible: boolean;
  militaryVisible: boolean;
  jimiVisible: boolean;
}

export function useMapSelectionSync(options: MapSelectionSyncOptions) {
  const { mapRef, selectedUnitId, selectedMilitaryUnitId, selectedJimiUnitId, selectedCountyId,
    activeRegionId, hoveredRegionId, hoveredMilitaryUnitId, hoveredJimiUnitId,
    mapDisplayMode, militaryColorMode, seatsVisible, militaryVisible, jimiVisible } = options;
  const selectedRegionId = getUnitRegionId(selectedUnitId);
  const militaryRegionId = selectedRegionId ?? activeRegionId;

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("seat-points")) return;
    updateMapHierarchySelection(map, {
      selectedUnitId,
      displayMode: mapDisplayMode,
    });
  }, [mapRef, selectedUnitId, mapDisplayMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("county-points")) return;
    updateMapCountySelection(map, {
      selectedUnitId,
      selectedCountyId,
      countyRegionId: selectedRegionId ?? activeRegionId,
      displayMode: mapDisplayMode,
    });
  }, [mapRef, selectedUnitId, selectedCountyId, selectedRegionId, activeRegionId,
    mapDisplayMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("military-points")) return;
    setMilitarySelection(map, {
      selectedMilitaryId: selectedMilitaryUnitId,
      selectedAdministrativeId: selectedUnitId,
      activeRegionId: militaryRegionId,
      colorMode: militaryColorMode,
    });
  }, [mapRef, selectedMilitaryUnitId, selectedUnitId, militaryRegionId, militaryColorMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("jimi-points")) return;
    setJimiSelection(map, {
      selectedJimiId: selectedJimiUnitId,
      activeRegionId: militaryRegionId,
    });
  }, [mapRef, selectedJimiUnitId, militaryRegionId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("military-points") || !map.getLayer("seat-points")) return;
    applyMapPointFocus(map, {
      selectedUnitId,
      selectedMilitaryUnitId,
      selectedJimiUnitId,
      hoveredRegionId,
      hoveredMilitaryUnitId,
      hoveredJimiUnitId,
      activeRegionId,
    });
  }, [mapRef, selectedUnitId, selectedMilitaryUnitId, selectedJimiUnitId, hoveredRegionId,
    hoveredMilitaryUnitId, hoveredJimiUnitId, activeRegionId]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) focusMapSelection(map, selectedUnitId, selectedCountyId,
      selectedMilitaryUnitId, selectedJimiUnitId);
  }, [mapRef, selectedUnitId, selectedCountyId, selectedMilitaryUnitId, selectedJimiUnitId]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) setLayerVisibility(map, seatLayerIds, seatsVisible);
  }, [mapRef, seatsVisible]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) setMilitaryVisibility(map, militaryVisible);
  }, [mapRef, militaryVisible]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) setJimiVisibility(map, jimiVisible);
  }, [mapRef, jimiVisible]);

  // The nation view is on exactly when no province is in view, so the two layers switch
  // from one fact rather than from a second copy of it in state.
  const provinceScope = (selectedRegionId ?? activeRegionId) !== null;

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    setBoundarySelection(map, getTopLevelUnitId(selectedUnitId), provinceScope);
    setNationScope(map, !provinceScope);
  }, [mapRef, selectedUnitId, provinceScope]);
}
