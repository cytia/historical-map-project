import type { GeoJSONSource, Map } from "maplibre-gl";
import { setLayerVisibility } from "./mapLayerVisibility";
import {
  addRelationLineLayers,
  createRelationAnimationController,
} from "./relationRendering";
import { defaultTheme } from "./theme";

const tokens = defaultTheme.map;
const displayRelationSourceId = "military-display-relations";
const displayFlowSourceId = "military-display-relation-flow";
const displayAnchorSourceId = "military-display-anchor";
const displayRelationLayerId = "military-display-relations";
const displayFlowLayerId = "military-display-relation-flow";
const displayAnchorLayerId = "military-display-anchor";
const displayAnchorLabelLayerId = "military-display-anchor-label";
const displayRelationAnimation = createRelationAnimationController({
  flowSourceId: displayFlowSourceId,
  flowLayerId: displayFlowLayerId,
});

export const militaryDisplayLayerIds = [
  displayRelationLayerId,
  displayFlowLayerId,
  displayAnchorLayerId,
  displayAnchorLabelLayerId,
] as const;

export interface MilitaryDisplayLayerData {
  displayGroupRelations: GeoJSON.FeatureCollection<GeoJSON.LineString>;
  displayGroupAnchor: GeoJSON.FeatureCollection<GeoJSON.Point>;
}

export function addMilitaryDisplayLayers(
  map: Map,
  data: MilitaryDisplayLayerData,
  visible: boolean,
) {
  map.addSource(displayRelationSourceId, { type: "geojson", data: data.displayGroupRelations });
  map.addSource(displayFlowSourceId, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addSource(displayAnchorSourceId, { type: "geojson", data: data.displayGroupAnchor });
  addRelationLineLayers(map, {
    relationSourceId: displayRelationSourceId,
    flowSourceId: displayFlowSourceId,
    relationLayerId: displayRelationLayerId,
    flowLayerId: displayFlowLayerId,
  });
  map.addLayer({
    id: displayAnchorLayerId,
    type: "circle",
    source: displayAnchorSourceId,
    paint: {
      "circle-radius": 5,
      "circle-color": tokens.land,
      "circle-opacity": 0.9,
      "circle-stroke-color": tokens.relationLineSelected,
      "circle-stroke-width": 2,
    },
  });
  map.addLayer({
    id: displayAnchorLabelLayerId,
    type: "symbol",
    source: displayAnchorSourceId,
    minzoom: 5.2,
    layout: {
      "text-field": ["get", "label"],
      "text-font": ["Open Sans Regular"],
      "text-size": 10,
      "text-offset": [0, 1.2],
      "text-anchor": "top",
      "text-allow-overlap": false,
    },
    paint: {
      "text-color": tokens.militaryLabel,
      "text-opacity": 0.86,
      "text-halo-color": tokens.land,
      "text-halo-width": 1.1,
    },
  });
  setLayerVisibility(map, militaryDisplayLayerIds, visible);
  displayRelationAnimation.setRelations(map, data.displayGroupRelations);
  if (visible) displayRelationAnimation.start(map);
}

export function setMilitaryDisplaySelection(map: Map, data: MilitaryDisplayLayerData) {
  const relations = map.getSource(displayRelationSourceId) as GeoJSONSource | undefined;
  const anchor = map.getSource(displayAnchorSourceId) as GeoJSONSource | undefined;
  if (!relations || !anchor) return;
  relations.setData(data.displayGroupRelations);
  anchor.setData(data.displayGroupAnchor);
  displayRelationAnimation.setRelations(map, data.displayGroupRelations);
  const flowVisible = map.getLayoutProperty(displayFlowLayerId, "visibility") !== "none";
  if (flowVisible) displayRelationAnimation.start(map);
  else displayRelationAnimation.stop(map);
}

export function setMilitaryDisplayVisibility(map: Map, visible: boolean) {
  if (visible) displayRelationAnimation.start(map);
  else displayRelationAnimation.stop(map);
}

export function stopMilitaryDisplayAnimation(map: Map) {
  displayRelationAnimation.stop(map);
}
