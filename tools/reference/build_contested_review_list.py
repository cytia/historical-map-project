"""Turn contested modern counties into a review list ordered by what each one decides.

Assembly reconstructs a historical unit as the union of the modern counties its
subordinate units occupied. That breaks down where several historical units share one
modern county: the county cannot be handed to all of them, so someone has to decide, and
the decision cannot come from the seat points that produced the conflict.

Not every conflict matters equally, and the ordering here follows what a wrong answer
would damage:

- Cross-province conflicts move a provincial edge, so they are settled first and block
  the provinces on both sides.
- Cross-prefecture conflicts move an internal prefectural edge within one province.
- Sibling conflicts sit inside one parent, so the parent's outline is unaffected however
  they resolve; they only matter once prefectural boundaries are drawn.

Conflicts where one claimant is an ancestor of the others are excluded upstream: a
prefecture sharing a county with its own 附郭 county is co-location, which is expected
and needs no decision.

The list records what has to be judged, not the judgement. Resolving an entry means
deciding how the modern county is split or assigned and citing the evidence, which is
documentary work that belongs with the sources.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path


def ancestors(unit_id: str, by_id: dict[str, dict]) -> set[str]:
    seen: set[str] = set()
    current = by_id.get(unit_id, {}).get("parentId")
    while current and current not in seen:
        seen.add(current)
        current = by_id.get(current, {}).get("parentId")
    return seen


def is_co_location(records: list[dict], by_id: dict[str, dict]) -> bool:
    """True when one claimant contains all the others in its parent chain."""
    for candidate in records:
        if all(
            other is candidate or candidate["unitId"] in ancestors(other["unitId"], by_id)
            for other in records
        ):
            return True
    return False


def classify(records: list[dict]) -> str:
    if len({record["province"] for record in records}) > 1:
        return "cross-province"
    if len({record["parentId"] for record in records}) > 1:
        return "cross-prefecture"
    return "sibling"


TIER_ORDER = {"cross-province": 0, "cross-prefecture": 1, "sibling": 2}

TIER_NOTE = {
    "cross-province": (
        "决定省级边界。裁决前两侧省份都无法定稿，且该共享边只画一次。"
    ),
    "cross-prefecture": (
        "决定省内府级边界，不影响省级轮廓。"
    ),
    "sibling": (
        "同属一个上级，无论如何裁决上级轮廓不变；只在绘制府级边界时才需要。"
    ),
}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--correspondence",
        type=Path,
        default=Path(".reference-work/seat-county-correspondence.json"),
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("tools/reference/contested-county-review.md"),
    )
    parser.add_argument(
        "--overrides",
        type=Path,
        default=Path("tools/reference/county-assignment-overrides.json"),
        help="Adjudicated county assignments to treat as settled",
    )
    arguments = parser.parse_args()

    data = json.loads(arguments.correspondence.read_text(encoding="utf-8"))
    matched = data["matched"]
    by_id = {record["unitId"]: record for record in matched}

    settled: dict[str, dict] = {}
    if arguments.overrides.exists():
        overrides = json.loads(arguments.overrides.read_text(encoding="utf-8"))
        settled = {entry["modernCountyId"]: entry for entry in overrides["overrides"]}

    by_county: dict[str, list[dict]] = defaultdict(list)
    for record in matched:
        by_county[record["modernCountyId"]].append(record)

    groups = []
    for county_id, records in by_county.items():
        if len(records) < 2 or is_co_location(records, by_id):
            continue
        # An adjudicated county is no longer a question; the decision and its evidence
        # live in the overrides file rather than as an open item here.
        if county_id in settled:
            continue
        groups.append(
            {
                "countyId": county_id,
                "county": records[0]["modernCounty"],
                "tier": classify(records),
                "records": sorted(records, key=lambda r: (r["level"], r["unit"])),
            }
        )

    groups.sort(
        key=lambda group: (
            TIER_ORDER[group["tier"]],
            group["records"][0]["province"],
            group["county"],
        )
    )

    tiers = Counter(group["tier"] for group in groups)
    units_involved = sum(len(group["records"]) for group in groups)

    # A unit or its parent appearing in several groups usually means one misplaced seat or
    # one unsettled affiliation is generating conflicts in more than one place, so these
    # are worth resolving before working through the list in order.
    unit_appearances: Counter[str] = Counter()
    parent_appearances: Counter[str] = Counter()
    for group in groups:
        for record in group["records"]:
            unit_appearances[record["unit"]] += 1
            if record["parentId"]:
                parent_appearances[record["parentId"]] += 1
    repeated_units = {
        name: count for name, count in unit_appearances.items() if count > 1
    }
    repeated_parents = {
        name: count for name, count in parent_appearances.most_common() if count > 2
    }

    lines: list[str] = []
    lines.append("# 现代县归属争议复核清单")
    lines.append("")
    lines.append(
        "拼装法把历史单位表达为其下辖单位所占现代县的并集。当多个历史单位的治所落在"
        "同一个现代县内时，这个县不能同时归属所有单位，必须人工裁决——而裁决依据不可能"
        "来自制造冲突的治所点本身。"
    )
    lines.append("")
    lines.append(
        "附郭共址（府与其附郭县共用一县）已在上游排除：那是预期结果，不需要裁决。"
    )
    lines.append("")
    lines.append(
        "本清单只记录需要判断的问题，不含结论。裁决一条意味着决定该现代县如何拆分或归属"
        "并给出依据，属于史料工作，结论应写回 `data/` 的来源记录。"
    )
    lines.append("")
    lines.append(
        f"由 `tools/reference/build_contested_review_list.py` 生成，"
        f"数据源 `{arguments.correspondence}`。"
    )
    lines.append("")
    lines.append("## 规模")
    lines.append("")
    lines.append("| 层级 | 组数 | 含义 |")
    lines.append("| --- | ---: | --- |")
    for tier in ("cross-province", "cross-prefecture", "sibling"):
        lines.append(f"| {tier} | {tiers.get(tier, 0)} | {TIER_NOTE[tier]} |")
    lines.append(f"| **合计** | **{len(groups)}** | 涉及 {units_involved} 个历史单位 |")
    lines.append("")
    if settled:
        lines.append(
            f"另有 {len(settled)} 组已裁决，结论与依据见 "
            "`county-assignment-overrides.json` 与 `cross-province-adjudication.md`，"
            "不再列入待办。"
        )
        lines.append("")

    if repeated_units or repeated_parents:
        lines.append("## 先处理的共因项")
        lines.append("")
        lines.append(
            "同一单位或同一上级反复出现，通常说明一处治所定位有误或一条隶属关系未定，"
            "在多个位置同时制造冲突。先解决这些，清单会随之缩短。"
        )
        lines.append("")
        if repeated_units:
            lines.append("重复出现的单位：")
            for name, count in sorted(
                repeated_units.items(), key=lambda item: -item[1]
            ):
                lines.append(f"- {name}（{count} 组）")
            lines.append("")
        if repeated_parents:
            lines.append("集中出现的上级：")
            for name, count in repeated_parents.items():
                lines.append(f"- `{name}`（{count} 次）")
            lines.append("")
            lines.append(
                "广西太平府、思明府一带的密集冲突不是数据缺陷。土州辖境本就细碎，"
                "十余个土州分布在现代少数几个县内，现代县界的粒度不足以分开它们。"
                "这类单位适合按区域代表点或 `schematic` 范围表达，不必强行拆分现代县；"
                "拆不开的，如实标注精度而不是编造界线。"
            )
            lines.append("")

    current_tier = None
    for group in groups:
        if group["tier"] != current_tier:
            current_tier = group["tier"]
            lines.append("")
            lines.append(f"## {current_tier}")
            lines.append("")
            lines.append(TIER_NOTE[current_tier])
            lines.append("")

        provinces = sorted({record["province"] for record in group["records"]})
        lines.append(f"### {group['county']}　（{'／'.join(provinces)}）")
        lines.append("")
        lines.append("| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |")
        lines.append("| --- | --- | --- | --- | --- |")
        for record in group["records"]:
            lines.append(
                f"| {record['unit']} | {record['level']} | {record['parentId'] or '—'} "
                f"| {record['longitude']:.4f}, {record['latitude']:.4f} "
                f"| {record['confidence']} |"
            )
        lines.append("")
        low = [r for r in group["records"] if r["confidence"] == "low"]
        if low:
            lines.append(
                f"- 低可信治所 {len(low)} 处（{'、'.join(r['unit'] for r in low)}）："
                "冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。"
            )
        lines.append("- [ ] 裁决：")
        lines.append("- [ ] 依据：")
        lines.append("")

    arguments.out.parent.mkdir(parents=True, exist_ok=True)
    arguments.out.write_text("\n".join(lines), encoding="utf-8")

    print(f"groups           {len(groups)}")
    for tier in ("cross-province", "cross-prefecture", "sibling"):
        print(f"  {tier:18s} {tiers.get(tier, 0)}")
    print(f"units involved   {units_involved}")
    print(f"wrote {arguments.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
