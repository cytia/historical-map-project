import type { Map, MapLayerMouseEvent } from "maplibre-gl";
import { queryAdministrativeTargets } from "./mapSelectionInteraction";

interface HoverRef {
  current: string | null;
}

interface PointHoverOptions {
  hoveredRegionRef: HoverRef;
  hoveredMilitaryRef: HoverRef;
  setHoveredRegion: (id: string | null) => void;
  setHoveredMilitaryUnit: (id: string | null) => void;
}

export function registerPointHoverHandlers(map: Map, options: PointHoverOptions) {
  const { hoveredRegionRef, hoveredMilitaryRef,
    setHoveredRegion, setHoveredMilitaryUnit } = options;
  const clearRegion = () => {
    if (hoveredRegionRef.current === null) return;
    hoveredRegionRef.current = null;
    setHoveredRegion(null);
  };
  const clearMilitary = () => {
    if (hoveredMilitaryRef.current === null) return;
    hoveredMilitaryRef.current = null;
    setHoveredMilitaryUnit(null);
  };
  const hoverSeat = (event: MapLayerMouseEvent) => {
    clearMilitary();
    const regionId = event.features?.[0]?.properties?.regionId;
    const nextRegionId = typeof regionId === "string" ? regionId : null;
    if (hoveredRegionRef.current === nextRegionId) return;
    hoveredRegionRef.current = nextRegionId;
    setHoveredRegion(nextRegionId);
  };
  const hoverMilitary = (event: MapLayerMouseEvent) => {
    const administrativeTarget = queryAdministrativeTargets(map, event.point)[0];
    if (administrativeTarget) {
      clearMilitary();
      if (hoveredRegionRef.current === administrativeTarget.regionId) return;
      hoveredRegionRef.current = administrativeTarget.regionId;
      setHoveredRegion(administrativeTarget.regionId);
      return;
    }
    clearRegion();
    const id = event.features?.[0]?.properties?.id;
    const nextMilitaryId = typeof id === "string" ? id : null;
    if (hoveredMilitaryRef.current === nextMilitaryId) return;
    hoveredMilitaryRef.current = nextMilitaryId;
    setHoveredMilitaryUnit(nextMilitaryId);
  };
  const showPointer = () => {
    map.getCanvas().style.cursor = "pointer";
  };
  const clearPointer = () => {
    map.getCanvas().style.cursor = "";
  };
  const leaveMilitary = () => {
    clearPointer();
    clearMilitary();
    clearRegion();
  };
  const leaveSeat = () => {
    clearPointer();
    clearRegion();
  };

  map.on("mousemove", "seat-points", hoverSeat);
  map.on("mouseenter", "seat-points", showPointer);
  map.on("mouseleave", "seat-points", leaveSeat);
  map.on("mousemove", "military-points", hoverMilitary);
  map.on("mouseenter", "military-points", showPointer);
  map.on("mouseleave", "military-points", leaveMilitary);
  map.on("mouseenter", "county-points", showPointer);
  map.on("mouseleave", "county-points", clearPointer);

  return () => {
    map.off("mousemove", "seat-points", hoverSeat);
    map.off("mouseenter", "seat-points", showPointer);
    map.off("mouseleave", "seat-points", leaveSeat);
    map.off("mousemove", "military-points", hoverMilitary);
    map.off("mouseenter", "military-points", showPointer);
    map.off("mouseleave", "military-points", leaveMilitary);
    map.off("mouseenter", "county-points", showPointer);
    map.off("mouseleave", "county-points", clearPointer);
  };
}
