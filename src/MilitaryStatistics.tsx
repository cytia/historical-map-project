import { Footnote } from "./components/Footnote";
import type {
  MilitaryMeasureType,
  MilitaryStatistic,
  MilitaryStatisticMetric,
  Source,
} from "./types";
import { useSources } from "./useHistoricalData";

const metricLabels: Record<MilitaryStatisticMetric, string> = {
  "soldier-count": "军额",
  "tuntian-area": "屯田",
  "tuntian-grain": "屯粮",
};

const metricMarkers: Record<MilitaryStatisticMetric, string> = {
  "soldier-count": "①",
  "tuntian-area": "②",
  "tuntian-grain": "③",
};

const preferredMeasureTypes: Record<MilitaryStatisticMetric, MilitaryMeasureType[]> = {
  "soldier-count": ["establishment", "actual", "registered", "field-army"],
  "tuntian-area": ["current-area", "registered-area", "cultivated-area", "original-area"],
  "tuntian-grain": ["annual-yield", "stored", "allocated", "summer-tax", "autumn-grain"],
};

const unitLabels = {
  people: "人",
  qing: "顷",
  mu: "亩",
  shi: "石",
  dou: "斗",
} as const;

function selectRecord(records: MilitaryStatistic[], metric: MilitaryStatisticMetric) {
  const candidates = records.filter((record) => record.metric === metric);
  return preferredMeasureTypes[metric]
    .map((measureType) => candidates.find((record) => record.measureType === measureType))
    .find(Boolean);
}

function formatValue(record: MilitaryStatistic) {
  const value = record.value.toLocaleString("zh-CN", { maximumFractionDigits: 5 });
  const estimate = record.valueType === "estimated" ? "估算 " : "";
  return `${estimate}${value} ${unitLabels[record.unit]}`;
}

function sourceNote(records: MilitaryStatistic[], sources: Source[]) {
  if (records.length === 0) return "当前暂无完整单位级数据记录。";
  const sourceIds = new Set(records.flatMap((record) => record.sources.map(({ sourceId }) => sourceId)));
  const sourceText = sources
    .filter(({ id }) => sourceIds.has(id))
    .map(({ citation }) => `来源：${citation}`)
    .join("\n");
  const recordYears = [...new Set(records.map(({ recordedYear }) =>
    recordedYear === null ? "记录年份待考" : `记录年份：${recordedYear}`))].join("；");
  const notes = [...new Set(records.flatMap((record) => record.sources
    .map(({ note }) => note)
    .filter((note): note is string => Boolean(note))))].join("\n");
  return [sourceText || "来源条目待补", recordYears, notes].filter(Boolean).join("\n");
}

function MetricLabel({ metric, records, sources }: {
  metric: MilitaryStatisticMetric;
  records: MilitaryStatistic[];
  sources: Source[];
}) {
  return <span className="metric-label">
    <span>{metricLabels[metric]}</span>
    <Footnote marker={metricMarkers[metric]} content={sourceNote(records, sources)} />
  </span>;
}

export function MilitaryStatistics({ records }: { records: MilitaryStatistic[] }) {
  const { data: sources } = useSources();
  const metrics: MilitaryStatisticMetric[] = ["soldier-count", "tuntian-area", "tuntian-grain"];
  return <section className="scope-section">
    <p className="eyebrow">军额／屯田／屯粮</p>
    <dl className="scope-tax">
      {metrics.map((metric) => {
        const record = selectRecord(records, metric);
        const tuntianArmy = metric === "soldier-count"
          ? records.find((candidate) => candidate.metric === metric && candidate.measureType === "tuntian-army")
          : undefined;
        const sourceRecords = [record, tuntianArmy]
          .filter((candidate): candidate is MilitaryStatistic => Boolean(candidate));
        return <div key={metric}>
          <dt><MetricLabel metric={metric} records={sourceRecords} sources={sources} /></dt>
          <dd title={record ? `来源记录类型：${record.measureType}` : undefined}>
            {record ? formatValue(record) : "暂无完整总额"}
            {tuntianArmy && <><br /><span className="scope-secondary">其中屯军 {formatValue(tuntianArmy)}</span></>}
          </dd>
        </div>;
      })}
    </dl>
  </section>;
}
