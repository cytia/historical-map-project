#![allow(
    dead_code,
    reason = "Schema fields are validated during deserialization even when no cross-record rule reads them"
)]

use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProjectData {
    #[serde(rename = "$schema")]
    pub schema: Option<String>,
    pub schema_version: u32,
    pub sources: Vec<Source>,
    #[serde(default)]
    pub scope_statistics: Vec<ScopeStatistic>,
    pub statistics: Vec<Statistic>,
    #[serde(default)]
    pub military_statistics: Vec<MilitaryStatistic>,
    pub polities: Vec<Polity>,
    pub administrative_units: Vec<AdministrativeUnit>,
    pub military_units: Vec<MilitaryUnit>,
    pub jimi_units: Vec<JimiUnit>,
    pub relations: Vec<Relation>,
    pub places: Vec<Place>,
    pub place_names: Vec<PlaceName>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Statistic {
    pub id: String,
    pub administrative_unit_id: String,
    pub category: StatisticCategory,
    pub metric: StatisticMetric,
    pub value: f64,
    pub unit: StatisticUnit,
    pub original_text: Option<String>,
    pub recorded_year: Option<i32>,
    pub value_type: StatisticValueType,
    pub method: Option<String>,
    pub confidence: Confidence,
    pub sources: Vec<SourceLink>,
    pub audit: Audit,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ScopeStatistic {
    pub id: String,
    pub category: StatisticCategory,
    pub metric: StatisticMetric,
    pub value: f64,
    pub unit: StatisticUnit,
    pub original_text: Option<String>,
    pub recorded_year: Option<i32>,
    pub value_type: StatisticValueType,
    pub method: Option<String>,
    pub confidence: Confidence,
    pub sources: Vec<SourceLink>,
    pub audit: Audit,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum StatisticCategory {
    Population,
    Tax,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum StatisticMetric {
    Households,
    RegisteredPopulation,
    RegisteredLand,
    SummerTax,
    AutumnGrain,
    Silver,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum StatisticUnit {
    Households,
    People,
    Qing,
    Shi,
    Liang,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum MilitaryStatisticMetric {
    SoldierCount,
    TuntianArea,
    TuntianGrain,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum MilitaryMeasureType {
    FieldArmy,
    TuntianArmy,
    Establishment,
    Registered,
    Actual,
    OriginalArea,
    RegisteredArea,
    CurrentArea,
    CultivatedArea,
    SummerTax,
    AutumnGrain,
    AnnualYield,
    Allocated,
    Stored,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum MilitaryStatisticUnit {
    People,
    Qing,
    Mu,
    Shi,
    Dou,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum StatisticValueType {
    Recorded,
    Estimated,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Source {
    pub id: String,
    pub title: String,
    pub kind: SourceKind,
    pub license: String,
    pub redistribution: Redistribution,
    #[serde(default)]
    pub coordinate_provider: bool,
    pub citation: String,
    pub creator: Option<String>,
    pub edition: Option<String>,
    pub locator: Option<String>,
    pub url: Option<String>,
    pub accessed_on: Option<String>,
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum SourceKind {
    Primary,
    Scholarly,
    Gazetteer,
    Dataset,
    Reference,
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum Redistribution {
    Allowed,
    Restricted,
    Unknown,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Polity {
    pub id: String,
    pub name: String,
    pub formal_name: Option<String>,
    pub validity: YearRange,
    pub confidence: Confidence,
    pub sources: Vec<SourceLink>,
    pub audit: Audit,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AdministrativeUnit {
    pub id: String,
    pub name: String,
    pub formal_name: Option<String>,
    pub level: AdministrativeLevel,
    pub domain: Option<UnitDomain>,
    pub military_kind: Option<MilitaryUnitKind>,
    pub five_army_id: Option<FiveArmyId>,
    pub polity_id: String,
    pub parent_id: Option<String>,
    pub seat_place_id: Option<String>,
    pub validity: YearRange,
    pub confidence: Confidence,
    pub sources: Vec<SourceLink>,
    pub audit: Audit,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct MilitaryStatistic {
    pub id: String,
    pub military_unit_id: String,
    pub metric: MilitaryStatisticMetric,
    pub measure_type: MilitaryMeasureType,
    pub value: f64,
    pub unit: MilitaryStatisticUnit,
    pub original_text: Option<String>,
    pub recorded_year: Option<i32>,
    pub value_type: StatisticValueType,
    pub confidence: Confidence,
    pub sources: Vec<SourceLink>,
    pub audit: Audit,
    pub note: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct MilitaryUnit {
    pub id: String,
    pub name: String,
    pub formal_name: Option<String>,
    pub level: AdministrativeLevel,
    pub domain: UnitDomain,
    pub military_kind: MilitaryUnitKind,
    pub polity_id: String,
    pub seat_place_id: Option<String>,
    pub validity: YearRange,
    pub confidence: Confidence,
    pub sources: Vec<SourceLink>,
    pub audit: Audit,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct JimiUnit {
    pub id: String,
    pub name: String,
    pub formal_name: Option<String>,
    pub jimi_kind: JimiKind,
    pub office_kind: JimiOfficeKind,
    pub polity_id: String,
    pub seat_place_id: Option<String>,
    pub validity: YearRange,
    pub confidence: Confidence,
    pub sources: Vec<SourceLink>,
    pub audit: Audit,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Relation {
    pub id: String,
    pub relation_type: RelationType,
    pub subject_id: String,
    pub object_id: String,
    pub validity: YearRange,
    pub confidence: Confidence,
    pub note: Option<String>,
    pub sources: Vec<SourceLink>,
    pub audit: Audit,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum UnitDomain {
    Administrative,
    Military,
    SpecialGovernance,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum JimiKind {
    MilitaryInstitution,
    NativeOffice,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum JimiOfficeKind {
    Dusi,
    XingDusi,
    LiushouSi,
    Wei,
    Suo,
    YuanshuaiFu,
    WanhuFu,
    XuanweiSi,
    XuanfuSi,
    ZhaotaoSi,
    AnfuSi,
    ZhangguanSi,
    TusiXunjianSi,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum MilitaryUnitKind {
    Dusi,
    XingDusi,
    LiushouSi,
    Wei,
    QianhuSuo,
    Suo,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum FiveArmyId {
    Central,
    Left,
    Right,
    Front,
    Rear,
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum RelationType {
    MilitarySubordination,
    MilitaryAffiliation,
    FiveArmyAffiliation,
    AdministrativeContext,
    CoLocation,
    JimiSubordination,
    JimiAdministrativeContext,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AdministrativeLevel {
    CapitalRegion,
    Province,
    Prefecture,
    Department,
    County,
    Military,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Place {
    pub id: String,
    pub longitude: Option<f64>,
    pub latitude: Option<f64>,
    pub location_accuracy: LocationAccuracy,
    pub location_method: Option<String>,
    pub confidence: Confidence,
    pub sources: Vec<SourceLink>,
    pub audit: Audit,
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum LocationAccuracy {
    Exact,
    Approximate,
    AreaOnly,
    Disputed,
    Unknown,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct PlaceName {
    pub id: String,
    pub place_id: String,
    pub name: String,
    pub script: Option<NameScript>,
    pub validity: YearRange,
    pub confidence: Confidence,
    pub sources: Vec<SourceLink>,
    pub audit: Audit,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum NameScript {
    Hans,
    Hant,
    Historical,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct YearRange {
    pub from: Option<i32>,
    pub to: Option<i32>,
    pub precision: TimePrecision,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TimePrecision {
    Exact,
    Circa,
    Range,
    Unknown,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Confidence {
    High,
    Medium,
    Low,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SourceLink {
    pub source_id: String,
    pub claim: ClaimKind,
    pub confidence: Confidence,
    pub note: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ClaimKind {
    Existence,
    Name,
    Time,
    Location,
    Parent,
    Boundary,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Audit {
    pub reviewed_on: String,
    pub revision_note: String,
}
