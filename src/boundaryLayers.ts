import type { ExpressionSpecification, Map } from "maplibre-gl";
import { setLayerVisibility } from "./mapLayerVisibility";
import { defaultTheme } from "./theme";

const tokens = defaultTheme.map;
const sourceId = "province-boundaries";
const fillLayerId = "province-boundary-fill";
const lineLayerId = "province-boundary-line";
const labelSourceId = "province-boundary-labels";
const labelLayerId = "province-boundary-label";

export const boundaryLayerIds = [fillLayerId, lineLayerId, labelLayerId] as const;
export const boundaryDataUrl = "/reference/province-baseline.geojson";

const fillOpacity = { idle: 0.18, hover: 0.28, selected: 0.42 };

/// Provincial fills reuse the affiliation palette so a province keeps one identity whether
/// the map shows it as an area or as the seat points inside it.
function affiliationColor(): ExpressionSpecification {
  const cases = Object.entries(tokens.affiliationColors)
    .flatMap(([unitId, color]) => [unitId, color]);
  return ["match", ["get", "unitId"], ...cases, tokens.relief] as unknown as ExpressionSpecification;
}

/// In the nation view the provinces are not drawn at all: the empire is one shape, and its
/// divisions appear only once one of them is chosen. The fill stays in the style so hover
/// can still find the province under the pointer, which is what lifts the national fill.
function opacityExpression(
  selectedUnitId: string | null,
  provinceScope: boolean,
): ExpressionSpecification | number {
  // In the nation view only the hovered province is tinted, and it is drawn over the
  // national wash rather than instead of it, so the lift has to clear that wash to read at
  // all. Nothing else in the layer is painted, which is what keeps the borders withheld.
  if (!provinceScope) {
    return ["case",
      ["boolean", ["feature-state", "hover"], false], tokens.nationHoverFillOpacity,
      0,
    ] as unknown as ExpressionSpecification;
  }
  return ["case",
    ["==", ["get", "unitId"], selectedUnitId ?? ""], fillOpacity.selected,
    ["boolean", ["feature-state", "hover"], false], fillOpacity.hover,
    fillOpacity.idle,
  ] as unknown as ExpressionSpecification;
}

/// In the nation view the hovered province brightens in the realm's own cinnabar rather
/// than showing its provincial colour, so hovering reads as lifting part of one empire
/// instead of previewing the division the view has not made yet.
function fillColorExpression(provinceScope: boolean) {
  return provinceScope ? affiliationColor() : tokens.nation;
}

/// A zoom expression has to stay at the top level, so the selected-width branch lives inside
/// each interpolation stop rather than wrapping the interpolation.
function lineWidthExpression(selectedUnitId: string | null): ExpressionSpecification {
  const selected: ExpressionSpecification = ["==", ["get", "unitId"], selectedUnitId ?? ""];
  return ["interpolate", ["linear"], ["zoom"],
    4, ["case", selected, 2.5, 0.8],
    10, ["case", selected, 4.0, 2.0],
  ];
}

/// Province names are drawn from their own point source rather than from the polygons.
/// MapLibre puts one label on every polygon of a MultiPolygon, which would repeat 廣東 on
/// each of its twenty-one islands; the export carries a single anchor per unit instead.
function labelData(
  document: GeoJSON.FeatureCollection,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: document.features.flatMap((feature) => {
      const anchor = feature.properties?.labelAnchor;
      if (!Array.isArray(anchor) || anchor.length !== 2) return [];
      return [{
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [anchor[0], anchor[1]] },
        properties: { name: feature.properties?.unitName ?? "" },
      }];
    }),
  };
}

export function addBoundaryLayers(
  map: Map,
  selectedUnitId: string | null,
  visible: boolean,
  provinceScope: boolean,
  beforeLayerId?: string,
) {
  if (map.getSource(sourceId)) return;
  map.addSource(sourceId, { type: "geojson", data: boundaryDataUrl, promoteId: "unitId" });
  // Areas sit under the seat and unit points so the points stay the foreground click target.
  const before = beforeLayerId && map.getLayer(beforeLayerId) ? beforeLayerId : undefined;
  map.addLayer({
    id: fillLayerId,
    type: "fill",
    source: sourceId,
    paint: {
      "fill-color": fillColorExpression(provinceScope),
      "fill-opacity": opacityExpression(selectedUnitId, provinceScope),
      "fill-opacity-transition": { duration: tokens.countyFadeDurationMs },
    },
  }, before);
  map.addLayer({
    id: lineLayerId,
    type: "line",
    source: sourceId,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
      "line-color": affiliationColor(),
      "line-opacity": provinceScope ? 0.75 : 0,
      "line-opacity-transition": { duration: tokens.countyFadeDurationMs },
      "line-width": lineWidthExpression(selectedUnitId),
    },
  }, before);
  map.addSource(labelSourceId, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: labelLayerId,
    type: "symbol",
    source: labelSourceId,
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["Open Sans Regular"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 4, 15, 7, 22],
      "text-letter-spacing": 0.18,
      "text-allow-overlap": false,
    },
    paint: {
      "text-color": tokens.provinceLabel,
      "text-opacity": provinceScope ? tokens.provinceLabelOpacity : 0,
      "text-opacity-transition": { duration: tokens.countyFadeDurationMs },
      "text-halo-color": tokens.land,
      "text-halo-width": 1.8,
    },
  });
  setLayerVisibility(map, boundaryLayerIds, visible);
  void fetch(boundaryDataUrl)
    .then((response) => response.json())
    .then((document) => {
      const source = map.getSource(labelSourceId) as maplibregl.GeoJSONSource | undefined;
      source?.setData(labelData(document));
    });
}

export function setBoundarySelection(
  map: Map,
  selectedUnitId: string | null,
  provinceScope: boolean,
) {
  if (!map.getLayer(fillLayerId)) return;
  map.setPaintProperty(fillLayerId, "fill-color", fillColorExpression(provinceScope));
  map.setPaintProperty(fillLayerId, "fill-opacity", opacityExpression(selectedUnitId, provinceScope));
  map.setPaintProperty(lineLayerId, "line-opacity", provinceScope ? 0.75 : 0);
  map.setPaintProperty(lineLayerId, "line-width", lineWidthExpression(selectedUnitId));
  map.setPaintProperty(labelLayerId, "text-opacity",
    provinceScope ? tokens.provinceLabelOpacity : 0);
}

export function setBoundaryVisibility(map: Map, visible: boolean) {
  setLayerVisibility(map, boundaryLayerIds, visible);
}

/// Tracks the province under the pointer through feature state so hover shading does not
/// rebuild the source data on every mouse move.
export function registerBoundaryHover(map: Map) {
  let hoveredId: string | null = null;
  const clearHover = () => {
    if (hoveredId === null) return;
    map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
    hoveredId = null;
  };
  const handleMove = (event: { features?: { id?: string | number }[] }) => {
    const id = event.features?.[0]?.id;
    if (typeof id !== "string" || id === hoveredId) return;
    clearHover();
    hoveredId = id;
    map.setFeatureState({ source: sourceId, id }, { hover: true });
  };
  map.on("mousemove", fillLayerId, handleMove);
  map.on("mouseleave", fillLayerId, clearHover);
  return () => {
    map.off("mousemove", fillLayerId, handleMove);
    map.off("mouseleave", fillLayerId, clearHover);
    clearHover();
  };
}
