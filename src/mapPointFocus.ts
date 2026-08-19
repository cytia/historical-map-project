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
  // Points of every system are drawn only once a province is in view. The province in view
  // is the active region: a hover must not open the gate, or moving the pointer over the
  // map before choosing anything would flash every province's points in turn.
  const administrativeRegionId = getUnitRegionId(focus.selectedUnitId) ?? focus.activeRegionId;
  if (jimiUnitId) {
    setSeatFocus(map, null, true);
    setMilitaryPointFocus(map, null, true, administrativeRegionId);
    setJimiPointFocus(map, getJimiFocusId(jimiUnitId) ?? jimiUnitId, false, administrativeRegionId);
    return;
  }
  if (militaryUnitId) {
    const commandId = getMilitaryFocusId(militaryUnitId) ?? militaryUnitId;
    setSeatFocus(map, null, true);
    setMilitaryPointFocus(map, commandId, false, administrativeRegionId);
    setJimiPointFocus(map, null, true, administrativeRegionId);
    return;
  }

  setSeatFocus(map, administrativeRegionId);
  setMilitaryPointFocus(map, null, false, administrativeRegionId);
  setJimiPointFocus(map, null, false, administrativeRegionId);
}
