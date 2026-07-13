import type { Map, PointLike } from "maplibre-gl";

export const selectionClickTolerance = 8;

export type AdministrativeTarget =
  | { kind: "county"; id: string; parentId: string; regionId: string }
  | { kind: "seat"; id: string; regionId: string };

export function queryAdministrativeFeature(map: Map, point: PointLike) {
  if (!map.getLayer("seat-points")) return undefined;
  try {
    const layers = map.getLayer("county-points")
      ? ["county-points", "seat-points"]
      : ["seat-points"];
    return map.queryRenderedFeatures(point, { layers })[0];
  } catch {
    // A style replacement can remove a layer between the existence check and query.
    return undefined;
  }
}

function getAdministrativeTarget(map: Map, point: PointLike): AdministrativeTarget | null {
  const properties = queryAdministrativeFeature(map, point)?.properties;
  const id = properties?.id;
  const regionId = properties?.regionId;
  if (typeof id !== "string" || typeof regionId !== "string") return null;
  if (properties?.kind === "county" && typeof properties.parentId === "string") {
    return { kind: "county", id, parentId: properties.parentId, regionId };
  }
  return { kind: "seat", id, regionId };
}

export function createSelectionPointerController(
  map: Map,
  clearSelection: () => void,
  selectTarget: (target: AdministrativeTarget) => void,
) {
  const container = map.getCanvasContainer();
  let gesture: {
    id: number;
    x: number;
    y: number;
    maxDistance: number;
    target: AdministrativeTarget | null;
  } | null = null;

  const removeWindowListeners = () => {
    window.removeEventListener("pointermove", handlePointerMove, true);
    window.removeEventListener("pointerup", handlePointerUp, true);
    window.removeEventListener("pointercancel", cancelGesture, true);
    window.removeEventListener("blur", cancelGesture, true);
  };
  const cancelGesture = () => {
    gesture = null;
    removeWindowListeners();
  };
  const handlePointerMove = (event: PointerEvent) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    gesture.maxDistance = Math.max(
      gesture.maxDistance,
      Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y),
    );
  };
  const handlePointerUp = (event: PointerEvent) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const completed = gesture;
    handlePointerMove(event);
    cancelGesture();
    if (completed.maxDistance > selectionClickTolerance) return;
    if (completed.target) selectTarget(completed.target);
    else clearSelection();
  };
  const handlePointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return;
    cancelGesture();
    const bounds = container.getBoundingClientRect();
    gesture = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      maxDistance: 0,
      target: getAdministrativeTarget(
        map,
        [event.clientX - bounds.left, event.clientY - bounds.top],
      ),
    };
    window.addEventListener("pointermove", handlePointerMove, true);
    window.addEventListener("pointerup", handlePointerUp, true);
    window.addEventListener("pointercancel", cancelGesture, true);
    window.addEventListener("blur", cancelGesture, true);
  };

  container.addEventListener("pointerdown", handlePointerDown);
  return () => {
    container.removeEventListener("pointerdown", handlePointerDown);
    cancelGesture();
  };
}
