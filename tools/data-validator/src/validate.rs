use std::collections::HashSet;

use crate::model::{
    AdministrativeUnit, LocationAccuracy, MilitaryMeasureType, MilitaryStatistic,
    MilitaryStatisticMetric, MilitaryStatisticUnit, MilitaryUnit, MilitaryUnitKind, Place,
    PlaceName, Polity, ProjectData, Relation, RelationType, SourceLink, YearRange,
};

pub fn validate(data: &ProjectData) -> Vec<String> {
    let mut errors = Vec::new();

    if data.schema_version != 1 {
        errors.push(format!(
            "schemaVersion must be 1, found {}",
            data.schema_version
        ));
    }

    let source_ids = collect_unique_ids(
        data.sources.iter().map(|item| item.id.as_str()),
        "source",
        &mut errors,
    );
    let polity_ids = collect_unique_ids(
        data.polities.iter().map(|item| item.id.as_str()),
        "polity",
        &mut errors,
    );
    let administrative_unit_ids = collect_unique_ids(
        data.administrative_units
            .iter()
            .map(|item| item.id.as_str()),
        "administrative unit",
        &mut errors,
    );
    let military_unit_ids = collect_unique_ids(
        data.military_units.iter().map(|item| item.id.as_str()),
        "military unit",
        &mut errors,
    );
    let military_command_unit_ids = data
        .military_units
        .iter()
        .filter(|unit| {
            matches!(
                &unit.military_kind,
                MilitaryUnitKind::Dusi | MilitaryUnitKind::XingDusi | MilitaryUnitKind::LiushouSi
            )
        })
        .map(|unit| unit.id.as_str())
        .collect::<HashSet<_>>();
    let special_governance_unit_ids = data
        .administrative_units
        .iter()
        .filter(|unit| {
            matches!(
                &unit.domain,
                Some(crate::model::UnitDomain::SpecialGovernance)
            )
        })
        .map(|unit| unit.id.as_str())
        .collect::<HashSet<_>>();
    let mut unit_ids = administrative_unit_ids.clone();
    for id in &military_unit_ids {
        if !unit_ids.insert(id) {
            errors.push(format!("duplicate historical unit id: {id}"));
        }
    }
    collect_unique_ids(
        data.statistics
            .iter()
            .map(|item| item.id.as_str())
            .chain(data.scope_statistics.iter().map(|item| item.id.as_str()))
            .chain(data.military_statistics.iter().map(|item| item.id.as_str())),
        "statistic",
        &mut errors,
    );
    let place_ids = collect_unique_ids(
        data.places.iter().map(|item| item.id.as_str()),
        "place",
        &mut errors,
    );
    collect_unique_ids(
        data.place_names.iter().map(|item| item.id.as_str()),
        "place name",
        &mut errors,
    );

    for source in &data.sources {
        validate_id(&source.id, "source", &mut errors);
        require_text(&source.title, &source.id, "title", &mut errors);
        require_text(&source.license, &source.id, "license", &mut errors);
        require_text(&source.citation, &source.id, "citation", &mut errors);
        if let Some(date) = &source.accessed_on {
            validate_date(date, &source.id, "accessedOn", &mut errors);
        }
    }

    for polity in &data.polities {
        validate_polity(polity, &source_ids, &mut errors);
    }

    for unit in &data.administrative_units {
        validate_unit(
            unit,
            &source_ids,
            &polity_ids,
            &administrative_unit_ids,
            &place_ids,
            &mut errors,
        );
    }

    for unit in &data.military_units {
        validate_military_unit(unit, &source_ids, &polity_ids, &place_ids, &mut errors);
    }

    for relation in &data.relations {
        validate_relation(
            relation,
            &source_ids,
            &administrative_unit_ids,
            &military_unit_ids,
            &special_governance_unit_ids,
            &place_ids,
            &mut errors,
        );
    }

    for statistic in &data.statistics {
        validate_id(&statistic.id, "statistic", &mut errors);
        if !administrative_unit_ids.contains(statistic.administrative_unit_id.as_str()) {
            errors.push(format!(
                "{} references missing administrative unit {}",
                statistic.id, statistic.administrative_unit_id
            ));
        }
        if !statistic.value.is_finite() || statistic.value < 0.0 {
            errors.push(format!(
                "{} has an invalid non-negative value",
                statistic.id
            ));
        }
        validate_source_links(&statistic.sources, &statistic.id, &source_ids, &mut errors);
        validate_audit(
            &statistic.audit.reviewed_on,
            &statistic.audit.revision_note,
            &statistic.id,
            &mut errors,
        );
    }

    for statistic in &data.scope_statistics {
        validate_id(&statistic.id, "scope statistic", &mut errors);
        if !statistic.value.is_finite() || statistic.value < 0.0 {
            errors.push(format!(
                "{} has an invalid non-negative value",
                statistic.id
            ));
        }
        validate_source_links(&statistic.sources, &statistic.id, &source_ids, &mut errors);
        validate_audit(
            &statistic.audit.reviewed_on,
            &statistic.audit.revision_note,
            &statistic.id,
            &mut errors,
        );
    }

    for statistic in &data.military_statistics {
        validate_military_statistic(
            statistic,
            &source_ids,
            &military_command_unit_ids,
            &mut errors,
        );
    }

    for place in &data.places {
        validate_place(place, &source_ids, &mut errors);
    }

    for place_name in &data.place_names {
        validate_place_name(place_name, &source_ids, &place_ids, &mut errors);
    }

    errors
}

