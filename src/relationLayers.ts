import type { Map } from "maplibre-gl";
import { getTopLevelUnitId, seats, topLevelSeats } from "./data";
import { setLayerVisibility } from "./mapLayerVisibility";
import { curvedCoordinates } from "./relationRendering";
import { createRelationRenderer } from "./relationRenderer";

const sourceId = "seat-relations";
const flowSourceId = "seat-relation-flow-segments";
const capitalSourceId = "seat-relation-capital";
const layerIds = ["seat-relations", "seat-relation-flow", "seat-relation-capital-pulse"] as const;
export { curvedCoordinates } from "./relationRendering";
const relationRenderer = createRelationRenderer({
  relationSourceId: sourceId,
  flowSourceId,
  pulseSourceId: capitalSourceId,
  relationLayerId: layerIds[0],
  flowLayerId: layerIds[1],
  pulseLayerId: layerIds[2],
});

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

export function stopRelationAnimation(map: Map) {
  relationRenderer.stop(map);
}

export function addRelationLayers(map: Map, selectedUnitId: string | null, visible: boolean) {
  const context = relationContext(selectedUnitId);
  const relations = relationData(context);
  relationRenderer.add(map, {
    relations,
    pulsePoint: capitalData(context),
  });
  setLayerVisibility(map, layerIds, visible);
}

export function setRelationSelection(map: Map, selectedUnitId: string | null) {
  const context = relationContext(selectedUnitId);
  const relations = relationData(context);
  const updated = relationRenderer.setData(map, {
    relations,
    pulsePoint: capitalData(context),
  });
  if (!updated) return;
  if (!context.selected?.region.seatPlaceId) return;
  relationRenderer.start(map);
}
