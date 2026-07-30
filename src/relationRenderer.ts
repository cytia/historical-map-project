import type { GeoJSONSource, Map } from "maplibre-gl";
import {
  addRelationLineLayers,
  createRelationAnimationController,
} from "./relationRendering";
import { defaultTheme } from "./theme";

const tokens = defaultTheme.map;

type LineData = GeoJSON.FeatureCollection<GeoJSON.LineString>;
type PointData = GeoJSON.FeatureCollection<GeoJSON.Point>;

interface RelationRendererIds {
  relationSourceId: string;
  flowSourceId: string;
  relationLayerId: string;
  flowLayerId: string;
  pulseSourceId?: string;
  pulseLayerId?: string;
}

export interface RelationRendererData {
  relations: LineData;
  flowRelations?: LineData;
  pulsePoint?: PointData;
}

const emptyLines = (): LineData => ({ type: "FeatureCollection", features: [] });
const emptyPoints = (): PointData => ({ type: "FeatureCollection", features: [] });

export function createRelationRenderer(ids: RelationRendererIds) {
  const hasPulse = Boolean(ids.pulseSourceId && ids.pulseLayerId);
  const resetPulse = (map: Map) => {
    if (!ids.pulseLayerId || !map.getLayer(ids.pulseLayerId)) return;
    map.setPaintProperty(ids.pulseLayerId, "circle-radius", 0);
    map.setPaintProperty(ids.pulseLayerId, "circle-opacity", 0);
  };
  const animation = createRelationAnimationController({
    flowSourceId: ids.flowSourceId,
    flowLayerId: ids.flowLayerId,
    onFrame: hasPulse ? (map, elapsed) => {
      const cycle = tokens.relationFlowDurationMs + tokens.relationFlowPauseMs;
      const cycleElapsed = elapsed % cycle;
      const pulse = cycleElapsed < tokens.relationFlowDurationMs ? 0 :
        (cycleElapsed - tokens.relationFlowDurationMs) / tokens.relationFlowPauseMs;
      map.setPaintProperty(
        ids.pulseLayerId!,
        "circle-radius",
        pulse * tokens.relationCapitalPulseRadius,
      );
      map.setPaintProperty(ids.pulseLayerId!, "circle-opacity", pulse > 0 ? 1 - pulse : 0);
    } : undefined,
  });

  const add = (map: Map, data: RelationRendererData) => {
    map.addSource(ids.relationSourceId, { type: "geojson", data: data.relations });
    map.addSource(ids.flowSourceId, { type: "geojson", data: emptyLines() });
    if (hasPulse) {
      map.addSource(ids.pulseSourceId!, {
        type: "geojson",
        data: data.pulsePoint ?? emptyPoints(),
      });
    }
    addRelationLineLayers(map, ids);
    if (hasPulse) {
      map.addLayer({
        id: ids.pulseLayerId!,
        type: "circle",
        source: ids.pulseSourceId!,
        paint: {
          "circle-radius": 0,
          "circle-color": "rgba(0,0,0,0)",
          "circle-stroke-color": tokens.relationCapitalPulse,
          "circle-stroke-width": tokens.relationCapitalPulseStrokeWidth,
          "circle-opacity": 0,
        },
      });
    }
    animation.setRelations(map, data.flowRelations ?? data.relations);
  };

  const setData = (map: Map, data: RelationRendererData) => {
    const relations = map.getSource(ids.relationSourceId) as GeoJSONSource | undefined;
    const flow = map.getSource(ids.flowSourceId) as GeoJSONSource | undefined;
    if (!relations || !flow) return false;
    relations.setData(data.relations);
    if (ids.pulseSourceId) {
      const pulse = map.getSource(ids.pulseSourceId) as GeoJSONSource | undefined;
      pulse?.setData(data.pulsePoint ?? emptyPoints());
    }
    animation.stop(map);
    animation.setRelations(map, data.flowRelations ?? data.relations);
    resetPulse(map);
    return true;
  };

  const start = (map: Map) => {
    resetPulse(map);
    animation.start(map);
  };
  const stop = (map: Map) => {
    animation.stop(map);
    resetPulse(map);
  };
  const layerIds = [
    ids.relationLayerId,
    ids.flowLayerId,
    ...(ids.pulseLayerId ? [ids.pulseLayerId] : []),
  ];

  return { add, setData, start, stop, layerIds };
}