fn validate_polity(polity: &Polity, source_ids: &HashSet<&str>, errors: &mut Vec<String>) {
    validate_id(&polity.id, "polity", errors);
    require_text(&polity.name, &polity.id, "name", errors);
    validate_year_range(&polity.validity, &polity.id, errors);
    validate_source_links(&polity.sources, &polity.id, source_ids, errors);
    validate_audit(
        &polity.audit.reviewed_on,
        &polity.audit.revision_note,
        &polity.id,
        errors,
    );
}

fn validate_unit(
    unit: &AdministrativeUnit,
    source_ids: &HashSet<&str>,
    polity_ids: &HashSet<&str>,
    unit_ids: &HashSet<&str>,
    place_ids: &HashSet<&str>,
    errors: &mut Vec<String>,
) {
    validate_id(&unit.id, "administrative unit", errors);
    require_text(&unit.name, &unit.id, "name", errors);
    validate_year_range(&unit.validity, &unit.id, errors);
    validate_source_links(&unit.sources, &unit.id, source_ids, errors);
    validate_audit(
        &unit.audit.reviewed_on,
        &unit.audit.revision_note,
        &unit.id,
        errors,
    );

    if !polity_ids.contains(unit.polity_id.as_str()) {
        errors.push(format!(
            "{} references missing polity {}",
            unit.id, unit.polity_id
        ));
    }
    if let Some(parent_id) = &unit.parent_id {
        if parent_id == &unit.id {
            errors.push(format!("{} cannot be its own parent", unit.id));
        } else if !unit_ids.contains(parent_id.as_str()) {
            errors.push(format!(
                "{} references missing parent {}",
                unit.id, parent_id
            ));
        }
    }
    if let Some(place_id) = &unit.seat_place_id
        && !place_ids.contains(place_id.as_str())
    {
        errors.push(format!(
            "{} references missing seat place {}",
            unit.id, place_id
        ));
    }
}

fn validate_military_unit(
    unit: &MilitaryUnit,
    source_ids: &HashSet<&str>,
    polity_ids: &HashSet<&str>,
    place_ids: &HashSet<&str>,
    errors: &mut Vec<String>,
) {
    validate_id(&unit.id, "military unit", errors);
    require_text(&unit.name, &unit.id, "name", errors);
    validate_year_range(&unit.validity, &unit.id, errors);
    validate_source_links(&unit.sources, &unit.id, source_ids, errors);
    validate_audit(
        &unit.audit.reviewed_on,
        &unit.audit.revision_note,
        &unit.id,
        errors,
    );

    if !matches!(&unit.level, crate::model::AdministrativeLevel::Military) {
        errors.push(format!("{} must use military level", unit.id));
    }
    if !matches!(&unit.domain, crate::model::UnitDomain::Military) {
        errors.push(format!("{} must use military domain", unit.id));
    }
    if !polity_ids.contains(unit.polity_id.as_str()) {
        errors.push(format!(
            "{} references missing polity {}",
            unit.id, unit.polity_id
        ));
    }
    if let Some(place_id) = &unit.seat_place_id
        && !place_ids.contains(place_id.as_str())
    {
        errors.push(format!(
            "{} references missing seat place {}",
            unit.id, place_id
        ));
    }
}

