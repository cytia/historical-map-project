import { Button } from "./components/Button";
import { Disclosure } from "./components/Disclosure";
import { PanelCloseButton } from "./components/PanelCloseButton";
import { getSources, regions } from "./data";
import { locationAccuracyLabel, locationConfidenceLabel } from "./locationLabels";
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

const fiveArmyLabels = {
  central: "中军都督府",
  left: "左军都督府",
  right: "右军都督府",
  front: "前军都督府",
  rear: "后军都督府",
} as const;

function MilitaryRelations({ record, parent, children }: {
  record: MilitaryRecord;
  parent?: MilitaryRecord;
  children: MilitaryRecord[];
}) {
  const selectMilitaryUnit = useAppStore((state) => state.selectMilitaryUnit);
  const fiveArmy = record.fiveArmyId ? fiveArmyLabels[record.fiveArmyId] : undefined;
  if (!parent && !fiveArmy && children.length === 0) return null;
  return (
    <section className="jurisdiction">
      <div className="section-heading"><p className="eyebrow">军事关系</p>
        <span>{children.length > 0 ? `${children.length} 个下辖单位` : ""}</span>
      </div>
      {fiveArmy && <p className="administrative-path">五军都督府 · {fiveArmy}</p>}
      {parent && <>
        <p className="administrative-path">上级军事单位</p>
        <div className="county-list"><Button variant="choice" size="medium" onClick={() =>
          selectMilitaryUnit(parent.unit.id, parent.administrativeRegionId)}>
          {parent.unit.name}
        </Button></div>
      </>}
      {children.length > 0 && <>
        <p className="administrative-path">下辖单位</p>
        <div className="county-list">
          {children.map((child) => <Button variant="choice" size="medium" key={child.unit.id}
            onClick={() => selectMilitaryUnit(child.unit.id, child.administrativeRegionId)}>
            {child.unit.name}
          </Button>)}
        </div>
      </>}
    </section>
  );
}

function relationSummary(record: MilitaryRecord, parent?: MilitaryRecord, children: MilitaryRecord[] = []) {
  const fiveArmy = record.fiveArmyId ? fiveArmyLabels[record.fiveArmyId] : undefined;
  const parts = [
    fiveArmy && `五军都督府：${fiveArmy}`,
    parent && `上级军事单位：${parent.unit.name}`,
    children.length > 0 && `下辖单位：${children.length} 个`,
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join("；") : null;
}

export function MilitaryDetailPanel({ record }: { record?: MilitaryRecord }) {
  const detailsOpen = useAppStore((state) => state.detailsOpen);
  const setDetailsOpen = useAppStore((state) => state.setDetailsOpen);
  if (!record) return null;
  const parent = record.militaryParentId ? militaryById.get(record.militaryParentId) : undefined;
  const region = regions.find(({ id }) => id === record.administrativeRegionId);
  const children = militaryRecords.filter(({ militaryParentId }) => militaryParentId === record.unit.id);
  const sources = getSources(record);
  const relationText = relationSummary(record, parent, children);
  return (
    <aside className={`detail-panel ${detailsOpen ? "is-open" : ""}`}>
      <PanelCloseButton label="关闭地点详情" onClick={() => setDetailsOpen(false)} />
      <Scrollbar>
        <p className="eyebrow">{kindLabel(record)}</p>
        <h2>{record.unit.formalName ?? record.unit.name}</h2>
        <p className="seat-line">驻所 · {record.name}</p>
        {region && <p className="administrative-path">行政所在 · {region.name}</p>}

        <MilitaryRelations record={record} parent={parent} children={children} />

        <section className="location-summary">
          <p className="eyebrow">治所定位</p>
          <strong>{locationAccuracyLabel[record.place.locationAccuracy]} · {locationConfidenceLabel[record.place.confidence]}</strong>
        </section>

        <Disclosure className="research-details" summary="详细资料">
          {relationText && <p>{relationText}</p>}
          <dl className="facts">
            <div><dt>坐标</dt><dd>{record.place.longitude?.toFixed(5)}, {record.place.latitude?.toFixed(5)}</dd></div>
            {record.place.locationMethod && <div><dt>定位方法</dt><dd>{record.place.locationMethod}</dd></div>}
            <div><dt>来源数</dt><dd>{sources.length}</dd></div>
          </dl>
          {sources.map((source) => <article className="source" key={source.id}>
            <h3>{source.title}</h3><p>{source.citation}</p><small>{source.license}</small>
          </article>)}
        </Disclosure>
      </Scrollbar>
    </aside>
  );
}
