import { counties, data, getRegionSummary, getStatistics, regions, topLevelSeats } from "./data";
import { useAppStore } from "./store";
import type { AdministrativeUnit, StatisticRecord } from "./types";

function PopulationSummary({ records }: { records: StatisticRecord[] }) {
  const households = records.find(({ metric }) => metric === "households");
  const population = records.find(({ metric }) => metric === "registered-population");
  return <section className="scope-section">
    <p className="eyebrow">户口登记</p>
    {households && population ? <>
      <strong className="scope-primary">{households.value.toLocaleString("zh-CN")} 户</strong>
      <p className="scope-secondary">口数 {population.value.toLocaleString("zh-CN")} 口</p>
      <small>公元 {households.recordedYear} 年登记</small>
    </> : <span className="metric-empty">暂无同口径可比汇总</span>}
  </section>;
}

function TaxSummary({ records }: { records: StatisticRecord[] }) {
  const labels = { "registered-land": "田产", "summer-tax": "夏税", "autumn-grain": "秋粮" } as const;
  const taxes = records.filter(({ metric }) => metric in labels);
  return <section className="scope-section">
    <p className="eyebrow">赋税原额</p>
    {taxes.length ? <dl className="scope-tax">{taxes.map((record) =>
      <div key={record.id}><dt>{labels[record.metric as keyof typeof labels]}</dt>
        <dd>{Math.floor(record.value).toLocaleString("zh-CN")} {record.unit === "qing" ? "顷" : "石余"}</dd></div>)}</dl>
      : <span className="metric-empty">暂无同口径可比汇总</span>}
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
  const countyCount = region ? counties.filter(({ region: parent }) => parent.id === region.id).length : counties.length;
  const formalName = region?.formalName?.replace(region.name, "");

  const selectRegion = (unit: AdministrativeUnit) => setActiveRegion(unit.id);
  const selectSeat = (unit: AdministrativeUnit) => {
    setActiveRegion(region!.id);
    selectUnit(unit.id);
  };

  return <aside className={`left-panel ${sidebarOpen ? "is-open" : ""}`}>
    <button className="panel-close" onClick={() => setSidebarOpen(false)} aria-label="关闭资料面板">×</button>
    <p className="eyebrow">{region ? "省级资料" : "全国总览"}</p>
    <div className="region-heading">
      <h2 className="region-title">{region?.name ?? "两京十三省"}</h2>
      {formalName && <p className="region-formal-name">{formalName}</p>}
    </div>
    <p className="muted">总录入 {summary.prefectures} 府，{summary.departments} 州，{countyCount} 县</p>

    <PopulationSummary records={records} />
    <TaxSummary records={records} />

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
      <p>仅展示具有同一统计口径的全国或省级原始记录。下级零散数据不自动累加为上级总数。</p>
      <p>当前行政数量表示项目已录入数据，并不代替史籍总数校勘。</p>
      <small>资料记录：{data.sources.length} 种来源</small>
    </details>
  </aside>;
}
