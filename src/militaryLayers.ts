import type { ExpressionSpecification, GeoJSONSource, Map } from "maplibre-gl";
import {
  isMilitaryPrimaryUnit,
  militaryById,
  publishedMilitaryRecords,
} from "./militaryData";
import { militaryColorExpression } from "./mapDisplay";
import { administrativeAffiliationIds } from "./data";
import { setLayerVisibility } from "./mapLayerVisibility";
import { curvedCoordinates, flowData, type FlowDataConfig } from "./relationLayers";
import { defaultTheme } from "./theme";
import type { HierarchyScope, MilitaryColorMode, MilitaryRecord } from "./types";

const tokens = defaultTheme.map;
const pointSourceId = "military-points";
const relationSourceId = "military-relations";
const flowSourceId = "military-relation-flow";
const animationFrames = new WeakMap<Map, number>();
const relationDataByMap = new WeakMap<Map, GeoJSON.FeatureCollection<GeoJSON.LineString>>();
const flowConfig: FlowDataConfig = {
  segmentLength: tokens.relationFlowSegmentLength,
  durationMs: tokens.relationFlowDurationMs,
  pauseMs: tokens.relationFlowPauseMs,
};
export const militaryLayerIds = [
  "military-relations", "military-relation-flow", "military-points", "military-labels",
] as const;

export interface MilitaryLayerSelection {
  selectedMilitaryId: string | null;
  selectedAdministrativeId: string | null;
  activeRegionId: string | null;
  scope: HierarchyScope;
  colorMode: MilitaryColorMode;
}

function isVisible(record: MilitaryRecord, selection: MilitaryLayerSelection) {
  if (isMilitaryPrimaryUnit(record.unit)) return true;
  if (selection.scope === "overview") {
    return false;
  }
  if (selection.scope === "domain") {
    return Boolean(selection.activeRegionId &&
      record.administrativeRegionId === selection.activeRegionId);
  }
  if (selection.selectedMilitaryId) {
    return record.militaryParentId === selection.selectedMilitaryId ||
      record.unit.id === selection.selectedMilitaryId;
  }
  return Boolean(selection.selectedAdministrativeId &&
    record.administrativeUnitId === selection.selectedAdministrativeId);
}

export function getVisibleMilitaryRecords(selection: MilitaryLayerSelection) {
  return publishedMilitaryRecords.filter((record) => isVisible(record, selection));
}

function featureData(selection: MilitaryLayerSelection) {
  const records = getVisibleMilitaryRecords(selection);
  const points = {
    type: "FeatureCollection" as const,
    features: records.map(({ unit, place, name, administrativeRegionId, administrativeUnitId, militaryParentId }) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [place.longitude!, place.latitude!] },
      properties: {
        id: unit.id,
        name: unit.name,
        label: name,
        kind: "military",
        regionId: administrativeRegionId,
        administrativeUnitId,
        militaryParentId,
        militaryKind: unit.militaryKind ?? "",
        fiveArmyId: unit.fiveArmyId ?? "",
      },
    })),
  };
  const relations = {
    type: "FeatureCollection" as const,
    features: records.flatMap((record) => {
      const parent = record.militaryParentId ? militaryById.get(record.militaryParentId) : undefined;
      if (!parent) return [];
      return [{
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: curvedCoordinates(
            [record.place.longitude!, record.place.latitude!],
            [parent.place.longitude!, parent.place.latitude!],
          ),
        },
        properties: { id: record.unit.id, selected: record.unit.id === selection.selectedMilitaryId },
      }];
    }),
  };
  return { points, relations };
}

function pointColor(mode: MilitaryColorMode): string | ExpressionSpecification {
  return militaryColorExpression(mode, administrativeAffiliationIds);
}

function pointSize(selectedMilitaryId: string | null): ExpressionSpecification {
  return ["case", ["==", ["get", "id"], selectedMilitaryId ?? ""], 15, 11];
}

const dusiPointExpression = ["match", ["get", "militaryKind"],
  "dusi", true, "xing-dusi", true, "liushou-si", true, false,
] as ExpressionSpecification;

