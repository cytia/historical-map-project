"""Adjudicate the modern counties left inside holes in the assembled mosaic.

These counties hold no Ming seat, so the seat rule cannot assign them, and they are
touched by more than one unit, so enclosure cannot either. Two weak signals are available,
and they fail in different places:

- **Adjacency**: which unit contributes most of the county's perimeter. Measures how far a
  county is surrounded, not who held it, and it points the wrong way exactly where
  province edges interlock — a 0.69 share favours 湖广 for 白河县, which belonged to
  陝西興安州.
- **Nearest seat**: the province of the closest recorded Ming seat. Assumes a county's
  ground fell to the nearest administrative centre, which fails where a seat sits across a
  watershed or where the nearest seat is 90 km away.

Neither is evidence on its own. But they are independent — one derives from the assembled
polygons, the other from the seat points — so where both land on the same province the
assignment rests on two unrelated grounds rather than one, and 白河县, the case that
defeats adjacency, is resolved correctly by nearest seat.

So agreement is treated as sufficient to assign, and disagreement is left for documentary
review. This is a working assignment for a draft boundary, not a finding about Ming
administrative geography: every county assigned here should still be checked against the
geography treatises before the extent it belongs to leaves `reconstructed`.
"""

from __future__ import annotations

import argparse
import glob
import json
from pathlib import Path

from shapely.geometry import Point, shape
from shapely.ops import unary_union

CONTACT_BUFFER_DEGREES = 0.001
DEGREE_KM = 111.0

# Beyond this the nearest seat is too far to say the ground fell to it, so agreement with
# adjacency is treated as coincidence rather than corroboration.
NEAREST_SEAT_LIMIT_KM = 60.0


