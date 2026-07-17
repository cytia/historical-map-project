import { useEffect, useRef } from "react";
import maplibregl, { type MapLayerMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AdministrativeTargetChooser } from "./AdministrativeTargetChooser";
import { getTopLevelUnitId, getUnitRegionId } from "./data";
import { addCountyLayers } from "./countyLayers";
import { naturalReferenceStyle, paperStyle } from "./mapConfig";
import {
  createSelectionPointerController,
  selectionClickTolerance,
} from "./mapSelectionInteraction";
import {
  addRelationLayers,
  setRelationSelection,
  stopRelationAnimation,
} from "./relationLayers";
import {
  addSeatLayers,
  setSeatFocus,
} from "./seatLayers";
import { useAppStore } from "./store";
import { addTerrainStyle, ensureTerrainProtocol } from "./terrain";
import { useAdministrativeTargetChoice } from "./useAdministrativeTargetChoice";
import { useMapSelectionSync } from "./useMapSelectionSync";

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hoveredRegionRef = useRef<string | null>(null);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const selectCounty = useAppStore((state) => state.selectCounty);
  const resetSelection = useAppStore((state) => state.resetSelection);
  const setActiveRegion = useAppStore((state) => state.setActiveRegion);
  const setHoveredRegion = useAppStore((state) => state.setHoveredRegion);
  const selectedUnitId = useAppStore((state) => state.selectedUnitId);
  const selectedCountyId = useAppStore((state) => state.selectedCountyId);
  const activeRegionId = useAppStore((state) => state.activeRegionId);
  const seatsVisible = useAppStore((state) => state.seatsVisible);
  const modernReferenceVisible = useAppStore((state) => state.modernReferenceVisible);
  const administrativeDisplayScope = useAppStore((state) => state.administrativeDisplayScope);
  const { targetChoice, closeTargetChoice, chooseTargets, applyAdministrativeTarget } =
    useAdministrativeTargetChoice({ selectCounty, selectUnit, setActiveRegion });
  useMapSelectionSync({ mapRef, hoveredRegionRef, selectedUnitId, selectedCountyId,
    activeRegionId, administrativeDisplayScope, seatsVisible });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    ensureTerrainProtocol();

    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [117.9, 32.05],
      zoom: 5.1,
      minZoom: 4,
      maxZoom: 10,
      clickTolerance: selectionClickTolerance,
      attributionControl: false,
      style: paperStyle,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: "底图：Natural Earth · 历史数据：CHGIS / 《明史》",
      }),
      "bottom-right",
    );

    map.on("style.load", () => {
      const state = useAppStore.getState();
      const selectedRegionId = getUnitRegionId(state.selectedUnitId) ?? state.activeRegionId;
      addRelationLayers(map, state.selectedUnitId, true);
      addSeatLayers(map, getTopLevelUnitId(state.selectedUnitId), state.activeRegionId, state.seatsVisible);
      addCountyLayers(map, {
        selectedUnitId: state.selectedUnitId,
        selectedCountyId: state.selectedCountyId,
        regionId: selectedRegionId,
        scope: state.administrativeDisplayScope,
      }, true);
      setRelationSelection(map, state.selectedUnitId);
    });

    const stopSelectionPointerController = createSelectionPointerController(
      map, () => {
        closeTargetChoice();
        hoveredRegionRef.current = null;
        map.stop();
        resetSelection();
      },
      applyAdministrativeTarget,
      chooseTargets,
    );
    const handleHover = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      const regionId = feature?.properties?.regionId;
      const hoveredRegionId = typeof regionId === "string" ? regionId : null;
      if (hoveredRegionRef.current !== hoveredRegionId) {
        hoveredRegionRef.current = hoveredRegionId;
        setHoveredRegion(hoveredRegionId);
      }
      const state = useAppStore.getState();
      const selectedRegionId = getUnitRegionId(state.selectedUnitId);
      setSeatFocus(map, getTopLevelUnitId(state.selectedUnitId), selectedRegionId ?? hoveredRegionRef.current ?? state.activeRegionId);
    };
    map.on("mousemove", "seat-points", handleHover);
    map.on("mouseenter", "seat-points", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseenter", "county-points", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "county-points", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("mouseleave", "seat-points", () => {
      map.getCanvas().style.cursor = "";
      if (hoveredRegionRef.current !== null) {
        hoveredRegionRef.current = null;
        setHoveredRegion(null);
      }
      const state = useAppStore.getState();
      const selectedRegionId = getUnitRegionId(state.selectedUnitId);
      setSeatFocus(map, getTopLevelUnitId(state.selectedUnitId), selectedRegionId ?? state.activeRegionId);
    });

    mapRef.current = map;
    return () => {
      stopSelectionPointerController();
      stopRelationAnimation(map);
      map.remove();
      mapRef.current = null;
    };
  }, [applyAdministrativeTarget, chooseTargets, closeTargetChoice,
    resetSelection, setHoveredRegion]);

  useEffect(closeTargetChoice, [administrativeDisplayScope, selectedCountyId,
    selectedUnitId, closeTargetChoice]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!modernReferenceVisible) {
      stopRelationAnimation(map);
      map.setStyle(paperStyle);
      return;
    }

    stopRelationAnimation(map);
    map.setStyle(addTerrainStyle(naturalReferenceStyle, import.meta.env.VITE_TERRAIN_URL));
  }, [modernReferenceVisible]);
  return <>
    <div className="map" ref={containerRef} aria-label="公元1600年已录入行政治所地图" />
    {targetChoice && <AdministrativeTargetChooser
      anchor={targetChoice.anchor}
      targets={targetChoice.targets}
      onClose={closeTargetChoice}
      onSelect={applyAdministrativeTarget}
    />}
  </>;
}
