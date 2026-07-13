import { useEffect, useRef } from "react";
import maplibregl, {
  type MapLayerMouseEvent,
  type MapMouseEvent,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { seats } from "./data";
import { createNaturalReferenceStyle, modernReferenceStyleUrl, paperStyle } from "./mapConfig";
import {
  addRelationLayers,
  setRelationSelection,
  setRelationVisibility,
  stopRelationAnimation,
} from "./relationLayers";
import {
  addSeatLayers,
  setSeatFocus,
  setSeatFocusTransition,
  setSeatLayerVisibility,
} from "./seatLayers";
import { useAppStore } from "./store";
import { addTerrainStyle, ensureTerrainProtocol } from "./terrain";
import { defaultTheme } from "./theme";

const mapTokens = defaultTheme.map;

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hoveredRegionRef = useRef<string | null>(null);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const setActiveRegion = useAppStore((state) => state.setActiveRegion);
  const setHoveredRegion = useAppStore((state) => state.setHoveredRegion);
  const selectedUnitId = useAppStore((state) => state.selectedUnitId);
  const activeRegionId = useAppStore((state) => state.activeRegionId);
  const seatsVisible = useAppStore((state) => state.seatsVisible);
  const modernReferenceVisible = useAppStore((state) => state.modernReferenceVisible);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    ensureTerrainProtocol();

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
      addRelationLayers(map, state.selectedUnitId, state.seatsVisible);
      addSeatLayers(map, state.selectedUnitId, state.activeRegionId, state.seatsVisible);
      setRelationSelection(map, state.selectedUnitId);
    });

    const handleClick = (event: MapMouseEvent) => {
      let feature: ReturnType<typeof map.queryRenderedFeatures>[number] | undefined;
      if (map.getLayer("seat-points")) {
        try {
          feature = map.queryRenderedFeatures(event.point, { layers: ["seat-points"] })[0];
        } catch {
          // Style replacement can remove the layer between the existence check and the query.
        }
      }
      const id = feature?.properties?.id;
      const regionId = feature?.properties?.regionId;
      if (typeof id === "string" && typeof regionId === "string") {
        setActiveRegion(regionId);
        selectUnit(id);
        return;
      }
      setActiveRegion(null);
    };
    const handleHover = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      const regionId = feature?.properties?.regionId;
      const hoveredRegionId = typeof regionId === "string" ? regionId : null;
      if (hoveredRegionRef.current !== hoveredRegionId) {
        hoveredRegionRef.current = hoveredRegionId;
        setHoveredRegion(hoveredRegionId);
      }
      const state = useAppStore.getState();
      const selectedRegion = seats.find(({ unit }) => unit.id === state.selectedUnitId)?.unit.parentId;
      setSeatFocusTransition(map, mapTokens.seatFocusFadeInDurationMs);
      setSeatFocus(map, state.selectedUnitId, selectedRegion ?? hoveredRegionRef.current ?? state.activeRegionId);
    };
    map.on("click", handleClick);
    map.on("mousemove", "seat-points", handleHover);
    map.on("mouseenter", "seat-points", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "seat-points", () => {
      map.getCanvas().style.cursor = "";
      if (hoveredRegionRef.current !== null) {
        hoveredRegionRef.current = null;
        setHoveredRegion(null);
      }
      const state = useAppStore.getState();
      const selectedRegion = seats.find(({ unit }) => unit.id === state.selectedUnitId)?.unit.parentId;
      setSeatFocusTransition(map, mapTokens.seatFocusFadeOutDurationMs);
      setSeatFocus(map, state.selectedUnitId, selectedRegion ?? state.activeRegionId);
    });

    mapRef.current = map;
    return () => {
      stopRelationAnimation(map);
      map.remove();
      mapRef.current = null;
    };
  }, [selectUnit, setActiveRegion, setHoveredRegion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !map.getLayer("seat-points")) return;

    const selectedRegion = seats.find(({ unit }) => unit.id === selectedUnitId)?.unit.parentId;
    setSeatFocus(map, selectedUnitId, selectedRegion ?? hoveredRegionRef.current ?? activeRegionId);
    setRelationSelection(map, selectedUnitId);

    const selected = seats.find((record) => record.unit.id === selectedUnitId);
    if (selected) {
      map.easeTo({
        center: [selected.place.longitude as number, selected.place.latitude as number],
        zoom: Math.max(map.getZoom(), 6.2),
        duration: 650,
      });
    }
  }, [selectedUnitId, activeRegionId]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.isStyleLoaded()) {
      setSeatLayerVisibility(map, seatsVisible);
      setRelationVisibility(map, seatsVisible);
    }
  }, [seatsVisible]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const controller = new AbortController();

    if (!modernReferenceVisible) {
      stopRelationAnimation(map);
      map.setStyle(paperStyle);
      return () => controller.abort();
    }

    fetch(modernReferenceStyleUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Style request failed: ${response.status}`);
        return response.json() as Promise<StyleSpecification>;
      })
      .then((style) => {
        stopRelationAnimation(map);
        map.setStyle(
          addTerrainStyle(
            createNaturalReferenceStyle(style),
            import.meta.env.VITE_TERRAIN_URL,
          ),
        );
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        console.warn("Modern reference map failed to load; using the paper map.");
        useAppStore.getState().setModernReferenceVisible(false);
        stopRelationAnimation(map);
        map.setStyle(paperStyle);
      });

    return () => controller.abort();
  }, [modernReferenceVisible]);

  return <div className="map" ref={containerRef} aria-label="公元1600年已录入府州治所地图" />;
}
