import { data } from "./data";
import type { AdministrativeUnit, MilitaryRecord } from "./types";

const unitsById = new Map(data.administrativeUnits.map((unit) => [unit.id, unit]));
const placesById = new Map(data.places.map((place) => [place.id, place]));
const namesByPlaceId = new Map(data.placeNames.map((name) => [name.placeId, name]));
const regionLevels = new Set(["capital-region", "province"]);
const militaryPrimaryKinds = new Set(["dusi", "xing-dusi", "liushou-si", "wei"]);

function findAdministrativeContext(unit: AdministrativeUnit) {
  let current = unit.parentId ? unitsById.get(unit.parentId) : undefined;
  const visited = new Set<string>();
  let administrativeUnitId: string | null = null;
  let administrativeRegionId: string | null = null;
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    if (current.domain === "administrative") {
      administrativeUnitId ??= current.id;
      if (regionLevels.has(current.level)) {
        administrativeRegionId = current.id;
        break;
      }
    }
    current = current.parentId ? unitsById.get(current.parentId) : undefined;
  }
  return { administrativeUnitId, administrativeRegionId };
}

function createRecord(unit: AdministrativeUnit): MilitaryRecord | null {
  if (!unit.seatPlaceId) return null;
  const place = placesById.get(unit.seatPlaceId);
  const placeName = namesByPlaceId.get(unit.seatPlaceId);
  if (!place || !placeName || place.longitude === undefined || place.latitude === undefined) {
    return null;
  }
  const parent = unit.parentId ? unitsById.get(unit.parentId) : undefined;
  const context = findAdministrativeContext(unit);
  return {
    unit,
    place,
    name: placeName.name,
    administrativeRegionId: context.administrativeRegionId,
    administrativeUnitId: parent?.domain === "administrative" ? parent.id : context.administrativeUnitId,
    militaryParentId: parent?.domain === "military" ? parent.id : null,
  };
}

export const militaryRecords = data.administrativeUnits
  .filter((unit) => unit.domain === "military" && unit.level === "military")
  .map(createRecord)
  .filter((record): record is MilitaryRecord => record !== null);

// The current military records are still trial data and must not enter the public release.
export const militaryTrialPublished = false;
export const publishedMilitaryRecords = militaryTrialPublished ? militaryRecords : [];

export const militaryById = new Map(militaryRecords.map((record) => [record.unit.id, record]));

export function isMilitaryPrimaryUnit(unit: AdministrativeUnit) {
  return unit.militaryKind !== undefined && militaryPrimaryKinds.has(unit.militaryKind);
}

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
