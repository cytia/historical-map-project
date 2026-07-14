import type { Map, PointLike } from "maplibre-gl";

export const selectionClickTolerance = 8;
export const selectionHitRadius = 8;

export type AdministrativeTarget =
  | { kind: "county"; id: string; parentId: string; regionId: string }
  | { kind: "seat"; id: string; regionId: string };

function pointCoordinates(point: PointLike) {
  return Array.isArray(point) ? point : [point.x, point.y];
}

export function queryAdministrativeFeatures(map: Map, point: PointLike) {
  if (!map.getLayer("seat-points")) return undefined;
  try {
    const layers = [
      "county-labels",
      "county-points",
      "seat-labels",
      "seat-points",
    ].filter((layerId) => map.getLayer(layerId));
    const [x, y] = pointCoordinates(point);
    return map.queryRenderedFeatures([
      [x - selectionHitRadius, y - selectionHitRadius],
      [x + selectionHitRadius, y + selectionHitRadius],
    ], { layers });
  } catch {
    // A style replacement can remove a layer between the existence check and query.
    return [];
  }
}

function targetFromProperties(properties: GeoJSON.GeoJsonProperties): AdministrativeTarget | null {
  const id = properties?.id;
  const regionId = properties?.regionId;
  if (typeof id !== "string" || typeof regionId !== "string") return null;
  if (properties?.kind === "county" && typeof properties.parentId === "string") {
    return { kind: "county", id, parentId: properties.parentId, regionId };
  }
  return { kind: "seat", id, regionId };
}

export function queryAdministrativeTargets(map: Map, point: PointLike) {
  const targets = queryAdministrativeFeatures(map, point)
    ?.map(({ properties }) => targetFromProperties(properties))
    .filter((target): target is AdministrativeTarget => target !== null) ?? [];
  return [...new globalThis.Map(targets.map((target) => [target.id, target])).values()];
}

export function createSelectionPointerController(
  map: Map,
  clearSelection: () => void,
  selectTarget: (target: AdministrativeTarget) => void,
  chooseTarget: (targets: AdministrativeTarget[], anchor: { x: number; y: number }) => void,
) {
  const container = map.getCanvasContainer();
  let gesture: {
    id: number;
    x: number;
    y: number;
    maxDistance: number;
    targets: AdministrativeTarget[];
  } | null = null;

  const removeWindowListeners = () => {
    window.removeEventListener("pointermove", handlePointerMove, true);
    window.removeEventListener("pointerup", handlePointerUp, true);
    window.removeEventListener("pointercancel", cancelGesture, true);
    window.removeEventListener("blur", cancelGesture);
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
    if (completed.targets.length === 1) selectTarget(completed.targets[0]);
    else if (completed.targets.length > 1) {
      chooseTarget(completed.targets, { x: completed.x, y: completed.y });
    } else clearSelection();
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
      targets: queryAdministrativeTargets(
        map,
        [event.clientX - bounds.left, event.clientY - bounds.top],
      ),
    };
    window.addEventListener("pointermove", handlePointerMove, true);
    window.addEventListener("pointerup", handlePointerUp, true);
    window.addEventListener("pointercancel", cancelGesture, true);
    window.addEventListener("blur", cancelGesture);
  };

  container.addEventListener("pointerdown", handlePointerDown);
  return () => {
    container.removeEventListener("pointerdown", handlePointerDown);
    cancelGesture();
  };
}
