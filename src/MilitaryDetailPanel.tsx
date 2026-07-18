import { getSources, regions } from "./data";
import { militaryById, militaryRecords } from "./militaryData";
import { useAppStore } from "./store";
import { Scrollbar } from "./Scrollbar";
import type { MilitaryRecord } from "./types";

function kindLabel(record: MilitaryRecord) {
  const kind = record.unit.militaryKind;
  if (kind === "dusi") return "都司";
  if (kind === "xing-dusi") return "行都司";
  if (kind === "liushou-si") return "留守司";
  if (kind === "wei") return "卫";
  if (kind === "qianhu-suo") return "千户所";
  if (kind === "suo") return "所";
  return "军事单位";
}

export function MilitaryDetailPanel({ record }: { record?: MilitaryRecord }) {
  const detailsOpen = useAppStore((state) => state.detailsOpen);
  const setDetailsOpen = useAppStore((state) => state.setDetailsOpen);
  const selectMilitaryUnit = useAppStore((state) => state.selectMilitaryUnit);
  if (!record) return null;
  const parent = record.militaryParentId ? militaryById.get(record.militaryParentId) : undefined;
  const region = regions.find(({ id }) => id === record.administrativeRegionId);
  const children = militaryRecords.filter(({ militaryParentId }) => militaryParentId === record.unit.id);
  const sources = getSources(record);
  return (
    <aside className={`detail-panel ${detailsOpen ? "is-open" : ""}`}>
      <button className="panel-close" onClick={() => setDetailsOpen(false)} aria-label="关闭地点详情">×</button>
      <Scrollbar>
        <p className="eyebrow">{kindLabel(record)}</p>
        <h2>{record.unit.name}</h2>
        <p className="seat-line">驻所 · {record.name}</p>
        <p className="administrative-path">行政所在 · {region?.name ?? "待核"}</p>

        <section className="location-summary">
          <p className="eyebrow">军事关系</p>
          <strong>{parent ? `上级 · ${parent.unit.name}` : "上级关系待录入"}</strong>
          {children.length > 0 && <div className="county-list">
            {children.map((child) => <button key={child.unit.id}
              onClick={() => selectMilitaryUnit(child.unit.id, child.administrativeRegionId)}>
              {child.unit.name}
            </button>)}
          </div>}
        </section>

        <section className="location-summary">
          <p className="eyebrow">点位定位</p>
          <strong>{record.place.locationAccuracy} · {record.place.confidence}</strong>
        </section>

        <details className="research-details">
          <summary>详细资料</summary>
          <dl className="facts">
            <div><dt>坐标</dt><dd>{record.place.longitude?.toFixed(5)}, {record.place.latitude?.toFixed(5)}</dd></div>
            <div><dt>定位方法</dt><dd>{record.place.locationMethod}</dd></div>
            <div><dt>来源数</dt><dd>{sources.length}</dd></div>
          </dl>
          {sources.map((source) => <article className="source" key={source.id}>
            <h3>{source.title}</h3><p>{source.citation}</p><small>{source.license}</small>
          </article>)}
        </details>
      </Scrollbar>
    </aside>
  );
}
