import type { ExpressionSpecification, GeoJSONSource, Map } from "maplibre-gl";
import { getMilitaryFocusId, publishedMilitaryRecords } from "./militaryData";
import { militaryHierarchyData } from "./militaryRelationData";
import { militaryColorExpression } from "./mapDisplay";
import {
  focusedTierOpacity,
  militaryTier,
  tierOpacityExpression,
  tierProperty,
} from "./displayTier";
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
import type { MilitaryColorMode } from "./types";

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
  labelLayerId,
] as const;

export interface MilitaryLayerSelection {
  selectedMilitaryId: string | null;
  selectedAdministrativeId: string | null;
  activeRegionId: string | null;
  colorMode: MilitaryColorMode;
}

export function getVisibleMilitaryRecords(selection: MilitaryLayerSelection) {
  return militaryHierarchyData(
    publishedMilitaryRecords,
    selection.selectedMilitaryId,
  ).records;
}

function featureData(selection: MilitaryLayerSelection) {
  const hierarchy = militaryHierarchyData(
    publishedMilitaryRecords,
    selection.selectedMilitaryId,
  );
  const points = {
    type: "FeatureCollection" as const,
    features: hierarchy.records.map(({ unit, place, administrativeRegionId, mapRegionId, administrativeUnitId, militaryParentId, fiveArmyId }) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [place.longitude!, place.latitude!] },
      properties: {
        id: unit.id,
        name: unit.name,
        label: unit.name,
        kind: "military",
        // The extent that draws this unit; the sourced administrative claim stays separate.
        regionId: mapRegionId,
        administrativeRegionId,
        administrativeUnitId,
        militaryParentId,
        militaryKind: unit.militaryKind ?? "",
        [tierProperty]: militaryTier(unit.militaryKind),
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
  const region = selection.activeRegionId;
  const gated = region !== null;
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
    animate: data.animateRelations,
  });
  addSubordinateRelationLayer(map, {
    sourceId: subordinateRelationSourceId,
    layerId: subordinateRelationLayerId,
    // 衛—所 lines reach second-tier points, so they arrive when those points do.
    opacity: tierOpacityExpression({ visible: gated, maximumOpacity: 0.78, regionId: region }),
  });
  map.addLayer({ id: pointOutlineLayerId, type: "symbol", source: pointSourceId,
    layout: { "icon-image": militarySymbolImageId,
      "icon-size": iconSizes.outline,
      "icon-allow-overlap": true },
    paint: { "icon-color": tokens.seatRing, "icon-opacity": tierOpacityExpression({ visible: gated, regionId: region }) } });
  map.addLayer({ id: pointLayerId, type: "symbol", source: pointSourceId,
    layout: { "icon-image": militarySymbolImageId,
      "icon-size": iconSizes.fill,
      "icon-allow-overlap": true },
    paint: { "icon-color": pointColor(selection.colorMode),
      "icon-opacity": tierOpacityExpression({ visible: gated, regionId: region }) } });
  map.addLayer({ id: labelLayerId, type: "symbol", source: pointSourceId,
    layout: { "text-field": ["get", "label"], "text-font": ["Open Sans Regular"],
      "text-size": 11,
      "text-offset": [0, 1.15], "text-anchor": "top", "text-allow-overlap": false },
    // Military labels stay below administrative ones in weight, so the tier ceiling is
    // 0.78 rather than 1; the tier expression replaces the old fixed minzoom cutoff.
    paint: { "text-color": tokens.militaryLabel,
      "text-opacity": tierOpacityExpression({ visible: gated, maximumOpacity: 0.78, label: true, regionId: region }),
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
    animate: data.animateRelations,
  });
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
  regionId: string | null = null,
) {
  if (!map.getLayer(pointLayerId)) return;
  const visible = regionId !== null && !dimAll;
  map.setPaintProperty(pointOutlineLayerId, "icon-opacity",
    focusedTierOpacity(commandOpacity(commandId, 1, 0.2, false), { visible, regionId }));
  map.setPaintProperty(pointLayerId, "icon-opacity",
    focusedTierOpacity(commandOpacity(commandId, 1, 0.28, false), { visible, regionId }));
  map.setPaintProperty(labelLayerId, "text-opacity",
    focusedTierOpacity(commandOpacity(commandId, 0.78, 0.2, false), { visible, label: true, regionId }));
}

export function setMilitaryVisibility(map: Map, visible: boolean) {
  setLayerVisibility(map, militaryLayerIds, visible);
  if (visible) militaryRelationRenderer.start(map);
  else militaryRelationRenderer.stop(map);
}

export function stopMilitaryRelationAnimation(map: Map) {
  militaryRelationRenderer.stop(map);
}
