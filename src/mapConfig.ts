import type { StyleSpecification } from "maplibre-gl";
import { defaultTheme } from "./theme";

const mapColors = defaultTheme.map;

export const naturalReferenceGeoJsonUrl =
  `/reference/natural-reference.geojson?v=${__NATURAL_REFERENCE_VERSION__}`;

const naturalMinZoom = {
  water: 0,
  waterway: 4,
};

export const paperStyle: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{
    id: "paper",
    type: "background",
    paint: { "background-color": mapColors.land },
  }],
};

export const naturalReferenceStyle: StyleSpecification = {
  version: 8,
  sources: {
    "natural-reference": {
      type: "geojson",
      data: naturalReferenceGeoJsonUrl,
    },
  },
  layers: [
    {
      id: "natural-water-background",
      type: "background",
      paint: { "background-color": mapColors.water },
    },
    {
      id: "natural-land",
      type: "fill",
      source: "natural-reference",
      filter: ["==", ["get", "kind"], "land"],
      paint: {
        "fill-color": mapColors.land,
        "fill-outline-color": mapColors.reliefHalo,
      },
    },
    {
      id: "natural-ocean",
      type: "fill",
      source: "natural-reference",
      filter: ["==", ["get", "kind"], "ocean"],
      paint: { "fill-color": mapColors.water },
    },
    {
      id: "natural-lakes",
      type: "fill",
      source: "natural-reference",
      minzoom: naturalMinZoom.water,
      filter: ["==", ["get", "kind"], "lake"],
      paint: { "fill-color": mapColors.water, "fill-opacity": 0.92 },
    },
    {
      id: "natural-rivers",
      type: "line",
      source: "natural-reference",
      minzoom: naturalMinZoom.waterway,
      filter: ["==", ["get", "kind"], "river"],
      paint: {
        "line-color": mapColors.waterway,
        "line-opacity": 0.86,
        "line-width": ["interpolate", ["linear"], ["zoom"], 4, 0.65, 8, 1.5, 10, 2.4],
      },
    },
    {
      id: "natural-coastline",
      type: "line",
      source: "natural-reference",
      filter: ["==", ["get", "kind"], "coastline"],
      paint: {
        "line-color": mapColors.waterway,
        "line-opacity": 0.72,
        "line-width": ["interpolate", ["linear"], ["zoom"], 4, 0.65, 8, 1.05, 10, 1.45],
      },
    },
  ],
};
