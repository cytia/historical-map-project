import type { ExpressionSpecification, Map } from "maplibre-gl";
import { seats } from "./data";
import { defaultTheme } from "./theme";

const mapColors = defaultTheme.map;

export const seatLayerIds = ["seat-halo", "seat-points", "seat-labels"] as const;

const seatGeoJson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: "FeatureCollection",
  features: seats.map(({ unit, place, name }) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [place.longitude as number, place.latitude as number],
    },
    properties: {
      id: unit.id,
      name: unit.name,
      seatName: name,
      level: unit.level,
      regionId: unit.parentId,
    },
  })),
};

function regionOpacity(
  regionId: string | null,
  active: number,
  inactive: number,
): number | ExpressionSpecification {
  if (!regionId) return active;
  return ["case", ["==", ["get", "regionId"], regionId], active, inactive];
}

function pointRadius(selectedUnitId: string | null): ExpressionSpecification {
  return ["case", ["==", ["get", "id"], selectedUnitId ?? ""], 7, 4];
}

export function addSeatLayers(
  map: Map,
  selectedUnitId: string | null,
  focusRegionId: string | null,
  visible: boolean,
) {
  map.addSource("seats", { type: "geojson", data: seatGeoJson });
  map.addLayer({
    id: "seat-halo",
    type: "circle",
    source: "seats",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 8, 8, 13],
      "circle-color": mapColors.seatHalo,
      "circle-stroke-width": 1,
      "circle-stroke-color": mapColors.seatHaloStroke,
      "circle-opacity": regionOpacity(focusRegionId, 1, 0.2),
    },
  });
  map.addLayer({
    id: "seat-points",
    type: "circle",
    source: "seats",
    paint: {
      "circle-radius": pointRadius(selectedUnitId),
      "circle-color": mapColors.seat,
      "circle-opacity": regionOpacity(focusRegionId, 1, 0.28),
      "circle-stroke-width": 2,
      "circle-stroke-color": mapColors.seatRing,
    },
  });
  map.addLayer({
    id: "seat-labels",
    type: "symbol",
    source: "seats",
    minzoom: 4.4,
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["Open Sans Regular"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 4, 11, 8, 14],
      "text-offset": [0, 1.1],
      "text-anchor": "top",
      "text-allow-overlap": false,
    },
    paint: {
      "text-color": mapColors.seatLabel,
      "text-opacity": regionOpacity(focusRegionId, 1, 0.2),
      "text-halo-color": mapColors.land,
      "text-halo-width": 1.5,
    },
  });
  setSeatLayerVisibility(map, visible);
}

export function setSeatFocus(map: Map, selectedUnitId: string | null, focusRegionId: string | null) {
  if (!map.getLayer("seat-points")) return;
  map.setPaintProperty("seat-points", "circle-radius", pointRadius(selectedUnitId));
  map.setPaintProperty("seat-points", "circle-opacity", regionOpacity(focusRegionId, 1, 0.28));
  map.setPaintProperty("seat-labels", "text-opacity", regionOpacity(focusRegionId, 1, 0.2));
  map.setPaintProperty("seat-halo", "circle-opacity", regionOpacity(focusRegionId, 1, 0.2));
}

export function setSeatFocusTransition(map: Map, duration: number) {
  const transition = { duration, delay: 0 };
  if (map.getLayer("seat-points")) {
    map.setPaintProperty("seat-points", "circle-opacity-transition", transition);
  }
  if (map.getLayer("seat-labels")) {
    map.setPaintProperty("seat-labels", "text-opacity-transition", transition);
  }
  if (map.getLayer("seat-halo")) {
    map.setPaintProperty("seat-halo", "circle-opacity-transition", transition);
  }
}

export function setSeatLayerVisibility(map: Map, visible: boolean) {
  const visibility = visible ? "visible" : "none";
  seatLayerIds.forEach((layerId) => {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", visibility);
  });
}
