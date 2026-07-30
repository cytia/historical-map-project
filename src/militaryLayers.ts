import type { ExpressionSpecification, GeoJSONSource, Map } from "maplibre-gl";
import { getMilitaryFocusId, publishedMilitaryRecords } from "./militaryData";
import { militaryHierarchyData } from "./militaryRelationData";
import {
  addMilitaryDisplayLayers,
  militaryDisplayLayerIds,
  setMilitaryDisplaySelection,
  setMilitaryDisplayVisibility,
  stopMilitaryDisplayAnimation,
} from "./militaryDisplayRelations";
import { militaryColorExpression } from "./mapDisplay";
import { administrativeAffiliationIds } from "./data";
import { setLayerVisibility } from "./mapLayerVisibility";
import {
  ensureMilitarySymbolImage,
  militarySymbolImageId,
  militaryPointIconSizes,
} from "./militaryMarker";
import {
  addSubordinateRelationLayer,
} from "./relationRendering";
import { createRelationRenderer } from "./relationRenderer";
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
const militaryRelationRenderer = createRelationRenderer({
  relationSourceId,
  flowSourceId,
  relationLayerId,
  flowLayerId,
});
export const militaryLayerIds = [
  ...militaryRelationRenderer.layerIds,
  subordinateRelationLayerId, pointOutlineLayerId, pointLayerId,
  labelLayerId, ...militaryDisplayLayerIds,
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
    features: hierarchy.records.map(({ unit, place, administrativeRegionId, administrativeUnitId, militaryParentId, fiveArmyId }) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [place.longitude!, place.latitude!] },
      properties: {
        id: unit.id,
        name: unit.name,
        label: unit.name,
        kind: "military",
        regionId: administrativeRegionId,
        administrativeUnitId,
        militaryParentId,
        militaryKind: unit.militaryKind ?? "",
        fiveArmyId: fiveArmyId ?? "",
        commandId: getMilitaryFocusId(unit.id),
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
  map.addSource(subordinateRelationSourceId, {
    type: "geojson",
    data: data.secondaryRelations,
  });
  militaryRelationRenderer.add(map, {
    relations: data.primaryRelations,
    flowRelations: data.flowRelations,
  });
  addSubordinateRelationLayer(map, {
    sourceId: subordinateRelationSourceId,
    layerId: subordinateRelationLayerId,
    opacity: 0.78,
  });
  addMilitaryDisplayLayers(map, data, visible);
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
  if (visible) militaryRelationRenderer.start(map);
}

export function setMilitarySelection(map: Map, selection: MilitaryLayerSelection) {
  const points = map.getSource(pointSourceId) as GeoJSONSource | undefined;
  const subordinateRelations = map.getSource(subordinateRelationSourceId) as
    GeoJSONSource | undefined;
  if (!points || !subordinateRelations) return;
  const data = featureData(selection);
  const iconSizes = militaryPointIconSizes(selection.selectedMilitaryId);
  points.setData(data.points);
  subordinateRelations.setData(data.secondaryRelations);
  militaryRelationRenderer.setData(map, {
    relations: data.primaryRelations,
    flowRelations: data.flowRelations,
  });
  setMilitaryDisplaySelection(map, data);
  if (map.getLayer(pointOutlineLayerId)) {
    map.setLayoutProperty(pointOutlineLayerId, "icon-size", iconSizes.outline);
  }
  if (map.getLayer(pointLayerId)) {
    map.setLayoutProperty(pointLayerId, "icon-size", iconSizes.fill);
    map.setPaintProperty(pointLayerId, "icon-color", pointColor(selection.colorMode));
  }
  const flowVisible = map.getLayoutProperty(flowLayerId, "visibility") !== "none";
  if (flowVisible) militaryRelationRenderer.start(map);
  else militaryRelationRenderer.stop(map);
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
  if (visible) militaryRelationRenderer.start(map);
  else militaryRelationRenderer.stop(map);
  setMilitaryDisplayVisibility(map, visible);
}

export function stopMilitaryRelationAnimation(map: Map) {
  militaryRelationRenderer.stop(map);
  stopMilitaryDisplayAnimation(map);
}
