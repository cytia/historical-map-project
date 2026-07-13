import type { ExpressionSpecification, GeoJSONSource, Map } from "maplibre-gl";
import { counties, getTopLevelUnitId, isDescendantOf, seats } from "./data";
import { curvedCoordinates } from "./relationLayers";
import { defaultTheme } from "./theme";

const tokens = defaultTheme.map;
const sourceId = "counties";
const relationSourceId = "county-relations";
const layerIds = ["county-relations", "county-points", "county-labels"] as const;
const clearTimers = new WeakMap<Map, number>();

function fadeDuration() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : tokens.countyFadeDurationMs;
}

function setOpacity(map: Map, opacity: number) {
  if (map.getLayer(layerIds[0])) map.setPaintProperty(layerIds[0], "line-opacity", opacity * 0.78);
  if (map.getLayer(layerIds[1])) map.setPaintProperty(layerIds[1], "circle-opacity", opacity);
  if (map.getLayer(layerIds[2])) map.setPaintProperty(layerIds[2], "text-opacity", opacity);
}

function expandedData(selectedUnitId: string | null) {
  const rootId = getTopLevelUnitId(selectedUnitId);
  const childStates = rootId ? seats.filter(({ unit }) =>
    unit.id !== rootId && isDescendantOf(unit.id, rootId)) : [];
  const childCounties = rootId ? counties.filter(({ unit }) =>
    isDescendantOf(unit.id, rootId)) : [];
  return {
    type: "FeatureCollection" as const,
    features: [
      ...childStates.map(({ unit, place, region }) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [place.longitude!, place.latitude!] },
        properties: { id: unit.id, name: unit.name, kind: "department", parentId: unit.parentId, regionId: region.id },
      })),
      ...childCounties.map(({ unit, place, parent, region }) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [place.longitude!, place.latitude!] },
      properties: { id: unit.id, name: unit.name, kind: "county", parentId: parent.id, regionId: region.id },
      })),
    ],
  };
}

function relationData(selectedUnitId: string | null) {
  const rootId = getTopLevelUnitId(selectedUnitId);
  if (!rootId) return { type: "FeatureCollection" as const, features: [] };
  const childStates = seats.filter(({ unit }) => unit.id !== rootId && isDescendantOf(unit.id, rootId));
  const childCounties = counties.filter(({ unit }) => isDescendantOf(unit.id, rootId));
  const records = [...childStates, ...childCounties];
  return {
    type: "FeatureCollection" as const,
    features: records.flatMap(({ unit, place }) => {
      const parent = seats.find(({ unit: parentUnit }) => parentUnit.id === unit.parentId);
      if (!parent) return [];
      return [{
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: curvedCoordinates(
            [place.longitude!, place.latitude!],
            [parent.place.longitude!, parent.place.latitude!],
          ),
        },
        properties: { id: unit.id },
      }];
    }),
  };
}

function radius(selectedUnitId: string | null, selectedCountyId: string | null): ExpressionSpecification {
  return ["case",
    ["==", ["get", "id"], selectedCountyId ?? selectedUnitId ?? ""], 5.5,
    ["==", ["get", "kind"], "department"], 4.5,
    3,
  ];
}

export function addCountyLayers(
  map: Map,
  parentId: string | null,
  selectedCountyId: string | null,
  visible: boolean,
) {
  const duration = fadeDuration();
  map.addSource(sourceId, { type: "geojson", data: expandedData(parentId) });
  map.addSource(relationSourceId, { type: "geojson", data: relationData(parentId) });
  map.addLayer({ id: layerIds[0], type: "line", source: relationSourceId,
    paint: { "line-color": tokens.relationLine, "line-width": tokens.relationLineWidth,
      "line-opacity": parentId ? 0.78 : 0, "line-opacity-transition": { duration } } });
  map.addLayer({ id: layerIds[1], type: "circle", source: sourceId,
    paint: { "circle-radius": radius(parentId, selectedCountyId),
      "circle-color": ["case", ["==", ["get", "id"], selectedCountyId ?? parentId ?? ""],
        tokens.countySelected, ["==", ["get", "kind"], "department"], tokens.seat, tokens.county],
      "circle-stroke-width": 1.5, "circle-stroke-color": tokens.seatRing,
      "circle-opacity": parentId ? 1 : 0, "circle-opacity-transition": { duration } } });
  map.addLayer({ id: layerIds[2], type: "symbol", source: sourceId,
    layout: { "text-field": ["get", "name"], "text-font": ["Open Sans Regular"],
      "text-size": 11, "text-offset": [0, 1], "text-anchor": "top", "text-allow-overlap": false },
    paint: { "text-color": tokens.countyLabel, "text-halo-color": tokens.land,
      "text-halo-width": 1.2, "text-opacity": parentId ? 1 : 0,
      "text-opacity-transition": { duration } } });
  setCountyVisibility(map, visible);
}

export function setCountySelection(map: Map, parentId: string | null, selectedCountyId: string | null) {
  const countySource = map.getSource(sourceId) as GeoJSONSource | undefined;
  const relationSource = map.getSource(relationSourceId) as GeoJSONSource | undefined;
  if (!countySource || !relationSource) return;
  const previousTimer = clearTimers.get(map);
  if (previousTimer !== undefined) window.clearTimeout(previousTimer);
  setOpacity(map, 0);
  if (!parentId) {
    const timer = window.setTimeout(() => {
      countySource.setData(expandedData(null));
      relationSource.setData(relationData(null));
      clearTimers.delete(map);
    }, fadeDuration());
    clearTimers.set(map, timer);
    return;
  }
  countySource.setData(expandedData(parentId));
  relationSource.setData(relationData(parentId));
  requestAnimationFrame(() => setOpacity(map, 1));
  if (!map.getLayer(layerIds[1])) return;
  map.setPaintProperty(layerIds[1], "circle-radius", radius(parentId, selectedCountyId));
  map.setPaintProperty(layerIds[1], "circle-color", ["case",
    ["==", ["get", "id"], selectedCountyId ?? parentId ?? ""], tokens.countySelected,
    ["==", ["get", "kind"], "department"], tokens.seat, tokens.county]);
}

export function clearCountySelection(map: Map) {
  const countySource = map.getSource(sourceId) as GeoJSONSource | undefined;
  const relationSource = map.getSource(relationSourceId) as GeoJSONSource | undefined;
  const previousTimer = clearTimers.get(map);
  if (previousTimer !== undefined) window.clearTimeout(previousTimer);
  clearTimers.delete(map);
  setOpacity(map, 0);
  countySource?.setData(expandedData(null));
  relationSource?.setData(relationData(null));
}

export function setCountyVisibility(map: Map, visible: boolean) {
  layerIds.forEach((id) => {
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
  });
}
