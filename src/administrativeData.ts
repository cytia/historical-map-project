import type { AdministrativeUnit, ProjectData, SeatRecord } from "./types";

const regionLevels = new Set(["capital-region", "province"]);

export function buildAdministrativeData(data: ProjectData) {
  const unitsById = new Map(data.administrativeUnits.map((unit) => [unit.id, unit]));
  const placesById = new Map(data.places.map((place) => [place.id, place]));
  const namesByPlaceId = new Map(data.placeNames.map((name) => [name.placeId, name]));
  const regions = data.administrativeUnits.filter((unit) => regionLevels.has(unit.level));

  const seats = data.administrativeUnits.flatMap((unit): SeatRecord[] => {
    if (!unit.seatPlaceId || !unit.parentId) return [];
    const place = placesById.get(unit.seatPlaceId);
    const placeName = namesByPlaceId.get(unit.seatPlaceId);
    const region = unitsById.get(unit.parentId);
    if (!place || !placeName || !region || place.longitude === undefined || place.latitude === undefined) {
      return [];
    }
    return [{ unit, place, name: placeName.name, region }];
  });

  const regionsWithSeats = regions.filter((region) =>
    seats.some((record) => record.region.id === region.id),
  );

  return { unitsById, regionsWithSeats, seats };
}

export function summarizeRegion(seats: SeatRecord[], regionId: string | null) {
  const records = regionId ? seats.filter((record) => record.region.id === regionId) : seats;
  return {
    prefectures: records.filter((record) => record.unit.level === "prefecture").length,
    departments: records.filter((record) => record.unit.level === "department").length,
    seats: records.length,
  };
}

export function regionForUnit(
  seats: SeatRecord[],
  unitId: string,
): AdministrativeUnit | undefined {
  return seats.find((record) => record.unit.id === unitId)?.region;
}
