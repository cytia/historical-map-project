import { curvedCoordinates } from "./relationRendering";
import { isJimiRoot, jimiRecords } from "./jimiData";
import { selectHierarchyRecords } from "./hierarchyDisplay";
import type { HierarchyScope, JimiRecord } from "./types";

const emptyRelations = (): GeoJSON.FeatureCollection<GeoJSON.LineString> => ({
  type: "FeatureCollection",
  features: [],
});

function relationData(
  records: JimiRecord[],
  selectedJimiId: string | null,
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const recordsById = new Map(records.map((record) => [record.unit.id, record]));
  return {
    type: "FeatureCollection",
    features: records.flatMap((record) => {
      const parent = record.jimiParentId ? recordsById.get(record.jimiParentId) : undefined;
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
          selected: record.unit.id === selectedJimiId,
          depth: record.jimiDepth,
        },
      }];
    }),
  };
}

export function jimiHierarchyData(
  records: JimiRecord[] = jimiRecords,
  selectedJimiId: string | null,
  scope: HierarchyScope,
) {
  const selected = records.some((record) => record.unit.id === selectedJimiId)
    ? selectedJimiId
    : null;
  const hierarchy = selectHierarchyRecords(records, selected, scope, {
    getId: (record) => record.unit.id,
    getParentId: (record) => record.jimiParentId,
    getRootId: (record) => record.jimiRootId,
    isRoot: isJimiRoot,
  });
  const relations = hierarchy.state.showRelations
    ? relationData(hierarchy.records, selected)
    : emptyRelations();
  return {
    records: hierarchy.records,
    relations,
    flowRelations: relations,
    animateRelations: hierarchy.state.animateRelations,
  };
}
