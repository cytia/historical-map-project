import { counties, data, getCountySources, getSources, getStatistics, seats } from "./data";
import { useAppStore } from "./store";
import type { CountyRecord, SeatRecord, StatisticRecord } from "./types";

function levelLabel(seat: SeatRecord) {
  if (seat.unit.level === "prefecture") return "府";
  return seat.unit.parentId === seat.region.id ? "直隶州" : "州";
}
const accuracyLabel = {
  exact: "可靠位置",
  approximate: "约略位置",
  area_only: "区域级定位",
  disputed: "存在争议",
  unknown: "尚不可定位",
} as const;
const confidenceLabel = { high: "高可信度", medium: "中等可信度", low: "低可信度" } as const;

function sourceMarker(record: StatisticRecord, index = 1) {
  const sourceId = record.sources[0]?.sourceId;
  const source = data.sources.find(({ id }) => id === sourceId);
  return <sup title={`来源：${source?.title ?? sourceId}`}>{index}</sup>;
}

function formatRecordedYear(year: number | null) {
  if (year === 1515) return "明武宗正德十年（公元 1515 年）";
  if (year === 1578) return "明神宗万历六年（公元 1578 年）";
  return year === null ? "登记时间待考" : `公元 ${year} 年`;
}

function formatTaxValue(record: StatisticRecord) {
  if (record.metric === "registered-land") {
    const qing = Math.floor(record.value);
    const mu = Math.round((record.value - qing) * 100);
    return `${qing.toLocaleString("zh-CN")} 顷 ${mu} 亩`;
  }
  const prefix = record.metric === "summer-tax" ? "小麦 " :
    record.metric === "autumn-grain" ? "米 " : "";
  if (prefix) return `${prefix}${Math.floor(record.value).toLocaleString("zh-CN")} 石余`;
  const scaled = Math.round(record.value * 1_000_000);
  const units = [["石", 1_000_000], ["斗", 100_000], ["升", 10_000],
    ["合", 1_000], ["勺", 100], ["抄", 10], ["撮", 1]] as const;
  let remainder = scaled;
  const parts = units.flatMap(([unit, divisor], index) => {
    const amount = Math.floor(remainder / divisor);
    remainder %= divisor;
    return amount || index === 0 ? [`${index === 0 ? amount.toLocaleString("zh-CN") : amount} ${unit}`] : [];
  });
  return prefix + parts.join(" ");
}

function PopulationMetric({ unitId }: { unitId: string }) {
  const records = getStatistics(unitId);
  const population = records.find(({ metric }) => metric === "registered-population");
  const households = records.find(({ metric }) => metric === "households");
  return (
    <section className="evidence-section population-evidence">
      <p className="eyebrow">户口登记</p>
      {population && households ? <>
        <div className="population-primary">
          <strong>{households.value.toLocaleString("zh-CN")} 户{sourceMarker(households)}</strong>
          <span>口数 {population.value.toLocaleString("zh-CN")} 口</span>
        </div>
        <p className="record-date">{formatRecordedYear(households.recordedYear)}登记</p>
        <small>黄册体系下的史料登记值，不等同于完整实际人口。</small>
      </> : <span className="metric-empty">暂无可靠县级户口记录</span>}
    </section>
  );
}

function TaxMetric({ unitId }: { unitId: string }) {
  const taxes = getStatistics(unitId).filter(({ category }) => category === "tax");
  const rows = [
    ["田产", taxes.find(({ metric }) => metric === "registered-land")],
    ["夏税", taxes.find(({ metric }) => metric === "summer-tax")],
    ["秋粮", taxes.find(({ metric }) => metric === "autumn-grain")],
  ] as const;
  return (
    <section className="evidence-section tax-evidence">
      <div className="section-heading"><p className="eyebrow">赋税原额</p>
        {taxes[0] && <span>《大明会典》{sourceMarker(taxes[0], 2)}</span>}</div>
      {taxes.length ? <dl className="tax-ledger">{rows.map(([label, tax]) => tax && (
        <div key={tax.id}><dt>{label}</dt><dd>{formatTaxValue(tax)}</dd></div>
      ))}</dl> : <span className="metric-empty">暂无已校勘县级原额</span>}
    </section>
  );
}

