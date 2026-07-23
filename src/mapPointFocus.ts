import type { Map } from "maplibre-gl";
import { getUnitRegionId } from "./data";
import { getMilitaryCommandRecord } from "./militaryData";
import { setMilitaryPointFocus } from "./militaryLayers";
import { setSeatFocus } from "./seatLayers";

interface MapPointFocus {
  selectedUnitId: string | null;
  selectedMilitaryUnitId: string | null;
  hoveredRegionId: string | null;
  hoveredMilitaryUnitId: string | null;
  activeRegionId: string | null;
}

export function applyMapPointFocus(map: Map, focus: MapPointFocus) {
  const militaryUnitId = focus.selectedMilitaryUnitId ??
    (focus.selectedUnitId ? null : focus.hoveredMilitaryUnitId);
  if (militaryUnitId) {
    const commandId = getMilitaryCommandRecord(militaryUnitId)?.unit.id ?? militaryUnitId;
    setSeatFocus(map, null, true);
    setMilitaryPointFocus(map, commandId);
    return;
  }

  const administrativeRegionId = focus.selectedUnitId
    ? getUnitRegionId(focus.selectedUnitId)
    : focus.hoveredRegionId ?? focus.activeRegionId;
  setSeatFocus(map, administrativeRegionId);
  setMilitaryPointFocus(map, null, administrativeRegionId !== null);
}
