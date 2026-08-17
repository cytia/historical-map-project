"""Screen military units for the ones that plausibly held territory (實土).

Ming garrisons divide into two kinds. A garrison established in frontier ground with no
prefecture or county inside its area administered land and people, and belongs in the
seamless mosaic alongside the provinces. A garrison stationed inside an existing county
governed soldiers rather than ground, and carries no polygon at all — only its seat.

The institution type does not decide this. 貴州都司 and 陝西行都司 are both `dusi`, but
the first sat inside civil territory and the second held the Hexi Corridor.

What the recorded data can show is where a seat sits relative to the civil mosaic. A seat
outside every province is on ground no prefecture claimed, which is the situation a 實土
unit is in. A seat inside a province is where a 非實土 garrison would be. That is evidence
about the seat, not a finding about the unit: a frontier garrison's seat can fall just
inside a neighbouring province, and a unit assembled from few counties may leave its own
seat outside the drafted mosaic.

So this produces candidates to be confirmed against the geography treatises, not a
classification. Distance from the mosaic edge is reported because a seat far outside is
harder to explain as an artefact than one sitting a kilometre beyond the line.

A second measure is reported alongside it: the distance from each seat to the nearest
civil seat of any prefecture, department or county. The criterion the literature states
for 實土 is whether prefectures and counties existed inside the garrison's area, so the
civil seats are what that question is actually about, and unlike the mosaic they are
recorded source data rather than a drafting product. Where the two measures disagree the
civil-seat distance is the one to trust: a garrison can sit far outside a draft edge and
still be ringed by county seats, which is 非實土 however the mosaic happens to fall.
"""

from __future__ import annotations

import argparse
import glob
import json
import math
from collections import Counter
from pathlib import Path

from shapely.geometry import Point, shape
from shapely.ops import unary_union

# Seats this close to the edge sit within the drafting error of the assembled mosaic, so
# their position cannot distinguish the two cases on its own.
EDGE_TOLERANCE_KM = 5.0
DEGREE_KM = 111.0

# A garrison with a county seat this close is inside the settled county belt whatever the
# mosaic edge does. Set from the spacing of civil seats themselves rather than chosen: in
# the north Shanxi and Xuanfu country the counties sit roughly 40-60 km apart, so a
# garrison nearer than this to one is within the same settled ground, not beyond it.
COUNTY_BELT_KM = 40.0

CIVIL_SEAT_LEVELS = {"prefecture", "department", "county"}


def haversine_km(
    longitude_a: float, latitude_a: float, longitude_b: float, latitude_b: float
) -> float:
    mean_latitude = math.radians((latitude_a + latitude_b) / 2)
    east = (longitude_a - longitude_b) * math.cos(mean_latitude) * DEGREE_KM
    north = (latitude_a - latitude_b) * DEGREE_KM
    return math.hypot(east, north)

# Frontier zones, in the order they are tested. 實土 status was a regional condition rather
# than a property of individual garrisons: the Hexi Corridor and Liaodong were administered
# as territory, while a garrison on the Fujian coast sat inside a county however far its
# seat happens to fall outside a drafted provincial edge. Grouping by zone lets the whole
# region be judged at once against the geography treatises.
FRONTIER_ZONES: list[tuple[str, str]] = [
    ("河西走廊 / 甘肃", "陕西行都司辖境，卫所境内无州县。**已判实土**"),
    ("辽东", "辽东都司辖境，明代不设府州县。**已判实土**"),
    (
        "长城北线（宣府、大同、蓟镇）",
        "大同府、蔚州、应州等州县密布，延庆州与保安州为直隶州直属六部。**已判非实土**",
    ),
    ("洮岷（甘南）", "洮州、岷州卫为军民指挥使司。**已判实土**"),
    ("川滇西南", "四川行都司及建昌等卫，与土司辖境交错。**已判实土**"),
    ("贵州及西南内地", "卫所与府州县犬牙相入，8/17 在州县带内。**已判实土，但须逐卫核定**"),
    ("东南沿海 / 岭南", "沿海卫所设于州县境内。**已判非实土**"),
    (
        "其他",
        "非边疆区域，而是本脚本的残余分组，地理上互不相邻。"
        "**已拆为其他边地（实土）、宁夏（非实土，并入陕西）、陕北（非实土，并入陕西）、"
        "内地关隘与近畿（非实土）、东南沿海（非实土）五子区分别裁决**",
    ),
]


