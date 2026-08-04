import runtimeIndexUrl from "../data/.generated/runtime-index.json?url";
import militaryStatisticsUrl from "../data/statistics/military.json?url";
import scopeStatisticsUrl from "../data/statistics/scope.json?url";
import sourcesUrl from "../data/catalog/sources.json?url";
import type {
  JimiUnit,
  MilitaryStatistic,
  RuntimeIndex,
  ScopeStatisticRecord,
  Source,
  StatisticRecord,
} from "./types";

const statisticUrls = import.meta.glob("../data/statistics/*.json", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

const cache = new Map<string, Promise<unknown>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSource(value: unknown): value is Source {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.citation === "string" &&
    typeof value.license === "string";
}

function hasStatisticFields(value: unknown) {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.metric === "string" &&
    typeof value.value === "number" &&
    (value.recordedYear === null || typeof value.recordedYear === "number") &&
    Array.isArray(value.sources);
}

function isStatistic(value: unknown): value is ScopeStatisticRecord {
  return hasStatisticFields(value);
}

function isRegionStatistic(value: unknown): value is StatisticRecord {
  return hasStatisticFields(value) &&
    isRecord(value) &&
    typeof value.administrativeUnitId === "string";
}

function isMilitaryStatistic(value: unknown): value is MilitaryStatistic {
  return hasStatisticFields(value) &&
    isRecord(value) &&
    typeof value.militaryUnitId === "string" &&
    typeof value.measureType === "string";
}

function isJimiUnit(value: unknown): value is JimiUnit {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.jimiKind === "string" &&
    typeof value.officeKind === "string";
}

function hasStrings(value: unknown, fields: string[]) {
  return isRecord(value) && fields.every((field) => typeof value[field] === "string");
}

async function fetchJson(url: string, label: string) {
  const cached = cache.get(url);
  if (cached) return cached;
  const request = fetch(url).then(async (response) => {
    if (!response.ok) throw new Error(`Unable to load ${label} (${response.status})`);
    return response.json() as Promise<unknown>;
  });
  cache.set(url, request);
  return request;
}

async function fetchCollection<T>(
  url: string,
  label: string,
  validate: (value: unknown) => value is T,
): Promise<T[]> {
  const value = await fetchJson(url, label);
  if (!Array.isArray(value) || !value.every(validate)) {
    throw new Error(`Invalid ${label} runtime data`);
  }
  return value as T[];
}

export async function loadRuntimeIndex(): Promise<RuntimeIndex> {
  const value = await fetchJson(runtimeIndexUrl, "runtime index");
  if (!isRecord(value) || value.schemaVersion !== 1 ||
    typeof value.sourceCount !== "number" ||
    !Array.isArray(value.administrativeUnits) ||
    !Array.isArray(value.militaryUnits) ||
    !Array.isArray(value.jimiUnits) ||
    !Array.isArray(value.relations) ||
    !Array.isArray(value.places) ||
    !Array.isArray(value.placeNames) ||
    !value.administrativeUnits.every((item) => hasStrings(item, ["id", "name", "level"])) ||
    !value.militaryUnits.every((item) => hasStrings(item, ["id", "name", "militaryKind"])) ||
    !value.jimiUnits.every(isJimiUnit) ||
    !value.relations.every((item) =>
      hasStrings(item, ["id", "relationType", "subjectId", "objectId"])) ||
    !value.places.every((item) => hasStrings(item, ["id", "locationAccuracy", "confidence"])) ||
    !value.placeNames.every((item) => hasStrings(item, ["id", "placeId", "name"]))) {
    throw new Error("Invalid runtime index");
  }
  return value as unknown as RuntimeIndex;
}

export function loadSources() {
  return fetchCollection(sourcesUrl, "source catalog", isSource);
}

export function loadRegionStatistics(regionId: string | null) {
  if (regionId === null) {
    return fetchCollection(scopeStatisticsUrl, "scope statistics", isStatistic);
  }
  const key = `../data/statistics/${regionId}.json`;
  const url = statisticUrls[key];
  if (!url) return Promise.resolve([]);
  return fetchCollection(url, `${regionId} statistics`, isRegionStatistic);
}

export function loadMilitaryStatistics() {
  return fetchCollection(militaryStatisticsUrl, "military statistics", isMilitaryStatistic);
}
