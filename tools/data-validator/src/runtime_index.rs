use std::{
    fs,
    path::{Path, PathBuf},
};

use serde_json::{Map, Value, json};

use crate::manifest::validated_assembled_value;

pub fn write(manifest_path: &Path, output_path: &Path) -> Result<PathBuf, String> {
    let value = validated_assembled_value(manifest_path)?;
    let root = value
        .as_object()
        .ok_or_else(|| "Assembled project data must be an object".to_owned())?;
    let source_count = collection(root, "sources")?.len();
    let runtime_index = json!({
        "schemaVersion": 1,
        "sourceCount": source_count,
        "administrativeUnits": project_collection(root, "administrativeUnits", &[
            "id", "name", "formalName", "level", "parentId", "seatPlaceId",
        ], true)?,
        "militaryUnits": project_collection(root, "militaryUnits", &[
            "id", "name", "formalName", "level", "militaryKind", "seatPlaceId",
        ], true)?,
            "jimiUnits": project_collection(root, "jimiUnits", &[
                "id", "name", "formalName", "jimiKind", "officeKind", "seatPlaceId",
            "validity", "confidence", "note",
        ], true)?,
        "relations": project_collection(root, "relations", &[
            "id", "relationType", "subjectId", "objectId",
        ], false)?,
        "places": project_collection(root, "places", &[
            "id", "longitude", "latitude", "locationAccuracy", "locationMethod",
            "confidence",
        ], true)?,
        "placeNames": project_collection(root, "placeNames", &[
            "id", "placeId", "name",
        ], false)?,
    });
    write_runtime_file(output_path, runtime_index)
}

fn collection<'a>(root: &'a Map<String, Value>, name: &str) -> Result<&'a Vec<Value>, String> {
    root.get(name)
        .and_then(Value::as_array)
        .ok_or_else(|| format!("Assembled collection {name} must be an array"))
}

fn project_collection(
    root: &Map<String, Value>,
    name: &str,
    fields: &[&str],
    include_source_ids: bool,
) -> Result<Vec<Value>, String> {
    collection(root, name)?
        .iter()
        .map(|item| {
            let object = item
                .as_object()
                .ok_or_else(|| format!("Collection {name} contains a non-object item"))?;
            let mut projected: Map<String, Value> = fields
                .iter()
                .filter_map(|field| {
                    object
                        .get(*field)
                        .map(|value| ((*field).to_owned(), value.clone()))
                })
                .collect();
            if include_source_ids {
                let source_ids = object
                    .get("sources")
                    .and_then(Value::as_array)
                    .into_iter()
                    .flatten()
                    .filter_map(|source| source.get("sourceId").and_then(Value::as_str))
                    .map(|source_id| Value::String(source_id.to_owned()))
                    .collect();
                projected.insert("sourceIds".to_owned(), Value::Array(source_ids));
            }
            Ok(Value::Object(projected))
        })
        .collect()
}

fn write_runtime_file(path: &Path, value: Value) -> Result<PathBuf, String> {
    let content = serde_json::to_string(&value)
        .map_err(|error| format!("Could not serialize {}: {error}", path.display()))?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Could not create {}: {error}", parent.display()))?;
    }
    fs::write(path, format!("{content}\n"))
        .map_err(|error| format!("Could not write {}: {error}", path.display()))?;
    Ok(path.to_path_buf())
}
