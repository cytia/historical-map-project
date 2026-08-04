use std::{collections::HashSet, fs, path::Path};

use serde::Deserialize;
use serde_json::{Map, Value};

use crate::{model::ProjectData, validate};

const COLLECTIONS: [&str; 11] = [
    "sources",
    "scopeStatistics",
    "statistics",
    "militaryStatistics",
    "polities",
    "administrativeUnits",
    "militaryUnits",
    "jimiUnits",
    "relations",
    "places",
    "placeNames",
];

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Manifest {
    #[serde(rename = "$schema")]
    _schema: Option<String>,
    schema_version: u32,
    project_schema: Option<String>,
    fragments: Vec<Fragment>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Fragment {
    collection: String,
    path: String,
    domain: Option<String>,
    region: Option<String>,
}

pub fn load_project(path: &Path) -> Result<ProjectData, String> {
    let value = read_json(path)?;
    let value = if value.get("fragments").is_some() {
        assemble_value(path)?
    } else {
        value
    };

    serde_json::from_value(value)
        .map_err(|error| format!("Invalid project data in {}: {error}", path.display()))
}

pub(crate) fn validated_assembled_value(manifest_path: &Path) -> Result<Value, String> {
    let value = assemble_value(manifest_path)?;
    let data: ProjectData = serde_json::from_value(value.clone())
        .map_err(|error| format!("Assembled project data is invalid: {error}"))?;
    let errors = validate::validate(&data);
    if errors.is_empty() {
        return Ok(value);
    }
    let details = errors
        .iter()
        .map(|error| format!("- {error}"))
        .collect::<Vec<_>>()
        .join("\n");
    Err(format!(
        "Assembled historical data validation failed with {} error(s):\n{details}",
        errors.len()
    ))
}

fn assemble_value(manifest_path: &Path) -> Result<Value, String> {
    let manifest = read_manifest(manifest_path)?;
    if manifest.schema_version != 1 {
        return Err(format!(
            "Manifest schemaVersion must be 1, found {}",
            manifest.schema_version
        ));
    }

    let mut root = Map::new();
    root.insert(
        "$schema".to_owned(),
        Value::String(
            manifest
                .project_schema
                .unwrap_or_else(|| "./schema/project-data.schema.json".to_owned()),
        ),
    );
    root.insert("schemaVersion".to_owned(), Value::from(1));
    for collection in COLLECTIONS {
        root.insert(collection.to_owned(), Value::Array(Vec::new()));
    }

    let mut paths = HashSet::new();
    let parent = manifest_path
        .parent()
        .ok_or_else(|| "Manifest path has no parent directory".to_owned())?;
    for fragment in manifest.fragments {
        if !COLLECTIONS.contains(&fragment.collection.as_str()) {
            return Err(format!(
                "Unknown fragment collection {}",
                fragment.collection
            ));
        }
        if fragment.path.is_empty() || Path::new(&fragment.path).is_absolute() {
            return Err(format!(
                "Fragment path must be a non-empty relative path: {}",
                fragment.path
            ));
        }
        if matches!(
            fragment.collection.as_str(),
            "administrativeUnits"
                | "militaryUnits"
                | "jimiUnits"
                | "places"
                | "placeNames"
                | "statistics"
                | "militaryStatistics"
        ) && (fragment.domain.is_none() && fragment.region.is_none())
        {
            return Err(format!(
                "Fragment {} must identify a domain or region",
                fragment.path
            ));
        }
        if !paths.insert(fragment.path.clone()) {
            return Err(format!("Duplicate fragment path {}", fragment.path));
        }

        let fragment_path = parent.join(&fragment.path);
        let fragment_value = read_json(&fragment_path)?;
        let items = fragment_value.as_array().ok_or_else(|| {
            format!(
                "Fragment {} must contain a JSON array",
                fragment_path.display()
            )
        })?;
        let target = root
            .get_mut(&fragment.collection)
            .and_then(Value::as_array_mut)
            .expect("known collection must be an array");
        if matches!(
            fragment.collection.as_str(),
            "administrativeUnits" | "militaryUnits"
        ) {
            for item in items {
                let mut item = item.clone();
                if let Some(domain) = &fragment.domain {
                    item.as_object_mut()
                        .ok_or_else(|| {
                            format!(
                                "Fragment {} contains a non-object unit",
                                fragment_path.display()
                            )
                        })?
                        .insert("domain".to_owned(), Value::String(domain.clone()));
                }
                target.push(item);
            }
        } else {
            target.extend(items.iter().cloned());
        }
    }

    Ok(Value::Object(root))
}

fn read_manifest(path: &Path) -> Result<Manifest, String> {
    let value = read_json(path)?;
    serde_json::from_value(value)
        .map_err(|error| format!("Invalid manifest in {}: {error}", path.display()))
}

fn read_json(path: &Path) -> Result<Value, String> {
    let content = fs::read_to_string(path)
        .map_err(|error| format!("Could not read {}: {error}", path.display()))?;
    serde_json::from_str(&content)
        .map_err(|error| format!("Invalid JSON in {}: {error}", path.display()))
}
