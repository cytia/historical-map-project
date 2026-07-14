import { useEffect, type RefObject } from "react";
import type { Map } from "maplibre-gl";
import { seats } from "./data";
import {
  focusMapSelection,
  updateMapCountySelection,
  updateMapHierarchySelection,
} from "./mapSelection";
import { setSeatLayerVisibility } from "./seatLayers";
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("seat-points")) return;
    const selectedRegion = seats.find(({ unit }) => unit.id === selectedUnitId)?.region.id;
    updateMapHierarchySelection(map, {
      selectedUnitId,
      focusRegionId: selectedRegion ?? hoveredRegionRef.current ?? activeRegionId,
    });
  }, [mapRef, hoveredRegionRef, selectedUnitId, activeRegionId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("county-points")) return;
    const selectedRegion = seats.find(({ unit }) => unit.id === selectedUnitId)?.region.id;
    updateMapCountySelection(map, {
      selectedUnitId,
      selectedCountyId,
      countyRegionId: selectedRegion ?? activeRegionId,
      administrativeDisplayScope,
    });
  }, [mapRef, selectedUnitId, selectedCountyId, activeRegionId,
    administrativeDisplayScope]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) focusMapSelection(map, selectedUnitId, selectedCountyId);
  }, [mapRef, selectedUnitId, selectedCountyId]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) setSeatLayerVisibility(map, seatsVisible);
  }, [mapRef, seatsVisible]);
}
