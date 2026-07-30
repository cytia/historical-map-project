import type { MilitaryMeasureType, MilitaryStatistic, MilitaryStatisticMetric } from "./types";

const metricLabels: Record<MilitaryStatisticMetric, string> = {
  "soldier-count": "军额",
  "tuntian-area": "屯田",
  "tuntian-grain": "屯粮",
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

export function MilitaryStatistics({ records }: { records: MilitaryStatistic[] }) {
  const metrics: MilitaryStatisticMetric[] = ["soldier-count", "tuntian-area", "tuntian-grain"];
  return <section className="scope-section">
    <p className="eyebrow">军额／屯田／屯粮</p>
    <dl className="scope-tax">
      {metrics.map((metric) => {
        const record = selectRecord(records, metric);
        const tuntianArmy = metric === "soldier-count"
          ? records.find((candidate) => candidate.metric === metric && candidate.measureType === "tuntian-army")
          : undefined;
        return <div key={metric}>
          <dt>{metricLabels[metric]}</dt>
          <dd title={record ? `来源记录类型：${record.measureType}` : undefined}>
            {record ? formatValue(record) : "暂无完整总额"}
            {tuntianArmy && <><br /><span className="scope-secondary">其中屯军 {formatValue(tuntianArmy)}</span></>}
          </dd>
        </div>;
      })}
    </dl>
  </section>;
}
