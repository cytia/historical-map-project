import type { ExpressionSpecification, Map } from "maplibre-gl";
import { setLayerVisibility } from "./mapLayerVisibility";
import { defaultTheme } from "./theme";

const tokens = defaultTheme.map;
const sourceId = "national-outline";
const labelSourceId = "national-outline-label";
const fillLayerId = "national-outline-fill";
const lineLayerId = "national-outline-line";
const labelLayerId = "national-outline-label";

export const nationLayerIds = [fillLayerId, lineLayerId, labelLayerId] as const;
export const nationDataUrl = "/reference/national-outline-1600.geojson";

/// The empire as one shape. The map opens on this rather than on fifteen coloured
/// provinces: before anything is chosen the question is what the realm was, not how it was
/// divided, and the divisions arrive when a province is picked.
///
/// The outline is the union of the same extents the provincial layer draws, so the two
/// agree vertex for vertex and no seam appears where they overlap.
const emptyPoints: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: "FeatureCollection",
  features: [],
};

/// One flat wash over the whole realm. Hover is not expressed here — the national outline
/// is a single feature and has no province to raise — but by the province fill underneath,
/// which lifts the hovered province alone without drawing its boundary.
const nationFillOpacity = tokens.nationFillOpacity;

function labelSize(): ExpressionSpecification {
  return ["interpolate", ["linear"], ["zoom"], 4, 80, 6, 120];
}

function lineWidth(): ExpressionSpecification {
  return ["interpolate", ["linear"], ["zoom"], 4, 0.8, 10, 2.0];
}

/// Reads the anchor the export wrote into the geometry. It is a representative point of the
/// mainland, so the name sits on land rather than in a bay the coastline curves around.
function labelData(
  document: GeoJSON.FeatureCollection,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const properties = document.features[0]?.properties;
  const anchor = properties?.labelAnchor;
  if (!Array.isArray(anchor) || anchor.length !== 2) return emptyPoints;
  return {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      geometry: { type: "Point", coordinates: [anchor[0], anchor[1]] },
      properties: { name: properties?.unitName ?? "大明" },
    }],
  };
}

export async function addNationLayers(map: Map, visible: boolean, beforeLayerId?: string) {
  if (map.getSource(sourceId)) return;
  const before = beforeLayerId && map.getLayer(beforeLayerId) ? beforeLayerId : undefined;
  map.addSource(sourceId, { type: "geojson", data: nationDataUrl });
  map.addSource(labelSourceId, { type: "geojson", data: emptyPoints });
  map.addLayer({
    id: fillLayerId,
    type: "fill",
    source: sourceId,
    paint: {
      "fill-color": tokens.nation,
      "fill-opacity": visible ? nationFillOpacity : 0,
      "fill-opacity-transition": { duration: tokens.countyFadeDurationMs },
    },
  }, before);
  map.addLayer({
    id: lineLayerId,
    type: "line",
    source: sourceId,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
      "line-color": tokens.nation,
      "line-opacity": 0.75,
      "line-width": lineWidth(),
    },
  }, before);
  map.addLayer({
    id: labelLayerId,
    type: "symbol",
    source: labelSourceId,
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["Open Sans Regular"],
      "text-size": labelSize(),
      "text-letter-spacing": 0.35,
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": tokens.nationLabel,
      "text-opacity": visible ? tokens.nationLabelOpacity : 0,
      "text-opacity-transition": { duration: tokens.countyFadeDurationMs },
      "text-halo-color": tokens.land,
      "text-halo-width": 2,
    },
  });
  setLayerVisibility(map, nationLayerIds, true);

  // The anchor travels with the geometry, so the label waits for the same fetch.
  const document = await fetch(nationDataUrl).then((response) => response.json());
  if (!map.getSource(labelSourceId)) return;
  (map.getSource(labelSourceId) as maplibregl.GeoJSONSource).setData(labelData(document));
}

/// The nation view is on whenever no province is chosen. Both the fill and the name fade
/// rather than switch, so choosing a province reads as the divisions arriving on top of the
/// realm instead of one map being swapped for another.
export function setNationScope(map: Map, active: boolean) {
  if (!map.getLayer(fillLayerId)) return;
  map.setPaintProperty(fillLayerId, "fill-opacity", active ? nationFillOpacity : 0);
  map.setPaintProperty(lineLayerId, "line-opacity", active ? 0.75 : 0.28);
  map.setPaintProperty(labelLayerId, "text-opacity", active ? tokens.nationLabelOpacity : 0);
}
