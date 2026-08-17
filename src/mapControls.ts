import maplibregl, { type Map } from "maplibre-gl";

const mapAttribution =
  "底图：Natural Earth · 历史数据：《明史》 · 现代坐标：Wikidata (CC0 1.0)、GeoNames (CC BY 4.0) | NOAA National Centers for Environmental Information. 2022: ETOPO 2022 15 Arc-Second Global Relief Model. DOI: 10.25921/fd45-gt74.";

export function addStandardMapControls(map: Map) {
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
  map.addControl(
    new maplibregl.AttributionControl({
      compact: true,
      customAttribution: mapAttribution,
    }),
    "bottom-right",
  );
}
