import { useEffect, type RefObject } from "react";
import type { Map } from "maplibre-gl";
import { getUnitRegionId } from "./data";
import {
  focusMapSelection,
  updateMapCountySelection,
  updateMapHierarchySelection,
} from "./mapSelection";
import { setLayerVisibility } from "./mapLayerVisibility";
import { seatLayerIds } from "./seatLayers";
import { setMilitarySelection, setMilitaryVisibility } from "./militaryLayers";
import type { HierarchyScope, MapDisplayMode, MilitaryColorMode } from "./types";

interface MapSelectionSyncOptions {
  mapRef: RefObject<Map | null>;
  hoveredRegionRef: RefObject<string | null>;
  selectedUnitId: string | null;
  selectedMilitaryUnitId: string | null;
  selectedCountyId: string | null;
  activeRegionId: string | null;
  hierarchyScope: HierarchyScope;
  mapDisplayMode: MapDisplayMode;
  militaryColorMode: MilitaryColorMode;
  seatsVisible: boolean;
  militaryVisible: boolean;
}

export function useMapSelectionSync(options: MapSelectionSyncOptions) {
  const { mapRef, hoveredRegionRef, selectedUnitId, selectedMilitaryUnitId, selectedCountyId,
    activeRegionId, hierarchyScope, mapDisplayMode, militaryColorMode, seatsVisible,
    militaryVisible } = options;
  const selectedRegionId = getUnitRegionId(selectedUnitId);
  const militaryRegionId = selectedRegionId ?? activeRegionId;

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("seat-points")) return;
    updateMapHierarchySelection(map, {
      selectedUnitId,
      focusRegionId: selectedRegionId ?? hoveredRegionRef.current ?? activeRegionId,
      displayMode: mapDisplayMode,
    });
  }, [mapRef, hoveredRegionRef, selectedUnitId, selectedRegionId, activeRegionId,
    mapDisplayMode]);

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
    if (map) focusMapSelection(map, selectedUnitId, selectedCountyId, selectedMilitaryUnitId);
  }, [mapRef, selectedUnitId, selectedCountyId, selectedMilitaryUnitId]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) setLayerVisibility(map, seatLayerIds, seatsVisible);
  }, [mapRef, seatsVisible]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) setMilitaryVisibility(map, militaryVisible);
  }, [mapRef, militaryVisible]);
}
