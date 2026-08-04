import type { ExpressionSpecification, GeoJSONSource, Map } from "maplibre-gl";
import { jimiRecords } from "./jimiData";
import { jimiHierarchyData } from "./jimiHierarchyData";
import {
  ensureJimiSymbolImages,
  jimiMilitarySymbolImageId,
  jimiNativeOfficeSymbolImageId,
  jimiPointIconSizes,
} from "./jimiMarker";
import { setLayerVisibility } from "./mapLayerVisibility";
import { createRelationRenderer } from "./relationRenderer";
import { defaultTheme } from "./theme";
import type { HierarchyScope } from "./types";

const tokens = defaultTheme.map;
const pointSourceId = "jimi-points";
const relationSourceId = "jimi-relations";
const flowSourceId = "jimi-relation-flow";
const relationLayerId = "jimi-relations";
const flowLayerId = "jimi-relation-flow";
const pointOutlineLayerId = "jimi-point-outline";
const pointLayerId = "jimi-points";
const labelLayerId = "jimi-labels";
const jimiRelationRenderer = createRelationRenderer({
  relationSourceId,
  flowSourceId,
  relationLayerId,
  flowLayerId,
});

export const jimiLayerIds = [
  ...jimiRelationRenderer.layerIds,
  pointOutlineLayerId,
  pointLayerId,
  labelLayerId,
] as const;

export interface JimiLayerSelection {
  selectedJimiId: string | null;
  scope: HierarchyScope;
}

function iconImageExpression(): ExpressionSpecification {
  return ["match", ["get", "jimiKind"],
    "military-institution", jimiMilitarySymbolImageId,
    jimiNativeOfficeSymbolImageId,
  ] as unknown as ExpressionSpecification;
}

function featureData(selection: JimiLayerSelection) {
  const hierarchy = jimiHierarchyData(jimiRecords, selection.selectedJimiId, selection.scope);
  return {
    points: {
      type: "FeatureCollection" as const,
      features: hierarchy.records.map(({ unit, place, administrativeRegionId, jimiRootId, jimiDepth }) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [place.longitude!, place.latitude!] },
        properties: {
          id: unit.id,
          name: unit.name,
          label: unit.name,
          kind: "jimi",
          jimiKind: unit.jimiKind,
          officeKind: unit.officeKind,
          regionId: administrativeRegionId ?? "",
          jimiRootId,
          jimiDepth,
        },
      })),
    },
    relations: hierarchy.relations,
    flowRelations: hierarchy.flowRelations,
    animateRelations: hierarchy.animateRelations,
  };
}

export function addJimiLayers(map: Map, selection: JimiLayerSelection, visible: boolean) {
  ensureJimiSymbolImages(map);
  const data = featureData(selection);
  const iconImage = iconImageExpression();
  const iconSizes = jimiPointIconSizes(selection.selectedJimiId);
  map.addSource(pointSourceId, { type: "geojson", data: data.points });
  jimiRelationRenderer.add(map, {
    relations: data.relations,
    flowRelations: data.flowRelations,
    animate: data.animateRelations,
  });
  map.addLayer({ id: pointOutlineLayerId, type: "symbol", source: pointSourceId,
    layout: { "icon-image": iconImage, "icon-size": iconSizes.outline,
      "icon-allow-overlap": true },
    paint: { "icon-color": tokens.seatRing,
      "icon-opacity": 1 } });
  map.addLayer({ id: pointLayerId, type: "symbol", source: pointSourceId,
    layout: { "icon-image": iconImage, "icon-size": iconSizes.fill,
      "icon-allow-overlap": true },
    paint: { "icon-color": tokens.affiliationNeutral,
      "icon-opacity": 1 } });
  map.addLayer({ id: labelLayerId, type: "symbol", source: pointSourceId,
    minzoom: 5.4,
    layout: { "text-field": ["get", "label"], "text-font": ["Open Sans Regular"],
      "text-size": 10, "text-offset": [0, 1.18], "text-anchor": "top",
      "text-allow-overlap": false },
    paint: { "text-color": tokens.militaryLabel,
      "text-opacity": 0.78,
      "text-halo-color": tokens.land, "text-halo-width": 1.2 } });
  setLayerVisibility(map, jimiLayerIds, visible);
  if (visible) jimiRelationRenderer.start(map);
}

export function setJimiSelection(map: Map, selection: JimiLayerSelection) {
  const source = map.getSource(pointSourceId) as GeoJSONSource | undefined;
  if (!source) return;
  const data = featureData(selection);
  source.setData(data.points);
  jimiRelationRenderer.setData(map, {
    relations: data.relations,
    flowRelations: data.flowRelations,
    animate: data.animateRelations,
  });
  const iconSizes = jimiPointIconSizes(selection.selectedJimiId);
  if (map.getLayer(pointOutlineLayerId)) {
    map.setLayoutProperty(pointOutlineLayerId, "icon-size", iconSizes.outline);
    map.setPaintProperty(pointOutlineLayerId, "icon-opacity", 1);
  }
  if (map.getLayer(pointLayerId)) {
    map.setLayoutProperty(pointLayerId, "icon-size", iconSizes.fill);
    map.setPaintProperty(pointLayerId, "icon-opacity", 1);
  }
  if (map.getLayer(labelLayerId)) {
    map.setPaintProperty(labelLayerId, "text-opacity", 0.78);
  }
  const flowVisible = map.getLayoutProperty(flowLayerId, "visibility") !== "none";
  if (flowVisible) jimiRelationRenderer.start(map);
  else jimiRelationRenderer.stop(map);
}

export function setJimiPointFocus(map: Map, jimiRootId: string | null, dimAll = false) {
  if (!map.getLayer(pointLayerId)) return;
  const opacity = (active: number, inactive: number) => {
    if (dimAll) return inactive;
    if (!jimiRootId) return active;
    return ["case", ["==", ["get", "jimiRootId"], jimiRootId], active, inactive] as unknown as ExpressionSpecification;
  };
  map.setPaintProperty(pointOutlineLayerId, "icon-opacity", opacity(1, 0.18));
  map.setPaintProperty(pointLayerId, "icon-opacity", opacity(1, 0.24));
  map.setPaintProperty(labelLayerId, "text-opacity", opacity(0.78, 0.18));
}

export function setJimiVisibility(map: Map, visible: boolean) {
  setLayerVisibility(map, jimiLayerIds, visible);
  if (visible) jimiRelationRenderer.start(map);
  else jimiRelationRenderer.stop(map);
}

export function stopJimiAnimation(map: Map) {
  jimiRelationRenderer.stop(map);
}
