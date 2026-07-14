import type { Map } from "maplibre-gl";

export function setLayerVisibility(
  map: Map,
  layerIds: readonly string[],
  visible: boolean,
) {
  const visibility = visible ? "visible" : "none";
  layerIds.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visibility);
    }
  });
}
