from __future__ import annotations

import argparse
import json
from pathlib import Path

import shapefile
from shapely.geometry import box, mapping, shape
from shapely.ops import unary_union


VIEWPORT = (70.0, 15.0, 150.0, 55.0)
LAYERS = (
    ("land", "ne_10m_land.zip", 0.005),
    ("lake", "ne_10m_lakes.zip", 0.0001),
    ("river", "ne_10m_rivers_lake_centerlines.zip", 0.0001),
    ("coastline", "ne_10m_coastline.zip", 0.0001),
)
AUDIT_FIELDS = (
    "dissolve",
    "scalerank",
    "featurecla",
    "name",
    "name_alt",
    "rivernum",
    "note",
    "min_zoom",
    "name_en",
    "min_label",
    "ne_id",
    "label",
    "wikidataid",
    "name_zh",
    "name_zht",
)


def rounded(value: object, digits: int = 5) -> object:
    if isinstance(value, (float, int)):
        return round(float(value), digits)
    if isinstance(value, list):
        return [rounded(item, digits) for item in value]
    if isinstance(value, tuple):
        return [rounded(item, digits) for item in value]
    return value


def source_id(kind: str, attributes: dict[str, object]) -> str | None:
    value = attributes.get("ne_id")
    if value is None or value == "":
        return None
    return f"natural-earth:{kind}:{value}"


def source_properties(kind: str, record: shapefile._Record) -> dict[str, object]:
    attributes = record.as_dict()
    properties: dict[str, object] = {
        "kind": kind,
        "sourceDataset": "natural-earth-10m",
    }
    identifier = source_id(kind, attributes)
    if identifier is not None:
        properties["sourceId"] = identifier
    for field in AUDIT_FIELDS:
        value = attributes.get(field)
        if value is not None:
            properties[field] = value
    return properties


def geometries_for_layer(
    source_dir: Path, kind: str, archive: str, tolerance: float
):
    viewport = box(*VIEWPORT)
    with shapefile.Reader(str(source_dir / archive)) as reader:
        for record, source_shape in zip(reader.records(), reader.shapes()):
            attributes = record.as_dict()
            if kind == "lake" and attributes["featurecla"] == "Reservoir":
                continue
            geometry = shape(source_shape.__geo_interface__).intersection(viewport)
            if geometry.is_empty:
                continue
            geometry = geometry.simplify(tolerance, preserve_topology=kind not in {"river", "coastline"})
            if not geometry.is_empty:
                yield geometry, source_properties(kind, record)


def feature(
    kind: str, geometry: object, properties: dict[str, object] | None = None
) -> dict[str, object]:
    return {
        "type": "Feature",
        "properties": properties or {"kind": kind},
        "geometry": rounded(mapping(geometry)),
    }


def features_for_layer(source_dir: Path, kind: str, archive: str, tolerance: float):
    for geometry, properties in geometries_for_layer(source_dir, kind, archive, tolerance):
        yield feature(kind, geometry, properties)


def build(source_dir: Path, output: Path) -> None:
    land_kind, land_archive, land_tolerance = LAYERS[0]
    land_geometries = [
        geometry
        for geometry, _ in geometries_for_layer(
            source_dir, land_kind, land_archive, land_tolerance
        )
    ]
    ocean = box(*VIEWPORT).difference(unary_union(land_geometries))
    features = [feature("ocean", ocean.simplify(0.0001, preserve_topology=True))]
    features.extend(feature("land", geometry) for geometry in land_geometries)
    for kind, archive, tolerance in LAYERS[1:]:
        features.extend(features_for_layer(source_dir, kind, archive, tolerance))
    document = {
        "type": "FeatureCollection",
        "name": "natural-reference",
        "bbox": list(VIEWPORT),
        "features": features,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(document, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {len(features)} features to {output} ({output.stat().st_size} bytes)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the project natural reference GeoJSON")
    parser.add_argument("--source-dir", type=Path, default=Path(".reference-work/natural-earth"))
    parser.add_argument("--output", type=Path, default=Path("public/reference/natural-reference.geojson"))
    args = parser.parse_args()
    build(args.source_dir, args.output)


if __name__ == "__main__":
    main()