fn validate_military_statistic(
    statistic: &MilitaryStatistic,
    source_ids: &HashSet<&str>,
    military_command_unit_ids: &HashSet<&str>,
    errors: &mut Vec<String>,
) {
    validate_id(&statistic.id, "military statistic", errors);
    if !military_command_unit_ids.contains(statistic.military_unit_id.as_str()) {
        errors.push(format!(
            "{} must reference a dusi, xing-dusi, or liushou-si military unit",
            statistic.id
        ));
    }
    if !statistic.value.is_finite() || statistic.value < 0.0 {
        errors.push(format!(
            "{} has an invalid non-negative value",
            statistic.id
        ));
    }
    if !military_measure_matches(&statistic.metric, &statistic.measure_type) {
        errors.push(format!(
            "{} has a measureType that does not match its metric",
            statistic.id
        ));
    }
    if !military_unit_matches(&statistic.metric, &statistic.unit) {
        errors.push(format!(
            "{} has a unit that does not match its metric",
            statistic.id
        ));
    }
    validate_source_links(&statistic.sources, &statistic.id, source_ids, errors);
    validate_audit(
        &statistic.audit.reviewed_on,
        &statistic.audit.revision_note,
        &statistic.id,
        errors,
    );
}

fn military_measure_matches(
    metric: &MilitaryStatisticMetric,
    measure_type: &MilitaryMeasureType,
) -> bool {
    match metric {
        MilitaryStatisticMetric::SoldierCount => matches!(
            measure_type,
            MilitaryMeasureType::FieldArmy
                | MilitaryMeasureType::TuntianArmy
                | MilitaryMeasureType::Establishment
                | MilitaryMeasureType::Registered
                | MilitaryMeasureType::Actual
        ),
        MilitaryStatisticMetric::TuntianArea => matches!(
            measure_type,
            MilitaryMeasureType::OriginalArea
                | MilitaryMeasureType::RegisteredArea
                | MilitaryMeasureType::CurrentArea
                | MilitaryMeasureType::CultivatedArea
        ),
        MilitaryStatisticMetric::TuntianGrain => matches!(
            measure_type,
            MilitaryMeasureType::SummerTax
                | MilitaryMeasureType::AutumnGrain
                | MilitaryMeasureType::AnnualYield
                | MilitaryMeasureType::Allocated
                | MilitaryMeasureType::Stored
        ),
    }
}

fn military_unit_matches(metric: &MilitaryStatisticMetric, unit: &MilitaryStatisticUnit) -> bool {
    match metric {
        MilitaryStatisticMetric::SoldierCount => matches!(unit, MilitaryStatisticUnit::People),
        MilitaryStatisticMetric::TuntianArea => matches!(
            unit,
            MilitaryStatisticUnit::Qing | MilitaryStatisticUnit::Mu
        ),
        MilitaryStatisticMetric::TuntianGrain => matches!(
            unit,
            MilitaryStatisticUnit::Shi | MilitaryStatisticUnit::Dou
        ),
    }
}

