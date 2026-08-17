"""Match each Ming administrative unit to the modern county its seat falls in.

The correspondence table this produces is the input to boundary assembly: a Ming
prefecture is reconstructed as the union of the modern counties its subordinate
units occupy, so the boundary comes from an authoritative dataset rather than from
freehand tracing.

A seat point is only evidence for the unit whose seat it is. Falling inside a modern
county says the historical seat sat on ground that county now covers; it does not say
the historical unit and the modern county had the same extent. The table is a starting
assignment for review, not a finding.

Seats near a modern boundary are reported separately: the seat is an approximate proxy,
so a point within the tolerance of an edge cannot decide between the two counties.

Source of the modern boundaries: geoBoundaries CHN ADM2 (ODC PDDL 1.0, public domain
dedication), representing 2017 county-level divisions in EPSG:4326.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path

from shapely.geometry import Point, shape
from shapely.prepared import prep
from shapely.strtree import STRtree

# A seat closer than this to a county edge cannot be assigned from the point alone.
# Seats are approximate proxies, so the ambiguity is in the input, not the geometry.
EDGE_TOLERANCE_DEGREES = 0.02

# Levels that hold territory and therefore participate in boundary assembly.
TERRITORIAL_LEVELS = {"prefecture", "department", "county"}


def top_level_unit(unit_id: str, units: dict[str, dict]) -> str:
    """Walk parentId to the province or capital region holding this unit."""
    seen: set[str] = set()
    current = unit_id
    while current in units and units[current].get("parentId") and current not in seen:
        seen.add(current)
        current = units[current]["parentId"]
    return current


def load_modern_counties(path: Path) -> list[dict]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    counties = []
    for feature in raw["features"]:
        geometry = shape(feature["geometry"])
        if not geometry.is_valid:
            geometry = geometry.buffer(0)
        properties = feature.get("properties", {})
        counties.append(
            {
                "name": properties.get("shapeName", ""),
                "id": properties.get("shapeID", ""),
                "geometry": geometry,
            }
        )
    return counties


def build_index(counties: list[dict]) -> tuple[STRtree, list[dict]]:
    tree = STRtree([county["geometry"] for county in counties])
    for county in counties:
        county["prepared"] = prep(county["geometry"])
    return tree, counties


def match_seat(point: Point, tree: STRtree, counties: list[dict]) -> tuple[dict | None, bool]:
    """Return the containing county and whether the seat sits near its edge."""
    candidates = tree.query(point)
    for position in candidates:
        county = counties[int(position)]
        if county["prepared"].contains(point):
            # `boundary` covers MultiPolygon islands and interior rings alike; `exterior`
            # exists only on a single Polygon and misses both.
            near_edge = county["geometry"].boundary.distance(point) < EDGE_TOLERANCE_DEGREES
            return county, near_edge
    return None, False


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--index",
        type=Path,
        default=Path("data/.generated/runtime-index.json"),
        help="Assembled runtime index holding units and places",
    )
    parser.add_argument(
        "--counties",
        type=Path,
        default=Path(".reference-work/adm2/geoBoundaries-CHN-ADM2.geojson"),
        help="geoBoundaries CHN ADM2 GeoJSON",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(".reference-work/seat-county-correspondence.json"),
        help="Where to write the correspondence table",
    )
    arguments = parser.parse_args()

    index = json.loads(arguments.index.read_text(encoding="utf-8"))
    units = {unit["id"]: unit for unit in index["administrativeUnits"]}
    places = {place["id"]: place for place in index["places"]}

    counties = load_modern_counties(arguments.counties)
    tree, counties = build_index(counties)

    matched: list[dict] = []
    unmatched: list[dict] = []
    near_edge: list[dict] = []
    no_seat: list[dict] = []

    for unit in index["administrativeUnits"]:
        if unit.get("level") not in TERRITORIAL_LEVELS:
            continue
        place = places.get(unit.get("seatPlaceId") or "")
        if not place or place.get("longitude") is None:
            no_seat.append({"unit": unit["name"], "unitId": unit["id"]})
            continue

        point = Point(place["longitude"], place["latitude"])
        county, edge_flag = match_seat(point, tree, counties)
        province = top_level_unit(unit["id"], units)

        record = {
            "unitId": unit["id"],
            "unit": unit["name"],
            "level": unit["level"],
            "province": units.get(province, {}).get("name", province),
            "parentId": unit.get("parentId"),
            "seatPlaceId": place["id"],
            "longitude": place["longitude"],
            "latitude": place["latitude"],
            "confidence": place.get("confidence"),
            "locationAccuracy": place.get("locationAccuracy"),
        }

        if county is None:
            unmatched.append(record)
            continue

        record["modernCounty"] = county["name"]
        record["modernCountyId"] = county["id"]
        matched.append(record)
        if edge_flag:
            near_edge.append(record)

    # A modern county claimed by several Ming units is expected where the modern unit is
    # larger, but it means the assembly cannot assign that county by seat alone.
    claims: dict[str, list[str]] = defaultdict(list)
    for record in matched:
        claims[record["modernCountyId"]].append(record["unit"])
    contested = {
        county_id: names for county_id, names in claims.items() if len(names) > 1
    }

    total = len(matched) + len(unmatched)
    output = {
        "generatedFrom": {
            "index": str(arguments.index),
            "counties": str(arguments.counties),
            "countySource": "geoBoundaries CHN ADM2, ODC PDDL 1.0, 2017 divisions",
            "edgeToleranceDegrees": EDGE_TOLERANCE_DEGREES,
        },
        "summary": {
            "unitsConsidered": total,
            "matched": len(matched),
            "unmatched": len(unmatched),
            "nearEdge": len(near_edge),
            "unitsWithoutSeat": len(no_seat),
            "contestedModernCounties": len(contested),
            "distinctModernCounties": len(claims),
        },
        "matched": matched,
        "unmatched": unmatched,
        "nearEdge": near_edge,
        "unitsWithoutSeat": no_seat,
        "contested": contested,
    }
    arguments.out.parent.mkdir(parents=True, exist_ok=True)
    arguments.out.write_text(
        json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"units considered      {total}")
    print(f"  matched             {len(matched)}")
    print(f"  unmatched           {len(unmatched)}")
    print(f"  near a modern edge  {len(near_edge)}")
    print(f"units without a seat  {len(no_seat)}")
    print(f"distinct counties     {len(claims)}")
    print(f"contested counties    {len(contested)}")
    print()
    by_level = Counter(record["level"] for record in matched)
    for level, count in sorted(by_level.items()):
        print(f"  matched {level}: {count}")
    if unmatched:
        print("\nunmatched units:")
        for record in unmatched[:20]:
            print(
                f"  {record['province']} {record['unit']} "
                f"({record['longitude']:.4f}, {record['latitude']:.4f})"
            )
        if len(unmatched) > 20:
            print(f"  ... and {len(unmatched) - 20} more")
    print(f"\nwrote {arguments.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