def province_of(unit_id: str, units: dict[str, dict]) -> str:
    seen: set[str] = set()
    current = unit_id
    while current in units and units[current].get("parentId") and current not in seen:
        seen.add(current)
        current = units[current]["parentId"]
    return current


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--index", type=Path, default=Path("data/.generated/runtime-index.json")
    )
    parser.add_argument(
        "--provinces", type=Path, default=Path("../Map-Boundary/build/1600/civil")
    )
    parser.add_argument(
        "--counties",
        type=Path,
        default=Path("../Map-Boundary/build/1600/_review-counties-in-holes.geojson"),
    )
    parser.add_argument(
        "--out", type=Path, default=Path("tools/reference/hole-county-assignments.json")
    )
    parser.add_argument(
        "--review-out",
        type=Path,
        default=Path("tools/reference/hole-county-review.md"),
    )
    arguments = parser.parse_args()

    index = json.loads(arguments.index.read_text(encoding="utf-8"))
    units = {unit["id"]: unit for unit in index["administrativeUnits"]}
    places = {place["id"]: place for place in index["places"]}

    seats = []
    for unit in index["administrativeUnits"]:
        place = places.get(unit.get("seatPlaceId") or "")
        if place and place.get("longitude") is not None:
            seats.append(
                (unit, Point(place["longitude"], place["latitude"]))
            )

    province_shapes: dict[str, object] = {}
    province_names: dict[str, str] = {}
    for path in sorted(glob.glob(str(arguments.provinces / "*.geojson"))):
        feature = json.loads(Path(path).read_text(encoding="utf-8"))["features"][0]
        unit_id = feature["properties"]["unitId"]
        province_shapes[unit_id] = shape(feature["geometry"])
        province_names[unit_id] = feature["properties"]["unitName"]

    assigned, contested = [], []
    for feature in json.loads(arguments.counties.read_text(encoding="utf-8"))["features"]:
        county = shape(feature["geometry"])
        name = feature["properties"]["modernCounty"] or feature["properties"]["modernCountyId"]

        perimeter = county.boundary
        contact: dict[str, float] = {}
        for unit_id, geometry in province_shapes.items():
            shared = perimeter.intersection(geometry.buffer(CONTACT_BUFFER_DEGREES))
            if not shared.is_empty:
                contact[unit_id] = contact.get(unit_id, 0.0) + shared.length
        total = sum(contact.values())
        ranked = sorted(contact.items(), key=lambda item: -item[1])
        adjacency_winner = ranked[0][0] if ranked else None
        adjacency_share = (ranked[0][1] / total) if ranked and total else 0.0

        centroid = county.centroid
        distance, position = min(
            (centroid.distance(point) * DEGREE_KM, index_position)
            for index_position, (_, point) in enumerate(seats)
        )
        nearest_unit = seats[position][0]
        nearest_province = province_of(nearest_unit["id"], units)

        record = {
            "county": name,
            "countyId": feature["properties"]["modernCountyId"],
            "adjacencyWinner": adjacency_winner,
            "adjacencyShare": round(adjacency_share, 3),
            "nearestSeat": nearest_unit["name"],
            "nearestSeatProvince": nearest_province,
            "nearestSeatKm": round(distance, 1),
        }

        agrees = (
            adjacency_winner is not None
            and adjacency_winner == nearest_province
            and distance <= NEAREST_SEAT_LIMIT_KM
        )
        if agrees:
            record["assignTo"] = adjacency_winner
            record["basis"] = "adjacency and nearest seat agree"
            assigned.append(record)
        else:
            if adjacency_winner is None:
                record["reason"] = "no assembled unit touches this county"
            elif distance > NEAREST_SEAT_LIMIT_KM:
                record["reason"] = (
                    f"nearest seat {distance:.0f} km away, too far to corroborate"
                )
            else:
                record["reason"] = (
                    f"adjacency points at {province_names.get(adjacency_winner, adjacency_winner)}, "
                    f"nearest seat at {province_names.get(nearest_province, nearest_province)}"
                )
            contested.append(record)

    payload = {
        "description": (
            "Working assignments for modern counties inside mosaic holes. Assigned where "
            "adjacency and nearest seat independently agree; contested entries need "
            "documentary review. Not a finding about Ming administrative geography."
        ),
        "generatedOn": "2026-08-14",
        "nearestSeatLimitKm": NEAREST_SEAT_LIMIT_KM,
        "assigned": assigned,
        "contested": contested,
    }
    arguments.out.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    lines = ["# 孔洞内现代县归属裁决", ""]
    lines.append(
        "这些县内无明代治所，无法由治所规则认领；又被两个以上单位接触，无法由包围关系认领。"
        "可用的两个信号各有失效场景，但彼此独立：**接壤占比**来自拼装出的多边形，"
        "**最近治所**来自治所点。"
    )
    lines.append("")
    lines.append(
        "两者一致时，归属有两条互不相关的依据支撑，据此自动判定；"
        f"不一致、或最近治所超过 {NEAREST_SEAT_LIMIT_KM:.0f} 公里者进入人工复核。"
    )
    lines.append("")
    lines.append(
        "**这是草稿边界的工作性归属，不是史学结论。** 白河县是关键校验：接壤占比 0.69 "
        "指向湖广（错误），最近治所指向陕西（正确，属兴安州）——说明单一信号不可靠，"
        "而两者一致时可信度显著提高。所有自动判定项在该几何脱离 `reconstructed` 之前，"
        "仍须按地理志复核。"
    )
    lines.append("")
    lines.append(f"自动判定 {len(assigned)} 个，待复核 {len(contested)} 个。")
    lines.append("")
    lines.append("## 待复核")
    lines.append("")
    lines.append("| 现代县 | 接壤占优 | 占比 | 最近治所 | 所属省 | 距离 | 原因 |")
    lines.append("| --- | --- | ---: | --- | --- | ---: | --- |")
    for record in sorted(contested, key=lambda item: -item["nearestSeatKm"]):
        lines.append(
            f"| {record['county']} "
            f"| {province_names.get(record['adjacencyWinner'], '—')} "
            f"| {record['adjacencyShare']:.2f} "
            f"| {record['nearestSeat']} "
            f"| {province_names.get(record['nearestSeatProvince'], record['nearestSeatProvince'])} "
            f"| {record['nearestSeatKm']:.0f} km | {record['reason']} |"
        )
    lines.append("")
    lines.append("## 自动判定")
    lines.append("")
    lines.append("| 现代县 | 归属 | 接壤占比 | 最近治所 | 距离 |")
    lines.append("| --- | --- | ---: | --- | ---: |")
    for record in sorted(assigned, key=lambda item: item["assignTo"]):
        lines.append(
            f"| {record['county']} | {province_names.get(record['assignTo'])} "
            f"| {record['adjacencyShare']:.2f} | {record['nearestSeat']} "
            f"| {record['nearestSeatKm']:.0f} km |"
        )
    lines.append("")
    arguments.review_out.write_text("\n".join(lines), encoding="utf-8")

    print(f"assigned  {len(assigned)}")
    print(f"contested {len(contested)}")
    print(f"wrote {arguments.out}")
    print(f"wrote {arguments.review_out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
