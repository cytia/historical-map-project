use std::collections::HashMap;

use crate::model::{ClaimKind, ProjectData, Redistribution, Source, SourceKind, SourceLink};

pub fn commercial(data: &ProjectData) -> Vec<String> {
    let sources = data
        .sources
        .iter()
        .map(|source| (source.id.as_str(), source))
        .collect::<HashMap<_, _>>();
    let mut issues = Vec::new();

    check_links("scopeStatistics", &data.scope_statistics, &sources, &mut issues);
    check_links("statistics", &data.statistics, &sources, &mut issues);
    check_links("militaryStatistics", &data.military_statistics, &sources, &mut issues);
    check_links("polities", &data.polities, &sources, &mut issues);
    check_links(
        "administrativeUnits",
        &data.administrative_units,
        &sources,
        &mut issues,
    );
    check_links("militaryUnits", &data.military_units, &sources, &mut issues);
    check_links("jimiUnits", &data.jimi_units, &sources, &mut issues);
    check_links("relations", &data.relations, &sources, &mut issues);
    check_links("places", &data.places, &sources, &mut issues);
    check_links("placeNames", &data.place_names, &sources, &mut issues);

    issues
}

trait HasSources {
    fn id(&self) -> &str;
    fn sources(&self) -> &[SourceLink];
}

macro_rules! impl_has_sources {
    ($($type:ty),+ $(,)?) => {
        $(
            impl HasSources for $type {
                fn id(&self) -> &str {
                    &self.id
                }

                fn sources(&self) -> &[SourceLink] {
                    &self.sources
                }
            }
        )+
    };
}

impl_has_sources!(
    crate::model::ScopeStatistic,
    crate::model::Statistic,
    crate::model::MilitaryStatistic,
    crate::model::Polity,
    crate::model::AdministrativeUnit,
    crate::model::MilitaryUnit,
    crate::model::JimiUnit,
    crate::model::Relation,
    crate::model::Place,
    crate::model::PlaceName,
);

fn check_links<T: HasSources>(
    collection: &str,
    records: &[T],
    sources: &HashMap<&str, &Source>,
    issues: &mut Vec<String>,
) {
    for record in records {
        for link in record.sources() {
            if !matches!(link.claim, ClaimKind::Location) {
                continue;
            }

            let Some(source) = sources.get(link.source_id.as_str()) else {
                issues.push(format!(
                    "{collection}/{} references missing source {}",
                    record.id(),
                    link.source_id
                ));
                continue;
            };

            if source.coordinate_provider && commercial_policy_excludes(source) {
                issues.push(format!(
                    "{collection}/{} uses {}; commercial package policy excludes this coordinate source",
                    record.id(),
                    source.id
                ));
                continue;
            }

            if !source.coordinate_provider {
                if looks_like_coordinate_provider(source) {
                    issues.push(format!(
                        "{collection}/{} uses {} for a location claim, but the source is not marked coordinateProvider",
                        record.id(),
                        source.id
                    ));
                }
                continue;
            }

            if source.redistribution != Redistribution::Allowed {
                issues.push(format!(
                    "{collection}/{} uses {} for {} claim; redistribution={:?}; license={}",
                    record.id(),
                    source.id,
                    claim_label(&link.claim),
                    source.redistribution,
                    source.license
                ));
            }
        }
    }
}

fn looks_like_coordinate_provider(source: &Source) -> bool {
    source.kind == SourceKind::Dataset
        || source.id.contains("coordinate")
        || source.id.contains("openstreetmap")
        || source.id.contains("wikidata")
        || source.id.starts_with("amap-")
        || source.license.contains("coordinate directory")
        || source.license.contains("map directory")
}

fn commercial_policy_excludes(source: &Source) -> bool {
    source.id.contains("openstreetmap") || source.license.to_ascii_lowercase().contains("odbl")
}

fn claim_label(claim: &ClaimKind) -> &'static str {
    match claim {
        ClaimKind::Existence => "existence",
        ClaimKind::Name => "name",
        ClaimKind::Time => "time",
        ClaimKind::Location => "location",
        ClaimKind::Parent => "parent",
        ClaimKind::Boundary => "boundary",
    }
}
