import projectData from "../data/project.json";
import type { ProjectData, SeatRecord } from "./types";

export const data = projectData as ProjectData;

export const nanjingUnit = data.administrativeUnits.find(
  (unit) => unit.id === "nanjing",
);

export const seats: SeatRecord[] = data.administrativeUnits
  .filter((unit) => unit.parentId === "nanjing" && unit.seatPlaceId)
  .flatMap((unit) => {
    const place = data.places.find((candidate) => candidate.id === unit.seatPlaceId);
    const placeName = data.placeNames.find(
      (candidate) => candidate.placeId === unit.seatPlaceId,
    );

    if (!place || !placeName || place.longitude === undefined || place.latitude === undefined) {
      return [];
    }

    return [{ unit, place, name: placeName.name }];
  });

export function getSources(record: SeatRecord): ProjectData["sources"] {
  const ids = new Set([
    ...record.unit.sources.map((source) => source.sourceId),
    ...record.place.sources.map((source) => source.sourceId),
  ]);
  return data.sources.filter((source) => ids.has(source.id));
}

