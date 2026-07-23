import type { ExpressionSpecification, GeoJSONSource, Map } from "maplibre-gl";
import { defaultTheme } from "./theme";

const tokens = defaultTheme.map;

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

function coordinateAt(coordinates: GeoJSON.Position[], progress: number): GeoJSON.Position {
  const scaled = Math.max(0, Math.min(1, progress)) * (coordinates.length - 1);
  const index = Math.min(Math.floor(scaled), coordinates.length - 2);
  const local = scaled - index;
  const from = coordinates[index];
  const to = coordinates[index + 1];
  return [from[0] + (to[0] - from[0]) * local, from[1] + (to[1] - from[1]) * local];
}

function segmentCoordinates(coordinates: GeoJSON.Position[], end: number, segmentLength: number) {
  const start = Math.max(0, end - segmentLength);
  const firstIndex = Math.ceil(start * (coordinates.length - 1));
  const lastIndex = Math.floor(end * (coordinates.length - 1));
  const segment = [coordinateAt(coordinates, start)];
  for (let index = firstIndex; index <= lastIndex; index += 1) segment.push(coordinates[index]);
  segment.push(coordinateAt(coordinates, end));
  return segment;
}

export interface FlowDataConfig {
  segmentLength: number;
  durationMs: number;
  pauseMs: number;
}

const defaultFlowConfig: FlowDataConfig = {
  segmentLength: tokens.relationFlowSegmentLength,
  durationMs: tokens.relationFlowDurationMs,
  pauseMs: tokens.relationFlowPauseMs,
};

export function flowData(
  relations: GeoJSON.FeatureCollection<GeoJSON.LineString>,
  elapsed: number,
  config: FlowDataConfig = defaultFlowConfig,
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const cycle = config.durationMs + config.pauseMs;
  return {
    type: "FeatureCollection",
    features: relations.features.flatMap((feature, index) => {
      const offset = (index / relations.features.length) * cycle;
      const localElapsed = (elapsed + offset) % cycle;
      if (localElapsed >= config.durationMs) return [];
      const progress = localElapsed / config.durationMs;
      return [{ ...feature, geometry: { type: "LineString" as const,
        coordinates: segmentCoordinates(feature.geometry.coordinates, progress, config.segmentLength) } }];
    }),
  };
}

export function relationLineOpacity(): ExpressionSpecification {
  const selectedOpacity: ExpressionSpecification = ["case", ["get", "selected"], 1, 0];
  return ["interpolate", ["linear"], ["zoom"], tokens.relationFullNetworkMinZoom - 0.01,
    selectedOpacity, tokens.relationFullNetworkMinZoom, 1];
}

interface RelationLayerIds {
  relationSourceId: string;
  flowSourceId: string;
  relationLayerId: string;
  flowLayerId: string;
}

export function addRelationLineLayers(map: Map, ids: RelationLayerIds) {
  map.addLayer({ id: ids.relationLayerId, type: "line", source: ids.relationSourceId,
    paint: { "line-color": ["case", ["get", "selected"], tokens.relationLineSelected,
      tokens.relationLine], "line-width": ["case", ["get", "selected"],
      tokens.relationLineSelectedWidth, tokens.relationLineWidth],
    "line-opacity": relationLineOpacity() } });
  map.addLayer({ id: ids.flowLayerId, type: "line", source: ids.flowSourceId,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": tokens.relationFlow, "line-width": tokens.relationFlowWidth,
      "line-opacity": relationLineOpacity() } });
}

interface SubordinateRelationLayerOptions {
  sourceId: string;
  layerId: string;
  opacity: number;
  transitionDuration?: number;
}

export function addSubordinateRelationLayer(
  map: Map,
  options: SubordinateRelationLayerOptions,
) {
  map.addLayer({ id: options.layerId, type: "line", source: options.sourceId,
    paint: { "line-color": tokens.relationLine, "line-width": tokens.relationLineWidth,
      "line-opacity": options.opacity,
      "line-opacity-transition": { duration: options.transitionDuration ?? 0 } } });
}

interface RelationAnimationOptions {
  flowSourceId: string;
  flowLayerId: string;
  onFrame?: (map: Map, elapsed: number) => void;
}

export function createRelationAnimationController(options: RelationAnimationOptions) {
  const animationFrames = new WeakMap<Map, number>();
  const relationsByMap = new WeakMap<Map, GeoJSON.FeatureCollection<GeoJSON.LineString>>();

  const stop = (map: Map) => {
    const frame = animationFrames.get(map);
    if (frame !== undefined) cancelAnimationFrame(frame);
    animationFrames.delete(map);
  };

  const setRelations = (
    map: Map,
    relations: GeoJSON.FeatureCollection<GeoJSON.LineString>,
  ) => {
    relationsByMap.set(map, relations);
    const source = map.getSource(options.flowSourceId) as GeoJSONSource | undefined;
    source?.setData(flowData(relations, 0));
  };

  const start = (map: Map) => {
    stop(map);
    const source = map.getSource(options.flowSourceId) as GeoJSONSource | undefined;
    const relations = relationsByMap.get(map);
    if (!source || !relations?.features.length ||
      matchMedia("(prefers-reduced-motion: reduce)").matches) {
      source?.setData({ type: "FeatureCollection", features: [] });
      return;
    }
    const startedAt = performance.now();
    const animate = (now: number) => {
      if (!map.getLayer(options.flowLayerId)) {
        animationFrames.delete(map);
        return;
      }
      const elapsed = now - startedAt;
      source.setData(flowData(relations, elapsed));
      options.onFrame?.(map, elapsed);
      animationFrames.set(map, requestAnimationFrame(animate));
    };
    animationFrames.set(map, requestAnimationFrame(animate));
  };

  return { setRelations, start, stop };
}
