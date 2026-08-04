import type { Map } from "maplibre-gl";
import { setLayerVisibility } from "./mapLayerVisibility";
import { createRelationRenderer } from "./relationRenderer";
import { defaultTheme } from "./theme";

const tokens = defaultTheme.map;
const displayRelationSourceId = "military-display-relations";
const displayFlowSourceId = "military-display-relation-flow";
const displayAnchorSourceId = "military-display-anchor";
const displayRelationLayerId = "military-display-relations";
const displayFlowLayerId = "military-display-relation-flow";
const displayPulseLayerId = "military-display-anchor-pulse";
const displayAnchorLayerId = "military-display-anchor";
const displayAnchorLabelLayerId = "military-display-anchor-label";
const displayRelationRenderer = createRelationRenderer({
  relationSourceId: displayRelationSourceId,
  flowSourceId: displayFlowSourceId,
  pulseSourceId: displayAnchorSourceId,
  relationLayerId: displayRelationLayerId,
  flowLayerId: displayFlowLayerId,
  pulseLayerId: displayPulseLayerId,
});

export const militaryDisplayLayerIds = [
  ...displayRelationRenderer.layerIds,
  displayAnchorLayerId,
  displayAnchorLabelLayerId,
] as const;

export interface MilitaryDisplayLayerData {
  displayGroupRelations: GeoJSON.FeatureCollection<GeoJSON.LineString>;
  displayGroupAnchor: GeoJSON.FeatureCollection<GeoJSON.Point>;
  animateRelations: boolean;
}

export function addMilitaryDisplayLayers(
  map: Map,
  data: MilitaryDisplayLayerData,
  visible: boolean,
) {
  displayRelationRenderer.add(map, {
    relations: data.displayGroupRelations,
    pulsePoint: data.displayGroupAnchor,
    animate: data.animateRelations,
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
  if (visible) displayRelationRenderer.start(map);
}

export function setMilitaryDisplaySelection(map: Map, data: MilitaryDisplayLayerData) {
  const updated = displayRelationRenderer.setData(map, {
    relations: data.displayGroupRelations,
    pulsePoint: data.displayGroupAnchor,
    animate: data.animateRelations,
  });
  if (!updated) return;
  const flowVisible = map.getLayoutProperty(displayFlowLayerId, "visibility") !== "none";
  if (flowVisible) displayRelationRenderer.start(map);
  else displayRelationRenderer.stop(map);
}

export function setMilitaryDisplayVisibility(map: Map, visible: boolean) {
  if (visible) displayRelationRenderer.start(map);
  else displayRelationRenderer.stop(map);
}

export function stopMilitaryDisplayAnimation(map: Map) {
  displayRelationRenderer.stop(map);
}
