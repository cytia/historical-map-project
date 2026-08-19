import { useCallback, useState } from "react";
import type { ChoosableTarget, MapTarget } from "./mapSelectionInteraction";

interface TargetChoice {
  anchor: { x: number; y: number };
  targets: ChoosableTarget[];
}

interface TargetChoiceActions {
  selectCounty: (countyId: string, parentId: string, regionId: string) => void;
  selectUnit: (unitId: string) => void;
  selectMilitaryUnit: (unitId: string, regionId: string | null) => void;
  selectJimiUnit: (unitId: string, regionId: string | null) => void;
  setActiveRegion: (regionId: string) => void;
}

export function useAdministrativeTargetChoice(actions: TargetChoiceActions) {
  const { selectCounty, selectUnit, selectMilitaryUnit, selectJimiUnit, setActiveRegion } = actions;
  const [targetChoice, setTargetChoice] = useState<TargetChoice | null>(null);
  const closeTargetChoice = useCallback(() => setTargetChoice(null), []);
  const chooseTargets = useCallback((
    targets: ChoosableTarget[],
    anchor: { x: number; y: number },
  ) => setTargetChoice({ targets, anchor }), []);
  const applyAdministrativeTarget = useCallback((target: MapTarget) => {
    closeTargetChoice();
    if (target.kind === "province") {
      setActiveRegion(target.regionId);
      return;
    }
    if (target.kind === "military") {
      selectMilitaryUnit(target.id, target.regionId);
      return;
    }
    if (target.kind === "jimi") {
      selectJimiUnit(target.id, target.regionId);
      return;
    }
    if (target.kind === "county") {
      selectCounty(target.id, target.parentId, target.regionId);
    } else {
      setActiveRegion(target.regionId);
      selectUnit(target.id);
    }
  }, [selectCounty, selectUnit, selectMilitaryUnit, selectJimiUnit, setActiveRegion, closeTargetChoice]);

  return { targetChoice, closeTargetChoice, chooseTargets, applyAdministrativeTarget };
}
