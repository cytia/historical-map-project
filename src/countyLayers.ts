import type { ExpressionSpecification, GeoJSONSource, Map } from "maplibre-gl";
import { counties, getTopLevelUnitId, isDescendantOf, seats } from "./data";
import { curvedCoordinates } from "./relationLayers";
import { defaultTheme } from "./theme";
import type { AdministrativeDisplayScope } from "./types";

const tokens = defaultTheme.map;
const sourceId = "counties";
const relationSourceId = "county-relations";
const layerIds = ["county-relations", "county-points", "county-labels"] as const;
const clearTimers = new WeakMap<Map, number>();

export interface CountyLayerSelection {
  selectedUnitId: string | null;
  selectedCountyId: string | null;
  regionId: string | null;
  scope: AdministrativeDisplayScope;
}

function fadeDuration() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : tokens.countyFadeDurationMs;
}

function selectedTopLevelId(selection: CountyLayerSelection) {
  return getTopLevelUnitId(selection.selectedUnitId);
}

function displayRootId(selection: CountyLayerSelection) {
  const topLevelId = selectedTopLevelId(selection);
  if (!topLevelId || selection.scope === "seat") return null;
  return selection.scope === "region" ? selection.regionId ?? topLevelId : topLevelId;
}

function setOpacity(map: Map, visible: boolean) {
  const lineOpacity = visible ? 0.78 : 0;
  const circleOpacity = visible ? 1 : 0;
  const textOpacity = visible ? 1 : 0;
  if (map.getLayer(layerIds[0])) map.setPaintProperty(layerIds[0], "line-opacity", lineOpacity);
  if (map.getLayer(layerIds[1])) map.setPaintProperty(layerIds[1], "circle-opacity", circleOpacity);
  if (map.getLayer(layerIds[2])) map.setPaintProperty(layerIds[2], "text-opacity", textOpacity);
}

function expandedData(selection: CountyLayerSelection) {
  const rootId = displayRootId(selection);
  const childStates = rootId ? seats.filter(({ unit }) =>
    unit.id !== getTopLevelUnitId(unit.id) && isDescendantOf(unit.id, rootId)) : [];
  const childCounties = rootId ? counties.filter(({ unit }) =>
    isDescendantOf(unit.id, rootId)) : [];
  return {
    type: "FeatureCollection" as const,
    features: [
      ...childStates.map(({ unit, place, region }) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [place.longitude!, place.latitude!] },
        properties: { id: unit.id, name: unit.name, kind: "department",
          parentId: unit.parentId, regionId: region.id },
      })),
      ...childCounties.map(({ unit, place, parent, region }) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [place.longitude!, place.latitude!] },
        properties: { id: unit.id, name: unit.name, kind: "county",
          parentId: parent.id, regionId: region.id },
      })),
    ],
  };
}

function relationData(selection: CountyLayerSelection) {
  const rootId = displayRootId(selection);
  if (!rootId) return { type: "FeatureCollection" as const, features: [] };
  const childStates = seats.filter(({ unit }) =>
    unit.id !== getTopLevelUnitId(unit.id) && isDescendantOf(unit.id, rootId));
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
  selection: CountyLayerSelection,
  visible: boolean,
) {
  const duration = fadeDuration();
  map.addSource(sourceId, { type: "geojson", data: expandedData(selection) });
  map.addSource(relationSourceId, { type: "geojson", data: relationData(selection) });
  map.addLayer({ id: layerIds[0], type: "line", source: relationSourceId,
    paint: { "line-color": tokens.relationLine, "line-width": tokens.relationLineWidth,
      "line-opacity": selection.selectedUnitId ? 0.78 : 0, "line-opacity-transition": { duration } } });
  map.addLayer({ id: layerIds[1], type: "circle", source: sourceId,
    paint: { "circle-radius": radius(selection.selectedUnitId, selection.selectedCountyId),
      "circle-color": ["case", ["==", ["get", "id"], selection.selectedCountyId ?? selection.selectedUnitId ?? ""],
        tokens.countySelected, ["==", ["get", "kind"], "department"], tokens.seat, tokens.county],
      "circle-stroke-width": 1.5, "circle-stroke-color": tokens.seatRing,
      "circle-opacity": selection.selectedUnitId ? 1 : 0, "circle-opacity-transition": { duration } } });
  map.addLayer({ id: layerIds[2], type: "symbol", source: sourceId,
    layout: { "text-field": ["get", "name"], "text-font": ["Open Sans Regular"],
      "text-size": 11, "text-offset": [0, 1], "text-anchor": "top", "text-allow-overlap": false },
    paint: { "text-color": tokens.countyLabel, "text-halo-color": tokens.land,
      "text-halo-width": 1.2, "text-opacity": selection.selectedUnitId ? 1 : 0,
      "text-opacity-transition": { duration } } });
  setCountyVisibility(map, visible);
}

export function setCountySelection(map: Map, selection: CountyLayerSelection) {
  const countySource = map.getSource(sourceId) as GeoJSONSource | undefined;
  const relationSource = map.getSource(relationSourceId) as GeoJSONSource | undefined;
  if (!countySource || !relationSource) return;
  const previousTimer = clearTimers.get(map);
  if (previousTimer !== undefined) window.clearTimeout(previousTimer);
  setOpacity(map, false);
  if (!selection.selectedUnitId) {
    const timer = window.setTimeout(() => {
      countySource.setData(expandedData(selection));
      relationSource.setData(relationData(selection));
      clearTimers.delete(map);
    }, fadeDuration());
    clearTimers.set(map, timer);
    return;
  }
  countySource.setData(expandedData(selection));
  relationSource.setData(relationData(selection));
  requestAnimationFrame(() => setOpacity(map, true));
  if (!map.getLayer(layerIds[1])) return;
  map.setPaintProperty(layerIds[1], "circle-radius", radius(selection.selectedUnitId, selection.selectedCountyId));
  map.setPaintProperty(layerIds[1], "circle-color", ["case",
    ["==", ["get", "id"], selection.selectedCountyId ?? selection.selectedUnitId ?? ""], tokens.countySelected,
    ["==", ["get", "kind"], "department"], tokens.seat, tokens.county]);
}

export function clearCountySelection(map: Map) {
  const countySource = map.getSource(sourceId) as GeoJSONSource | undefined;
  const relationSource = map.getSource(relationSourceId) as GeoJSONSource | undefined;
  const previousTimer = clearTimers.get(map);
  if (previousTimer !== undefined) window.clearTimeout(previousTimer);
  clearTimers.delete(map);
  setOpacity(map, false);
  const emptySelection: CountyLayerSelection = {
    selectedUnitId: null,
    selectedCountyId: null,
    regionId: null,
    scope: "prefecture",
  };
  countySource?.setData(expandedData(emptySelection));
  relationSource?.setData(relationData(emptySelection));
}

export function setCountyVisibility(map: Map, visible: boolean) {
  layerIds.forEach((id) => {
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
  });
}
