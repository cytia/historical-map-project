import { curvedCoordinates } from "./relationRendering";
import {
  isJimiMilitaryPrimary,
  isJimiPrimary,
  isJimiRoot,
  jimiRecords,
} from "./jimiData";
import { getHierarchyDisplayState, selectHierarchyRecords } from "./hierarchyDisplay";
import type { HierarchyScope, JimiRecord } from "./types";

const emptyRelations = (): GeoJSON.FeatureCollection<GeoJSON.LineString> => ({
  type: "FeatureCollection",
  features: [],
});

function relationData(
  records: JimiRecord[],
  selectedJimiId: string | null,
): {
  relations: GeoJSON.FeatureCollection<GeoJSON.LineString>;
  flowRelations: GeoJSON.FeatureCollection<GeoJSON.LineString>;
} {
  const recordsById = new Map(records.map((record) => [record.unit.id, record]));
  const selectedRootId = selectedJimiId
    ? recordsById.get(selectedJimiId)?.jimiRootId
    : undefined;
  const relations: GeoJSON.Feature<GeoJSON.LineString>[] = [];
  const flowRelations: GeoJSON.Feature<GeoJSON.LineString>[] = [];
  records.forEach((record) => {
    if (selectedRootId && record.jimiRootId !== selectedRootId) return;
    const parent = record.jimiParentId ? recordsById.get(record.jimiParentId) : undefined;
    if (!parent || parent.unit.jimiKind !== record.unit.jimiKind) return;
    const feature = {
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
        selected: record.unit.id === selectedJimiId,
        depth: record.jimiDisplayLevel,
      },
    };
    relations.push(feature);
    if (!isJimiMilitaryPrimary(record) && record.unit.jimiKind === "military-institution") {
      return;
    }
    flowRelations.push(feature);
  });
  return {
    relations: {
      type: "FeatureCollection",
      features: relations,
    },
    flowRelations: {
      type: "FeatureCollection",
      features: flowRelations,
    },
  };
}

function uniqueRecords(records: JimiRecord[]) {
  return [...new Map(records.map((record) => [record.unit.id, record])).values()];
}

function primaryAncestorId(record: JimiRecord, recordsById: Map<string, JimiRecord>) {
  let current: JimiRecord | undefined = record;
  const visited = new Set<string>();
  while (current && !visited.has(current.unit.id)) {
    visited.add(current.unit.id);
    if (isJimiPrimary(current)) return current.unit.id;
    current = current.jimiParentId ? recordsById.get(current.jimiParentId) : undefined;
  }
  return record.unit.id;
}

function militaryRecordsForSelection(
  records: JimiRecord[],
  selected: JimiRecord | undefined,
  scope: HierarchyScope,
) {
  const primaryRecords = records.filter(isJimiPrimary);
  if (!selected || scope === "overview") return primaryRecords;
  const recordsById = new Map(records.map((record) => [record.unit.id, record]));
  const primaryId = primaryAncestorId(selected, recordsById);
  const secondaryRecords = records.filter((record) => {
    if (record.unit.jimiKind !== "military-institution" || record.jimiDisplayLevel !== 2) {
      return false;
    }
    return scope === "domain"
      ? record.jimiRootId === selected.jimiRootId
      : record.jimiParentId === primaryId;
  });
  return uniqueRecords([...primaryRecords, ...secondaryRecords]);
}

function nativeRecordsForSelection(
  records: JimiRecord[],
  selectedId: string,
  scope: HierarchyScope,
) {
  const nativeRecords = records.filter(({ unit }) => unit.jimiKind === "native-office");
  const hierarchy = selectHierarchyRecords(nativeRecords, selectedId, scope, {
    getId: (record) => record.unit.id,
    getParentId: (record) => record.jimiParentId,
    getRootId: (record) => record.jimiRootId,
    isRoot: isJimiRoot,
  });
  return uniqueRecords([
    ...records.filter(isJimiPrimary),
    ...hierarchy.records,
  ]);
}

function emptySelectionState(scope: HierarchyScope, selected: JimiRecord | undefined) {
  return getHierarchyDisplayState(scope, selected !== undefined);
}

function selectRecords(
  records: JimiRecord[],
  selected: JimiRecord | undefined,
  scope: HierarchyScope,
) {
  if (!selected) {
    return { records: records.filter(isJimiPrimary), state: emptySelectionState(scope, selected) };
  }
  if (selected.unit.jimiKind === "military-institution") {
    return {
      records: militaryRecordsForSelection(records, selected, scope),
      state: emptySelectionState(scope, selected),
    };
  }
  return {
    records: nativeRecordsForSelection(records, selected.unit.id, scope),
    state: emptySelectionState(scope, selected),
  };
}

/*
 * The relation graph remains historical, while military-jimi display levels
 * determine which edges receive animation. A qianhu edge is still visible,
 * but it must not look like a command-level relation.
 */
function buildRelations(
  records: JimiRecord[],
  selectedJimiId: string | null,
) {
  return relationData(records, selectedJimiId);
}

export function jimiHierarchyData(
  records: JimiRecord[] = jimiRecords,
  selectedJimiId: string | null,
  scope: HierarchyScope,
) {
  const selected = records.some((record) => record.unit.id === selectedJimiId)
    ? records.find((record) => record.unit.id === selectedJimiId)
    : undefined;
  const hierarchy = selectRecords(records, selected, scope);
  const relationSets = hierarchy.state.showRelations
    ? buildRelations(hierarchy.records, selected?.unit.id ?? null)
    : { relations: emptyRelations(), flowRelations: emptyRelations() };
  return {
    records: hierarchy.records,
    relations: relationSets.relations,
    flowRelations: relationSets.flowRelations,
    animateRelations: hierarchy.state.animateRelations,
  };
}
