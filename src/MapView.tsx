import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AdministrativeTargetChooser } from "./AdministrativeTargetChooser";
import { getTopLevelUnitId, getUnitRegionId } from "./data";
import { addCountyLayers } from "./countyLayers";
import { naturalReferenceStyle } from "./mapConfig";
import { addStandardMapControls } from "./mapControls";
import { applyMapPointFocus } from "./mapPointFocus";
import { registerPointHoverHandlers } from "./mapPointHover";
import {
  createSelectionPointerController,
  selectionClickTolerance,
} from "./mapSelectionInteraction";
import {
  addRelationLayers,
  setRelationSelection,
  stopRelationAnimation,
} from "./relationLayers";
import { addSeatLayers } from "./seatLayers";
import { addMilitaryLayers, stopMilitaryRelationAnimation } from "./militaryLayers";
import { addBoundaryLayers, registerBoundaryHover } from "./boundaryLayers";
import { addNationLayers } from "./nationLayer";
import { addJimiLayers } from "./jimiLayers";
import { stopJimiAnimation } from "./jimiLayers";
import { useAppStore } from "./store";
import { addTerrainStyle, ensureTerrainProtocol } from "./terrain";
import { useAdministrativeTargetChoice } from "./useAdministrativeTargetChoice";
import { useMapSelectionSync } from "./useMapSelectionSync";

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hoveredRegionRef = useRef<string | null>(null);
  const hoveredMilitaryRef = useRef<string | null>(null);
  const hoveredJimiRef = useRef<string | null>(null);
  const stopBoundaryHoverRef = useRef<(() => void) | null>(null);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const selectMilitaryUnit = useAppStore((state) => state.selectMilitaryUnit);
  const selectJimiUnit = useAppStore((state) => state.selectJimiUnit);
  const selectCounty = useAppStore((state) => state.selectCounty);
  const resetSelection = useAppStore((state) => state.resetSelection);
  const setActiveRegion = useAppStore((state) => state.setActiveRegion);
  const setHoveredRegion = useAppStore((state) => state.setHoveredRegion);
  const setHoveredMilitaryUnit = useAppStore((state) => state.setHoveredMilitaryUnit);
  const setHoveredJimiUnit = useAppStore((state) => state.setHoveredJimiUnit);
  const selectedUnitId = useAppStore((state) => state.selectedUnitId);
  const selectedMilitaryUnitId = useAppStore((state) => state.selectedMilitaryUnitId);
  const selectedJimiUnitId = useAppStore((state) => state.selectedJimiUnitId);
  const selectedCountyId = useAppStore((state) => state.selectedCountyId);
  const activeRegionId = useAppStore((state) => state.activeRegionId);
  const hoveredRegionId = useAppStore((state) => state.hoveredRegionId);
  const hoveredMilitaryUnitId = useAppStore((state) => state.hoveredMilitaryUnitId);
  const hoveredJimiUnitId = useAppStore((state) => state.hoveredJimiUnitId);
  const seatsVisible = useAppStore((state) => state.seatsVisible);
  const militaryVisible = useAppStore((state) => state.militaryVisible);
  const jimiVisible = useAppStore((state) => state.jimiVisible);
  const boundariesVisible = useAppStore((state) => state.boundariesVisible);
  const mapDisplayMode = useAppStore((state) => state.mapDisplayMode);
  const militaryColorMode = useAppStore((state) => state.militaryColorMode);
  const { targetChoice, closeTargetChoice, chooseTargets, applyAdministrativeTarget } =
    useAdministrativeTargetChoice({ selectCounty, selectUnit, selectMilitaryUnit, selectJimiUnit, setActiveRegion });
  useMapSelectionSync({ mapRef, selectedUnitId, selectedMilitaryUnitId, selectedJimiUnitId,
    selectedCountyId, activeRegionId, hoveredRegionId, hoveredMilitaryUnitId, hoveredJimiUnitId,
    mapDisplayMode, militaryColorMode, seatsVisible, militaryVisible, jimiVisible,
    boundariesVisible });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    ensureTerrainProtocol();

    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [123.5, 36.5],
      zoom: 4.0,
      minZoom: 4,
      maxZoom: 10,
      clickTolerance: selectionClickTolerance,
      attributionControl: false,
      style: addTerrainStyle(naturalReferenceStyle, import.meta.env.VITE_TERRAIN_URL),
    });

    addStandardMapControls(map);

    map.on("style.load", () => {
      const state = useAppStore.getState();
      const selectedRegionId = getUnitRegionId(state.selectedUnitId) ?? state.activeRegionId;
      const provinceScope = selectedRegionId !== null;
      void addNationLayers(map, !provinceScope);
      addBoundaryLayers(map, getTopLevelUnitId(state.selectedUnitId), state.boundariesVisible,
        provinceScope);
      addRelationLayers(map, state.selectedUnitId, true);
      addMilitaryLayers(map, {
        selectedMilitaryId: state.selectedMilitaryUnitId,
        selectedAdministrativeId: state.selectedUnitId,
        activeRegionId: selectedRegionId,
        colorMode: state.militaryColorMode,
      }, state.militaryVisible);
      addJimiLayers(map, { selectedJimiId: state.selectedJimiUnitId,
        activeRegionId: selectedRegionId }, state.jimiVisible);
      addSeatLayers(map, getTopLevelUnitId(state.selectedUnitId), state.activeRegionId,
        state.seatsVisible, state.mapDisplayMode);
      addCountyLayers(map, {
        selectedUnitId: state.selectedUnitId,
        selectedCountyId: state.selectedCountyId,
        regionId: selectedRegionId,
        displayMode: state.mapDisplayMode,
      }, true);
      stopBoundaryHoverRef.current?.();
      stopBoundaryHoverRef.current = registerBoundaryHover(map);
      setRelationSelection(map, state.selectedUnitId);
      applyMapPointFocus(map, {
        selectedUnitId: state.selectedUnitId,
        selectedMilitaryUnitId: state.selectedMilitaryUnitId,
        selectedJimiUnitId: state.selectedJimiUnitId,
        hoveredRegionId: state.hoveredRegionId,
        hoveredMilitaryUnitId: state.hoveredMilitaryUnitId,
        hoveredJimiUnitId: state.hoveredJimiUnitId,
        activeRegionId: state.activeRegionId,
      });
    });

    const stopSelectionPointerController = createSelectionPointerController(
      map, () => {
        closeTargetChoice();
        hoveredRegionRef.current = null;
        hoveredMilitaryRef.current = null;
        map.stop();
        resetSelection();
      },
      applyAdministrativeTarget,
      chooseTargets,
      () => useAppStore.getState().selectionDomain,
    );
    const stopPointHoverHandlers = registerPointHoverHandlers(map, {
        hoveredRegionRef,
        hoveredMilitaryRef,
        hoveredJimiRef,
        setHoveredRegion,
        setHoveredMilitaryUnit,
        setHoveredJimiUnit,
    });

    mapRef.current = map;
    return () => {
      stopSelectionPointerController();
      stopPointHoverHandlers();
      stopBoundaryHoverRef.current?.();
      stopBoundaryHoverRef.current = null;
      stopRelationAnimation(map);
      stopMilitaryRelationAnimation(map);
      stopJimiAnimation(map);
      map.remove();
      mapRef.current = null;
    };
  }, [applyAdministrativeTarget, chooseTargets, closeTargetChoice, selectMilitaryUnit,
    selectJimiUnit, resetSelection, setHoveredJimiUnit, setHoveredMilitaryUnit, setHoveredRegion]);

  useEffect(closeTargetChoice, [selectedCountyId,
    selectedMilitaryUnitId, selectedUnitId, closeTargetChoice]);

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
