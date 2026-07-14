import type { Map } from "maplibre-gl";
import { setCountySelection } from "./countyLayers";
import { counties, getTopLevelUnitId, seats } from "./data";
import { setRelationSelection } from "./relationLayers";
import { setSeatFocus } from "./seatLayers";
import type { AdministrativeDisplayScope } from "./types";

export function updateMapHierarchySelection(map: Map, options: {
  selectedUnitId: string | null;
  focusRegionId: string | null;
}) {
  const { selectedUnitId, focusRegionId } = options;
  const topLevelUnitId = getTopLevelUnitId(selectedUnitId);
  setSeatFocus(map, topLevelUnitId, focusRegionId);
  setRelationSelection(map, topLevelUnitId);
}

export function updateMapCountySelection(map: Map, options: {
  selectedUnitId: string | null;
  selectedCountyId: string | null;
  countyRegionId: string | null;
  administrativeDisplayScope: AdministrativeDisplayScope;
}) {
  const { selectedUnitId, selectedCountyId, countyRegionId,
    administrativeDisplayScope } = options;
  setCountySelection(map, {
    selectedUnitId,
    selectedCountyId,
    regionId: countyRegionId,
    scope: administrativeDisplayScope,
  });
}

export function focusMapSelection(
  map: Map,
  selectedUnitId: string | null,
  selectedCountyId: string | null,
) {
  const selected = counties.find(({ unit }) => unit.id === selectedCountyId) ??
    seats.find(({ unit }) => unit.id === selectedUnitId);
  if (!selected) return;
  map.easeTo({
    center: [selected.place.longitude!, selected.place.latitude!],
    zoom: Math.max(map.getZoom(), 6.2),
    duration: 650,
  });
}