fn validate_relation(
    relation: &Relation,
    source_ids: &HashSet<&str>,
    administrative_unit_ids: &HashSet<&str>,
    military_unit_ids: &HashSet<&str>,
    special_governance_unit_ids: &HashSet<&str>,
    place_ids: &HashSet<&str>,
    errors: &mut Vec<String>,
) {
    validate_id(&relation.id, "relation", errors);
    validate_year_range(&relation.validity, &relation.id, errors);
    validate_source_links(&relation.sources, &relation.id, source_ids, errors);
    validate_audit(
        &relation.audit.reviewed_on,
        &relation.audit.revision_note,
        &relation.id,
        errors,
    );

    let subject_is_military = military_unit_ids.contains(relation.subject_id.as_str());
    let object_is_military = military_unit_ids.contains(relation.object_id.as_str());
    let subject_is_special_governance =
        special_governance_unit_ids.contains(relation.subject_id.as_str());
    let subject_is_administrative = administrative_unit_ids.contains(relation.subject_id.as_str());
    let object_is_administrative = administrative_unit_ids.contains(relation.object_id.as_str());
    let object_is_place = place_ids.contains(relation.object_id.as_str());

    match &relation.relation_type {
        RelationType::MilitarySubordination => {
            require_relation_endpoint(
                subject_is_military,
                &relation.subject_id,
                "military unit",
                &relation.id,
                errors,
            );
            require_relation_endpoint(
                object_is_military,
                &relation.object_id,
                "military unit",
                &relation.id,
                errors,
            );
        }
        RelationType::MilitaryAffiliation => {
            require_relation_endpoint(
                subject_is_military || subject_is_special_governance,
                &relation.subject_id,
                "military or special-governance unit",
                &relation.id,
                errors,
            );
            require_relation_endpoint(
                object_is_military,
                &relation.object_id,
                "military unit",
                &relation.id,
                errors,
            );
        }
        RelationType::FiveArmyAffiliation => {
            require_relation_endpoint(
                subject_is_military,
                &relation.subject_id,
                "military unit",
                &relation.id,
                errors,
            );
            let valid_five_army = matches!(
                relation.object_id.as_str(),
                "central" | "left" | "right" | "front" | "rear"
            );
            require_relation_endpoint(
                valid_five_army,
                &relation.object_id,
                "five army command",
                &relation.id,
                errors,
            );
        }
        RelationType::AdministrativeContext | RelationType::CoLocation => {
            require_relation_endpoint(
                subject_is_military,
                &relation.subject_id,
                "military unit",
                &relation.id,
                errors,
            );
            require_relation_endpoint(
                object_is_administrative,
                &relation.object_id,
                "administrative unit",
                &relation.id,
                errors,
            );
        }
    }

    if relation.subject_id == relation.object_id {
        errors.push(format!("{} cannot relate an object to itself", relation.id));
    }
    if !subject_is_military
        && !subject_is_administrative
        && !place_ids.contains(relation.subject_id.as_str())
    {
        errors.push(format!(
            "{} references missing subject {}",
            relation.id, relation.subject_id
        ));
    }
    if !object_is_military
        && !object_is_administrative
        && !object_is_place
        && !matches!(&relation.relation_type, RelationType::FiveArmyAffiliation)
    {
        errors.push(format!(
            "{} references missing object {}",
            relation.id, relation.object_id
        ));
    }
}

fn require_relation_endpoint(
    valid: bool,
    endpoint: &str,
    expected: &str,
    relation_id: &str,
    errors: &mut Vec<String>,
) {
    if !valid {
        errors.push(format!(
            "{} expects {} endpoint {}, but it was not found",
            relation_id, expected, endpoint
        ));
    }
}

fn validate_place(place: &Place, source_ids: &HashSet<&str>, errors: &mut Vec<String>) {
    validate_id(&place.id, "place", errors);
    validate_source_links(&place.sources, &place.id, source_ids, errors);
    validate_audit(
        &place.audit.reviewed_on,
        &place.audit.revision_note,
        &place.id,
        errors,
    );

    match (place.longitude, place.latitude) {
        (Some(longitude), Some(latitude)) => {
            if !(-180.0..=180.0).contains(&longitude) {
                errors.push(format!("{} longitude is outside [-180, 180]", place.id));
            }
            if !(-90.0..=90.0).contains(&latitude) {
                errors.push(format!("{} latitude is outside [-90, 90]", place.id));
            }
            if place.location_accuracy == LocationAccuracy::Unknown {
                errors.push(format!(
                    "{} has coordinates but locationAccuracy is unknown",
                    place.id
                ));
            }
        }
        (None, None) => {
            if place.location_accuracy != LocationAccuracy::Unknown {
                errors.push(format!(
                    "{} has no coordinates and must use unknown locationAccuracy",
                    place.id
                ));
            }
        }
        _ => errors.push(format!(
            "{} must provide both longitude and latitude or neither",
            place.id
        )),
    }
}

fn validate_place_name(
    place_name: &PlaceName,
    source_ids: &HashSet<&str>,
    place_ids: &HashSet<&str>,
    errors: &mut Vec<String>,
) {
    validate_id(&place_name.id, "place name", errors);
    require_text(&place_name.name, &place_name.id, "name", errors);
    validate_year_range(&place_name.validity, &place_name.id, errors);
    validate_source_links(&place_name.sources, &place_name.id, source_ids, errors);
    validate_audit(
        &place_name.audit.reviewed_on,
        &place_name.audit.revision_note,
        &place_name.id,
        errors,
    );

    if !place_ids.contains(place_name.place_id.as_str()) {
        errors.push(format!(
            "{} references missing place {}",
            place_name.id, place_name.place_id
        ));
    }
}

