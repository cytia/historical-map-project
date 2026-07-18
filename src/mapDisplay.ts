import type { ExpressionSpecification } from "maplibre-gl";
import { defaultTheme } from "./theme";
import type { MapDisplayMode, MilitaryColorMode } from "./types";

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

export const militaryColorModes = [
  {
    id: "military",
    label: "军事",
    description: "军事点位按五军都督府归属着色",
  },
] as const satisfies ReadonlyArray<{
  id: MilitaryColorMode;
  label: string;
  description: string;
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

export function militaryColorExpression(
  mode: MilitaryColorMode,
  affiliationIds: readonly string[],
) {
  if (mode === "administrative") {
    const variantBranches = affiliationIds.flatMap((id) => [
      id,
      mapColors.militaryAffiliationVariants[id as keyof typeof mapColors.militaryAffiliationVariants] ??
        mapColors.affiliationNeutral,
    ]);
    const variantExpression = ["match", ["get", "regionId"], ...variantBranches,
      mapColors.affiliationNeutral] as unknown as ExpressionSpecification;
    const exactExpression = affiliationColorExpression("administrative", affiliationIds);
    return ["match", ["get", "militaryKind"],
      "xing-dusi", variantExpression,
      "liushou-si", variantExpression,
      exactExpression,
    ] as unknown as ExpressionSpecification;
  }
  return ["match", ["get", "fiveArmyId"],
    "central", mapColors.militaryAffiliationColors.central,
    "left", mapColors.militaryAffiliationColors.left,
    "right", mapColors.militaryAffiliationColors.right,
    "front", mapColors.militaryAffiliationColors.front,
    "rear", mapColors.militaryAffiliationColors.rear,
    mapColors.affiliationNeutral,
  ] as unknown as ExpressionSpecification;
}
