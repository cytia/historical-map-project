import { useEffect, useRef } from "react";
import maplibregl, { type MapMouseEvent, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { seats } from "./data";
import {
  addSeatLayers,
  createNaturalReferenceStyle,
  modernReferenceStyleUrl,
  paperStyle,
  setSeatLayerVisibility,
} from "./mapConfig";
import { useAppStore } from "./store";

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const selectedUnitId = useAppStore((state) => state.selectedUnitId);
  const seatsVisible = useAppStore((state) => state.seatsVisible);
  const modernReferenceVisible = useAppStore((state) => state.modernReferenceVisible);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [117.9, 32.05],
      zoom: 5.1,
      minZoom: 4,
      maxZoom: 10,
      attributionControl: false,
      style: paperStyle,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: "历史数据：CHGIS / 《明史》",
      }),
      "bottom-right",
    );

    map.on("style.load", () => {
      const state = useAppStore.getState();
      addSeatLayers(map, state.selectedUnitId, state.seatsVisible);
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

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [selectUnit]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !map.getLayer("seat-points")) return;

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

  useEffect(() => {
    const map = mapRef.current;
    if (map?.isStyleLoaded()) setSeatLayerVisibility(map, seatsVisible);
  }, [seatsVisible]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const controller = new AbortController();

    if (!modernReferenceVisible) {
      map.setStyle(paperStyle);
      return () => controller.abort();
    }

    fetch(modernReferenceStyleUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Style request failed: ${response.status}`);
        return response.json() as Promise<StyleSpecification>;
      })
      .then((style) => map.setStyle(createNaturalReferenceStyle(style)))
      .catch(() => {
        if (controller.signal.aborted) return;
        console.warn("Modern reference map failed to load; using the paper map.");
        useAppStore.getState().setModernReferenceVisible(false);
        map.setStyle(paperStyle);
      });

    return () => controller.abort();
  }, [modernReferenceVisible]);

  return <div className="map" ref={containerRef} aria-label="公元1600年南京直隶治所地图" />;
}
