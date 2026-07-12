import projectData from "../data/project.json";
import type { ProjectData, SeatRecord } from "./types";
import { buildAdministrativeData, summarizeRegion } from "./administrativeData";

export const data = projectData as ProjectData;

const administrativeData = buildAdministrativeData(data);
export const regions = administrativeData.regionsWithSeats;
export const seats: SeatRecord[] = administrativeData.seats;
export const getRegionSummary = (regionId: string | null) => summarizeRegion(seats, regionId);

export function getSources(record: SeatRecord): ProjectData["sources"] {
  const ids = new Set([
    ...record.unit.sources.map((source) => source.sourceId),
    ...record.place.sources.map((source) => source.sourceId),
  ]);
  return data.sources.filter((source) => ids.has(source.id));
}
