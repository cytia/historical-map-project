import type { Map, StyleSpecification } from "maplibre-gl";
import { seats } from "./data";
import { defaultTheme } from "./theme";

const mapColors = defaultTheme.map;

export const modernReferenceStyleUrl =
  "https://tiles.openfreemap.org/styles/positron";

const naturalSourceLayers = new Set([
  "landcover",
  "mountain_peak",
  "water",
  "waterway",
]);

const naturalMinZoom: Record<string, number> = {
  landcover: 3,
  mountain_peak: 5,
  water: 0,
  waterway: 4,
};

export const paperStyle: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "paper",
      type: "background",
      paint: { "background-color": mapColors.land },
    },
  ],
};

export const seatLayerIds = ["seat-halo", "seat-points", "seat-labels"] as const;

export function createNaturalReferenceStyle(style: StyleSpecification) {
  return {
    ...style,
    layers: style.layers
      .filter((layer) => {
        if (layer.type === "background") return true;
        const sourceLayer = "source-layer" in layer ? layer["source-layer"] : undefined;
        return typeof sourceLayer === "string" && naturalSourceLayers.has(sourceLayer);
      })
      .map((layer) => {
        const sourceLayer = "source-layer" in layer ? layer["source-layer"] : undefined;
        if (layer.type === "background") {
          return {
            ...layer,
            paint: { ...layer.paint, "background-color": mapColors.land },
          };
        }
        if (sourceLayer === "water" && layer.type === "fill") {
          return {
            ...layer,
            minzoom: naturalMinZoom.water,
            paint: { ...layer.paint, "fill-color": mapColors.water, "fill-opacity": 0.76 },
          };
        }
        if (sourceLayer === "waterway" && layer.type === "line") {
          return {
            ...layer,
            minzoom: naturalMinZoom.waterway,
            paint: { ...layer.paint, "line-color": mapColors.waterway, "line-opacity": 0.78 },
          };
        }
        if (sourceLayer === "landcover" && layer.type === "fill") {
          return {
            ...layer,
            minzoom: naturalMinZoom.landcover,
            paint: {
              ...layer.paint,
              "fill-color": [
                "match",
                ["get", "class"],
                "wood",
                mapColors.vegetation,
                "forest",
                mapColors.vegetation,
                "grass",
                mapColors.lowland,
                "farmland",
                mapColors.lowland,
                "meadow",
                mapColors.lowland,
                mapColors.land,
              ],
              "fill-opacity": 0.52,
            },
          };
        }
        if (sourceLayer === "mountain_peak" && layer.type === "symbol") {
          return {
            ...layer,
            minzoom: naturalMinZoom.mountain_peak,
            paint: { ...layer.paint, "text-color": mapColors.relief, "text-halo-color": mapColors.reliefHalo },
          };
        }
        return layer;
      }),
  } satisfies StyleSpecification;
}

const seatGeoJson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: "FeatureCollection",
  features: seats.map(({ unit, place, name }) => ({
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
    },
  })),
};

export function addSeatLayers(
  map: Map,
  selectedUnitId: string | null,
  visible: boolean,
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
    },
  });
  map.addLayer({
    id: "seat-points",
    type: "circle",
    source: "seats",
    paint: {
      "circle-radius": [
        "case",
        ["==", ["get", "id"], selectedUnitId ?? ""],
        7,
        4,
      ],
      "circle-color": mapColors.seat,
      "circle-stroke-width": 2,
      "circle-stroke-color": mapColors.seatRing,
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
      "text-halo-color": mapColors.land,
      "text-halo-width": 1.5,
    },
  });

  setSeatLayerVisibility(map, visible);
}

export function setSeatLayerVisibility(map: Map, visible: boolean) {
  const visibility = visible ? "visible" : "none";
  seatLayerIds.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visibility);
    }
  });
}
