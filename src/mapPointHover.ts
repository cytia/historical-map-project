import type { Map, MapLayerMouseEvent } from "maplibre-gl";
import { queryAdministrativeTargets } from "./mapSelectionInteraction";

interface HoverRef {
  current: string | null;
}

interface PointHoverOptions {
  hoveredRegionRef: HoverRef;
  hoveredMilitaryRef: HoverRef;
  hoveredJimiRef: HoverRef;
  setHoveredRegion: (id: string | null) => void;
  setHoveredMilitaryUnit: (id: string | null) => void;
  setHoveredJimiUnit: (id: string | null) => void;
}

export function registerPointHoverHandlers(map: Map, options: PointHoverOptions) {
  const { hoveredRegionRef, hoveredMilitaryRef,
    hoveredJimiRef, setHoveredRegion, setHoveredMilitaryUnit, setHoveredJimiUnit } = options;
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
  const clearJimi = () => {
    if (hoveredJimiRef.current === null) return;
    hoveredJimiRef.current = null;
    setHoveredJimiUnit(null);
  };
  const hoverSeat = (event: MapLayerMouseEvent) => {
    clearMilitary();
    clearJimi();
    const regionId = event.features?.[0]?.properties?.regionId;
    const nextRegionId = typeof regionId === "string" ? regionId : null;
    if (hoveredRegionRef.current === nextRegionId) return;
    hoveredRegionRef.current = nextRegionId;
    setHoveredRegion(nextRegionId);
  };
  const hoverMilitary = (event: MapLayerMouseEvent) => {
    clearJimi();
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
  const hoverJimi = (event: MapLayerMouseEvent) => {
    clearRegion();
    clearMilitary();
    const id = event.features?.[0]?.properties?.id;
    const nextJimiId = typeof id === "string" ? id : null;
    if (hoveredJimiRef.current === nextJimiId) return;
    hoveredJimiRef.current = nextJimiId;
    setHoveredJimiUnit(nextJimiId);
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
    clearJimi();
  };
  const leaveJimi = () => {
    clearPointer();
    clearJimi();
    clearRegion();
    clearMilitary();
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
  map.on("mousemove", "jimi-points", hoverJimi);
  map.on("mouseenter", "jimi-points", showPointer);
  map.on("mouseleave", "jimi-points", leaveJimi);
  map.on("mouseenter", "county-points", showPointer);
  map.on("mouseleave", "county-points", clearPointer);

  return () => {
    map.off("mousemove", "seat-points", hoverSeat);
    map.off("mouseenter", "seat-points", showPointer);
    map.off("mouseleave", "seat-points", leaveSeat);
    map.off("mousemove", "military-points", hoverMilitary);
    map.off("mouseenter", "military-points", showPointer);
    map.off("mouseleave", "military-points", leaveMilitary);
    map.off("mousemove", "jimi-points", hoverJimi);
    map.off("mouseenter", "jimi-points", showPointer);
    map.off("mouseleave", "jimi-points", leaveJimi);
    map.off("mouseenter", "county-points", showPointer);
    map.off("mouseleave", "county-points", clearPointer);
  };
}
