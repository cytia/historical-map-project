import type { Map } from "maplibre-gl";
import { setCountySelection } from "./countyLayers";
import { counties, getTopLevelUnitId, seats } from "./data";
import { militaryById } from "./militaryData";
import { setRelationSelection } from "./relationLayers";
import { setSeatDisplayMode, setSeatSelection } from "./seatLayers";
import type { HierarchyScope, MapDisplayMode } from "./types";

export function updateMapHierarchySelection(map: Map, options: {
  selectedUnitId: string | null;
  displayMode: MapDisplayMode;
}) {
  const { selectedUnitId, displayMode } = options;
  const topLevelUnitId = getTopLevelUnitId(selectedUnitId);
  setSeatSelection(map, topLevelUnitId);
  setSeatDisplayMode(map, displayMode);
  setRelationSelection(map, topLevelUnitId);
}

export function updateMapCountySelection(map: Map, options: {
  selectedUnitId: string | null;
  selectedCountyId: string | null;
  countyRegionId: string | null;
  hierarchyScope: HierarchyScope;
  displayMode: MapDisplayMode;
}) {
  const { selectedUnitId, selectedCountyId, countyRegionId,
    hierarchyScope, displayMode } = options;
  setCountySelection(map, {
    selectedUnitId,
    selectedCountyId,
    regionId: countyRegionId,
    scope: hierarchyScope,
    displayMode,
  });
}

export function focusMapSelection(
  map: Map,
  selectedUnitId: string | null,
  selectedCountyId: string | null,
  selectedMilitaryUnitId: string | null,
) {
  const selected = counties.find(({ unit }) => unit.id === selectedCountyId) ??
    seats.find(({ unit }) => unit.id === selectedUnitId) ??
    militaryById.get(selectedMilitaryUnitId ?? "");
  if (!selected) return;
  map.easeTo({
    center: [selected.place.longitude!, selected.place.latitude!],
    zoom: Math.max(map.getZoom(), 6.2),
    duration: 650,
  });
}
