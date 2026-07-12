import maplibregl, { type RasterLayerSpecification, type StyleSpecification } from "maplibre-gl";
import { Protocol } from "pmtiles";

const attribution =
  "Produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.";

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
  const backgroundIndex = layers.findIndex((layer) => layer.type === "background");
  layers.splice(backgroundIndex + 1, 0, terrainLayer);

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
