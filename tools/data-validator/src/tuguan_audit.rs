use std::collections::{BTreeMap, HashMap, HashSet};

use crate::model::{AdministrativeLevel, JimiKind, ProjectData, RelationType};

struct AuditRow {
    id: String,
    name: String,
    office_kind: String,
    depth: usize,
    parent: String,
    context: String,
    point_status: String,
}

pub fn render(data: &ProjectData) -> String {
    let jimi_by_id = data
        .jimi_units
        .iter()
        .map(|unit| (unit.id.as_str(), unit))
        .collect::<HashMap<_, _>>();
    let administrative_by_id = data
        .administrative_units
        .iter()
        .map(|unit| (unit.id.as_str(), unit))
        .collect::<HashMap<_, _>>();
    let place_by_id = data
        .places
        .iter()
        .map(|place| (place.id.as_str(), place))
        .collect::<HashMap<_, _>>();
    let parent_by_id = data
        .relations
        .iter()
        .filter(|relation| relation.relation_type == RelationType::JimiSubordination)
        .map(|relation| (relation.subject_id.as_str(), relation.object_id.as_str()))
        .collect::<HashMap<_, _>>();
    let context_by_id = data
        .relations
        .iter()
        .filter(|relation| relation.relation_type == RelationType::JimiAdministrativeContext)
        .map(|relation| (relation.subject_id.as_str(), relation.object_id.as_str()))
        .collect::<HashMap<_, _>>();

    let mut rows_by_region: BTreeMap<String, Vec<AuditRow>> = BTreeMap::new();
    for unit in data
        .jimi_units
        .iter()
        .filter(|unit| matches!(&unit.jimi_kind, JimiKind::NativeOffice))
    {
        let (depth, parent_id) = hierarchy_position(unit.id.as_str(), &parent_by_id);
        let context_id = resolve_context(
            unit.id.as_str(),
            &parent_by_id,
            &context_by_id,
        );
        let region_id = context_id
            .and_then(|id| top_level_region(id, &administrative_by_id))
            .unwrap_or_else(|| "unresolved".to_owned());
        let context = context_id
            .and_then(|id| administrative_by_id.get(id))
            .map(|context| context.name.clone())
            .unwrap_or_else(|| "unresolved".to_owned());
        let parent = parent_id
            .and_then(|id| jimi_by_id.get(id))
            .map(|parent| parent.name.clone())
            .unwrap_or_else(|| "root".to_owned());
        let point_status = match unit
            .seat_place_id
            .as_deref()
            .and_then(|id| place_by_id.get(id))
        {
            Some(place) if place.longitude.is_some() && place.latitude.is_some() => "mapped",
            Some(_) => "missing-coordinate",
            None => "missing-place",
        };
        rows_by_region
            .entry(region_id)
            .or_default()
            .push(AuditRow {
                id: unit.id.clone(),
                name: unit.name.clone(),
                office_kind: format!("{:?}", unit.office_kind),
                depth,
                parent,
                context,
                point_status: point_status.to_owned(),
            });
    }

    for rows in rows_by_region.values_mut() {
        rows.sort_by(|left, right| left.name.cmp(&right.name));
    }

    let region_names = data
        .administrative_units
        .iter()
        .filter(|unit| {
            matches!(
                unit.level,
                AdministrativeLevel::Province | AdministrativeLevel::CapitalRegion
            )
        })
        .map(|unit| (unit.id.as_str(), unit.name.as_str()))
        .collect::<HashMap<_, _>>();
    let total = rows_by_region.values().map(Vec::len).sum::<usize>();
    let mut output = format!(
        "# 1600 Native-Office Audit\n\nTotal native-office records: {total}\n\n"
    );

    for (region_id, region_name) in region_names.iter().collect::<BTreeMap<_, _>>() {
        let rows = rows_by_region.get(*region_id);
        output.push_str(&format!(
            "## {} ({})\n\n",
            region_name, region_id
        ));
        match rows {
            Some(rows) if !rows.is_empty() => {
                output.push_str(
                    "| Institution | Office type | Level | Tuguan parent | Administrative context | Point | ID |\n|---|---|---:|---|---|---|---|\n",
                );
                for row in rows {
                    output.push_str(&format!(
                        "| {} | {} | {} | {} | {} | {} | `{}` |\n",
                        row.name,
                        row.office_kind,
                        row.depth,
                        row.parent,
                        row.context,
                        row.point_status,
                        row.id,
                    ));
                }
                output.push('\n');
            }
            _ => output.push_str("No native-office record is currently loaded for the 1600 slice.\n\n"),
        }
    }

    if let Some(rows) = rows_by_region.get("unresolved") {
        output.push_str("## Unresolved administrative context\n\n");
        output.push_str(
            "These records require source review before they can receive a provincial color.\n\n",
        );
        for row in rows {
            output.push_str(&format!("- {} (`{}`)\n", row.name, row.id));
        }
    }

    output
}

fn hierarchy_position<'a>(
    unit_id: &'a str,
    parent_by_id: &HashMap<&'a str, &'a str>,
) -> (usize, Option<&'a str>) {
    let mut current = unit_id;
    let mut depth = 1;
    let mut parent = None;
    let mut visited = HashSet::new();
    while let Some(next) = parent_by_id.get(current) {
        if !visited.insert(current) {
            break;
        }
        parent = Some(*next);
        current = next;
        depth += 1;
    }
    (depth, parent)
}

fn resolve_context<'a>(
    unit_id: &'a str,
    parent_by_id: &HashMap<&'a str, &'a str>,
    context_by_id: &HashMap<&'a str, &'a str>,
) -> Option<&'a str> {
    let mut current = unit_id;
    let mut visited = HashSet::new();
    loop {
        if let Some(context) = context_by_id.get(current) {
            return Some(*context);
        }
        if !visited.insert(current) {
            return None;
        }
        current = parent_by_id.get(current).copied()?;
    }
}

fn top_level_region<'a>(
    unit_id: &'a str,
    administrative_by_id: &HashMap<&'a str, &crate::model::AdministrativeUnit>,
) -> Option<String> {
    let mut current = unit_id;
    let mut visited = HashSet::new();
    loop {
        let unit = administrative_by_id.get(current)?;
        if matches!(
            unit.level,
            AdministrativeLevel::Province | AdministrativeLevel::CapitalRegion
        ) {
            return Some(unit.id.clone());
        }
        if !visited.insert(current) {
            return None;
        }
        current = unit.parent_id.as_deref()?;
    }
}
