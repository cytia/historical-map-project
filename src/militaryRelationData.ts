import {
  getMilitaryCommandRecord,
  isMilitaryPrimaryUnit,
  militaryById,
} from "./militaryData";
import { militaryTier, tierProperty } from "./displayTier";
import { curvedCoordinates } from "./relationRendering";
import type { MilitaryRecord } from "./types";

/// Second-tier units — 所 — are no longer gated on which unit is selected. Zoom decides
/// whether they are drawn, the same way it does for counties, so they all belong to the
/// source and the tier expression reveals them.
function secondaryRecords(records: MilitaryRecord[]) {
  return records.filter((record) => !isMilitaryPrimaryUnit(record.unit));
}

function lineData(
  records: MilitaryRecord[],
  selectedMilitaryId: string | null,
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  return {
    type: "FeatureCollection",
    features: records.flatMap((record) => {
      const parent = record.militaryParentId ? militaryById.get(record.militaryParentId) : undefined;
      if (!parent) return [];
      return [{
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: curvedCoordinates(
            [record.place.longitude!, record.place.latitude!],
            [parent.place.longitude!, parent.place.latitude!],
          ),
        },
        properties: {
          id: record.unit.id,
          selected: record.unit.id === selectedMilitaryId,
          // The line belongs to the tier of the unit it leads to, so it fades in with it.
          [tierProperty]: militaryTier(record.unit.militaryKind),
        },
      }];
    }),
  };
}

/// Every published record is in the source; the tier expression decides what is drawn.
/// Relation lines are drawn only for the selected unit, so an unselected map carries no
/// connections at all.
export function militaryHierarchyData(
  records: MilitaryRecord[],
  selectedMilitaryId: string | null,
) {
  const hasSelection = selectedMilitaryId !== null;
  const command = getMilitaryCommandRecord(selectedMilitaryId);
  const secondary = secondaryRecords(records);
  // Only the selected unit's own links: its segment up to its 都司, and its segments down
  // to subordinate units. Sibling 衛 under the same 都司 are not part of the answer.
  const primary = command
    ? records.filter((record) =>
      isMilitaryPrimaryUnit(record.unit) &&
      record.militaryParentId === command.unit.id &&
      (record.unit.id === selectedMilitaryId || command.unit.id === selectedMilitaryId))
    : [];
  const primaryRelations = hasSelection
    ? lineData(primary, selectedMilitaryId)
    : { type: "FeatureCollection" as const, features: [] };
  const selectedSubordinates = hasSelection
    ? secondary.filter((record) => record.militaryParentId === selectedMilitaryId)
    : [];
  return {
    records: [...records.filter(({ unit }) => isMilitaryPrimaryUnit(unit)), ...secondary],
    primaryRelations,
    flowRelations: primaryRelations,
    secondaryRelations: lineData(selectedSubordinates, selectedMilitaryId),
    animateRelations: hasSelection,
  };
}
