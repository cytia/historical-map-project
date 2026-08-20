import type { ExpressionSpecification } from "maplibre-gl";

/// How deep into a hierarchy a point sits, counted the same way in every system so one
/// zoom threshold governs all of them. Administrative, military and jimi units each reach
/// their own tiers by their own rules, but a tier means the same thing once assigned, and
/// the map draws them by one rule: nothing until a province is chosen, then first-tier
/// points, then the deeper tiers as the camera comes in.
export type DisplayTier = 1 | 2 | 3;

/// Zoom at which a tier starts being drawn. A tier is shown or it is not: crossing the
/// threshold adds it, going back below removes it. There is deliberately no fade — a
/// half-transparent point reads as a rendering artefact rather than as a level of the
/// hierarchy. Tier 1 has no entry because it appears with the province itself.
const tierZoom: Record<Exclude<DisplayTier, 1>, number> = {
  2: 5.2,
  3: 6.4,
};

/// Labels appear slightly after their points so a tier's dots land before its names.
const labelZoomOffset = 0.35;

export const tierProperty = "displayTier";

/// Restricts a layer to the province in view. A point whose `regionId` is something else —
/// or which has no documented province at all, as most jimi offices currently do — is not
/// drawn, so the map shows one province's units rather than the whole country's. Units
/// outside any mapped province stay hidden until their own face exists to be chosen.
function regionCeiling(
  regionId: string | null,
  maximumOpacity: number | ExpressionSpecification,
): ExpressionSpecification | number {
  if (!regionId) return 0;
  return ["case",
    ["==", ["get", "regionId"], regionId], maximumOpacity,
    0,
  ] as unknown as ExpressionSpecification;
}

/// Opacity for a point, its label, or a line, read from the feature's own `displayTier`.
/// One expression covers a whole layer whatever mix of tiers it holds, which is what lets
/// the three systems share these thresholds instead of each hard-coding its own minzoom.
///
/// `visible` is false until a province is chosen, and then everything is hidden — the map
/// opens on the empire, not on a field of points. MapLibre allows only one zoom-based
/// subexpression per property, so the `step` stays at the top and the per-tier choice goes
/// inside each stop, rather than one `step` per tier selected by a `case`.
export function tierOpacityExpression(options: {
  visible: boolean;
  maximumOpacity?: number | ExpressionSpecification;
  label?: boolean;
  regionId?: string | null;
} ): ExpressionSpecification | number {
  if (!options.visible) return 0;
  const maximumOpacity = options.regionId === undefined
    ? options.maximumOpacity ?? 1
    : regionCeiling(options.regionId, options.maximumOpacity ?? 1);
  const offset = options.label ? labelZoomOffset : 0;
  // Which tiers are drawn at and above one zoom stop. Tier 1 is always at the ceiling.
  const atZoom = (zoom: number): ExpressionSpecification => {
    const shown = (tier: Exclude<DisplayTier, 1>) => zoom >= tierZoom[tier] + offset;
    return ["case",
      ["==", ["get", tierProperty], 2], shown(2) ? maximumOpacity : 0,
      ["==", ["get", tierProperty], 3], shown(3) ? maximumOpacity : 0,
      maximumOpacity,
    ] as unknown as ExpressionSpecification;
  };
  const thresholds = [tierZoom[2] + offset, tierZoom[3] + offset];
  // `step` holds each value until the next threshold, so a tier switches on at its own
  // zoom and off again below it, with nothing in between.
  return ["step", ["zoom"],
    atZoom(0),
    ...thresholds.flatMap((zoom) => [zoom, atZoom(zoom)]),
  ] as unknown as ExpressionSpecification;
}

/// Dimming a point for focus and hiding it for zoom are separate questions that both
/// answer through opacity. Passing the focus expression as the tier ceiling multiplies the
/// two per zoom stop, which keeps the `step` at the top of the expression where MapLibre
/// requires it — an `["*", step, focus]` wrapper puts zoom below a multiply and is rejected.
export function focusedTierOpacity(
  focusOpacity: number | ExpressionSpecification,
  options: { visible: boolean; label?: boolean; regionId?: string | null },
): ExpressionSpecification | number {
  return tierOpacityExpression({ ...options, maximumOpacity: focusOpacity });
}

/// A 府 or 直隶州 seat is tier 1, a 属州 tier 2, a county tier 3. `kind` is what the
/// county layer already tags its features with; seats carry no kind and are tier 1.
export function administrativeTier(kind: string | undefined): DisplayTier {
  if (kind === "county") return 3;
  if (kind === "department") return 2;
  return 1;
}

/// 都司類單位 and 衛 are first-tier display units and stay so whatever they are
/// subordinate to — a 衛 is not demoted for belonging to a 都司. 所 are second tier.
export function militaryTier(militaryKind: string | undefined): DisplayTier {
  return militaryKind === "qianhu-suo" || militaryKind === "suo" ? 2 : 1;
}

/// Jimi records already carry a display level computed from office kind and depth; it is
/// clamped rather than recomputed, because that level encodes rules about which offices
/// count as primary that do not belong in a rendering module.
export function jimiTier(displayLevel: number | undefined): DisplayTier {
  if (!displayLevel || displayLevel <= 1) return 1;
  return displayLevel === 2 ? 2 : 3;
}

/// Whether a tier is drawn at a given zoom, answered from the same thresholds the paint
/// expression uses. Hit testing needs this because MapLibre's rendered-feature query
/// ignores paint opacity: a point faded out by tier or by the nation view is still returned
/// and would otherwise stay clickable while invisible.
export function isTierVisibleAtZoom(
  tier: DisplayTier | undefined,
  zoom: number,
  label = false,
): boolean {
  if (tier === undefined || tier === 1) return true;
  return zoom >= tierZoom[tier] + (label ? labelZoomOffset : 0);
}
