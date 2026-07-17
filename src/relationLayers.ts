import type { ExpressionSpecification, GeoJSONSource, Map } from "maplibre-gl";
import { getTopLevelUnitId, seats, topLevelSeats } from "./data";
import { setLayerVisibility } from "./mapLayerVisibility";
import { defaultTheme } from "./theme";

const tokens = defaultTheme.map;
const sourceId = "seat-relations";
const flowSourceId = "seat-relation-flow-segments";
const capitalSourceId = "seat-relation-capital";
const layerIds = ["seat-relations", "seat-relation-flow", "seat-relation-capital-pulse"] as const;
const animationFrames = new WeakMap<Map, number>();

export function stopRelationAnimation(map: Map) {
  const frame = animationFrames.get(map);
  if (frame !== undefined) cancelAnimationFrame(frame);
  animationFrames.delete(map);
}

export function curvedCoordinates(from: [number, number], to: [number, number]) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const bend = Math.min(Math.hypot(dx, dy) * 0.08, 0.42);
  const length = Math.hypot(dx, dy) || 1;
  const control: [number, number] = [
    (from[0] + to[0]) / 2 - (dy / length) * bend,
    (from[1] + to[1]) / 2 + (dx / length) * bend,
  ];

  return Array.from({ length: 25 }, (_, index): [number, number] => {
    const t = index / 24;
    const inverse = 1 - t;
    return [
      inverse * inverse * from[0] + 2 * inverse * t * control[0] + t * t * to[0],
      inverse * inverse * from[1] + 2 * inverse * t * control[1] + t * t * to[1],
    ];
  });
}

function relationContext(selectedUnitId: string | null) {
  const topLevelUnitId = getTopLevelUnitId(selectedUnitId);
  const selected = seats.find(({ unit }) => unit.id === topLevelUnitId);
  const capital = seats.find(({ place }) => place.id === selected?.region.seatPlaceId);
  return { topLevelUnitId, selected, capital };
}

function relationData(
  context: ReturnType<typeof relationContext>,
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const { topLevelUnitId, selected, capital } = context;
  if (!selected || !capital) return { type: "FeatureCollection", features: [] };
  const capitalPoint: [number, number] = [capital.place.longitude!, capital.place.latitude!];

  return {
    type: "FeatureCollection",
    features: topLevelSeats
      .filter(({ region, place }) => region.id === selected.region.id && place.id !== capital.place.id)
      .map(({ unit, place }) => ({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: curvedCoordinates([place.longitude!, place.latitude!], capitalPoint),
        },
        properties: { id: unit.id, selected: unit.id === topLevelUnitId },
      })),
  };
}

function capitalData(
  context: ReturnType<typeof relationContext>,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const { selected, capital } = context;
  if (!selected || !capital) return { type: "FeatureCollection", features: [] };
  return { type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: {
    type: "Point", coordinates: [capital.place.longitude!, capital.place.latitude!],
  } }] };
}

function coordinateAt(coordinates: GeoJSON.Position[], progress: number): GeoJSON.Position {
  const scaled = Math.max(0, Math.min(1, progress)) * (coordinates.length - 1);
  const index = Math.min(Math.floor(scaled), coordinates.length - 2);
  const local = scaled - index;
  const from = coordinates[index];
  const to = coordinates[index + 1];
  return [from[0] + (to[0] - from[0]) * local, from[1] + (to[1] - from[1]) * local];
}

function segmentCoordinates(coordinates: GeoJSON.Position[], end: number) {
  const start = Math.max(0, end - tokens.relationFlowSegmentLength);
  const firstIndex = Math.ceil(start * (coordinates.length - 1));
  const lastIndex = Math.floor(end * (coordinates.length - 1));
  const segment = [coordinateAt(coordinates, start)];
  for (let index = firstIndex; index <= lastIndex; index += 1) segment.push(coordinates[index]);
  segment.push(coordinateAt(coordinates, end));
  return segment;
}

