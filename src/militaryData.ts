import { data } from "./data";
import { getMilitaryDisplayGroup, getMilitaryDisplayGroupId } from "./militaryDisplayGroups";
import type { MilitaryRecord, MilitaryUnit } from "./types";

const administrativeUnitsById = new Map(data.administrativeUnits.map((unit) => [unit.id, unit]));
const placesById = new Map(data.places.map((place) => [place.id, place]));
const namesByPlaceId = new Map(data.placeNames.map((name) => [name.placeId, name]));
const regionLevels = new Set(["capital-region", "province"]);
const militaryPrimaryKinds = new Set(["dusi", "xing-dusi", "liushou-si", "wei"]);
const militaryCommandKinds = new Set(["dusi", "xing-dusi", "liushou-si"]);
const militaryParentById = new Map(
  data.relations
    .filter((relation) => relation.relationType === "military-subordination")
    .map((relation) => [relation.subjectId, relation.objectId]),
);
const administrativeContextById = new Map(
  data.relations
    .filter((relation) => relation.relationType === "administrative-context")
    .map((relation) => [relation.subjectId, relation.objectId]),
);
const fiveArmyAffiliationByUnitId = new Map(
  data.relations
    .filter((relation) => relation.relationType === "five-army-affiliation")
    .map((relation) => [relation.subjectId, relation.objectId as MilitaryRecord["fiveArmyId"]]),
);

function resolveFiveArmyId(unitId: string) {
  let currentId: string | undefined = unitId;
  const visited = new Set<string>();
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const affiliation = fiveArmyAffiliationByUnitId.get(currentId);
    if (affiliation) return affiliation;
    currentId = militaryParentById.get(currentId);
  }
  return undefined;
}

function findAdministrativeContext(unit: MilitaryUnit) {
  let current = administrativeContextById.get(unit.id)
    ? administrativeUnitsById.get(administrativeContextById.get(unit.id)!)
    : undefined;
  const visited = new Set<string>();
  const administrativeUnitId = current?.id ?? null;
  let administrativeRegionId: string | null = null;
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    if (regionLevels.has(current.level)) {
      administrativeRegionId = current.id;
      break;
    }
    current = current.parentId ? administrativeUnitsById.get(current.parentId) : undefined;
  }
  return { administrativeUnitId, administrativeRegionId };
}

function createRecord(unit: MilitaryUnit): MilitaryRecord | null {
  if (!unit.seatPlaceId) return null;
  const place = placesById.get(unit.seatPlaceId);
  const placeName = namesByPlaceId.get(unit.seatPlaceId);
  if (!place || !placeName || place.longitude === undefined || place.latitude === undefined) {
    return null;
  }
  const context = findAdministrativeContext(unit);
  return {
    unit,
    place,
    name: placeName.name,
    administrativeRegionId: context.administrativeRegionId,
    administrativeUnitId: context.administrativeUnitId,
    militaryParentId: militaryParentById.get(unit.id) ?? null,
    fiveArmyId: resolveFiveArmyId(unit.id),
  };
}

export const militaryRecords = data.militaryUnits
  .map(createRecord)
  .filter((record): record is MilitaryRecord => record !== null);

// The Guizhou trial is visible in the application while remaining outside the public data release.
export const militaryTrialPublished = true;
export const publishedMilitaryRecords = militaryTrialPublished ? militaryRecords : [];

export const militaryById = new Map(militaryRecords.map((record) => [record.unit.id, record]));

export function isMilitaryPrimaryUnit(unit: MilitaryUnit) {
  return militaryPrimaryKinds.has(unit.militaryKind);
}

export function getMilitaryCommandRecord(unitId: string | null) {
  let current = unitId ? militaryById.get(unitId) : undefined;
  const visited = new Set<string>();
  while (current && !visited.has(current.unit.id)) {
    visited.add(current.unit.id);
    if (militaryCommandKinds.has(current.unit.militaryKind)) return current;
    current = current.militaryParentId ? militaryById.get(current.militaryParentId) : undefined;
  }
  return undefined;
}

export function getMilitaryFocusId(unitId: string | null) {
  return getMilitaryCommandRecord(unitId)?.unit.id ?? getMilitaryDisplayGroupId(unitId) ?? unitId;
}

export { getMilitaryDisplayGroup };

export function isMilitaryDescendant(unitId: string, ancestorId: string) {
  let current = militaryById.get(unitId);
  const visited = new Set<string>();
  while (current?.militaryParentId && !visited.has(current.unit.id)) {
    visited.add(current.unit.id);
    if (current.militaryParentId === ancestorId) return true;
    current = militaryById.get(current.militaryParentId);
  }
  return false;
}
