import { useAppStore } from "./store";
import { Scrollbar } from "./Scrollbar";
import { ScopeUnitButtons } from "./ScopeUnitButtons";
import { militaryById } from "./militaryData";
import type { MilitaryDisplayGroup, MilitaryRecord } from "./types";

const fiveArmyLabels = {
  central: "中军都督府",
  left: "左军都督府",
  right: "右军都督府",
  front: "前军都督府",
  rear: "后军都督府",
} as const;

function groupAdministrativePath(group: MilitaryDisplayGroup) {
  return group.fiveArmyId
    ? `五军都督府 · ${fiveArmyLabels[group.fiveArmyId]}`
    : group.administrativePath ?? "五军分属 · 中央在京卫所";
}

function recordsForGroup(group: MilitaryDisplayGroup) {
  return group.memberIds
    .map((id) => militaryById.get(id))
    .filter((record): record is MilitaryRecord => record !== undefined);
}

export function MilitaryDisplayGroupPanel({ group }: { group: MilitaryDisplayGroup }) {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const selectMilitaryUnit = useAppStore((state) => state.selectMilitaryUnit);
  const records = recordsForGroup(group);
  const guards = records.filter(({ unit }) => unit.militaryKind === "wei");
  const qianhu = records.filter(({ unit }) => unit.militaryKind === "qianhu-suo");
  const chooseUnit = (unit: { id: string }) => {
    const record = militaryById.get(unit.id);
    if (record) selectMilitaryUnit(record.unit.id, record.administrativeRegionId);
  };

  return <aside className={`left-panel ${sidebarOpen ? "is-open" : ""}`}>
    <button className="panel-close" onClick={() => setSidebarOpen(false)}
      aria-label="关闭资料面板">×</button>
    <Scrollbar>
      <p className="eyebrow">军事显示分组</p>
      <div className="region-heading">
        <h2 className="region-title">{group.name}</h2>
      </div>
      <p className="administrative-path">{groupAdministrativePath(group)}</p>
      <p className="muted">地图归类 · {records.length} 处已录入单位</p>

      <details className="scope-section scope-collapsible" open>
        <summary className="section-heading">
          <span className="eyebrow">卫</span>
          <span className="scope-peer-count">{guards.length} 处</span>
        </summary>
        <ScopeUnitButtons units={guards.map(({ unit }) => unit)} onSelect={chooseUnit} />
      </details>

      <details className="scope-section scope-collapsible" open>
        <summary className="section-heading">
          <span className="eyebrow">千户所</span>
          <span className="scope-peer-count">{qianhu.length} 处</span>
        </summary>
        <ScopeUnitButtons units={qianhu.map(({ unit }) => unit)} onSelect={chooseUnit} />
      </details>

      <details className="scope-details">
        <summary>显示说明</summary>
        <p>{group.description}</p>
        <p>选择组内单位后，地图会显示指向“{group.anchor.label}”的虚线；锚点仅用于集中表示，不是历史机构治所，也不表示行政隶属。</p>
      </details>
    </Scrollbar>
  </aside>;
}
