import { Disclosure } from "./components/Disclosure";
import { PanelCloseButton } from "./components/PanelCloseButton";
import { getRecordSourceIds } from "./data";
import {
  getJimiChildren,
  getJimiFocusId,
  jimiById,
  jimiKindLabel,
  jimiOfficeLabel,
  jimiRecords,
  isJimiRoot,
} from "./jimiData";
import { ScopeUnitButtons } from "./ScopeUnitButtons";
import { Scrollbar } from "./Scrollbar";
import { useAppStore } from "./store";
import type { JimiRecord } from "./types";

function sourceCount(records: JimiRecord[]) {
  return new Set(records.flatMap((record) => [...getRecordSourceIds(record)])).size;
}

function levelLabel(record: JimiRecord) {
  return `${record.jimiDisplayLevel}级`;
}

function groupLeafChildren(children: JimiRecord[]) {
  const groups: JimiRecord[][] = [];
  const groupsByType = new Map<string, JimiRecord[]>();
  for (const child of children) {
    if (getJimiChildren(child.unit.id).length > 0) {
      groups.push([child]);
      continue;
    }
    const typeKey = `${child.jimiDisplayLevel}:${child.unit.officeKind}`;
    const group = groupsByType.get(typeKey);
    if (group) {
      group.push(child);
      continue;
    }
    const newGroup = [child];
    groupsByType.set(typeKey, newGroup);
    groups.push(newGroup);
  }
  return groups;
}

function HierarchyLeafGroup({ records, onSelect }: {
  records: JimiRecord[];
  onSelect: (record: JimiRecord) => void;
}) {
  const firstRecord = records[0];
  const recordsByUnitId = new Map(records.map((record) => [record.unit.id, record]));
  return <div className="jimi-tree-node">
    <p className="scope-secondary">{levelLabel(firstRecord)} · {jimiOfficeLabel(firstRecord.unit.officeKind)}</p>
    <ScopeUnitButtons units={records.map((record) => record.unit)} onSelect={(unit) => {
      const record = recordsByUnitId.get(unit.id);
      if (record) onSelect(record);
    }} />
  </div>;
}

function HierarchyNode({ record, onSelect }: {
  record: JimiRecord;
  onSelect: (record: JimiRecord) => void;
}) {
  const children = getJimiChildren(record.unit.id);
  const heading = <>
    <span className="scope-secondary">{levelLabel(record)} · {jimiOfficeLabel(record.unit.officeKind)} · {record.unit.name}</span>
    {children.length > 0 && <span className="scope-peer-count">{children.length}处</span>}
  </>;
  if (children.length === 0) {
    return <div className="jimi-tree-node">
      <p className="scope-secondary">{levelLabel(record)} · {jimiOfficeLabel(record.unit.officeKind)}</p>
      <ScopeUnitButtons units={[record.unit]} onSelect={() => onSelect(record)} />
    </div>;
  }
  return <Disclosure className="jimi-tree-node scope-collapsible" summaryClassName="section-heading"
    open={record.jimiDepth === 1} summary={heading}>
    <ScopeUnitButtons units={[record.unit]} onSelect={() => onSelect(record)} />
    <div className="jimi-tree-children">
      {groupLeafChildren(children).map((group) => {
        const key = group.map((child) => child.unit.id).join("-");
        return group.length === 1 && getJimiChildren(group[0].unit.id).length > 0
          ? <HierarchyNode key={key} record={group[0]} onSelect={onSelect} />
          : <HierarchyLeafGroup key={key} records={group} onSelect={onSelect} />;
      })}
    </div>
  </Disclosure>;
}

export function JimiScopePanel({ record }: { record: JimiRecord }) {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const selectJimiUnit = useAppStore((state) => state.selectJimiUnit);
  if (!isJimiRoot(record) && getJimiFocusId(record.unit.id) === null) {
    return <aside className={`left-panel ${sidebarOpen ? "is-open" : ""}`}>
      <PanelCloseButton label="关闭资料面板" onClick={() => setSidebarOpen(false)} />
      <Scrollbar>
        <p className="eyebrow">羁縻关系资料</p>
        <h2 className="region-title">所属体系待考</h2>
        <p className="muted">当前点位 · {record.unit.name}</p>
        <section className="scope-section scope-population">
          <p className="eyebrow">关系状态</p>
          <span className="metric-empty">暂无已核验的羁縻直属上级</span>
        </section>
        <Disclosure className="scope-details" summary="数据说明">
          <p>该点位不会因行政所在、名称类别或地图距离被推定为某一羁縻体系下属。</p>
          <small>待核点位资料记录：{sourceCount([record])} 种来源</small>
        </Disclosure>
      </Scrollbar>
    </aside>;
  }
  const root = jimiById.get(getJimiFocusId(record.unit.id) ?? record.unit.id) ?? record;
  const systemRecords = jimiRecords.filter((candidate) => candidate.jimiRootId === root.unit.id);
  const children = getJimiChildren(root.unit.id, systemRecords);
  const deeper = systemRecords.filter((candidate) => candidate.jimiDepth >= 3).length;
  const choose = (candidate: JimiRecord) =>
    selectJimiUnit(candidate.unit.id, candidate.administrativeRegionId);

  return <aside className={`left-panel ${sidebarOpen ? "is-open" : ""}`}>
    <PanelCloseButton label="关闭资料面板" onClick={() => setSidebarOpen(false)} />
    <Scrollbar>
      <p className="eyebrow">羁縻关系资料</p>
      <h2 className="region-title">{root.unit.name}</h2>
      <p className="muted">当前点位 · {record.unit.name}</p>
      <p className="administrative-path">机构类别 · {jimiKindLabel(root.unit.jimiKind)}</p>
      <p className="muted">已核验 {children.length} 处直属下级{deeper > 0 ? `，${deeper} 处更下级点位` : ""}</p>

      <Disclosure className="scope-section scope-collapsible" summaryClassName="section-heading"
        open summary={<><span className="eyebrow">归属层级</span><span className="scope-peer-count">1级根节点</span></>}>
        <HierarchyNode record={root} onSelect={choose} />
      </Disclosure>

      <Disclosure className="scope-details" summary="数据与层级说明">
        <p>羁縻军事机构按机构类型区分层级：都司、行都司、留守司、卫、元帅府、万户府为一级，所为二级；土司／土官按已核验隶属关系计算。</p>
        <p>行政所在只作为地理上下文，不作为羁縻上级。</p>
        <p>本面板只展开当前羁縻体系，未建立直属关系的点位不会被自动并入本体系。</p>
        <small>本体系资料记录：{sourceCount(systemRecords)} 种来源</small>
      </Disclosure>
    </Scrollbar>
  </aside>;
}
