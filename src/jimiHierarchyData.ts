import { jimiTier, tierProperty } from "./displayTier";
import { curvedCoordinates } from "./relationRendering";
import {
  isJimiMilitaryPrimary,
  jimiRecords,
} from "./jimiData";
import type { JimiRecord } from "./types";

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
  const relations: GeoJSON.Feature<GeoJSON.LineString>[] = [];
  const flowRelations: GeoJSON.Feature<GeoJSON.LineString>[] = [];
  records.forEach((record) => {
    // Only the selected unit's own links: the segment up to its parent, and the segments
    // down to its children. The rest of the tree is not what the click asked about.
    const linked = record.unit.id === selectedJimiId || record.jimiParentId === selectedJimiId;
    if (!linked) return;
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
        // The line belongs to the tier of the unit it leads to, so it appears with it.
        [tierProperty]: jimiTier(record.jimiDisplayLevel),
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

/// Every record is in the source and the tier expression decides what is drawn, so record
/// selection no longer depends on what is selected — only relation lines do.
function selectRecords(records: JimiRecord[]) {
  return uniqueRecords(records);
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

/// Relation lines belong to the selected unit; with nothing selected the map carries no
/// jimi connections at all.
export function jimiHierarchyData(
  records: JimiRecord[] = jimiRecords,
  selectedJimiId: string | null,
) {
  const selected = records.find((record) => record.unit.id === selectedJimiId);
  const visibleRecords = selectRecords(records);
  const relationSets = selected
    ? buildRelations(visibleRecords, selected.unit.id)
    : { relations: emptyRelations(), flowRelations: emptyRelations() };
  return {
    records: visibleRecords,
    relations: relationSets.relations,
    flowRelations: relationSets.flowRelations,
    animateRelations: selected !== undefined,
  };
}
