import { Footnote } from "./components/Footnote";
import { populationRegistrationNote } from "./statisticsNotes";
import { TaxMetricLabel, type TaxMetric } from "./taxGlossary";
import type { StatisticFields } from "./types";

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
      <strong className="scope-primary">{households.value.toLocaleString("zh-CN")} 户
        <Footnote marker="1" content={populationNote} />
      </strong>
      <p className="scope-secondary">口数 {population.value.toLocaleString("zh-CN")} 口</p>
    </> : <span className="metric-empty">暂无同口径可比汇总</span>}
  </section>;
}

function formatTaxValue(record: StatisticFields) {
  const prefix = record.metric === "summer-tax" ? "本色小麦 " :
    record.metric === "autumn-grain" ? "本色米 " : "";
  const unit = record.unit === "qing" ? "顷" : record.unit === "liang" ? "两" : "石余";
  return `${prefix}${Math.floor(record.value).toLocaleString("zh-CN")} ${unit}`;
}

function TaxSummary({ records, regionId }: { records: StatisticFields[]; regionId?: string }) {
  const taxMetrics: TaxMetric[] = ["registered-land", "summer-tax", "autumn-grain"];
  const taxes = records.filter(({ metric }) => taxMetrics.includes(metric as TaxMetric));
  const silver = records.find(({ metric }) => metric === "silver");
  const taxByMetric = new Map(taxes.map((record) => [record.metric, record]));
  return <section className="scope-section">
    <p className="eyebrow">赋税原额{taxes[0] && <Footnote
      marker="2"
      content={regionId === "nanjing"
        ? "《大明会典》万历六年实在官民田土、实征夏税与秋粮；南京直隶区未见直接总额，按14府、4直隶州分项汇总。当前仅计田产、本色小麦和本色米，折色银等其他税目未纳入。"
        : "来源：《大明会典》万历六年实在田土、实征夏税与秋粮"}
    />}</p>
    {taxes.length ? <dl className="scope-tax">{taxMetrics.map((metric) => {
      const record = taxByMetric.get(metric);
      const guizhouLandNote = metric === "registered-land" && regionId === "guizhou" && !record
        ? "贵州田产原文：《大明会典》：“贵州布政司田土自来原无丈量顷亩，每岁该纳粮差，俱于土官名下总行认纳，如洪武年间例。”因此不录入可换算的顷亩总额。"
        : undefined;
      return <div key={metric}><dt><TaxMetricLabel metric={metric} /></dt>
        <dd>{record ? formatTaxValue(record) : guizhouLandNote ? <span>
          暂无完整总额<Footnote marker="⑤" content={guizhouLandNote} />
        </span> : "暂无完整总额"}</dd></div>;
    })}
      <div><dt><TaxMetricLabel metric="silver" /></dt>
        <dd>{silver ? formatTaxValue(silver) : "暂无可靠记录"}</dd></div>
    </dl>
      : <span className="metric-empty">暂无同口径可比汇总</span>}
  </section>;
}

export function AdministrativeStatistics({ records, regionId }: {
  records: StatisticFields[];
  regionId?: string;
}) {
  return <>
    <PopulationSummary records={records} />
    <TaxSummary records={records} regionId={regionId} />
  </>;
}
