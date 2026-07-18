import type { ExpressionSpecification, GeoJSONSource, Map } from "maplibre-gl";
import {
  administrativeAffiliationIds,
  counties,
  getTopLevelUnitId,
  isDescendantOf,
  seats,
} from "./data";
import { affiliationColorExpression } from "./mapDisplay";
import { setLayerVisibility } from "./mapLayerVisibility";
import { curvedCoordinates } from "./relationLayers";
import { defaultTheme } from "./theme";
import type { AdministrativeDisplayScope, MapDisplayMode } from "./types";

const tokens = defaultTheme.map;
const sourceId = "counties";
const relationSourceId = "county-relations";
const layerIds = ["county-relations", "county-points", "county-labels"] as const;
const clearTimers = new WeakMap<Map, number>();
const coLocatedCountyIds = new Set(["shangyuan-county", "jiangning-county"]);

export interface CountyLayerSelection {
  selectedUnitId: string | null;
  selectedCountyId: string | null;
  regionId: string | null;
  scope: AdministrativeDisplayScope;
  displayMode: MapDisplayMode;
}

function visualCoordinates(record: (typeof counties)[number] | (typeof seats)[number]) {
  if ("parent" in record && coLocatedCountyIds.has(record.unit.id)) {
    // Keep the historical proxy in data while rendering the documented co-located county seat at its prefectural anchor.
    const parentSeat = seats.find(({ unit }) => unit.id === record.parent.id);
    if (parentSeat?.place.longitude !== undefined && parentSeat.place.latitude !== undefined) {
      return [parentSeat.place.longitude, parentSeat.place.latitude] as [number, number];
    }
  }
  return [record.place.longitude!, record.place.latitude!] as [number, number];
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

function layerData(selection: CountyLayerSelection) {
  const rootId = displayRootId(selection);
  const childStates = rootId ? seats.filter(({ unit }) =>
    unit.id !== getTopLevelUnitId(unit.id) && isDescendantOf(unit.id, rootId)) : [];
  const childCounties = rootId ? counties.filter(({ unit }) =>
    isDescendantOf(unit.id, rootId)) : [];
  const points = {
    type: "FeatureCollection" as const,
    features: [
      ...childStates.map(({ unit, place, region }) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: visualCoordinates({ unit, place, name: unit.name, region }) },
        properties: { id: unit.id, name: unit.name, kind: "department",
          parentId: unit.parentId, regionId: region.id },
      })),
      ...childCounties.map(({ unit, place, parent, region }) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: visualCoordinates({ unit, place, parent, name: unit.name, region }) },
        properties: { id: unit.id, name: unit.name, kind: "county",
          parentId: parent.id, regionId: region.id },
      })),
    ],
  };
  const records = [...childStates, ...childCounties];
  const relations = {
    type: "FeatureCollection" as const,
    features: records.flatMap((record) => {
      const { unit } = record;
      const parent = seats.find(({ unit: parentUnit }) => parentUnit.id === unit.parentId);
      if (!parent) return [];
      const from = visualCoordinates(record);
      const to = visualCoordinates(parent);
      if (from[0] === to[0] && from[1] === to[1]) return [];
      return [{
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: curvedCoordinates(from, to),
        },
        properties: { id: unit.id },
      }];
    }),
  };
  return { points, relations };
}

function radius(selectedUnitId: string | null, selectedCountyId: string | null): ExpressionSpecification {
  return ["case",
    ["==", ["get", "id"], selectedCountyId ?? selectedUnitId ?? ""], 5.5,
    ["==", ["get", "kind"], "department"], 4.5,
    3,
  ];
}

function pointColor(selection: CountyLayerSelection): ExpressionSpecification {
  const affiliationColor = affiliationColorExpression(
    selection.displayMode,
    administrativeAffiliationIds,
  );
  return ["case",
    ["==", ["get", "id"], selection.selectedCountyId ?? selection.selectedUnitId ?? ""],
    tokens.countySelected,
    affiliationColor,
  ] as ExpressionSpecification;
}

export function addCountyLayers(
  map: Map,
  selection: CountyLayerSelection,
  visible: boolean,
) {
  const duration = fadeDuration();
  const data = layerData(selection);
  map.addSource(sourceId, { type: "geojson", data: data.points });
  map.addSource(relationSourceId, { type: "geojson", data: data.relations });
  map.addLayer({ id: layerIds[0], type: "line", source: relationSourceId,
    paint: { "line-color": tokens.relationLine, "line-width": tokens.relationLineWidth,
      "line-opacity": selection.selectedUnitId ? 0.78 : 0, "line-opacity-transition": { duration } } });
  map.addLayer({ id: layerIds[1], type: "circle", source: sourceId,
    paint: { "circle-radius": radius(selection.selectedUnitId, selection.selectedCountyId),
      "circle-color": pointColor(selection),
      "circle-stroke-width": 1.5, "circle-stroke-color": tokens.seatRing,
      "circle-opacity": selection.selectedUnitId ? 1 : 0, "circle-opacity-transition": { duration } } });
  map.addLayer({ id: layerIds[2], type: "symbol", source: sourceId,
    layout: { "text-field": ["get", "name"], "text-font": ["Open Sans Regular"],
      "text-size": 11, "text-offset": [0, 1], "text-anchor": "top", "text-allow-overlap": false },
    paint: { "text-color": tokens.countyLabel, "text-halo-color": tokens.land,
      "text-halo-width": 1.2, "text-opacity": selection.selectedUnitId ? 1 : 0,
      "text-opacity-transition": { duration } } });
  setLayerVisibility(map, layerIds, visible);
}

export function setCountySelection(map: Map, selection: CountyLayerSelection) {
  const countySource = map.getSource(sourceId) as GeoJSONSource | undefined;
  const relationSource = map.getSource(relationSourceId) as GeoJSONSource | undefined;
  if (!countySource || !relationSource) return;
  const previousTimer = clearTimers.get(map);
  if (previousTimer !== undefined) window.clearTimeout(previousTimer);
  const updateData = () => {
    const data = layerData(selection);
    countySource.setData(data.points);
    relationSource.setData(data.relations);
  };
  setOpacity(map, false);
  if (!selection.selectedUnitId) {
    const timer = window.setTimeout(() => {
      updateData();
      clearTimers.delete(map);
    }, fadeDuration());
    clearTimers.set(map, timer);
    return;
  }
  updateData();
  requestAnimationFrame(() => setOpacity(map, true));
  if (!map.getLayer(layerIds[1])) return;
  map.setPaintProperty(layerIds[1], "circle-radius", radius(selection.selectedUnitId, selection.selectedCountyId));
  map.setPaintProperty(layerIds[1], "circle-color", pointColor(selection));
}