export function addMilitaryLayers(map: Map, selection: MilitaryLayerSelection, visible: boolean) {
  const data = featureData(selection);
  map.addSource(pointSourceId, { type: "geojson", data: data.points });
  map.addSource(relationSourceId, { type: "geojson", data: data.relations });
  map.addSource(flowSourceId, { type: "geojson", data: flowData(data.relations, 0, flowConfig) });
  map.addLayer({ id: militaryLayerIds[0], type: "line", source: relationSourceId,
    paint: { "line-color": ["case", ["get", "selected"], tokens.militaryRelationLineSelected,
      tokens.militaryRelationLine], "line-width": ["case", ["get", "selected"],
      tokens.militaryRelationSelectedWidth, tokens.militaryRelationWidth], "line-opacity": 0.8 } });
  map.addLayer({ id: militaryLayerIds[1], type: "line", source: flowSourceId,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": tokens.militaryRelationFlow, "line-width": tokens.relationFlowWidth,
      "line-opacity": 0.95 } });
  map.addLayer({ id: militaryLayerIds[2], type: "symbol", source: pointSourceId,
    layout: { "text-field": "▲", "text-font": ["Open Sans Regular"],
      "text-size": pointSize(selection.selectedMilitaryId), "text-allow-overlap": true },
    paint: { "text-color": pointColor(selection.colorMode),
      "text-halo-color": ["case", dusiPointExpression, tokens.seatRing, tokens.land],
      "text-halo-width": ["case", dusiPointExpression, 2, 0.8] } });
  map.addLayer({ id: militaryLayerIds[3], type: "symbol", source: pointSourceId,
    minzoom: 4.4, layout: { "text-field": ["get", "label"], "text-font": ["Open Sans Regular"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 4, 10, 8, 13],
      "text-offset": [0, 1.4], "text-anchor": "top", "text-allow-overlap": false },
    paint: { "text-color": tokens.militaryLabel, "text-halo-color": tokens.land,
      "text-halo-width": 1.4 } });
  setLayerVisibility(map, militaryLayerIds, visible);
  relationDataByMap.set(map, data.relations);
  if (visible) startMilitaryRelationAnimation(map);
}

export function stopMilitaryRelationAnimation(map: Map) {
  const frame = animationFrames.get(map);
  if (frame !== undefined) cancelAnimationFrame(frame);
  animationFrames.delete(map);
}

function startMilitaryRelationAnimation(map: Map) {
  stopMilitaryRelationAnimation(map);
  const flowSource = map.getSource(flowSourceId) as GeoJSONSource | undefined;
  const relations = relationDataByMap.get(map);
  if (!flowSource || !relations || !relations.features.length ||
    matchMedia("(prefers-reduced-motion: reduce)").matches) {
    flowSource?.setData({ type: "FeatureCollection", features: [] });
    return;
  }
  const startedAt = performance.now();
  const animate = (now: number) => {
    if (!map.getLayer(militaryLayerIds[1])) {
      animationFrames.delete(map);
      return;
    }
    flowSource.setData(flowData(relations, now - startedAt, flowConfig));
    animationFrames.set(map, requestAnimationFrame(animate));
  };
  animationFrames.set(map, requestAnimationFrame(animate));
}

export function setMilitarySelection(map: Map, selection: MilitaryLayerSelection) {
  const points = map.getSource(pointSourceId) as GeoJSONSource | undefined;
  const relations = map.getSource(relationSourceId) as GeoJSONSource | undefined;
  const flow = map.getSource(flowSourceId) as GeoJSONSource | undefined;
  if (!points || !relations || !flow) return;
  const data = featureData(selection);
  points.setData(data.points);
  relations.setData(data.relations);
  relationDataByMap.set(map, data.relations);
  flow.setData(flowData(data.relations, 0, flowConfig));
  if (map.getLayer(militaryLayerIds[2])) {
    map.setLayoutProperty(militaryLayerIds[2], "text-size", pointSize(selection.selectedMilitaryId));
    map.setPaintProperty(militaryLayerIds[2], "text-color", pointColor(selection.colorMode));
  }
  if (map.getLayoutProperty(militaryLayerIds[1], "visibility") !== "none") {
    startMilitaryRelationAnimation(map);
  }
}

export function setMilitaryVisibility(map: Map, visible: boolean) {
  setLayerVisibility(map, militaryLayerIds, visible);
  if (visible) startMilitaryRelationAnimation(map);
  else stopMilitaryRelationAnimation(map);
}
