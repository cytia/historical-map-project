import type { Map } from "maplibre-gl";
import { getUnitRegionId } from "./data";
import { getJimiFocusId } from "./jimiData";
import { getMilitaryFocusId } from "./militaryData";
import { setJimiPointFocus } from "./jimiLayers";
import { setMilitaryPointFocus } from "./militaryLayers";
import { setSeatFocus } from "./seatLayers";

interface MapPointFocus {
  selectedUnitId: string | null;
  selectedMilitaryUnitId: string | null;
  selectedJimiUnitId: string | null;
  hoveredRegionId: string | null;
  hoveredMilitaryUnitId: string | null;
  hoveredJimiUnitId: string | null;
  activeRegionId: string | null;
}

export function applyMapPointFocus(map: Map, focus: MapPointFocus) {
  const militaryUnitId = focus.selectedMilitaryUnitId ??
    (focus.selectedUnitId ? null : focus.hoveredMilitaryUnitId);
  const jimiUnitId = focus.selectedJimiUnitId ??
    (focus.selectedUnitId || militaryUnitId ? null : focus.hoveredJimiUnitId);
  if (jimiUnitId) {
    setSeatFocus(map, null, true);
    setMilitaryPointFocus(map, null, true);
    setJimiPointFocus(map, getJimiFocusId(jimiUnitId) ?? jimiUnitId);
    return;
  }
  if (militaryUnitId) {
    const commandId = getMilitaryFocusId(militaryUnitId) ?? militaryUnitId;
    setSeatFocus(map, null, true);
    setMilitaryPointFocus(map, commandId);
    setJimiPointFocus(map, null, true);
    return;
  }

  const administrativeRegionId = focus.selectedUnitId
    ? getUnitRegionId(focus.selectedUnitId)
    : focus.hoveredRegionId ?? focus.activeRegionId;
  setSeatFocus(map, administrativeRegionId);
  setMilitaryPointFocus(map, null, administrativeRegionId !== null);
  setJimiPointFocus(map, null, administrativeRegionId !== null);
}
