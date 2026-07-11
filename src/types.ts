export type Confidence = "high" | "medium" | "low";

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
  level: "capital-region" | "province" | "prefecture" | "department";
  parentId?: string;
  seatPlaceId?: string;
  confidence: Confidence;
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
  administrativeUnits: AdministrativeUnit[];
  places: Place[];
  placeNames: PlaceName[];
}

export interface SeatRecord {
  unit: AdministrativeUnit;
  place: Place;
  name: string;
}

