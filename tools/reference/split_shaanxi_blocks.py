"""Cut the overlapping Shaanxi-area blocks into a first-draft split.

The baseline gives 陕西, 陕西行都司, 洮州卫 and 岷州卫 the same placeholder outline, because
Natural Earth has no unit matching any of the Ming ones. Dragging vertices apart by hand from
four identical copies is impractical, so this script produces a starting split by assigning
each piece of ground to the nearest seat of the units that claim it.

The result is a DRAFT, not a boundary. Nearest-seat assignment is exactly the Voronoi-style
interpolation that `.private-docs/boundary-reconstruction.md` forbids recording as a
historical boundary. Its only purpose is to give the manual QGIS work a workable starting
shape whose edges sit roughly where the sources say they should. Every edge still has to be
moved onto the terrain and textual evidence before it becomes a geometry record.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from shapely.geometry import Point, shape, mapping
from shapely.ops import unary_union

# Blocks that currently share one placeholder outline, with the seats that anchor each.
# 洮州卫 and 岷州卫 are 軍民指揮使司 holding their own territory (明史 vol.42); the Hexi
# garrisons under 陕西行都司 hold the corridor.
TARGET_BLOCKS = ("shaanxi", "shaanxi-xing-dusi", "taozhou-wei-shaanxi", "minzhou-wei-shaanxi")


def seats_by_block(index: dict) -> dict[str, list[Point]]:
    places = {p["id"]: p for p in index["places"]}
    military = {m["id"]: m for m in index["militaryUnits"]}
    units = {u["id"]: u for u in index["administrativeUnits"]}

    def seat_of(record: dict | None) -> Point | None:
        if not record:
            return None
        place = places.get(record.get("seatPlaceId") or "")
        if not place or place.get("longitude") is None:
            return None
        return Point(place["longitude"], place["latitude"])

    grouped: dict[str, list[Point]] = {block: [] for block in TARGET_BLOCKS}

    # 陕西行都司 is anchored by every garrison reporting to it.
    for relation in index["relations"]:
        if (
            relation.get("objectId") == "shaanxi-xing-dusi"
            and relation["relationType"] == "military-subordination"
        ):
            point = seat_of(military.get(relation["subjectId"]))
            if point:
                grouped["shaanxi-xing-dusi"].append(point)

    for block in ("taozhou-wei-shaanxi", "minzhou-wei-shaanxi"):
        point = seat_of(military.get(block))
        if point:
            grouped[block].append(point)
    # 西固城守禦軍民千戶所 is subordinate to 岷州卫 and anchors its southern reach.
    xigu = seat_of(military.get("xigu-cheng-qianhusuo-shaanxi"))
    if xigu:
        grouped["minzhou-wei-shaanxi"].append(xigu)

    # 陕西 keeps every civil seat that the province administers.
    def top_level(unit_id: str) -> str:
        seen: set[str] = set()
        current = unit_id
        while current in units and units[current].get("parentId") and current not in seen:
            seen.add(current)
            current = units[current]["parentId"]
        return current

    for unit in index["administrativeUnits"]:
        if top_level(unit["id"]) != "shaanxi":
            continue
        point = seat_of(unit)
        if point:
            grouped["shaanxi"].append(point)

    return grouped


def split(baseline_path: Path, index_path: Path, output: Path) -> None:
    baseline = json.loads(baseline_path.read_text(encoding="utf-8"))
    index = json.loads(index_path.read_text(encoding="utf-8"))
    grouped = seats_by_block(index)

    features = {f["properties"]["unitId"]: f for f in baseline["features"]}
    contested = unary_union([shape(features[b]["geometry"]) for b in TARGET_BLOCKS])

    # Walk a grid over the contested ground and give each cell to the block whose nearest
    # seat is closest. A grid keeps the operation simple and its coarseness honest: the
    # output is meant to be redrawn, not measured.
    #
    # Ground further than this from every seat is left unassigned. Without the cutoff the
    # nearest-seat rule has no way to answer "nobody", and the Qinghai interior — which the
    # 四至 describe as 生番界, beyond the reach of the administration — gets swallowed by
    # whichever block happens to be least far away.
    max_reach_degrees = 1.8
    step = 0.05
    minx, miny, maxx, maxy = contested.bounds
    assigned: dict[str, list] = {block: [] for block in TARGET_BLOCKS}
    y = miny
    while y < maxy:
        x = minx
        while x < maxx:
            cell_centre = Point(x + step / 2, y + step / 2)
            if contested.contains(cell_centre):
                distances = {
                    b: min((cell_centre.distance(p) for p in grouped[b]), default=float("inf"))
                    for b in TARGET_BLOCKS
                }
                best = min(TARGET_BLOCKS, key=lambda b: distances[b])
                if distances[best] <= max_reach_degrees:
                    from shapely.geometry import box

                    assigned[best].append(box(x, y, x + step, y + step))
            x += step
        y += step

    for block in TARGET_BLOCKS:
        if not assigned[block]:
            continue
        piece = unary_union(assigned[block]).intersection(contested)
        features[block]["geometry"] = mapping(piece)
        features[block]["properties"]["status"] = "draft-split"
        features[block]["properties"]["correctionNote"] = (
            "DRAFT nearest-seat split, not a boundary. Every edge must be redrawn against "
            "terrain and the 四至 in 讀史方輿紀要 vol.60 before this becomes a geometry record. "
            + features[block]["properties"].get("correctionNote", "")
        )

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(baseline, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print(f"wrote draft split to {output}")
    for block in TARGET_BLOCKS:
        print(f"  {block:24} area={shape(features[block]['geometry']).area:7.2f}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--baseline", type=Path, default=Path("public/reference/province-baseline.geojson")
    )
    parser.add_argument("--index", type=Path, default=Path("data/.generated/runtime-index.json"))
    parser.add_argument(
        "--output", type=Path, default=Path(".reference-work/qgis/provinces-edit.geojson")
    )
    args = parser.parse_args()
    split(args.baseline, args.index, args.output)


if __name__ == "__main__":
    main()