function flowData(
  relations: GeoJSON.FeatureCollection<GeoJSON.LineString>,
  elapsed: number,
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const cycle = tokens.relationFlowDurationMs + tokens.relationFlowPauseMs;
  return {
    type: "FeatureCollection",
    features: relations.features.flatMap((feature, index) => {
      const offset = (index / relations.features.length) * cycle;
      const localElapsed = (elapsed + offset) % cycle;
      if (localElapsed >= tokens.relationFlowDurationMs) return [];
      const progress = localElapsed / tokens.relationFlowDurationMs;
      return [{ ...feature, geometry: { type: "LineString" as const,
        coordinates: segmentCoordinates(feature.geometry.coordinates, progress) } }];
    }),
  };
}

function zoomOpacity(): ExpressionSpecification {
  const selectedOpacity: ExpressionSpecification = ["case", ["get", "selected"], 1, 0];
  return ["interpolate", ["linear"], ["zoom"], tokens.relationFullNetworkMinZoom - 0.01,
    selectedOpacity, tokens.relationFullNetworkMinZoom, 1];
}

export function addRelationLayers(map: Map, selectedUnitId: string | null, visible: boolean) {
  const context = relationContext(selectedUnitId);
  const relations = relationData(context);
  map.addSource(sourceId, { type: "geojson", data: relations });
  map.addSource(flowSourceId, { type: "geojson", data: flowData(relations, 0) });
  map.addSource(capitalSourceId, { type: "geojson", data: capitalData(context) });
  map.addLayer({ id: layerIds[0], type: "line", source: sourceId,
    paint: { "line-color": ["case", ["get", "selected"], tokens.relationLineSelected, tokens.relationLine],
      "line-width": ["case", ["get", "selected"],
      tokens.relationLineSelectedWidth, tokens.relationLineWidth], "line-opacity": zoomOpacity() } });
  map.addLayer({ id: layerIds[1], type: "line", source: flowSourceId,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": tokens.relationFlow, "line-width": tokens.relationFlowWidth,
      "line-opacity": zoomOpacity() } });
  map.addLayer({ id: layerIds[2], type: "circle", source: capitalSourceId,
    paint: { "circle-radius": 0, "circle-color": "rgba(0,0,0,0)",
      "circle-stroke-color": tokens.relationCapitalPulse, "circle-stroke-width": tokens.relationCapitalPulseStrokeWidth,
      "circle-opacity": 0 } });
  setLayerVisibility(map, layerIds, visible);
}

export function setRelationSelection(map: Map, selectedUnitId: string | null) {
  const context = relationContext(selectedUnitId);
  const relations = relationData(context);
  const source = map.getSource(sourceId) as GeoJSONSource | undefined;
  const flowSource = map.getSource(flowSourceId) as GeoJSONSource | undefined;
  const capitalSource = map.getSource(capitalSourceId) as GeoJSONSource | undefined;
  if (!source || !flowSource || !capitalSource) return;
  source.setData(relations);
  flowSource.setData(flowData(relations, 0));
  capitalSource.setData(capitalData(context));
  const previousFrame = animationFrames.get(map);
  if (previousFrame !== undefined) stopRelationAnimation(map);
  map.setPaintProperty(layerIds[2], "circle-radius", 0);
  map.setPaintProperty(layerIds[2], "circle-opacity", 0);
  if (!context.selected?.region.seatPlaceId) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    flowSource.setData({ type: "FeatureCollection", features: [] });
    return;
  }

  const startedAt = performance.now();
  const animate = (now: number) => {
    if (!map.getLayer(layerIds[1]) || !map.getLayer(layerIds[2])) {
      animationFrames.delete(map);
      return;
    }
    const elapsed = now - startedAt;
    flowSource.setData(flowData(relations, elapsed));
    const cycle = tokens.relationFlowDurationMs + tokens.relationFlowPauseMs;
    const cycleElapsed = elapsed % cycle;
    const pulse = cycleElapsed < tokens.relationFlowDurationMs ? 0 :
      (cycleElapsed - tokens.relationFlowDurationMs) / tokens.relationFlowPauseMs;
    map.setPaintProperty(layerIds[2], "circle-radius", pulse * tokens.relationCapitalPulseRadius);
    map.setPaintProperty(layerIds[2], "circle-opacity", pulse > 0 ? 1 - pulse : 0);
    animationFrames.set(map, requestAnimationFrame(animate));
  };
  animationFrames.set(map, requestAnimationFrame(animate));
}
