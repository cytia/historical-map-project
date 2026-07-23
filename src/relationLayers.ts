import type { GeoJSONSource, Map } from "maplibre-gl";
import { getTopLevelUnitId, seats, topLevelSeats } from "./data";
import { setLayerVisibility } from "./mapLayerVisibility";
import {
  addRelationLineLayers,
  createRelationAnimationController,
  curvedCoordinates,
} from "./relationRendering";
import { defaultTheme } from "./theme";

const tokens = defaultTheme.map;
const sourceId = "seat-relations";
const flowSourceId = "seat-relation-flow-segments";
const capitalSourceId = "seat-relation-capital";
const layerIds = ["seat-relations", "seat-relation-flow", "seat-relation-capital-pulse"] as const;
export { curvedCoordinates } from "./relationRendering";

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

const relationAnimation = createRelationAnimationController({
  flowSourceId,
  flowLayerId: layerIds[1],
  onFrame: (map, elapsed) => {
    const cycle = tokens.relationFlowDurationMs + tokens.relationFlowPauseMs;
    const cycleElapsed = elapsed % cycle;
    const pulse = cycleElapsed < tokens.relationFlowDurationMs ? 0 :
      (cycleElapsed - tokens.relationFlowDurationMs) / tokens.relationFlowPauseMs;
    map.setPaintProperty(layerIds[2], "circle-radius", pulse * tokens.relationCapitalPulseRadius);
    map.setPaintProperty(layerIds[2], "circle-opacity", pulse > 0 ? 1 - pulse : 0);
  },
});

export function stopRelationAnimation(map: Map) {
  relationAnimation.stop(map);
}

export function addRelationLayers(map: Map, selectedUnitId: string | null, visible: boolean) {
  const context = relationContext(selectedUnitId);
  const relations = relationData(context);
  map.addSource(sourceId, { type: "geojson", data: relations });
  map.addSource(flowSourceId, { type: "geojson",
    data: { type: "FeatureCollection", features: [] } });
  map.addSource(capitalSourceId, { type: "geojson", data: capitalData(context) });
  addRelationLineLayers(map, {
    relationSourceId: sourceId,
    flowSourceId,
    relationLayerId: layerIds[0],
    flowLayerId: layerIds[1],
  });
  map.addLayer({ id: layerIds[2], type: "circle", source: capitalSourceId,
    paint: { "circle-radius": 0, "circle-color": "rgba(0,0,0,0)",
      "circle-stroke-color": tokens.relationCapitalPulse, "circle-stroke-width": tokens.relationCapitalPulseStrokeWidth,
      "circle-opacity": 0 } });
  setLayerVisibility(map, layerIds, visible);
  relationAnimation.setRelations(map, relations);
}

export function setRelationSelection(map: Map, selectedUnitId: string | null) {
  const context = relationContext(selectedUnitId);
  const relations = relationData(context);
  const source = map.getSource(sourceId) as GeoJSONSource | undefined;
  const flowSource = map.getSource(flowSourceId) as GeoJSONSource | undefined;
  const capitalSource = map.getSource(capitalSourceId) as GeoJSONSource | undefined;
  if (!source || !flowSource || !capitalSource) return;
  source.setData(relations);
  capitalSource.setData(capitalData(context));
  relationAnimation.stop(map);
  relationAnimation.setRelations(map, relations);
  map.setPaintProperty(layerIds[2], "circle-radius", 0);
  map.setPaintProperty(layerIds[2], "circle-opacity", 0);
  if (!context.selected?.region.seatPlaceId) return;
  relationAnimation.start(map);
}
