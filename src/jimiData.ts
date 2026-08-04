import { data, getTopLevelUnitId } from "./data";
import type { JimiRecord, JimiUnit } from "./types";

const placesById = new Map(data.places.map((place) => [place.id, place]));
const namesByPlaceId = new Map(data.placeNames.map((name) => [name.placeId, name]));
export const jimiParentById = new Map(
  data.relations
    .filter((relation) => relation.relationType === "jimi-subordination")
    .map((relation) => [relation.subjectId, relation.objectId]),
);
const administrativeContextById = new Map(
  data.relations
    .filter((relation) => relation.relationType === "jimi-administrative-context")
    .map((relation) => [relation.subjectId, relation.objectId]),
);
const rootOfficeKinds = new Set<JimiUnit["officeKind"]>([
  "dusi",
  "xing-dusi",
  "xuanwei-si",
  "xuanfu-si",
  "zhaotao-si",
  "anfu-si",
]);

function createRecord(unit: JimiUnit): Omit<JimiRecord, "jimiRootId" | "jimiDepth"> | null {
  if (!unit.seatPlaceId) return null;
  const place = placesById.get(unit.seatPlaceId);
  const placeName = namesByPlaceId.get(unit.seatPlaceId);
  if (!place || !placeName || place.longitude === undefined || place.latitude === undefined) {
    return null;
  }
  const administrativeUnitId = administrativeContextById.get(unit.id) ?? null;
  return {
    unit,
    place,
    name: placeName.name,
    administrativeUnitId,
    administrativeRegionId: administrativeUnitId
      ? getTopLevelUnitId(administrativeUnitId)
      : null,
    jimiParentId: jimiParentById.get(unit.id) ?? null,
  };
}

const baseJimiRecords = data.jimiUnits
  .map(createRecord)
  .filter((record): record is Omit<JimiRecord, "jimiRootId" | "jimiDepth"> => record !== null);

function resolveHierarchy(unitId: string) {
  const visited = new Set<string>();
  let currentId = unitId;
  let depth = 1;
  while (jimiParentById.has(currentId) && !visited.has(currentId)) {
    visited.add(currentId);
    currentId = jimiParentById.get(currentId)!;
    depth += 1;
  }
  return { jimiRootId: currentId, jimiDepth: depth };
}

export const jimiRecords: JimiRecord[] = baseJimiRecords.map((record) => ({
  ...record,
  ...resolveHierarchy(record.unit.id),
}));

export const jimiById = new Map(jimiRecords.map((record) => [record.unit.id, record]));

export function isJimiRoot(record: JimiRecord) {
  if (record.jimiParentId !== null) return false;
  // A direct Shizhou Wei office can be a root even when its title is a lower office kind.
  return rootOfficeKinds.has(record.unit.officeKind) || administrativeContextById.has(record.unit.id);
}

export function getJimiChildren(unitId: string, records = jimiRecords) {
  return records.filter((record) => record.jimiParentId === unitId);
}

export function getJimiRoots(records = jimiRecords) {
  return records.filter(isJimiRoot);
}

export function getJimiFocusId(unitId: string) {
  const rootId = jimiById.get(unitId)?.jimiRootId;
  const root = rootId ? jimiById.get(rootId) : undefined;
  return root && isJimiRoot(root) ? root.unit.id : null;
}

export function getJimiUnresolved(records = jimiRecords) {
  return records.filter((record) => {
    if (record.jimiParentId === null) return !isJimiRoot(record);
    return !jimiById.has(record.jimiParentId);
  });
}

export function getJimiAncestors(recordId: string) {
  const ancestors: JimiRecord[] = [];
  const visited = new Set<string>();
  let parentId = jimiById.get(recordId)?.jimiParentId ?? null;
  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = jimiById.get(parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    parentId = parent.jimiParentId;
  }
  return ancestors;
}

export function jimiKindLabel(kind: JimiUnit["jimiKind"]) {
  return kind === "military-institution" ? "羁縻军事机构" : "土司／土官衙门";
}

export function jimiOfficeLabel(kind: JimiUnit["officeKind"]) {
  const labels: Record<JimiUnit["officeKind"], string> = {
    dusi: "都司",
    "xing-dusi": "行都司",
    wei: "卫",
    suo: "所",
    "xuanwei-si": "宣慰司",
    "xuanfu-si": "宣抚司",
    "zhaotao-si": "招讨司",
    "anfu-si": "安抚司",
    "zhangguan-si": "长官司",
    "tusi-xunjian-si": "土巡检司",
  };
  return labels[kind];
}
