import {
  getMilitaryCommandRecord,
  isMilitaryDescendant,
  isMilitaryPrimaryUnit,
  militaryById,
} from "./militaryData";
import { curvedCoordinates } from "./relationRendering";
import type { HierarchyScope, MilitaryRecord } from "./types";

function selectedPrimaryUnit(selectedMilitaryId: string | null) {
  const selected = selectedMilitaryId ? militaryById.get(selectedMilitaryId) : undefined;
  if (!selected || isMilitaryPrimaryUnit(selected.unit)) return selected;
  return selected.militaryParentId ? militaryById.get(selected.militaryParentId) : undefined;
}

function secondaryRecords(
  records: MilitaryRecord[],
  selectedMilitaryId: string | null,
  scope: HierarchyScope,
) {
  if (scope === "overview") return [];
  const command = getMilitaryCommandRecord(selectedMilitaryId);
  const primary = selectedPrimaryUnit(selectedMilitaryId);
  if (!command || !primary) return [];
  return records.filter((record) => {
    if (isMilitaryPrimaryUnit(record.unit)) return false;
    return scope === "domain"
      ? isMilitaryDescendant(record.unit.id, command.unit.id)
      : record.militaryParentId === primary.unit.id;
  });
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
        },
      }];
    }),
  };
}

export function militaryHierarchyData(
  records: MilitaryRecord[],
  selectedMilitaryId: string | null,
  scope: HierarchyScope,
) {
  const command = getMilitaryCommandRecord(selectedMilitaryId);
  const secondary = secondaryRecords(records, selectedMilitaryId, scope);
  const visibleRecords = [
    ...records.filter(({ unit }) => isMilitaryPrimaryUnit(unit)),
    ...secondary,
  ];
  const primary = command
    ? records.filter((record) =>
      isMilitaryPrimaryUnit(record.unit) && record.militaryParentId === command.unit.id)
    : [];
  const primaryRelations = lineData(primary, selectedMilitaryId);
  return {
    records: visibleRecords,
    primaryRelations,
    flowRelations: primaryRelations,
    secondaryRelations: lineData(secondary, selectedMilitaryId),
  };
}
