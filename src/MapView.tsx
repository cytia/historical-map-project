import { useEffect, useRef } from "react";
import maplibregl, { type GeoJSONSource, type MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { seats } from "./data";
import { useAppStore } from "./store";

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

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const selectedUnitId = useAppStore((state) => state.selectedUnitId);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [117.9, 32.05],
      zoom: 5.1,
      minZoom: 4,
      maxZoom: 10,
      attributionControl: false,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: "paper",
            type: "background",
            paint: { "background-color": "#e8e1d3" },
          },
        ],
      },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: "历史数据：CHGIS / 《明史》" }),
      "bottom-right",
    );

    map.on("load", () => {
      map.addSource("seats", { type: "geojson", data: seatGeoJson });
      map.addLayer({
        id: "seat-halo",
        type: "circle",
        source: "seats",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 8, 8, 13],
          "circle-color": "rgba(117, 47, 38, 0.11)",
          "circle-stroke-width": 1,
          "circle-stroke-color": "rgba(117, 47, 38, 0.18)",
        },
      });
      map.addLayer({
        id: "seat-points",
        type: "circle",
        source: "seats",
        paint: {
          "circle-radius": ["case", ["==", ["get", "id"], ""], 5, 4],
          "circle-color": "#7a3027",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#f4eee2",
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
          "text-color": "#2c2a25",
          "text-halo-color": "#e8e1d3",
          "text-halo-width": 1.5,
        },
      });

      const handleClick = (event: MapMouseEvent) => {
        const feature = map.queryRenderedFeatures(event.point, { layers: ["seat-points"] })[0];
        const id = feature?.properties?.id;
        if (typeof id === "string") selectUnit(id);
      };
      map.on("click", "seat-points", handleClick);
      map.on("mouseenter", "seat-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "seat-points", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [selectUnit]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const source = map.getSource("seats") as GeoJSONSource | undefined;
    if (!source) return;

    map.setPaintProperty("seat-points", "circle-radius", [
      "case",
      ["==", ["get", "id"], selectedUnitId ?? ""],
      7,
      4,
    ]);

    const selected = seats.find((record) => record.unit.id === selectedUnitId);
    if (selected) {
      map.easeTo({
        center: [selected.place.longitude as number, selected.place.latitude as number],
        zoom: Math.max(map.getZoom(), 6.2),
        duration: 650,
      });
    }
  }, [selectedUnitId]);

  return <div className="map" ref={containerRef} aria-label="公元1600年南京直隶治所地图" />;
}

