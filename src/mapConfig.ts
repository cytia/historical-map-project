import type { StyleSpecification } from "maplibre-gl";
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
