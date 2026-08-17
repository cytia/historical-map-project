use std::{
    collections::{HashMap, HashSet},
    fs,
    path::Path,
};

use serde_json::Value;

use crate::model::{Geometry, GeometrySystem, GeometryTopology, ProjectData};

/// Longitude/latitude envelope covering Ming territory and its surroundings. Coordinates
/// outside it almost always mean swapped axes or a wrong projection rather than a real place.
const LONGITUDE_RANGE: (f64, f64) = (70.0, 145.0);
const LATITUDE_RANGE: (f64, f64) = (15.0, 55.0);

/// Validates geometry records. `data_root` is the directory holding the manifest, used to
/// resolve `geometryPath`; when absent, only checks that do not touch the filesystem run.
pub fn validate(
    data: &ProjectData,
    data_root: Option<&Path>,
    unit_ids: &HashSet<&str>,
    source_ids: &HashSet<&str>,
    errors: &mut Vec<String>,
) {
    let mut seen_ids = HashSet::new();
    let by_id: HashMap<&str, &Geometry> = data
        .geometries
        .iter()
        .map(|geometry| (geometry.id.as_str(), geometry))
        .collect();

    for geometry in &data.geometries {
        if !seen_ids.insert(geometry.id.as_str()) {
            errors.push(format!("duplicate geometry id: {}", geometry.id));
        }

        if !unit_ids.contains(geometry.unit_id.as_str()) {
            errors.push(format!(
                "{} references unknown unit {}",
                geometry.id, geometry.unit_id
            ));
        }

        if let Some(crs) = &geometry.crs
            && crs != "EPSG:4326"
        {
            errors.push(format!("{} must use EPSG:4326, found {crs}", geometry.id));
        }

        for link in &geometry.sources {
            if !source_ids.contains(link.source_id.as_str()) {
                errors.push(format!(
                    "{} references missing source {}",
                    geometry.id, link.source_id
                ));
            }
        }

        validate_extent_reference(geometry, &by_id, errors);

        if let (Some(relative), Some(root)) = (&geometry.geometry_path, data_root) {
            validate_geometry_file(geometry, &root.join("geometries").join(relative), errors);
        }
    }

    validate_unit_coverage(data, errors);
    validate_mosaic_membership(data, errors);
}

/// Exclusive records form one seamless mosaic of administrative territory. Which institution
/// commands a unit does not decide whether it belongs: a frontier garrison holding ground
/// with no civil unit inside it (實土) sits in the mosaic beside prefectures, while a garrison
/// stationed within a county governs people rather than land and must stay overlapping.
///
/// Full seamlessness and mutual-exclusion checks need polygon boolean operations and are
/// deferred until the first exclusive geometries exist to test them against.
fn validate_mosaic_membership(data: &ProjectData, errors: &mut Vec<String>) {
    for geometry in &data.geometries {
        if geometry.topology != GeometryTopology::Exclusive {
            continue;
        }
        if geometry.coextensive_with.is_some() {
            errors.push(format!(
                "{} claims exclusive territory but borrows another record's extent; \
                 two units cannot both hold the same ground in the mosaic",
                geometry.id
            ));
        }
    }
}

/// A record either carries its own coordinates or points at another record's. Chained
/// references are rejected so every geometry resolves to coordinates in one step.
fn validate_extent_reference(
    geometry: &Geometry,
    by_id: &HashMap<&str, &Geometry>,
    errors: &mut Vec<String>,
) {
    match (&geometry.geometry_path, &geometry.coextensive_with) {
        (Some(_), Some(_)) => errors.push(format!(
            "{} cannot set both geometryPath and coextensiveWith",
            geometry.id
        )),
        (None, None) => errors.push(format!(
            "{} must set either geometryPath or coextensiveWith",
            geometry.id
        )),
        (None, Some(target)) => {
            if target == &geometry.id {
                errors.push(format!("{} cannot be coextensive with itself", geometry.id));
                return;
            }
            let Some(referenced) = by_id.get(target.as_str()) else {
                errors.push(format!(
                    "{} is coextensive with unknown geometry {target}",
                    geometry.id
                ));
                return;
            };
            if referenced.geometry_path.is_none() {
                errors.push(format!(
                    "{} is coextensive with {target}, which has no coordinates of its own",
                    geometry.id
                ));
            }
            if referenced.target_year != geometry.target_year {
                errors.push(format!(
                    "{} is coextensive with {target} but targets a different year",
                    geometry.id
                ));
            }
        }
        (Some(_), None) => {}
    }
}