fn collect_unique_ids<'a>(
    ids: impl Iterator<Item = &'a str>,
    entity: &str,
    errors: &mut Vec<String>,
) -> HashSet<&'a str> {
    let mut unique = HashSet::new();
    for id in ids {
        if !unique.insert(id) {
            errors.push(format!("duplicate {entity} id: {id}"));
        }
    }
    unique
}

fn validate_id(id: &str, entity: &str, errors: &mut Vec<String>) {
    let valid = id.len() >= 3
        && id.len() <= 80
        && id.chars().enumerate().all(|(index, character)| {
            character.is_ascii_lowercase()
                || character.is_ascii_digit() && index > 0
                || character == '-' && index > 0 && index + 1 < id.len()
        })
        && !id.contains("--");

    if !valid {
        errors.push(format!("invalid {entity} id: {id}"));
    }
}

fn validate_year_range(range: &YearRange, id: &str, errors: &mut Vec<String>) {
    if let (Some(from), Some(to)) = (range.from, range.to)
        && from > to
    {
        errors.push(format!("{id} has validity.from after validity.to"));
    }
}

fn validate_source_links(
    links: &[SourceLink],
    owner_id: &str,
    source_ids: &HashSet<&str>,
    errors: &mut Vec<String>,
) {
    if links.is_empty() {
        errors.push(format!("{owner_id} must cite at least one source"));
    }
    for link in links {
        if !source_ids.contains(link.source_id.as_str()) {
            errors.push(format!(
                "{owner_id} references missing source {}",
                link.source_id
            ));
        }
    }
}

fn validate_audit(date: &str, note: &str, id: &str, errors: &mut Vec<String>) {
    validate_date(date, id, "reviewedOn", errors);
    require_text(note, id, "revisionNote", errors);
}

fn validate_date(date: &str, id: &str, field: &str, errors: &mut Vec<String>) {
    let bytes = date.as_bytes();
    let valid = bytes.len() == 10
        && bytes[4] == b'-'
        && bytes[7] == b'-'
        && bytes
            .iter()
            .enumerate()
            .all(|(index, byte)| index == 4 || index == 7 || byte.is_ascii_digit());
    if !valid {
        errors.push(format!("{id} has invalid {field}; expected YYYY-MM-DD"));
    }
}

fn require_text(value: &str, id: &str, field: &str, errors: &mut Vec<String>) {
    if value.trim().is_empty() {
        errors.push(format!("{id} has empty {field}"));
    }
}

#[cfg(test)]
mod tests {
    use super::validate;
    use crate::model::ProjectData;

    #[test]
    fn accepts_an_empty_project_scaffold() {
        let data: ProjectData = serde_json::from_str(
            r#"{
                "schemaVersion": 1,
                "sources": [],
                "statistics": [],
                "polities": [],
                "administrativeUnits": [],
                "militaryUnits": [],
                "relations": [],
                "places": [],
                "placeNames": []
            }"#,
        )
        .expect("fixture must deserialize");

        assert!(validate(&data).is_empty());
    }

    #[test]
    fn reports_missing_references_and_invalid_coordinates() {
        let data: ProjectData = serde_json::from_str(
            r#"{
                "schemaVersion": 1,
                "sources": [],
                "statistics": [],
                "polities": [],
                "administrativeUnits": [],
                "militaryUnits": [],
                "relations": [],
                "places": [{
                    "id": "sample-place",
                    "longitude": 181,
                    "latitude": 30,
                    "locationAccuracy": "exact",
                    "confidence": "low",
                    "sources": [{
                        "sourceId": "missing-source",
                        "claim": "location",
                        "confidence": "low"
                    }],
                    "audit": {
                        "reviewedOn": "2026-07-11",
                        "revisionNote": "Test fixture"
                    }
                }],
                "placeNames": []
            }"#,
        )
        .expect("fixture must deserialize");

        let errors = validate(&data);
        assert!(errors.iter().any(|error| error.contains("missing source")));
        assert!(errors.iter().any(|error| error.contains("longitude")));
    }
}
