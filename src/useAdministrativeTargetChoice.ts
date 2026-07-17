import { useCallback, useState } from "react";
import type { AdministrativeTarget } from "./mapSelectionInteraction";

interface TargetChoice {
  anchor: { x: number; y: number };
  targets: AdministrativeTarget[];
}

interface TargetChoiceActions {
  selectCounty: (countyId: string, parentId: string, regionId: string) => void;
  selectUnit: (unitId: string) => void;
  setActiveRegion: (regionId: string) => void;
}

export function useAdministrativeTargetChoice(actions: TargetChoiceActions) {
  const { selectCounty, selectUnit, setActiveRegion } = actions;
  const [targetChoice, setTargetChoice] = useState<TargetChoice | null>(null);
  const closeTargetChoice = useCallback(() => setTargetChoice(null), []);
  const chooseTargets = useCallback((
    targets: AdministrativeTarget[],
    anchor: { x: number; y: number },
  ) => setTargetChoice({ targets, anchor }), []);
  const applyAdministrativeTarget = useCallback((target: AdministrativeTarget) => {
    closeTargetChoice();
    if (target.kind === "county") {
      selectCounty(target.id, target.parentId, target.regionId);
    } else {
      setActiveRegion(target.regionId);
      selectUnit(target.id);
    }
  }, [selectCounty, selectUnit, setActiveRegion, closeTargetChoice]);

  return { targetChoice, closeTargetChoice, chooseTargets, applyAdministrativeTarget };
}
