import type { Map } from "maplibre-gl";
import { getTopLevelUnitId, seats, topLevelSeats } from "./data";
import { setLayerVisibility } from "./mapLayerVisibility";
import { administrativeTier, tierProperty } from "./displayTier";
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

  // Only the selected seat's own link to its provincial capital. Drawing every seat's line
  // would answer a question the click did not ask, and fills the province with a fan.
  return {
    type: "FeatureCollection",
    features: topLevelSeats
      .filter(({ unit, region, place }) => region.id === selected.region.id &&
        place.id !== capital.place.id && unit.id === topLevelUnitId)
      .map(({ unit, place }) => ({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: curvedCoordinates([place.longitude!, place.latitude!], capitalPoint),
        },
        // Both ends are prefectural seats, so the line belongs to the first tier and is
        // drawn whenever they are.
        properties: { id: unit.id, selected: unit.id === topLevelUnitId,
          [tierProperty]: administrativeTier(undefined) },
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

/// Connections belong to whatever is selected: with nothing chosen the map carries no
/// relation lines at all, rather than drawing the whole network once the camera is close.
export function addRelationLayers(
  map: Map,
  selectedUnitId: string | null,
  visible: boolean,
) {
  const hasSelection = selectedUnitId !== null;
  const context = relationContext(selectedUnitId);
  const relations = hasSelection ? relationData(context) : { type: "FeatureCollection" as const, features: [] };
  relationRenderer.add(map, {
    relations,
    pulsePoint: hasSelection ? capitalData(context) : { type: "FeatureCollection" as const, features: [] },
    animate: hasSelection,
  });
  setLayerVisibility(map, layerIds, visible);
}

export function setRelationSelection(map: Map, selectedUnitId: string | null) {
  const hasSelection = selectedUnitId !== null;
  const context = relationContext(selectedUnitId);
  const relations = hasSelection ? relationData(context) : { type: "FeatureCollection" as const, features: [] };
  const updated = relationRenderer.setData(map, {
    relations,
    pulsePoint: hasSelection ? capitalData(context) : { type: "FeatureCollection" as const, features: [] },
    animate: hasSelection,
  });
  if (!updated || !hasSelection) return;
  relationRenderer.start(map);
}
