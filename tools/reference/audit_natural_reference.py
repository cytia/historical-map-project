from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

import shapefile
from shapely.geometry import box, shape

from build_natural_reference import VIEWPORT, source_id


RIVER_ARCHIVE = "ne_10m_rivers_lake_centerlines.zip"
PROPERTY_FIELDS = (
    "sourceId",
    "dissolve",
    "scalerank",
    "featurecla",
    "name",
    "name_en",
    "label",
    "rivernum",
    "min_zoom",
    "ne_id",
)


def source_rivers(source_dir: Path) -> list[dict[str, object]]:
    viewport = box(*VIEWPORT)
    records: list[dict[str, object]] = []
    with shapefile.Reader(str(source_dir / RIVER_ARCHIVE)) as reader:
        for record, source_shape in zip(reader.records(), reader.shapes()):
            attributes = record.as_dict()
            geometry = shape(source_shape.__geo_interface__).intersection(viewport)
            if geometry.is_empty:
                continue
            identifier = source_id("river", attributes)
            if identifier is None:
                raise ValueError("A viewport river record has no ne_id")
            records.append({
                "sourceId": identifier,
                "geometryType": geometry.geom_type,
                **attributes,
            })
    return records


def generated_rivers(input_path: Path) -> list[dict[str, object]]:
    document = json.loads(input_path.read_text(encoding="utf-8"))
    return [
        feature
        for feature in document["features"]
        if feature.get("properties", {}).get("kind") == "river"
    ]


def duplicate_values(values: list[str]) -> list[str]:
    return sorted(value for value, count in Counter(values).items() if count > 1)


def audit(source_dir: Path, input_path: Path, output_path: Path) -> dict[str, object]:
    source = source_rivers(source_dir)
    generated = generated_rivers(input_path)
    source_by_id = {record["sourceId"]: record for record in source}
    generated_by_id = {
        feature["properties"]["sourceId"]: feature
        for feature in generated
        if feature.get("properties", {}).get("sourceId") is not None
    }
    source_ids = [record["sourceId"] for record in source]
    generated_ids = [
        feature.get("properties", {}).get("sourceId", "")
        for feature in generated
    ]
    missing = sorted(set(source_ids) - set(generated_ids))
    unexpected = sorted(set(generated_ids) - set(source_ids))
    property_mismatches: list[dict[str, object]] = []
    for identifier in sorted(set(source_by_id) & set(generated_by_id)):
        properties = generated_by_id[identifier]["properties"]
        mismatches = {
            field: {
                "source": source_by_id[identifier].get(field),
                "generated": properties.get(field),
            }
            for field in PROPERTY_FIELDS
            if source_by_id[identifier].get(field) != properties.get(field)
        }
        if mismatches:
            property_mismatches.append({"sourceId": identifier, "fields": mismatches})

    report: dict[str, object] = {
        "status": "pass" if not (
            missing
            or unexpected
            or duplicate_values(source_ids)
            or duplicate_values(generated_ids)
            or property_mismatches
            or len(source) != len(generated)
        ) else "fail",
        "viewport": list(VIEWPORT),
        "sourceRiverCount": len(source),
        "generatedRiverCount": len(generated),
        "missingSourceIds": missing,
        "unexpectedSourceIds": unexpected,
        "duplicateSourceIds": duplicate_values(source_ids),
        "duplicateGeneratedIds": duplicate_values(generated_ids),
        "propertyMismatches": property_mismatches,
        "sourceFeatureClassCounts": dict(Counter(record["featurecla"] for record in source)),
        "sourceScaleRankCounts": dict(Counter(str(record["scalerank"]) for record in source)),
        "sourceMinZoomCounts": dict(Counter(str(record["min_zoom"]) for record in source)),
        "sourceGeometryTypeCounts": dict(Counter(record["geometryType"] for record in source)),
        "generatedGeometryTypeCounts": dict(
            Counter(feature.get("geometry", {}).get("type") for feature in generated)
        ),
        "namedSourceCount": sum(bool(record.get("name")) for record in source),
        "unnamedSourceCount": sum(not bool(record.get("name")) for record in source),
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit Natural Earth river records")
    parser.add_argument("--source-dir", type=Path, default=Path(".reference-work/natural-earth"))
    parser.add_argument("--input", type=Path, default=Path("public/reference/natural-reference.geojson"))
    parser.add_argument("--output", type=Path, default=Path(".reference-work/natural-reference-audit.json"))
    args = parser.parse_args()
    report = audit(args.source_dir, args.input, args.output)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if report["status"] != "pass":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
