import type { ExpressionSpecification, Map } from "maplibre-gl";
import { setLayerVisibility } from "./mapLayerVisibility";
import { defaultTheme } from "./theme";

const tokens = defaultTheme.map;
const sourceId = "province-boundaries";
const fillLayerId = "province-boundary-fill";
const lineLayerId = "province-boundary-line";

export const boundaryLayerIds = [fillLayerId, lineLayerId] as const;
export const boundaryDataUrl = "/reference/province-baseline.geojson";

const fillOpacity = { idle: 0.18, hover: 0.28, selected: 0.42 };

/// Provincial fills reuse the affiliation palette so a province keeps one identity whether
/// the map shows it as an area or as the seat points inside it.
function affiliationColor(): ExpressionSpecification {
  const cases = Object.entries(tokens.affiliationColors)
    .flatMap(([unitId, color]) => [unitId, color]);
  return ["match", ["get", "unitId"], ...cases, tokens.relief] as unknown as ExpressionSpecification;
}

function opacityExpression(selectedUnitId: string | null): ExpressionSpecification {
  return ["case",
    ["==", ["get", "unitId"], selectedUnitId ?? ""], fillOpacity.selected,
    ["boolean", ["feature-state", "hover"], false], fillOpacity.hover,
    fillOpacity.idle,
  ];
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

export function addBoundaryLayers(
  map: Map,
  selectedUnitId: string | null,
  visible: boolean,
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
      "fill-color": affiliationColor(),
      "fill-opacity": opacityExpression(selectedUnitId),
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
      "line-opacity": 0.75,
      "line-width": lineWidthExpression(selectedUnitId),
    },
  }, before);
  setLayerVisibility(map, boundaryLayerIds, visible);
}

export function setBoundarySelection(map: Map, selectedUnitId: string | null) {
  if (!map.getLayer(fillLayerId)) return;
  map.setPaintProperty(fillLayerId, "fill-opacity", opacityExpression(selectedUnitId));
  map.setPaintProperty(lineLayerId, "line-width", lineWidthExpression(selectedUnitId));
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