function Jurisdiction({ seat }: { seat: SeatRecord }) {
  const selectCounty = useAppStore((state) => state.selectCounty);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const childCounties = counties.filter(({ parent }) => parent.id === seat.unit.id);
  const childStates = seats.filter(({ unit }) => unit.parentId === seat.unit.id);
  const countLabel = [childStates.length && `${childStates.length} 州`, childCounties.length && `${childCounties.length} 县`]
    .filter(Boolean).join(" · ");
  return (
    <section className="jurisdiction">
      <div className="section-heading"><p className="eyebrow">下辖单位</p><span>{countLabel}</span></div>
      {childStates.length || childCounties.length ? <div className="county-list">
        {childStates.map((child) => (
          <button key={child.unit.id} onClick={() => selectUnit(child.unit.id)}>{child.unit.name}</button>
        ))}
        {childCounties.map((county) => (
        <button key={county.unit.id} onClick={() =>
          selectCounty(county.unit.id, county.parent.id, county.region.id)}>
          {county.unit.name}
        </button>
      ))}</div> : <p className="metric-empty">下辖数据尚未录入</p>}
    </section>
  );
}

function PeerCounties({ county }: { county: CountyRecord }) {
  const selectCounty = useAppStore((state) => state.selectCounty);
  const siblings = counties.filter(({ parent }) => parent.id === county.parent.id);
  return (
    <section className="jurisdiction">
      <div className="section-heading"><p className="eyebrow">同级单位</p><span>{siblings.length} 县</span></div>
      <div className="county-list">{siblings.map((sibling) => (
        <button className={sibling.unit.id === county.unit.id ? "is-current" : ""}
          key={sibling.unit.id} onClick={() =>
            selectCounty(sibling.unit.id, sibling.parent.id, sibling.region.id)}>
          {sibling.unit.name}
        </button>
      ))}</div>
    </section>
  );
}

export function AdministrativeDetailPanel({ seat, county }: {
  seat?: SeatRecord;
  county?: CountyRecord;
}) {
  const detailsOpen = useAppStore((state) => state.detailsOpen);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const setDetailsOpen = useAppStore((state) => state.setDetailsOpen);
  const record = county ?? seat;
  if (!record) return null;
  const sources = county ? getCountySources(county) : getSources(seat!);
  const taxRecords = getStatistics(record.unit.id).filter(({ category }) => category === "tax");
  const parentSeat = seat && seat.unit.parentId !== seat.region.id
    ? seats.find(({ unit }) => unit.id === seat.unit.parentId)
    : undefined;
  return (
    <aside className={`detail-panel ${detailsOpen ? "is-open" : ""}`}>
      <button className="panel-close" onClick={() => setDetailsOpen(false)} aria-label="关闭地点详情">×</button>
      <p className="eyebrow">{county ? "县" : levelLabel(seat!)}</p>
      <h2>{record.unit.name}</h2>
      <p className="seat-line">治所 · {record.name}</p>
      {county && <p className="administrative-path">{county.parent.name} · {county.region.name}</p>}
      {county && <button className="return-prefecture" onClick={() => selectUnit(county.parent.id)}>
        <span aria-hidden="true">←</span> 返回{county.parent.name}
      </button>}
      {parentSeat && <button className="return-prefecture" onClick={() => selectUnit(parentSeat.unit.id)}>
        <span aria-hidden="true">←</span> 返回{parentSeat.unit.name}
      </button>}

      <PopulationMetric unitId={record.unit.id} />
      <TaxMetric unitId={record.unit.id} />
      {county ? <PeerCounties county={county} /> : <Jurisdiction seat={seat!} />}

      <section className="location-summary">
        <p className="eyebrow">治所定位</p>
        <strong>{accuracyLabel[record.place.locationAccuracy]} · {confidenceLabel[record.place.confidence]}</strong>
      </section>

      <details className="research-details">
        <summary>详细资料</summary>
        <p>{county ? `行政链：明 → ${county.region.name} → ${county.parent.name} → ${county.unit.name}` :
          `${seat!.unit.name}治下已录入 ${seats.filter(({ unit }) => unit.parentId === seat!.unit.id).length} 州、${counties.filter(({ parent }) => parent.id === seat!.unit.id).length} 县。`}</p>
        <dl className="facts">
          <div><dt>坐标</dt><dd>{record.place.longitude?.toFixed(5)}, {record.place.latitude?.toFixed(5)}</dd></div>
          <div><dt>定位方法</dt><dd>{record.place.locationMethod}</dd></div>
        </dl>
        {taxRecords.length > 0 && <div className="original-amounts">
          <p className="eyebrow">赋税原额全文</p>
          {taxRecords.map((tax) => <p key={tax.id}>{tax.originalText}</p>)}
        </div>}
        {sources.map((source) => <article className="source" key={source.id}>
          <h3>{source.title}</h3><p>{source.citation}</p><small>{source.license}</small>
        </article>)}
      </details>
    </aside>
  );
}
