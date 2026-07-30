import { Footnote } from "./components/Footnote";

export type TaxMetric = "registered-land" | "summer-tax" | "autumn-grain" | "silver";

const taxMetricLabels: Record<TaxMetric, string> = {
  "registered-land": "田产",
  "summer-tax": "夏税",
  "autumn-grain": "秋粮",
  silver: "折色银",
};

const taxMetricMarkers: Record<TaxMetric, string> = {
  "registered-land": "①",
  "summer-tax": "②",
  "autumn-grain": "③",
  silver: "④",
};

const taxMetricExplanations: Record<TaxMetric, string> = {
  "registered-land": "万历六年《大明会典》所载实在官民田土总额；原史料未分列官田、民田，本项目不作拆分或估算，不等同于官田总额。",
  "summer-tax": "明代田赋的两税之一，主要征米、麦等，限于八月前完纳；此处为万历六年实征本色小麦。",
  "autumn-grain": "明代田赋的两税之一，主要征米等，限于次年二月前完纳；此处为万历六年实征本色米。",
  silver: "把原应缴的实物税按规定折合为银缴纳；当前没有可靠的统一数额，未作估算。",
};

export function TaxMetricLabel({ metric }: { metric: TaxMetric }) {
  return (
    <span className="metric-label">
      <span>{taxMetricLabels[metric]}</span>
      <Footnote marker={taxMetricMarkers[metric]} content={taxMetricExplanations[metric]} />
    </span>
  );
}
