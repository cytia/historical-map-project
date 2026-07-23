export type Confidence = "high" | "medium" | "low";
export type UnitDomain = "administrative" | "military" | "special-governance";
export type HierarchyScope = "overview" | "unit" | "domain";
export type AdministrativeDisplayScope = HierarchyScope;
export type MapDisplayMode = "administrative" | "jurisdiction" | "control";
export type MilitaryColorMode = "administrative" | "military";
export type SelectionDomain = "administrative" | "military";
export type MilitaryUnitKind = "dusi" | "xing-dusi" | "liushou-si" | "wei" | "qianhu-suo" | "suo";

export interface SourceLink {
  sourceId: string;
  claim: string;
  confidence: Confidence;
  note?: string;
}

export interface Source {
  id: string;
  title: string;
  creator?: string;
  citation: string;
  license: string;
  url?: string;
}

export interface AdministrativeUnit {
  id: string;
  name: string;
  formalName?: string;
  level: "capital-region" | "province" | "prefecture" | "department" | "county" | "military";
  domain?: UnitDomain;
  militaryKind?: MilitaryUnitKind;
  fiveArmyId?: "central" | "left" | "right" | "front" | "rear";
  polityId: string;
  parentId?: string;
  seatPlaceId?: string;
  confidence: Confidence;
  sources: SourceLink[];
}

export interface MilitaryUnit {
  id: string;
  name: string;
  formalName?: string;
  level: "military";
  domain: "military";
  militaryKind: MilitaryUnitKind;
  polityId: string;
  seatPlaceId?: string;
  confidence: Confidence;
  sources: SourceLink[];
}

export type HistoricalRelationType =
  | "military-subordination"
  | "military-affiliation"
  | "five-army-affiliation"
  | "administrative-context"
  | "co-location";

export interface HistoricalRelation {
  id: string;
  relationType: HistoricalRelationType;
  subjectId: string;
  objectId: string;
  confidence: Confidence;
  note?: string;
  sources: SourceLink[];
}

export interface Place {
  id: string;
  longitude?: number;
  latitude?: number;
  locationAccuracy: "exact" | "approximate" | "area_only" | "disputed" | "unknown";
  locationMethod?: string;
  confidence: Confidence;
  sources: SourceLink[];
}

export interface PlaceName {
  id: string;
  placeId: string;
  name: string;
}

export interface ProjectData {
  sources: Source[];
  scopeStatistics: ScopeStatisticRecord[];
  statistics: StatisticRecord[];
  administrativeUnits: AdministrativeUnit[];
  militaryUnits: MilitaryUnit[];
  relations: HistoricalRelation[];
  places: Place[];
  placeNames: PlaceName[];
}

export interface StatisticFields {
  id: string;
  category: "population" | "tax";
  metric: "households" | "registered-population" | "registered-land" | "summer-tax" | "autumn-grain" | "silver";
  value: number;
  unit: "households" | "people" | "qing" | "shi" | "liang";
  originalText?: string;
  recordedYear: number | null;
  valueType: "recorded" | "estimated";
  confidence: Confidence;
  sources: SourceLink[];
}

export interface StatisticRecord extends StatisticFields {
  administrativeUnitId: string;
}

export type ScopeStatisticRecord = StatisticFields;

export interface SeatRecord {
  unit: AdministrativeUnit;
  place: Place;
  name: string;
  region: AdministrativeUnit;
}

export interface CountyRecord {
  unit: AdministrativeUnit;
  place: Place;
  name: string;
  parent: AdministrativeUnit;
  region: AdministrativeUnit;
}

export interface MilitaryRecord {
  unit: MilitaryUnit;
  place: Place;
  name: string;
  administrativeRegionId: string | null;
  administrativeUnitId: string | null;
  militaryParentId: string | null;
  fiveArmyId?: "central" | "left" | "right" | "front" | "rear";
}
