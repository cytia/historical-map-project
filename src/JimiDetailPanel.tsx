import { Button } from "./components/Button";
import { Disclosure } from "./components/Disclosure";
import { PanelCloseButton } from "./components/PanelCloseButton";
import { data, getSources, regions } from "./data";
import {
  getJimiAncestors,
  getJimiChildren,
  jimiById,
  jimiKindLabel,
  jimiOfficeLabel,
} from "./jimiData";
import { locationAccuracyLabel, locationConfidenceLabel } from "./locationLabels";
import { Scrollbar } from "./Scrollbar";
import { useAppStore } from "./store";
import type { JimiRecord } from "./types";
import { useSources } from "./useHistoricalData";

function validityLabel(record: JimiRecord) {
  const { from, to } = record.unit.validity;
  if (from === 1600 && to === 1600) return "1600年有效";
  if (to !== null && to < 1600) return "1600年以前已废或停止运作";
  if (from !== null && from > 1600) return "1600年以后始设";
  return "存续时间需按来源解释";
}

function JimiRelations({ record }: { record: JimiRecord }) {
  const selectJimiUnit = useAppStore((state) => state.selectJimiUnit);
  const parent = record.jimiParentId ? jimiById.get(record.jimiParentId) : undefined;
  const ancestors = getJimiAncestors(record.unit.id);
  const children = getJimiChildren(record.unit.id);
  const context = record.administrativeUnitId
    ? data.administrativeUnits.find((unit) => unit.id === record.administrativeUnitId)
    : undefined;
  if (!parent && !context && children.length === 0 && !record.jimiParentId) return null;
  return <section className="jurisdiction">
    <div className="section-heading"><p className="eyebrow">羁縻关系</p>
      <span>{children.length > 0 ? `${children.length}个下属点位` : ""}</span></div>
    <p className="administrative-path">归属层级 · {record.jimiDisplayLevel}级</p>
    {ancestors.length > 0 && <>
      <p className="administrative-path">羁縻归属路径</p>
      <div className="county-list">{ancestors.map((ancestor) =>
        <Button variant="choice" size="medium" key={ancestor.unit.id}
          onClick={() => selectJimiUnit(ancestor.unit.id, ancestor.administrativeRegionId)}>
          {ancestor.unit.name}
        </Button>)}
      </div>
    </>}
    {record.jimiParentId && !parent &&
      <p className="administrative-path">上级羁縻机构 · 归属待考（上级点位未载入）</p>}
    {context && <p className="administrative-path">行政所在 · {context.name}</p>}
    {children.length > 0 && <>
      <p className="administrative-path">下属机构</p>
      <div className="county-list">{children.map((child) =>
        <Button variant="choice" size="medium" key={child.unit.id}
          onClick={() => selectJimiUnit(child.unit.id, child.administrativeRegionId)}>
          {child.unit.name}
        </Button>)}
      </div>
    </>}
  </section>;
}

function JimiDetailPanelContent({ record }: { record: JimiRecord }) {
  const detailsOpen = useAppStore((state) => state.detailsOpen);
  const setDetailsOpen = useAppStore((state) => state.setDetailsOpen);
  const { data: sourceCatalog } = useSources();
  const region = regions.find(({ id }) => id === record.administrativeRegionId);
  const sources = getSources(record, sourceCatalog);
  return <aside className={`detail-panel ${detailsOpen ? "is-open" : ""}`}>
    <PanelCloseButton label="关闭地点详情" onClick={() => setDetailsOpen(false)} />
    <Scrollbar>
      <p className="eyebrow">{jimiKindLabel(record.unit.jimiKind)} · {jimiOfficeLabel(record.unit.officeKind)}</p>
      <h2>{record.unit.formalName ?? record.unit.name}</h2>
      <p className="seat-line">驻所 · {record.name}</p>
      {region && <p className="administrative-path">所在区域 · {region.name}</p>}
      <p className="administrative-path">时间状态 · {validityLabel(record)}</p>

      <JimiRelations record={record} />

      <section className="location-summary">
        <p className="eyebrow">点位定位</p>
        <strong>{locationAccuracyLabel[record.place.locationAccuracy]} · {locationConfidenceLabel[record.place.confidence]}</strong>
      </section>

      <Disclosure className="research-details" summary="详细资料">
        <dl className="facts">
          <div><dt>机构类别</dt><dd>{jimiOfficeLabel(record.unit.officeKind)}</dd></div>
          <div><dt>坐标</dt><dd>{record.place.longitude?.toFixed(5)}, {record.place.latitude?.toFixed(5)}</dd></div>
          {record.place.locationMethod && <div><dt>定位方法</dt><dd>{record.place.locationMethod}</dd></div>}
          {record.unit.note && <div><dt>资料说明</dt><dd>{record.unit.note}</dd></div>}
          <div><dt>来源数</dt><dd>{sources.length}</dd></div>
        </dl>
        {sources.map((source) => <article className="source" key={source.id}>
          <h3>{source.title}</h3><p>{source.citation}</p><small>{source.license}</small>
        </article>)}
      </Disclosure>
    </Scrollbar>
  </aside>;
}

export function JimiDetailPanel({ record }: { record?: JimiRecord }) {
  return record ? <JimiDetailPanelContent record={record} /> : null;
}
