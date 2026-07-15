import { counties, data, getRegionSummary, getStatistics, regions, topLevelSeats } from "./data";
import { useAppStore } from "./store";
import { populationRegistrationNote } from "./statisticsNotes";
import { TaxMetricLabel, type TaxMetric } from "./taxGlossary";
import { Tooltip } from "./Tooltip";
import type { AdministrativeUnit, StatisticRecord } from "./types";

const isDerivedRegionRecord = (record: StatisticRecord) => record.valueType === "estimated";

function PopulationSummary({ records }: { records: StatisticRecord[] }) {
  const households = records.find(({ metric }) => metric === "households");
  const population = records.find(({ metric }) => metric === "registered-population");
  const aggregationNote = "南京直隶区未见直接总额，按14府、4直隶州万历六年登记值汇总。";
  const populationNote = households
    ? `${isDerivedRegionRecord(households) ? `${aggregationNote}\n` : ""}${populationRegistrationNote(households.recordedYear)}`
    : "";
  return <section className="scope-section">
    <p className="eyebrow">户口登记</p>
    {households && population ? <>
      <strong className="scope-primary">{households.value.toLocaleString("zh-CN")} 户<Tooltip content={populationNote}>
        <sup tabIndex={0}>1</sup>
      </Tooltip></strong>
      <p className="scope-secondary">口数 {population.value.toLocaleString("zh-CN")} 口</p>
      <small>公元 {households.recordedYear} 年登记</small>
      <small>{isDerivedRegionRecord(households) ? aggregationNote : populationNote}</small>
    </> : <span className="metric-empty">暂无同口径可比汇总</span>}
  </section>;
}

function TaxSummary({ records, regionId }: { records: StatisticRecord[]; regionId?: string }) {
  const taxMetrics: TaxMetric[] = ["registered-land", "summer-tax", "autumn-grain"];
  const taxes = records.filter(({ metric }) => taxMetrics.includes(metric as TaxMetric));
  const silver = records.find(({ metric }) => metric === "silver");
  const taxByMetric = new Map(taxes.map((record) => [record.metric, record]));
  const formatTaxValue = (record: StatisticRecord) => {
    const prefix = record.metric === "summer-tax" ? "本色小麦 " : record.metric === "autumn-grain" ? "本色米 " : "";
    const unit = record.unit === "qing" ? "顷" : record.unit === "liang" ? "两" : "石余";
    return `${prefix}${Math.floor(record.value).toLocaleString("zh-CN")} ${unit}`;
  };
  return <section className="scope-section">
    <p className="eyebrow">赋税原额{taxes[0] && <Tooltip content={regionId === "nanjing"
      ? "《大明会典》万历六年实在田土、实征夏税与秋粮；南京直隶区未见同口径直接总额，以下田产、夏税、秋粮按14府、4直隶州分项汇总。"
      : "来源：《大明会典》万历六年实在田土、实征夏税与秋粮"}>
      <sup tabIndex={0}>2</sup>
    </Tooltip>}</p>
    {taxes.length ? <dl className="scope-tax">{taxMetrics.map((metric) => {
      const record = taxByMetric.get(metric);
      return <div key={metric}><dt><TaxMetricLabel metric={metric} /></dt>
        <dd>{record ? formatTaxValue(record) : "暂无完整总额"}</dd></div>;
    })}
      <div><dt><TaxMetricLabel metric="silver" /></dt>
        <dd>{silver ? formatTaxValue(silver) : "暂无可靠记录"}</dd></div>
    </dl>
      : <span className="metric-empty">暂无同口径可比汇总</span>}
    {regionId === "nanjing" && taxes.length > 0 && <small>
      当前汇总含万历六年官民田土、本色小麦与本色米；丝绢、布帛、钞、折色银及其他税目未纳入统一合计。
    </small>}
  </section>;
}

function UnitButtons({ units, onSelect }: {
  units: AdministrativeUnit[];
  onSelect: (unit: AdministrativeUnit) => void;
}) {
  return <div className="scope-unit-list">{units.map((unit) =>
    <button key={unit.id} onClick={() => onSelect(unit)}>{unit.name}</button>)}</div>;
}

export function ScopePanel({ region }: { region?: AdministrativeUnit }) {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const setActiveRegion = useAppStore((state) => state.setActiveRegion);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const records = region ? getStatistics(region.id) : [];
  const summary = getRegionSummary(region?.id ?? null);
  const childSeats = region ? topLevelSeats.filter(({ region: parent }) => parent.id === region.id) : [];
  const countyCount = region
    ? counties.filter(({ region: parent }) => parent.id === region.id).length
    : counties.length;
  const prefectureCount = region
    ? childSeats.filter(({ unit }) => unit.level === "prefecture").length
    : summary.prefectures;
  const departmentCount = region
    ? childSeats.filter(({ unit }) => unit.level === "department").length
    : summary.departments;
  const departmentLabel = region?.level === "capital-region" ? "直隶州" : "州";
  const formalName = region?.formalName?.replace(region.name, "");

  const selectRegion = (unit: AdministrativeUnit) => setActiveRegion(unit.id);
  const selectSeat = (unit: AdministrativeUnit) => {
    setActiveRegion(region!.id);
    selectUnit(unit.id);
  };

  return <aside className={`left-panel ${sidebarOpen ? "is-open" : ""}`}>
    <button className="panel-close" onClick={() => setSidebarOpen(false)} aria-label="关闭资料面板">×</button>
    <p className="eyebrow">{region ? (region.level === "capital-region" ? "直隶区资料" : "省级资料") : "全国总览"}</p>
    <div className="region-heading">
      <h2 className="region-title">{region?.name ?? "两京十三省"}</h2>
      {formalName && <p className="region-formal-name">{formalName}</p>}
    </div>
    <p className="muted">总录入 {prefectureCount} 府，{departmentCount} {departmentLabel}，{countyCount} 县</p>

    <PopulationSummary records={records} />
    <TaxSummary records={records} regionId={region?.id} />

    <section className="scope-section">
      <div className="section-heading"><p className="eyebrow">下辖单位</p>
        <span>{region ? childSeats.length : regions.length} 处</span></div>
      <UnitButtons units={region ? childSeats.map(({ unit }) => unit) : regions}
        onSelect={region ? selectSeat : selectRegion} />
    </section>

    {region && <details className="scope-section scope-peer-regions">
      <summary className="section-heading">
        <span className="eyebrow">同级单位</span>
        <span className="scope-peer-count">{regions.length} 处</span>
      </summary>
      <UnitButtons units={regions} onSelect={selectRegion} />
    </details>}

    <details className="scope-details">
      <summary>统计说明</summary>
      <p>本项目以万历六年（1578）为人口、田产与赋税展示口径；南京直隶区的区域值按14府、4直隶州分项汇总，折色银等缺失项目明确标注。</p>
      <p>当前版本保留完整府州县行政层级；县级人口、赋税暂不继续扩展，江宁县记录作为现有示例保留。</p>
      <p>当前行政数量表示项目已录入数据，并不代替史籍总数校勘。</p>
      <small>资料记录：{data.sources.length} 种来源</small>
    </details>
  </aside>;
}
