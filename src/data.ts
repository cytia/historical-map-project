import type {
  CountyRecord,
  JimiRecord,
  MilitaryRecord,
  RuntimeIndex,
  SeatRecord,
  Source,
} from "./types";
import {
  buildAdministrativeData,
  findAdministrativeRegionId,
  findTopLevelUnitId,
  summarizeRegion,
} from "./administrativeData";

const emptyData: RuntimeIndex = {
  schemaVersion: 1,
  sourceCount: 0,
  administrativeUnits: [],
  militaryUnits: [],
  jimiUnits: [],
  relations: [],
  places: [],
  placeNames: [],
};

export let data = emptyData;
let administrativeData = buildAdministrativeData(data);
export let regions = administrativeData.regionsWithSeats;
export let seats: SeatRecord[] = administrativeData.seats;
export let counties: CountyRecord[] = administrativeData.counties;
export let administrativeAffiliationIds = regions.map(({ id }) => id);
export let topLevelSeats = seats.filter(({ unit, region }) => unit.parentId === region.id);

export function initializeData(runtimeIndex: RuntimeIndex) {
  data = runtimeIndex;
  administrativeData = buildAdministrativeData(data);
  regions = administrativeData.regionsWithSeats;
  seats = administrativeData.seats;
  counties = administrativeData.counties;
  administrativeAffiliationIds = regions.map(({ id }) => id);
  topLevelSeats = seats.filter(({ unit, region }) => unit.parentId === region.id);
}

export const getTopLevelUnitId = (unitId: string | null) =>
  findTopLevelUnitId(administrativeData.unitsById, unitId);
export const getAdministrativeRegionId = (unitId: string | null) =>
  findAdministrativeRegionId(administrativeData.unitsById, unitId);
export const getUnitRegionId = (unitId: string | null) =>
  seats.find(({ unit }) => unit.id === unitId)?.region.id ?? null;
export const isDescendantOf = (unitId: string, ancestorId: string) => {
  let current = administrativeData.unitsById.get(unitId);
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    current = administrativeData.unitsById.get(current.parentId);
  }
  return false;
};
export const getRegionSummary = (regionId: string | null) => summarizeRegion(seats, regionId);

export function getRecordSourceIds(record: SeatRecord | CountyRecord | MilitaryRecord | JimiRecord) {
  return new Set([
    ...(record.unit.sourceIds ?? record.unit.sources?.map((source) => source.sourceId) ?? []),
    ...(record.place.sourceIds ?? record.place.sources?.map((source) => source.sourceId) ?? []),
  ]);
}

export function getSources(
  record: SeatRecord | CountyRecord | MilitaryRecord | JimiRecord,
  sources: Source[],
) {
  const ids = getRecordSourceIds(record);
  return sources.filter((source) => ids.has(source.id));
}
