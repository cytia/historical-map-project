"""Build modern-province starting shapes for Ming provincial boundary reconstruction.

The output is a working draft, not historical data. Each shape is a union of modern
Natural Earth admin-1 units chosen because the Ming unit is known to cover roughly that
ground. Every boundary still needs manual correction in QGIS against textual evidence
before it can become a geometry record, so the drafts stay in the ignored work directory
rather than under data/.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import shapefile
from shapely.geometry import mapping, shape
from shapely.ops import unary_union

ARCHIVE = "ne_10m_admin_1_states_provinces.zip"

# Modern admin-1 units whose combined extent approximates each Ming province. These are
# starting shapes only: the notes record why the modern extent differs from the Ming one,
# and each difference has to be resolved by hand before the draft becomes a record.
COMPOSITIONS: dict[str, dict[str, object]] = {
    "jingshi": {
        "label": "京师 (北直隶)",
        "modern": ["Hebei", "Beijing", "Tianjin"],
        "note": "North border follows the Great Wall line rather than the modern provincial edge; the Ming extent excludes territory beyond it.",
    },
    "nanjing": {
        "label": "南京 (南直隶)",
        "modern": ["Jiangsu", "Anhui", "Shanghai"],
        "note": "Merge the three modern units and drop the interior boundaries.",
    },
    "shandong": {
        "label": "山东",
        "modern": ["Shandong"],
        "note": "Ming Shandong also administered the Liaodong peninsula through a separate military command; the civil extent stays on the peninsula proper.",
    },
    "shanxi": {
        "label": "山西",
        "modern": ["Shanxi"],
        "note": "North border follows the Great Wall line rather than the modern provincial edge.",
    },
    "henan": {
        "label": "河南",
        "modern": ["Henan"],
        "note": "Close to the modern extent; verify the southern edge against Huguang.",
    },
    "shaanxi": {
        "label": "陕西",
        "modern": ["Shaanxi", "Gansu", "Ningxia", "Qinghai"],
        "note": "Ming Shaanxi covered today's Gansu and Ningxia. The Hexi Corridor and Xining belong to shaanxi-xing-dusi and must be split out of this shape; the Qinghai interior was never administrative territory at all and is cut away entirely.",
    },
    "sichuan": {
        "label": "四川",
        "modern": ["Sichuan", "Chongqing"],
        "note": "Eastern edge against Huguang differs noticeably from the modern line.",
    },
    "huguang": {
        "label": "湖广",
        "modern": ["Hubei", "Hunan"],
        "note": "Merge the two modern units and drop the interior boundary.",
    },
    "jiangxi": {
        "label": "江西",
        "modern": ["Jiangxi"],
        "note": "Close to the modern extent.",
    },
    "zhejiang": {
        "label": "浙江",
        "modern": ["Zhejiang"],
        "note": "Close to the modern extent; the northern edge against Nanjing needs checking.",
    },
    "fujian": {
        "label": "福建",
        "modern": ["Fujian"],
        "note": "Close to the modern extent; Taiwan was outside the provincial administration.",
    },
    "guangdong": {
        "label": "广东",
        "modern": ["Guangdong", "Hainan"],
        "note": "Hainan was administered under Guangdong as Qiongzhou prefecture.",
    },
    "guangxi": {
        "label": "广西",
        "modern": ["Guangxi"],
        "note": "Modern Guangxi reaches the sea; the Ming coastal margin against Guangdong differs and needs checking.",
    },
    "yunnan": {
        "label": "云南",
        "modern": ["Yunnan"],
        "note": "Civil extent only. The southern and western jimi commissions reached well beyond the modern border and belong to separate jimi geometry records, not to this shape.",
    },
    "guizhou": {
        "label": "贵州",
        "modern": ["Guizhou"],
        "note": "Ming Guizhou was materially smaller than the modern province and interlocked with Huguang and Sichuan; this shape overstates it and needs the most correction.",
    },
    # Garrison commands holding administrative territory (實土). Their ground contains no
    # prefecture or county, so they sit in the same seamless mosaic as the provinces rather
    # than overlapping them. Without these the mosaic has holes where the civil system simply
    # did not reach.
    "liaodong-dusi": {
        "system": "military",
        "label": "辽东都司",
        "modern": ["Liaoning"],
        "note": "No prefectures or counties were established; the command exercised civil administration directly, so this is 實土 territory. The Ming extent stops at the Liaodong frontier wall and does not reach the modern province's northern and eastern edges.",
    },
    "shaanxi-xing-dusi": {
        "system": "military",
        "label": "陕西行都司",
        "modern": ["Gansu"],
        "note": "The Hexi Corridor garrisons held territory with no civil units inside it. This shape currently duplicates ground also claimed by the shaanxi baseline; the shared edge with 陕西布政使司 near 103.2-103.4 E has to be drawn so the two stop overlapping. Xining belongs here as well and must be taken from the Qinghai side.",
    },
    # 軍民指揮使司: garrison commands that also administered civilians, so they held territory
    # in their own right. 明史 vol.42 records only three in Shaanxi — 洮州, 岷州, 河州 — and
    # 河州 was restored to civil prefecture status in 1473, leaving these two as separate
    # blocks in the mosaic. Both currently sit inside the Gansu shape used by the xing-dusi
    # and must be carved out of it by hand.
    "taozhou-wei-shaanxi": {
        "system": "military",
        "label": "洮州卫军民指挥使司",
        "modern": ["Gansu"],
        "note": "軍民指揮使司 holding its own territory on the upper Tao river; 明史 vol.42 records the promotion in 洪武十二年. The shape must be cut out of the Gansu block and bounded against 臨洮府, 鞏昌府 and the Tibetan areas to the west; the seat lies at 103.35, 34.69.",
    },
    "minzhou-wei-shaanxi": {
        "system": "military",
        "label": "岷州卫军民指挥使司",
        "modern": ["Gansu"],
        "note": "軍民指揮使司 promoted in 洪武十五年 per 明史 vol.42, with 西固城守禦軍民千戶所 under it. The shape must be cut out of the Gansu block; the seat lies at 104.03, 34.44 and the subordinate 西固城 at 104.37, 33.79.",
    },
}


def modern_shapes(source: Path) -> dict[str, list[object]]:
    """Collect geometries for every modern unit named in the compositions."""
    wanted = {name for entry in COMPOSITIONS.values() for name in entry["modern"]}
    collected: dict[str, list[object]] = {name: [] for name in wanted}
    with shapefile.Reader(str(source / ARCHIVE)) as reader:
        for record, geometry in zip(reader.records(), reader.shapes()):
            attributes = record.as_dict()
            if attributes.get("admin") != "China":
                continue
            name = attributes.get("name_en") or attributes.get("name")
            if name in collected:
                collected[name].append(shape(geometry.__geo_interface__))
    return collected


def build(source: Path, output: Path) -> None:
    collected = modern_shapes(source)
    missing = {name for name, shapes in collected.items() if not shapes}
    if missing:
        raise SystemExit(f"missing modern units in {ARCHIVE}: {sorted(missing)}")

    features = []
    for unit_id, entry in COMPOSITIONS.items():
        parts = [part for name in entry["modern"] for part in collected[name]]
        # No simplification: shapely's preserve_topology guards a single geometry, not the
        # shared edge between two, so simplifying each province independently pulls
        # neighbouring edges apart into slivers and gaps. The source units already tile
        # cleanly, so the union is passed through untouched.
        merged = unary_union(parts)
        features.append(
            {
                "type": "Feature",
                "properties": {
                    "unitId": unit_id,
                    "label": entry["label"],
                    "system": entry.get("system", "civil"),
                    "modernComposition": entry["modern"],
                    "correctionNote": entry["note"],
                    "status": "uncorrected-baseline",
                    "sourceDataset": "natural-earth-10m-admin-1",
                },
                "geometry": mapping(merged),
            }
        )

    document = {
        "type": "FeatureCollection",
        "name": "province-baseline",
        "note": "Uncorrected modern starting shapes for manual Ming boundary reconstruction. Not historical data.",
        "features": features,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(document, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print(f"wrote {len(features)} baseline shapes to {output} ({output.stat().st_size} bytes)")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, default=Path(".reference-work/natural-earth"))
    parser.add_argument(
        "--output", type=Path, default=Path("public/reference/province-baseline.geojson")
    )
    args = parser.parse_args()
    build(args.source_dir, args.output)


if __name__ == "__main__":
    main()