fn validate_geometry_file(geometry: &Geometry, path: &Path, errors: &mut Vec<String>) {
    let Ok(content) = fs::read_to_string(path) else {
        errors.push(format!(
            "{} references missing geometry file {}",
            geometry.id,
            path.display()
        ));
        return;
    };
    let Ok(value) = serde_json::from_str::<Value>(&content) else {
        errors.push(format!(
            "{} references invalid JSON in {}",
            geometry.id,
            path.display()
        ));
        return;
    };

    let Some(node) = value.get("geometry").or(Some(&value)) else {
        return;
    };
    let Some(kind) = node.get("type").and_then(Value::as_str) else {
        errors.push(format!("{} geometry file has no type", geometry.id));
        return;
    };
    if !matches!(kind, "Polygon" | "MultiPolygon") {
        errors.push(format!(
            "{} geometry file must be Polygon or MultiPolygon, found {kind}",
            geometry.id
        ));
        return;
    }

    let Some(coordinates) = node.get("coordinates") else {
        errors.push(format!("{} geometry file has no coordinates", geometry.id));
        return;
    };
    let polygons = match kind {
        "Polygon" => vec![coordinates],
        _ => match coordinates.as_array() {
            Some(items) => items.iter().collect(),
            None => {
                errors.push(format!("{} MultiPolygon coordinates must be an array", geometry.id));
                return;
            }
        },
    };
    for polygon in polygons {
        validate_polygon(geometry, polygon, errors);
    }
}

fn validate_polygon(geometry: &Geometry, polygon: &Value, errors: &mut Vec<String>) {
    let Some(rings) = polygon.as_array() else {
        errors.push(format!("{} polygon coordinates must be an array", geometry.id));
        return;
    };
    for ring in rings {
        let Some(positions) = ring.as_array() else {
            errors.push(format!("{} polygon ring must be an array", geometry.id));
            continue;
        };
        if positions.len() < 4 {
            errors.push(format!(
                "{} polygon ring needs at least four positions",
                geometry.id
            ));
            continue;
        }
        if positions.first() != positions.last() {
            errors.push(format!("{} polygon ring is not closed", geometry.id));
        }
        for position in positions {
            let Some(pair) = position.as_array() else {
                errors.push(format!("{} position must be an array", geometry.id));
                continue;
            };
            let (Some(longitude), Some(latitude)) = (
                pair.first().and_then(Value::as_f64),
                pair.get(1).and_then(Value::as_f64),
            ) else {
                errors.push(format!("{} position must hold two numbers", geometry.id));
                continue;
            };
            if longitude < LONGITUDE_RANGE.0 || longitude > LONGITUDE_RANGE.1 {
                errors.push(format!(
                    "{} longitude {longitude} is outside the expected range; check for swapped axes",
                    geometry.id
                ));
            }
            if latitude < LATITUDE_RANGE.0 || latitude > LATITUDE_RANGE.1 {
                errors.push(format!(
                    "{} latitude {latitude} is outside the expected range; check for swapped axes",
                    geometry.id
                ));
            }
        }
    }
}

/// Within one system and target year a unit has at most one extent. A unit may still hold an
/// exclusive territory in the mosaic and a separate overlapping zone, so the system is part
/// of the key rather than the unit alone.
fn validate_unit_coverage(data: &ProjectData, errors: &mut Vec<String>) {
    let mut seen: HashSet<(&str, GeometrySystem, i32)> = HashSet::new();
    for geometry in &data.geometries {
        let key = (
            geometry.unit_id.as_str(),
            geometry.system,
            geometry.target_year,
        );
        if !seen.insert(key) {
            errors.push(format!(
                "{} duplicates the extent already recorded for {} in the same system and year",
                geometry.id, geometry.unit_id
            ));
        }
    }
}
