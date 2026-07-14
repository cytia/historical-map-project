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
import type { AdministrativeDisplayScope } from "./types";

interface MapSelectionSyncOptions {
  mapRef: RefObject<Map | null>;
  hoveredRegionRef: RefObject<string | null>;
  selectedUnitId: string | null;
  selectedCountyId: string | null;
  activeRegionId: string | null;
  administrativeDisplayScope: AdministrativeDisplayScope;
  seatsVisible: boolean;
}

export function useMapSelectionSync(options: MapSelectionSyncOptions) {
  const { mapRef, hoveredRegionRef, selectedUnitId, selectedCountyId,
    activeRegionId, administrativeDisplayScope, seatsVisible } = options;
  const selectedRegionId = getUnitRegionId(selectedUnitId);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("seat-points")) return;
    updateMapHierarchySelection(map, {
      selectedUnitId,
      focusRegionId: selectedRegionId ?? hoveredRegionRef.current ?? activeRegionId,
    });
  }, [mapRef, hoveredRegionRef, selectedUnitId, selectedRegionId, activeRegionId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("county-points")) return;
    updateMapCountySelection(map, {
      selectedUnitId,
      selectedCountyId,
      countyRegionId: selectedRegionId ?? activeRegionId,
      administrativeDisplayScope,
    });
  }, [mapRef, selectedUnitId, selectedCountyId, selectedRegionId, activeRegionId,
    administrativeDisplayScope]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) focusMapSelection(map, selectedUnitId, selectedCountyId);
  }, [mapRef, selectedUnitId, selectedCountyId]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) setLayerVisibility(map, seatLayerIds, seatsVisible);
  }, [mapRef, seatsVisible]);
}
