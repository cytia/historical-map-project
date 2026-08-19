import type { ExpressionSpecification, Map } from "maplibre-gl";
import { administrativeAffiliationIds, topLevelSeats } from "./data";
import { administrativeTier, tierOpacityExpression, tierProperty } from "./displayTier";
import { affiliationColorExpression } from "./mapDisplay";
import { setLayerVisibility } from "./mapLayerVisibility";
import { defaultTheme } from "./theme";
import type { MapDisplayMode } from "./types";

const mapColors = defaultTheme.map;

export const seatLayerIds = ["seat-halo", "seat-points", "seat-labels"] as const;

const seatGeoJson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: "FeatureCollection",
  features: topLevelSeats.map(({ unit, place, name, region }) => ({
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
      [tierProperty]: administrativeTier(undefined),
      regionId: region.id,
    },
  })),
};

/// Seats obey the same "province first, then zoom" rule as garrisons and jimi offices;
/// `regionId` restricts the layer to the province in view.
function seatOpacity(
  focusRegionId: string | null,
  active: number,
  dimAll = false,
  label = false,
) {
  return tierOpacityExpression({
    visible: focusRegionId !== null && !dimAll,
    maximumOpacity: active,
    regionId: focusRegionId,
    label,
  });
}

function pointRadius(selectedUnitId: string | null): ExpressionSpecification {
  return ["case", ["==", ["get", "id"], selectedUnitId ?? ""], 7, 4];
}

function pointColor(displayMode: MapDisplayMode) {
  return affiliationColorExpression(displayMode, administrativeAffiliationIds);
}

export function addSeatLayers(
  map: Map,
  selectedUnitId: string | null,
  focusRegionId: string | null,
  visible: boolean,
  displayMode: MapDisplayMode,
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
      "circle-opacity": seatOpacity(focusRegionId, 1),
      // A circle's stroke has its own opacity and keeps drawing at full strength when the
      // fill is hidden, which would leave a ring behind for every hidden point.
      "circle-stroke-opacity": seatOpacity(focusRegionId, 1),
    },
  });
  map.addLayer({
    id: "seat-points",
    type: "circle",
    source: "seats",
    paint: {
      "circle-radius": pointRadius(selectedUnitId),
      "circle-color": pointColor(displayMode),
      "circle-opacity": seatOpacity(focusRegionId, 1),
      "circle-stroke-width": 2,
      "circle-stroke-color": mapColors.seatRing,
      "circle-stroke-opacity": seatOpacity(focusRegionId, 1),
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
      "text-opacity": seatOpacity(focusRegionId, 1, false, true),
      "text-halo-color": mapColors.land,
      "text-halo-width": 1.5,
    },
  });
  setLayerVisibility(map, seatLayerIds, visible);
}

export function setSeatDisplayMode(map: Map, displayMode: MapDisplayMode) {
  if (!map.getLayer("seat-points")) return;
  map.setPaintProperty("seat-points", "circle-color", pointColor(displayMode));
}

export function setSeatSelection(map: Map, selectedUnitId: string | null) {
  if (!map.getLayer("seat-points")) return;
  map.setPaintProperty("seat-points", "circle-radius", pointRadius(selectedUnitId));
}

export function setSeatFocus(map: Map, focusRegionId: string | null, dimAll = false) {
  if (!map.getLayer("seat-points")) return;
  map.setPaintProperty("seat-points", "circle-opacity",
    seatOpacity(focusRegionId, 1, dimAll));
  map.setPaintProperty("seat-points", "circle-stroke-opacity",
    seatOpacity(focusRegionId, 1, dimAll));
  map.setPaintProperty("seat-labels", "text-opacity",
    seatOpacity(focusRegionId, 1, dimAll, true));
  map.setPaintProperty("seat-halo", "circle-opacity",
    seatOpacity(focusRegionId, 1, dimAll));
  map.setPaintProperty("seat-halo", "circle-stroke-opacity",
    seatOpacity(focusRegionId, 1, dimAll));
}
