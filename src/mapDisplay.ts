import type { ExpressionSpecification } from "maplibre-gl";
import { defaultTheme } from "./theme";
import type { MapDisplayMode } from "./types";

const mapColors = defaultTheme.map;

export const mapDisplayModes = [
  {
    id: "administrative",
    label: "行政",
    description: "按一级行政区域为点位分色",
    available: true,
  },
  {
    id: "jurisdiction",
    label: "管辖",
    description: "巡抚、总督管辖关系尚未接入",
    available: false,
  },
  {
    id: "control",
    label: "势力",
    description: "战争期间实际控制关系尚未接入",
    available: false,
  },
] as const satisfies ReadonlyArray<{
  id: MapDisplayMode;
  label: string;
  description: string;
  available: boolean;
}>;

const affiliationProperty: Record<MapDisplayMode, string> = {
  administrative: "regionId",
  jurisdiction: "jurisdictionId",
  control: "controllingActorId",
};

export function affiliationColorExpression(
  mode: MapDisplayMode,
  affiliationIds: readonly string[],
): string | ExpressionSpecification {
  if (!affiliationIds.length || mode !== "administrative") return mapColors.affiliationNeutral;
  const branches = affiliationIds.flatMap((id) => [
    id,
    mapColors.affiliationColors[id as keyof typeof mapColors.affiliationColors] ??
      mapColors.affiliationNeutral,
  ]);
  return ["match", ["get", affiliationProperty[mode]], ...branches,
    mapColors.affiliationNeutral] as unknown as ExpressionSpecification;
}
