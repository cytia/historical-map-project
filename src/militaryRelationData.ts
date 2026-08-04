import {
  getMilitaryCommandRecord,
  isMilitaryDescendant,
  isMilitaryPrimaryUnit,
  militaryById,
} from "./militaryData";
import { getMilitaryDisplayGroup } from "./militaryDisplayGroups";
import { getHierarchyDisplayState } from "./hierarchyDisplay";
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
  const hierarchyRoot = command ?? (
    primary?.unit.militaryKind === "wei" ? primary : undefined
  );
  if (!hierarchyRoot || !primary) return [];
  return records.filter((record) => {
    if (isMilitaryPrimaryUnit(record.unit)) return false;
    return scope === "domain"
      ? isMilitaryDescendant(record.unit.id, hierarchyRoot.unit.id)
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

function displayGroupLineData(
  records: MilitaryRecord[],
  selectedMilitaryId: string | null,
  scope: HierarchyScope,
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const group = getMilitaryDisplayGroup(selectedMilitaryId);
  if (!group) return { type: "FeatureCollection", features: [] };
  const anchor = [group.anchor.longitude, group.anchor.latitude] as [number, number];
  return {
    type: "FeatureCollection",
    features: displayGroupRecords(records, selectedMilitaryId, scope)
      .map((record) => ({
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: curvedCoordinates(
            [record.place.longitude!, record.place.latitude!],
            anchor,
          ),
        },
        properties: {
          id: record.unit.id,
          selected: record.unit.id === selectedMilitaryId,
        },
      })),
  };
}

function displayGroupRecords(
  records: MilitaryRecord[],
  selectedMilitaryId: string | null,
  scope: HierarchyScope,
) {
  const group = getMilitaryDisplayGroup(selectedMilitaryId);
  if (!group) return [];
  const groupRecords = records.filter(({ unit }) => group.memberIds.includes(unit.id));
  if (scope === "domain") return groupRecords;
  const primaryRecords = groupRecords.filter(({ unit }) => isMilitaryPrimaryUnit(unit));
  if (scope === "overview") return primaryRecords;
  const selected = groupRecords.find(({ unit }) => unit.id === selectedMilitaryId);
  return selected && !isMilitaryPrimaryUnit(selected.unit)
    ? [...primaryRecords, selected]
    : primaryRecords;
}

function displayGroupAnchorData(
  selectedMilitaryId: string | null,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const group = getMilitaryDisplayGroup(selectedMilitaryId);
  if (!group) return { type: "FeatureCollection", features: [] };
  return {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [group.anchor.longitude, group.anchor.latitude],
      },
      properties: {
        id: group.anchor.id,
        label: group.anchor.label,
        description: group.anchor.description,
      },
    }],
  };
}

export function militaryHierarchyData(
  records: MilitaryRecord[],
  selectedMilitaryId: string | null,
  scope: HierarchyScope,
) {
  const display = getHierarchyDisplayState(scope, selectedMilitaryId !== null);
  const command = getMilitaryCommandRecord(selectedMilitaryId);
  const secondary = secondaryRecords(records, selectedMilitaryId, scope);
  const displayGroupSecondary = displayGroupRecords(records, selectedMilitaryId, scope)
    .filter(({ unit }) => !isMilitaryPrimaryUnit(unit));
  const visibleRecords = [
    ...records.filter(({ unit }) => isMilitaryPrimaryUnit(unit)),
    ...secondary,
    ...displayGroupSecondary,
  ];
  const primary = command
    ? records.filter((record) =>
      isMilitaryPrimaryUnit(record.unit) && record.militaryParentId === command.unit.id)
    : [];
  const primaryRelations = display.showRelations
    ? lineData(primary, selectedMilitaryId)
    : { type: "FeatureCollection" as const, features: [] };
  return {
    records: visibleRecords,
    primaryRelations,
    flowRelations: primaryRelations,
    secondaryRelations: lineData(secondary, selectedMilitaryId),
    displayGroupRelations: display.showRelations
      ? displayGroupLineData(records, selectedMilitaryId, scope)
      : { type: "FeatureCollection" as const, features: [] },
    displayGroupAnchor: displayGroupAnchorData(selectedMilitaryId),
    animateRelations: display.animateRelations,
  };
}
