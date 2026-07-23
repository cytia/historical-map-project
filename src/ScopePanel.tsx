import { counties, data, getRegionSummary, getStatistics, regions, topLevelSeats } from "./data";
import { useAppStore } from "./store";
import { populationRegistrationNote } from "./statisticsNotes";
import { TaxMetricLabel, type TaxMetric } from "./taxGlossary";
import { Tooltip } from "./Tooltip";
import { Scrollbar } from "./Scrollbar";
import { ScopeUnitButtons } from "./ScopeUnitButtons";
import type { AdministrativeUnit, StatisticFields } from "./types";

const isDerivedRegionRecord = (record: StatisticFields) => record.valueType === "estimated";

function PopulationSummary({ records }: { records: StatisticFields[] }) {
  const households = records.find(({ metric }) => metric === "households");
  const population = records.find(({ metric }) => metric === "registered-population");
  const populationNote = households
    ? populationRegistrationNote(households.recordedYear, isDerivedRegionRecord(households))
    : "";
  return <section className="scope-section scope-population">
    <p className="eyebrow">户口登记</p>
    {households && population ? <>
      <strong className="scope-primary">{households.value.toLocaleString("zh-CN")} 户<Tooltip content={populationNote}>
        <sup tabIndex={0}>1</sup>
      </Tooltip></strong>
      <p className="scope-secondary">口数 {population.value.toLocaleString("zh-CN")} 口</p>
    </> : <span className="metric-empty">暂无同口径可比汇总</span>}
  </section>;
}

function TaxSummary({ records, regionId }: { records: StatisticFields[]; regionId?: string }) {
  const taxMetrics: TaxMetric[] = ["registered-land", "summer-tax", "autumn-grain"];
  const taxes = records.filter(({ metric }) => taxMetrics.includes(metric as TaxMetric));
  const silver = records.find(({ metric }) => metric === "silver");
  const taxByMetric = new Map(taxes.map((record) => [record.metric, record]));
  const formatTaxValue = (record: StatisticFields) => {
    const prefix = record.metric === "summer-tax" ? "本色小麦 " : record.metric === "autumn-grain" ? "本色米 " : "";
    const unit = record.unit === "qing" ? "顷" : record.unit === "liang" ? "两" : "石余";
    return `${prefix}${Math.floor(record.value).toLocaleString("zh-CN")} ${unit}`;
  };
  return <section className="scope-section">
    <p className="eyebrow">赋税原额{taxes[0] && <Tooltip content={regionId === "nanjing"
      ? "《大明会典》万历六年实在官民田土、实征夏税与秋粮；南京直隶区未见直接总额，按14府、4直隶州分项汇总。当前仅计田产、本色小麦和本色米，折色银等其他税目未纳入。"
      : "来源：《大明会典》万历六年实在田土、实征夏税与秋粮"}>
      <sup tabIndex={0}>2</sup>
    </Tooltip>}</p>
    {taxes.length ? <dl className="scope-tax">{taxMetrics.map((metric) => {
      const record = taxByMetric.get(metric);
      const guizhouLandNote = metric === "registered-land" && regionId === "guizhou" && !record
        ? "贵州田产原文：《大明会典》：“贵州布政司田土自来原无丈量顷亩，每岁该纳粮差，俱于土官名下总行认纳，如洪武年间例。”因此不录入可换算的顷亩总额。"
        : undefined;
      return <div key={metric}><dt><TaxMetricLabel metric={metric} /></dt>
        <dd>{record ? formatTaxValue(record) : guizhouLandNote ? <Tooltip content={guizhouLandNote}>
          <span tabIndex={0}>暂无完整总额<sup className="tax-footnote">⑤</sup></span>
        </Tooltip> : "暂无完整总额"}</dd></div>;
    })}
      <div><dt><TaxMetricLabel metric="silver" /></dt>
        <dd>{silver ? formatTaxValue(silver) : "暂无可靠记录"}</dd></div>
    </dl>
      : <span className="metric-empty">暂无同口径可比汇总</span>}
  </section>;
}

export function ScopePanel({ region }: { region?: AdministrativeUnit }) {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const setActiveRegion = useAppStore((state) => state.setActiveRegion);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const records = region ? getStatistics(region.id) : data.scopeStatistics;
  const summary = getRegionSummary(region?.id ?? null);
  const childSeats = region ? topLevelSeats.filter(({ region: parent }) => parent.id === region.id) : [];
  const countyCount = region
    ? counties.filter(({ region: parent }) => parent.id === region.id).length
    : counties.length;
  const prefectureCount = summary.prefectures;
  const departmentCount = summary.departments;
  const departmentLabel = "州";
  const formalName = region?.formalName?.replace(region.name, "");

  const selectRegion = (unit: AdministrativeUnit) => setActiveRegion(unit.id);
  const selectSeat = (unit: AdministrativeUnit) => {
    setActiveRegion(region!.id);
    selectUnit(unit.id);
  };

  return <aside className={`left-panel ${sidebarOpen ? "is-open" : ""}`}>
    <button className="panel-close" onClick={() => setSidebarOpen(false)} aria-label="关闭资料面板">×</button>
    <Scrollbar>
      <p className="eyebrow">{region ? (region.level === "capital-region" ? "直隶区资料" : "省级资料") : "全国总览"}</p>
      <div className="region-heading">
        <h2 className="region-title">{region?.name ?? "两京十三省"}</h2>
        {formalName && <p className="region-formal-name">{formalName}</p>}
      </div>
      <p className="muted">总录入 {prefectureCount} 府，{departmentCount} {departmentLabel}，{countyCount} 县</p>

      <PopulationSummary records={records} />
      <TaxSummary records={records} regionId={region?.id} />

      <details className="scope-section scope-collapsible">
        <summary className="section-heading">
          <span className="eyebrow">下辖单位</span>
          <span className="scope-peer-count">{region ? childSeats.length : regions.length} 处</span>
        </summary>
        <ScopeUnitButtons units={region ? childSeats.map(({ unit }) => unit) : regions}
          onSelect={region ? selectSeat : selectRegion} />
      </details>

      {region && <details className="scope-section scope-peer-regions scope-collapsible">
        <summary className="section-heading">
          <span className="eyebrow">同级单位</span>
          <span className="scope-peer-count">{regions.length} 处</span>
        </summary>
        <ScopeUnitButtons units={regions} onSelect={selectRegion} />
      </details>}

      <details className="scope-details">
        <summary>统计说明</summary>
        <p>本项目以万历六年（1578）为人口、田产与赋税展示口径；南京直隶区的区域值按14府、4直隶州分项汇总，折色银等缺失项目明确标注。</p>
        <p>当前版本保留完整府州县行政层级；县级人口、赋税暂不继续扩展，江宁县记录作为现有示例保留。</p>
        <p>当前行政数量表示项目已录入数据，并不代替史籍总数校勘。</p>
        <small>资料记录：{data.sources.length} 种来源</small>
      </details>
    </Scrollbar>
  </aside>;
}
