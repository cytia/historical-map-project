"""Compare provincial shapes against the seats they must contain.

Two checks, both derived from the project's own data rather than an external boundary set:

- A prefecture or department seat outside its own province's shape proves that edge wrong,
  since a province contains its seats at minimum.
- The convex hull of a province's seats is a lower bound on its extent, so a shape much
  larger than its hull claims ground no recorded seat supports.

Neither check proves a boundary correct. Passing both only means nothing contradicts it.
Run before and after correcting a shape; the outside-seat count should reach zero.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from shapely.geometry import MultiPoint, Point, shape

# Tolerance for a seat sitting essentially on the line. Seats are approximate proxies, so a
# near-miss is not evidence of a wrong edge.
EDGE_TOLERANCE_DEGREES = 0.05
SEAT_LEVELS = {"prefecture", "department"}
HULL_RATIO_REPORT_THRESHOLD = 1.25


def top_level_unit(unit_id: str, units: dict[str, dict]) -> str:
    seen: set[str] = set()
    current = unit_id
    while current in units and units[current].get("parentId") and current not in seen:
        seen.add(current)
        current = units[current]["parentId"]
    return current


def seats_by_province(index: dict, levels: set[str]) -> dict[str, list[tuple[str, Point]]]:
    units = {unit["id"]: unit for unit in index["administrativeUnits"]}
    places = {place["id"]: place for place in index["places"]}
    grouped: dict[str, list[tuple[str, Point]]] = {}
    for unit in index["administrativeUnits"]:
        if unit.get("level") not in levels:
            continue
        place = places.get(unit.get("seatPlaceId") or "")
        if not place or place.get("longitude") is None:
            continue
        province = top_level_unit(unit["id"], units)
        grouped.setdefault(province, []).append(
            (unit["name"], Point(place["longitude"], place["latitude"]))
        )
    return grouped


def audit(index_path: Path, baseline_path: Path) -> int:
    index = json.loads(index_path.read_text(encoding="utf-8"))
    baseline = json.loads(baseline_path.read_text(encoding="utf-8"))
    shapes = {
        feature["properties"]["unitId"]: shape(feature["geometry"])
        for feature in baseline["features"]
    }
    seats = seats_by_province(index, SEAT_LEVELS)
    hull_seats = seats_by_province(index, SEAT_LEVELS | {"county"})

    outside_total = 0
    print("province   seats  outside   area  hull  ratio")
    for unit_id in sorted(shapes):
        geometry = shapes[unit_id]
        province_seats = seats.get(unit_id, [])
        tolerant = geometry.buffer(EDGE_TOLERANCE_DEGREES)
        outside = [name for name, point in province_seats if not tolerant.contains(point)]
        outside_total += len(outside)
        hull_points = [point for _, point in hull_seats.get(unit_id, [])]
        hull = MultiPoint(hull_points).convex_hull if len(hull_points) >= 3 else None
        ratio = geometry.area / hull.area if hull is not None and hull.area > 0 else float("nan")
        print(
            f"{unit_id:10} {len(province_seats):5} {len(outside):8}"
            f" {geometry.area:6.2f} {hull.area if hull is not None else 0:5.2f} {ratio:5.2f}x"
        )
        for name, point in ((n, p) for n, p in province_seats if n in outside):
            print(f"           outside: {name} @ {point.x:.2f},{point.y:.2f}")
        if ratio == ratio and ratio > HULL_RATIO_REPORT_THRESHOLD:
            print(f"           claims {ratio:.2f}x its seat hull; check for over-extent")

    print(f"\n{outside_total} seat(s) outside their own province")
    return outside_total


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--index", type=Path, default=Path("data/.generated/runtime-index.json"))
    parser.add_argument(
        "--baseline", type=Path, default=Path("public/reference/province-baseline.geojson")
    )
    args = parser.parse_args()
    audit(args.index, args.baseline)


if __name__ == "__main__":
    main()
