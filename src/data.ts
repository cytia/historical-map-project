import projectData from "../data/project.json";
import type { CountyRecord, ProjectData, SeatRecord } from "./types";
import { buildAdministrativeData, findTopLevelUnitId, summarizeRegion } from "./administrativeData";

export const data = projectData as ProjectData;

const administrativeData = buildAdministrativeData(data);
export const regions = administrativeData.regionsWithSeats;
export const seats: SeatRecord[] = administrativeData.seats;
export const counties: CountyRecord[] = administrativeData.counties;
export const administrativeAffiliationIds = regions.map(({ id }) => id);
export const topLevelSeats = seats.filter(({ unit, region }) => unit.parentId === region.id);
export const getTopLevelUnitId = (unitId: string | null) =>
  findTopLevelUnitId(administrativeData.unitsById, unitId);
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
export const getStatistics = (unitId: string) =>
  data.statistics.filter((record) => record.administrativeUnitId === unitId);
export const getRegionSummary = (regionId: string | null) => summarizeRegion(seats, regionId);

export function getSources(record: SeatRecord | CountyRecord): ProjectData["sources"] {
  const ids = new Set([
    ...record.unit.sources.map((source) => source.sourceId),
    ...record.place.sources.map((source) => source.sourceId),
  ]);
  return data.sources.filter((source) => ids.has(source.id));
}
