import type { ExpressionSpecification, GeoJSONSource, Map } from "maplibre-gl";
import { getMilitaryCommandRecord, publishedMilitaryRecords } from "./militaryData";
import { militaryHierarchyData } from "./militaryRelationData";
import { militaryColorExpression } from "./mapDisplay";
import { administrativeAffiliationIds } from "./data";
import { setLayerVisibility } from "./mapLayerVisibility";
import {
  ensureMilitarySymbolImage,
  militarySymbolImageId,
  militaryPointIconSizes,
} from "./militaryMarker";
import {
  addRelationLineLayers,
  addSubordinateRelationLayer,
  createRelationAnimationController,
} from "./relationRendering";
import { defaultTheme } from "./theme";
import type { HierarchyScope, MilitaryColorMode } from "./types";

const tokens = defaultTheme.map;
const pointSourceId = "military-points";
const relationSourceId = "military-relations";
const flowSourceId = "military-relation-flow";
const subordinateRelationSourceId = "military-subordinate-relations";
const relationLayerId = "military-relations";
const flowLayerId = "military-relation-flow";
const subordinateRelationLayerId = "military-subordinate-relations";
const pointOutlineLayerId = "military-point-outline";
const pointLayerId = "military-points";
const labelLayerId = "military-labels";
const militaryRelationAnimation = createRelationAnimationController({
  flowSourceId,
  flowLayerId,
});
export const militaryLayerIds = [
  relationLayerId, flowLayerId, subordinateRelationLayerId, pointOutlineLayerId, pointLayerId,
  labelLayerId,
] as const;

export interface MilitaryLayerSelection {
  selectedMilitaryId: string | null;
  selectedAdministrativeId: string | null;
  activeRegionId: string | null;
  scope: HierarchyScope;
  colorMode: MilitaryColorMode;
}

export function getVisibleMilitaryRecords(selection: MilitaryLayerSelection) {
  return militaryHierarchyData(
    publishedMilitaryRecords,
    selection.selectedMilitaryId,
    selection.scope,
  ).records;
}

function featureData(selection: MilitaryLayerSelection) {
  const hierarchy = militaryHierarchyData(
    publishedMilitaryRecords,
    selection.selectedMilitaryId,
    selection.scope,
  );
  const points = {
    type: "FeatureCollection" as const,
    features: hierarchy.records.map(({ unit, place, name, administrativeRegionId, administrativeUnitId, militaryParentId, fiveArmyId }) => ({
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
        fiveArmyId: fiveArmyId ?? "",
        commandId: getMilitaryCommandRecord(unit.id)?.unit.id ?? unit.id,
      },
    })),
  };
  return { points, ...hierarchy };
}

function pointColor(mode: MilitaryColorMode): string | ExpressionSpecification {
  return militaryColorExpression(mode, administrativeAffiliationIds);
}

function commandOpacity(
  commandId: string | null,
  active: number,
  inactive: number,
  dimAll: boolean,
): number | ExpressionSpecification {
  if (dimAll) return inactive;
  if (!commandId) return active;
  return ["case", ["==", ["get", "commandId"], commandId], active, inactive];
}

export function addMilitaryLayers(map: Map, selection: MilitaryLayerSelection, visible: boolean) {
  const data = featureData(selection);
  const iconSizes = militaryPointIconSizes(selection.selectedMilitaryId);
  ensureMilitarySymbolImage(map);
  map.addSource(pointSourceId, { type: "geojson", data: data.points });
  map.addSource(relationSourceId, { type: "geojson", data: data.primaryRelations });
  map.addSource(flowSourceId, { type: "geojson",
    data: { type: "FeatureCollection", features: [] } });
  map.addSource(subordinateRelationSourceId, {
    type: "geojson",
    data: data.secondaryRelations,
  });
  addRelationLineLayers(map, {
    relationSourceId,
    flowSourceId,
    relationLayerId,
    flowLayerId,
  });
  addSubordinateRelationLayer(map, {
    sourceId: subordinateRelationSourceId,
    layerId: subordinateRelationLayerId,
    opacity: 0.78,
  });
  map.addLayer({ id: pointOutlineLayerId, type: "symbol", source: pointSourceId,
    layout: { "icon-image": militarySymbolImageId,
      "icon-size": iconSizes.outline,
      "icon-allow-overlap": true },
    paint: { "icon-color": tokens.seatRing } });
  map.addLayer({ id: pointLayerId, type: "symbol", source: pointSourceId,
    layout: { "icon-image": militarySymbolImageId,
      "icon-size": iconSizes.fill,
      "icon-allow-overlap": true },
    paint: { "icon-color": pointColor(selection.colorMode) } });
  map.addLayer({ id: labelLayerId, type: "symbol", source: pointSourceId,
    minzoom: 5.2, layout: { "text-field": ["get", "label"], "text-font": ["Open Sans Regular"],
      "text-size": 11,
      "text-offset": [0, 1.15], "text-anchor": "top", "text-allow-overlap": false },
    paint: { "text-color": tokens.militaryLabel, "text-opacity": 0.78,
      "text-halo-color": tokens.land, "text-halo-width": 1.2 } });
  setLayerVisibility(map, militaryLayerIds, visible);
  militaryRelationAnimation.setRelations(map, data.flowRelations);
  if (visible) militaryRelationAnimation.start(map);
}

export function setMilitarySelection(map: Map, selection: MilitaryLayerSelection) {
  const points = map.getSource(pointSourceId) as GeoJSONSource | undefined;
  const relations = map.getSource(relationSourceId) as GeoJSONSource | undefined;
  const flow = map.getSource(flowSourceId) as GeoJSONSource | undefined;
  const subordinateRelations = map.getSource(subordinateRelationSourceId) as
    GeoJSONSource | undefined;
  if (!points || !relations || !flow || !subordinateRelations) return;
  const data = featureData(selection);
  const iconSizes = militaryPointIconSizes(selection.selectedMilitaryId);
  points.setData(data.points);
  relations.setData(data.primaryRelations);
  subordinateRelations.setData(data.secondaryRelations);
  militaryRelationAnimation.setRelations(map, data.flowRelations);
  if (map.getLayer(pointOutlineLayerId)) {
    map.setLayoutProperty(pointOutlineLayerId, "icon-size", iconSizes.outline);
  }
  if (map.getLayer(pointLayerId)) {
    map.setLayoutProperty(pointLayerId, "icon-size", iconSizes.fill);
    map.setPaintProperty(pointLayerId, "icon-color", pointColor(selection.colorMode));
  }
  const flowVisible = map.getLayoutProperty(flowLayerId, "visibility") !== "none";
  if (flowVisible) militaryRelationAnimation.start(map);
  else militaryRelationAnimation.stop(map);
}

export function setMilitaryPointFocus(
  map: Map,
  commandId: string | null,
  dimAll = false,
) {
  if (!map.getLayer(pointLayerId)) return;
  map.setPaintProperty(pointOutlineLayerId, "icon-opacity",
    commandOpacity(commandId, 1, 0.2, dimAll));
  map.setPaintProperty(pointLayerId, "icon-opacity",
    commandOpacity(commandId, 1, 0.28, dimAll));
  map.setPaintProperty(labelLayerId, "text-opacity",
    commandOpacity(commandId, 0.78, 0.2, dimAll));
}

export function setMilitaryVisibility(map: Map, visible: boolean) {
  setLayerVisibility(map, militaryLayerIds, visible);
  if (visible) militaryRelationAnimation.start(map);
  else militaryRelationAnimation.stop(map);
}

export function stopMilitaryRelationAnimation(map: Map) {
  militaryRelationAnimation.stop(map);
}
