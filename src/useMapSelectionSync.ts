import { useEffect, type RefObject } from "react";
import type { Map } from "maplibre-gl";
import { getTopLevelUnitId, getUnitRegionId } from "./data";
import { setBoundarySelection, setBoundaryVisibility } from "./boundaryLayers";
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
import type { HierarchyScope, MapDisplayMode, MilitaryColorMode } from "./types";

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
  hierarchyScope: HierarchyScope;
  mapDisplayMode: MapDisplayMode;
  militaryColorMode: MilitaryColorMode;
  seatsVisible: boolean;
  militaryVisible: boolean;
  jimiVisible: boolean;
  boundariesVisible: boolean;
}

export function useMapSelectionSync(options: MapSelectionSyncOptions) {
  const { mapRef, selectedUnitId, selectedMilitaryUnitId, selectedJimiUnitId, selectedCountyId,
    activeRegionId, hoveredRegionId, hoveredMilitaryUnitId, hoveredJimiUnitId,
    hierarchyScope, mapDisplayMode, militaryColorMode, seatsVisible, militaryVisible, jimiVisible,
    boundariesVisible } = options;
  const selectedRegionId = getUnitRegionId(selectedUnitId);
  const militaryRegionId = selectedRegionId ?? activeRegionId;

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("seat-points")) return;
    updateMapHierarchySelection(map, {
      selectedUnitId,
      hierarchyScope,
      displayMode: mapDisplayMode,
    });
  }, [mapRef, selectedUnitId, hierarchyScope, mapDisplayMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("county-points")) return;
    updateMapCountySelection(map, {
      selectedUnitId,
      selectedCountyId,
      countyRegionId: selectedRegionId ?? activeRegionId,
      hierarchyScope,
      displayMode: mapDisplayMode,
    });
  }, [mapRef, selectedUnitId, selectedCountyId, selectedRegionId, activeRegionId,
    hierarchyScope, mapDisplayMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("military-points")) return;
    setMilitarySelection(map, {
      selectedMilitaryId: selectedMilitaryUnitId,
      selectedAdministrativeId: selectedUnitId,
      activeRegionId: militaryRegionId,
      scope: hierarchyScope,
      colorMode: militaryColorMode,
    });
  }, [mapRef, selectedMilitaryUnitId, selectedUnitId, militaryRegionId,
    hierarchyScope, militaryColorMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("jimi-points")) return;
    setJimiSelection(map, { selectedJimiId: selectedJimiUnitId, scope: hierarchyScope });
  }, [mapRef, selectedJimiUnitId, hierarchyScope]);

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
    hoveredMilitaryUnitId, hoveredJimiUnitId, activeRegionId, hierarchyScope]);

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

  useEffect(() => {
    const map = mapRef.current;
    if (map) setBoundaryVisibility(map, boundariesVisible);
  }, [mapRef, boundariesVisible]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) setBoundarySelection(map, getTopLevelUnitId(selectedUnitId));
  }, [mapRef, selectedUnitId]);
}
