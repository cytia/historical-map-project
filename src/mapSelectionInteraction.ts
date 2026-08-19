import type { Map, PointLike } from "maplibre-gl";
import type { SelectionDomain } from "./types";

export const selectionClickTolerance = 8;
export const selectionHitRadius = 8;

export type AdministrativeTarget =
  | { kind: "county"; id: string; parentId: string; regionId: string }
  | { kind: "seat"; id: string; regionId: string };
export type MilitaryTarget = { kind: "military"; id: string; regionId: string | null };
export type JimiTarget = { kind: "jimi"; id: string; regionId: string | null };
/// A province face is ground, not a unit. Clicking it opens the province; it never joins a
/// co-located list, because the points inside it are what a list is choosing between.
export type ProvinceTarget = { kind: "province"; regionId: string };
export type MapTarget = AdministrativeTarget | MilitaryTarget | JimiTarget | ProvinceTarget;
/// Everything a co-located list can offer: the units standing on the ground, not the ground.
export type ChoosableTarget = Exclude<MapTarget, ProvinceTarget>;

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

function targetFromMilitaryProperties(properties: GeoJSON.GeoJsonProperties): MilitaryTarget | null {
  const id = properties?.id;
  if (typeof id !== "string") return null;
  const regionId = typeof properties?.regionId === "string" ? properties.regionId : null;
  return { kind: "military", id, regionId };
}

function targetFromJimiProperties(properties: GeoJSON.GeoJsonProperties): JimiTarget | null {
  const id = properties?.id;
  if (typeof id !== "string") return null;
  const regionId = typeof properties?.regionId === "string" ? properties.regionId : null;
  return { kind: "jimi", id, regionId };
}

export function queryMapTargets(map: Map, point: PointLike, selectionDomain: SelectionDomain) {
  const layers = [
    ...(selectionDomain === "jimi"
      ? ["jimi-labels", "jimi-points"]
      : selectionDomain === "military"
        ? ["military-labels", "military-points"]
        : ["county-labels", "county-points", "seat-labels", "seat-points"]),
    ...(selectionDomain === "jimi"
      ? ["military-labels", "military-points", "county-labels", "county-points", "seat-labels", "seat-points"]
      : selectionDomain === "military"
        ? ["jimi-labels", "jimi-points", "county-labels", "county-points", "seat-labels", "seat-points"]
        : ["jimi-labels", "jimi-points", "military-labels", "military-points"]),
    // Ranked last so a click that lands on a point inside a province still picks the point.
    "province-boundary-fill",
  ].filter((layerId) => map.getLayer(layerId));
  try {
    const [x, y] = pointCoordinates(point);
    const features = map.queryRenderedFeatures([
      [x - selectionHitRadius, y - selectionHitRadius],
      [x + selectionHitRadius, y + selectionHitRadius],
    ], { layers });
    const targets = features.reduce<MapTarget[]>((result, { properties }) => {
      if (typeof properties?.unitId === "string") {
        result.push({ kind: "province", regionId: properties.unitId });
        return result;
      }
      if (properties?.kind === "military") {
        const target = targetFromMilitaryProperties(properties);
        if (target) result.push(target);
        return result;
      }
      if (properties?.kind === "jimi") {
        const target = targetFromJimiProperties(properties);
        if (target) result.push(target);
        return result;
      }
      const target = targetFromProperties(properties);
      if (target) result.push(target);
      return result;
    }, []);
    const unique = [...new globalThis.Map<string, MapTarget>(targets.map((target) => [
      `${target.kind}-${target.kind === "province" ? target.regionId : target.id}`, target,
    ])).values()];
    // The province under the pointer is a fallback, not a candidate: whenever the click
    // also caught a point, that point is what was aimed at, and a list of co-located units
    // should not offer the ground they all stand on.
    const points = unique.filter((target) => target.kind !== "province");
    if (points.length) {
      return points.sort((left, right) => {
        const leftPriority = left.kind === selectionDomain ? 0 : 1;
        const rightPriority = right.kind === selectionDomain ? 0 : 1;
        return leftPriority - rightPriority;
      });
    }
    return unique;
  } catch {
    return [];
  }
}

export function createSelectionPointerController(
  map: Map,
  clearSelection: () => void,
  selectTarget: (target: MapTarget) => void,
  chooseTarget: (targets: ChoosableTarget[], anchor: { x: number; y: number }) => void,
  getSelectionDomain: () => SelectionDomain = () => "administrative",
) {
  const container = map.getCanvasContainer();
  let gesture: {
    id: number;
    x: number;
    y: number;
    maxDistance: number;
    targets: MapTarget[];
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
      // queryMapTargets only returns several targets when they are all points.
      chooseTarget(completed.targets as ChoosableTarget[], { x: completed.x, y: completed.y });
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
      targets: queryMapTargets(map, [event.clientX - bounds.left, event.clientY - bounds.top],
        getSelectionDomain(),
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