def frontier_zone(longitude: float, latitude: float) -> str:
    if longitude < 104 and latitude > 36:
        return "河西走廊 / 甘肃"
    if longitude > 119 and latitude > 38:
        return "辽东"
    if 104 <= longitude <= 116 and latitude >= 39.5:
        return "长城北线（宣府、大同、蓟镇）"
    if longitude < 106 and 34 < latitude <= 38:
        return "洮岷（甘南）"
    if latitude < 30 and longitude < 105:
        return "川滇西南"
    if latitude < 26:
        return "东南沿海 / 岭南"
    if 103 <= longitude <= 112 and 24 <= latitude <= 30:
        return "贵州及西南内地"
    return "其他"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--index", type=Path, default=Path("data/.generated/runtime-index.json")
    )
    parser.add_argument(
        "--provinces", type=Path, default=Path("../Map-Boundary/build/1600/civil")
    )
    parser.add_argument(
        "--out", type=Path, default=Path("tools/reference/territorial-military-candidates.md")
    )
    arguments = parser.parse_args()

    index = json.loads(arguments.index.read_text(encoding="utf-8"))
    places = {place["id"]: place for place in index["places"]}

    civil_seats = []
    for unit in index["administrativeUnits"]:
        if unit.get("level") not in CIVIL_SEAT_LEVELS:
            continue
        place = places.get(unit.get("seatPlaceId") or "")
        if place and place.get("longitude") is not None:
            civil_seats.append((unit["name"], place["longitude"], place["latitude"]))

    def nearest_civil_seat(longitude: float, latitude: float) -> tuple[str, float]:
        name, seat_longitude, seat_latitude = min(
            civil_seats,
            key=lambda seat: haversine_km(longitude, latitude, seat[1], seat[2]),
        )
        return name, haversine_km(longitude, latitude, seat_longitude, seat_latitude)

    shapes = []
    for path in sorted(glob.glob(str(arguments.provinces / "*.geojson"))):
        feature = json.loads(Path(path).read_text(encoding="utf-8"))["features"][0]
        shapes.append(shape(feature["geometry"]))
    mosaic = unary_union(shapes)

    outside, inside, unlocated = [], [], []
    for unit in index["militaryUnits"]:
        place = places.get(unit.get("seatPlaceId") or "")
        if not place or place.get("longitude") is None:
            unlocated.append(unit)
            continue
        point = Point(place["longitude"], place["latitude"])
        record = {
            "id": unit["id"],
            "name": unit["name"],
            "formalName": unit.get("formalName"),
            "militaryKind": unit["militaryKind"],
            "longitude": place["longitude"],
            "latitude": place["latitude"],
            "confidence": place.get("confidence"),
        }
        seat_name, seat_distance = nearest_civil_seat(
            place["longitude"], place["latitude"]
        )
        record["nearestCivilSeat"] = seat_name
        record["nearestCivilSeatKm"] = seat_distance
        if mosaic.contains(point):
            inside.append(record)
        else:
            record["distanceKm"] = mosaic.distance(point) * DEGREE_KM
            outside.append(record)

    outside.sort(key=lambda item: -item["distanceKm"])
    clear = [item for item in outside if item["distanceKm"] >= EDGE_TOLERANCE_KM]
    marginal = [item for item in outside if item["distanceKm"] < EDGE_TOLERANCE_KM]

    lines = ["# 实土军事单位候选清单", ""]
    lines.append(
        "明代卫所分实土与非实土：设于边地、辖境内无州县者具备政区属性，应与布政使司并列"
        "进入同一张无缝底图；设于府州县境内者只管军户不领土地，不生成多边形，只保留治所点。"
    )
    lines.append("")
    lines.append(
        "机构类型不决定这件事。贵州都司与陕西行都司同为 `dusi`，前者驻在民政区内，"
        "后者领有河西走廊。当前数据没有实土标记，因此本清单以治所相对民政马赛克的位置"
        "筛出候选，**供人工按地理志核定，不作为分类结论**。"
    )
    lines.append("")
    lines.append(
        f"判读说明：治所在马赛克外 {EDGE_TOLERANCE_KM:.0f} 公里以上者列为明确候选；"
        "不足该距离者可能只是拼装误差或治所偏在边缘，单独列出。民政马赛克本身仍是草稿，"
        "其边缘误差会直接影响本清单，故距离小的条目尤其不可只凭此判定。"
    )
    lines.append("")
    lines.append("## 规模")
    lines.append("")
    lines.append("| 类别 | 数量 | 说明 |")
    lines.append("| --- | ---: | --- |")
    lines.append(f"| 治所在马赛克外 ≥{EDGE_TOLERANCE_KM:.0f} km | {len(clear)} | 实土候选，需核定 |")
    lines.append(f"| 治所在马赛克外 <{EDGE_TOLERANCE_KM:.0f} km | {len(marginal)} | 边缘，可能为误差 |")
    lines.append(f"| 治所在马赛克内 | {len(inside)} | 非实土候选，默认无几何 |")
    lines.append(f"| 治所未定位 | {len(unlocated)} | 无法判读 |")
    lines.append("")

    kinds = Counter(item["militaryKind"] for item in clear)
    lines.append(f"明确候选按机构类型：{dict(kinds)}")
    lines.append("")
    lines.append(
        "候选按边疆区域分组。实土与否在明代基本是**区域性**条件而非单个卫所的属性——"
        "河西走廊与辽东整体按政区管理，而福建沿海卫所无论治所落在何处都设于州县境内。"
        "因此建议**按区整体判定**，而不是逐个卫所裁决。"
    )
    lines.append("")
    lines.append(
        f"「最近州县治所」为第二判据，独立于马赛克。文献所载实土标准是辖境内有无州县，"
        f"州县治所正是该问题的直接证据，且为源数据而非拼装产物。距离小于 "
        f"{COUNTY_BELT_KM:.0f} km 者以粗体标出：该卫所处在州县密集地带，"
        "无论马赛克边缘如何都应属非实土。两项判据不一致时以本列为准。"
    )
    lines.append("")

    zoned: dict[str, list[dict]] = {}
    for item in clear:
        zone = frontier_zone(item["longitude"], item["latitude"])
        zoned.setdefault(zone, []).append(item)

    lines.append("## 按边疆区域分组")
    lines.append("")
    lines.append("| 区域 | 候选数 | 机构类型 | 州县带内 | 最近州县中位数 |")
    lines.append("| --- | ---: | --- | ---: | ---: |")
    for zone, note in FRONTIER_ZONES:
        entries = zoned.get(zone, [])
        if not entries:
            continue
        zone_kinds = Counter(entry["militaryKind"] for entry in entries)
        summary = "、".join(f"{k} {v}" for k, v in zone_kinds.most_common())
        distances = sorted(entry["nearestCivilSeatKm"] for entry in entries)
        in_belt = sum(1 for value in distances if value < COUNTY_BELT_KM)
        median = distances[len(distances) // 2]
        lines.append(
            f"| {zone} | {len(entries)} | {summary} "
            f"| {in_belt}/{len(entries)} | {median:.0f} km |"
        )
    lines.append("")
    lines.append(
        "判定结论见 `territorial-military-decisions.json`，依据见 "
        "`territorial-military-evidence.md`。本表只呈现证据，不重复结论。"
    )
    lines.append("")
    for zone, note in FRONTIER_ZONES:
        entries = zoned.get(zone, [])
        if not entries:
            continue
        lines.append(f"### {zone}")
        lines.append("")
        lines.append(f"{note}。候选 {len(entries)} 个。")
        lines.append("")
        in_belt = sum(
            1 for entry in entries if entry["nearestCivilSeatKm"] < COUNTY_BELT_KM
        )
        if in_belt:
            lines.append(
                f"其中 {in_belt} 个距最近州县治所不足 {COUNTY_BELT_KM:.0f} km，"
                "位于州县密集地带，按「设于有州县处者为非实土」当属非实土。"
            )
            lines.append("")
        lines.append("| 单位 | 类型 | 距马赛克 | 最近州县治所 | 距离 | 治所坐标 | 可信度 |")
        lines.append("| --- | --- | ---: | --- | ---: | --- | --- |")
        for item in sorted(entries, key=lambda entry: -entry["distanceKm"]):
            belt = "**" if item["nearestCivilSeatKm"] < COUNTY_BELT_KM else ""
            lines.append(
                f"| {item['name']} | {item['militaryKind']} | {item['distanceKm']:.0f} km "
                f"| {item['nearestCivilSeat']} "
                f"| {belt}{item['nearestCivilSeatKm']:.0f} km{belt} "
                f"| {item['longitude']:.4f}, {item['latitude']:.4f} "
                f"| {item['confidence']} |"
            )
        lines.append("")

    lines.append("## 边缘条目")
    lines.append("")
    lines.append(
        "治所落在马赛克外但距离很近。民政边界本身是草稿，这些条目更可能反映拼装误差而非实土属性。"
    )
    lines.append("")
    lines.append("| 单位 | 类型 | 距马赛克 | 最近州县治所 | 距离 | 治所坐标 | 可信度 |")
    lines.append("| --- | --- | ---: | --- | ---: | --- | --- |")
    for item in marginal:
        lines.append(
            f"| {item['name']} | {item['militaryKind']} | {item['distanceKm']:.1f} km "
            f"| {item['nearestCivilSeat']} | {item['nearestCivilSeatKm']:.0f} km "
            f"| {item['longitude']:.4f}, {item['latitude']:.4f} | {item['confidence']} |"
        )
    lines.append("")

    arguments.out.parent.mkdir(parents=True, exist_ok=True)
    arguments.out.write_text("\n".join(lines), encoding="utf-8")

    print(f"outside >= {EDGE_TOLERANCE_KM:.0f} km : {len(clear)}")
    print(f"outside <  {EDGE_TOLERANCE_KM:.0f} km : {len(marginal)}")
    print(f"inside mosaic      : {len(inside)}")
    print(f"unlocated          : {len(unlocated)}")
    print(f"\ncandidate kinds: {dict(kinds)}")
    print(f"wrote {arguments.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
