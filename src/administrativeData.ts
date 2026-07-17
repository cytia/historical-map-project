import type { AdministrativeUnit, CountyRecord, ProjectData, SeatRecord } from "./types";

const regionLevels = new Set(["capital-region", "province"]);

export function buildAdministrativeData(data: ProjectData) {
  const unitsById = new Map(data.administrativeUnits.map((unit) => [unit.id, unit]));
  const placesById = new Map(data.places.map((place) => [place.id, place]));
  const namesByPlaceId = new Map(data.placeNames.map((name) => [name.placeId, name]));
  const regions = data.administrativeUnits.filter((unit) => regionLevels.has(unit.level));
  const findRegion = (unit: AdministrativeUnit) => {
    let current = unit.parentId ? unitsById.get(unit.parentId) : undefined;
    while (current && !regionLevels.has(current.level)) {
      current = current.parentId ? unitsById.get(current.parentId) : undefined;
    }
    return current;
  };

  const seats = data.administrativeUnits.flatMap((unit): SeatRecord[] => {
    if (unit.level !== "prefecture" && unit.level !== "department") return [];
    if (!unit.seatPlaceId || !unit.parentId) return [];
    const place = placesById.get(unit.seatPlaceId);
    const placeName = namesByPlaceId.get(unit.seatPlaceId);
    const region = findRegion(unit);
    if (!place || !placeName || !region || place.longitude === undefined || place.latitude === undefined) {
      return [];
    }
    return [{ unit, place, name: placeName.name, region }];
  });

  const counties = data.administrativeUnits.flatMap((unit): CountyRecord[] => {
    if (unit.level !== "county" || !unit.seatPlaceId || !unit.parentId) return [];
    const place = placesById.get(unit.seatPlaceId);
    const placeName = namesByPlaceId.get(unit.seatPlaceId);
    const parent = unitsById.get(unit.parentId);
    const region = findRegion(unit);
    if (!place || !placeName || !parent || !region ||
      place.longitude === undefined || place.latitude === undefined) return [];
    return [{ unit, place, name: placeName.name, parent, region }];
  });

  const regionsWithSeats = regions.filter((region) =>
    seats.some((record) => record.region.id === region.id),
  );

  return { unitsById, regionsWithSeats, seats, counties };
}

export function findTopLevelUnitId(
  unitsById: Map<string, AdministrativeUnit>,
  unitId: string | null,
) {
  let current = unitId ? unitsById.get(unitId) : undefined;
  while (current?.parentId) {
    const parent = unitsById.get(current.parentId);
    if (!parent || regionLevels.has(parent.level)) return current.id;
    current = parent;
  }
  return current?.id ?? null;
}

export function summarizeRegion(seats: SeatRecord[], regionId: string | null) {
  const regional = regionId ? seats.filter((record) => record.region.id === regionId) : seats;
  return {
    prefectures: regional.filter((record) => record.unit.level === "prefecture").length,
    departments: regional.filter((record) => record.unit.level === "department").length,
    seats: regional.length,
  };
}
