import type { Map } from "maplibre-gl";
import { setCountySelection } from "./countyLayers";
import { counties, seats } from "./data";
import { getTopLevelUnitId } from "./data";
import { setRelationSelection } from "./relationLayers";
import { setSeatFocus } from "./seatLayers";

export function updateMapSelection(map: Map, options: {
  selectedUnitId: string | null;
  selectedCountyId: string | null;
  focusRegionId: string | null;
}) {
  const { selectedUnitId, selectedCountyId, focusRegionId } = options;
  const topLevelUnitId = getTopLevelUnitId(selectedUnitId);
  setSeatFocus(map, topLevelUnitId, focusRegionId);
  setRelationSelection(map, topLevelUnitId);
  setCountySelection(map, selectedUnitId, selectedCountyId);

  const selected = counties.find(({ unit }) => unit.id === selectedCountyId) ??
    seats.find(({ unit }) => unit.id === selectedUnitId);
  if (!selected) return;
  map.easeTo({
    center: [selected.place.longitude!, selected.place.latitude!],
    zoom: Math.max(map.getZoom(), 6.2),
    duration: 650,
  });
}
