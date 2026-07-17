import maplibregl, { type RasterLayerSpecification, type StyleSpecification } from "maplibre-gl";
import { Protocol } from "pmtiles";

const attribution =
  "NOAA National Centers for Environmental Information. 2022: ETOPO 2022 15 Arc-Second Global Relief Model. DOI: 10.25921/fd45-gt74.";

let protocolRegistered = false;

export function ensureTerrainProtocol() {
  if (protocolRegistered) return;
  const protocol = new Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  protocolRegistered = true;
}

function pmtilesUrl(value: string) {
  if (value.startsWith("pmtiles://")) return value;
  return `pmtiles://${new URL(value, window.location.href).href}`;
}

export function addTerrainStyle(
  style: StyleSpecification,
  terrainUrl: string | undefined,
): StyleSpecification {
  if (!terrainUrl) return style;

  const terrainLayer: RasterLayerSpecification = {
    id: "terrain-hillshade",
    type: "raster",
    source: "terrain-hillshade",
    paint: {
      "raster-fade-duration": 0,
      "raster-opacity": 0.9,
    },
  };
  const layers = style.layers.filter((layer) => {
    const sourceLayer = "source-layer" in layer ? layer["source-layer"] : undefined;
    return sourceLayer !== "landcover";
  });
  const landIndex = layers.findIndex((layer) => layer.id === "natural-land");
  const backgroundIndex = layers.findIndex((layer) => layer.type === "background");
  const insertionIndex = landIndex >= 0 ? landIndex + 1 : backgroundIndex + 1;
  layers.splice(insertionIndex, 0, terrainLayer);

  return {
    ...style,
    sources: {
      ...style.sources,
      "terrain-hillshade": {
        type: "raster",
        url: pmtilesUrl(terrainUrl),
        tileSize: 512,
        attribution,
      },
    },
    layers,
  };
}
