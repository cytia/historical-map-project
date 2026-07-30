import { Disclosure } from "./components/Disclosure";
import { PanelCloseButton } from "./components/PanelCloseButton";
import { getRecordSourceIds } from "./data";
import { MilitaryDisplayGroupPanel } from "./MilitaryDisplayGroupPanel";
import { MilitaryStatistics } from "./MilitaryStatistics";
import {
  getMilitaryCommandRecord,
  isMilitaryDescendant,
  isMilitaryPrimaryUnit,
  militaryById,
  publishedMilitaryRecords,
} from "./militaryData";
import { getMilitaryDisplayGroup } from "./militaryDisplayGroups";
import { ScopeUnitButtons } from "./ScopeUnitButtons";
import { Scrollbar } from "./Scrollbar";
import { useAppStore } from "./store";
import type { MilitaryRecord } from "./types";
import { useMilitaryStatistics as useMilitaryStatisticsData } from "./useHistoricalData";

const fiveArmyLabels = {
  central: "中军都督府",
  left: "左军都督府",
  right: "右军都督府",
  front: "前军都督府",
  rear: "后军都督府",
} as const;

function sourceCount(records: MilitaryRecord[]) {
  return new Set(records.flatMap((record) => [...getRecordSourceIds(record)])).size;
}

function selectLabel(count: number, unit: string) {
  return `${count} ${unit}`;
}

export function MilitaryScopePanel({ record }: { record: MilitaryRecord }) {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const selectMilitaryUnit = useAppStore((state) => state.selectMilitaryUnit);
  const { data: militaryStatistics } = useMilitaryStatisticsData();
  const command = getMilitaryCommandRecord(record.unit.id);
  const displayGroup = getMilitaryDisplayGroup(record.unit.id);

  if (!command && displayGroup) return <MilitaryDisplayGroupPanel group={displayGroup} />;

  if (!command) {
    return <aside className={`left-panel ${sidebarOpen ? "is-open" : ""}`}>
      <PanelCloseButton label="关闭资料面板" onClick={() => setSidebarOpen(false)} />
      <Scrollbar>
        <p className="eyebrow">都司系统资料</p>
        <h2 className="region-title">所属都司待考</h2>
        <p className="muted">{record.unit.formalName ?? record.unit.name}</p>
        <section className="scope-section scope-population">
          <p className="eyebrow">关系状态</p>
          <span className="metric-empty">暂无已核验的都司隶属关系</span>
        </section>
        <Disclosure className="scope-details" summary="数据说明">
          <p>该单位不因行政所在或地图距离被推定为某都司下属。</p>
          <small>资料记录：{sourceCount([record])} 种来源</small>
        </Disclosure>
      </Scrollbar>
    </aside>;
  }

  const primary = publishedMilitaryRecords.filter(({ unit, militaryParentId }) =>
    isMilitaryPrimaryUnit(unit) && militaryParentId === command.unit.id);
  const secondary = publishedMilitaryRecords.filter(({ unit }) =>
    !isMilitaryPrimaryUnit(unit) && isMilitaryDescendant(unit.id, command.unit.id));
  const systemRecords = [command, ...primary, ...secondary];
  const secondaryParents = primary.filter(({ unit }) =>
    secondary.some(({ militaryParentId }) => militaryParentId === unit.id));
  const statistics = militaryStatistics.filter(({ militaryUnitId }) =>
    militaryUnitId === command.unit.id);
  const unresolved = publishedMilitaryRecords.filter((candidate) =>
    candidate.administrativeRegionId === command.administrativeRegionId &&
    candidate.unit.id !== command.unit.id &&
    !getMilitaryCommandRecord(candidate.unit.id));
  const unresolvedPrimary = unresolved.filter(({ unit }) => isMilitaryPrimaryUnit(unit)).length;
  const unresolvedSecondary = unresolved.length - unresolvedPrimary;
  const peers = publishedMilitaryRecords.filter((candidate) =>
    candidate.unit.id !== command.unit.id &&
    getMilitaryCommandRecord(candidate.unit.id)?.unit.id === candidate.unit.id &&
    candidate.fiveArmyId === command.fiveArmyId);
  const chooseUnit = (unit: { id: string }) => {
    const selected = militaryById.get(unit.id);
    if (selected) selectMilitaryUnit(unit.id, selected.administrativeRegionId);
  };

  return <aside className={`left-panel ${sidebarOpen ? "is-open" : ""}`}>
    <PanelCloseButton label="关闭资料面板" onClick={() => setSidebarOpen(false)} />
    <Scrollbar>
      <p className="eyebrow">都司系统资料</p>
      <div className="region-heading">
        <h2 className="region-title">{command.unit.formalName ?? command.unit.name}</h2>
      </div>
      <p className="muted">驻所 · {command.name}</p>
      {command.fiveArmyId &&
        <p className="administrative-path">五军都督府 · {fiveArmyLabels[command.fiveArmyId]}</p>}
      <p className="muted">已核验 {primary.length} 卫，{secondary.length} 所</p>

      <MilitaryStatistics records={statistics} />

      <Disclosure className="scope-section scope-collapsible" summaryClassName="section-heading"
        summary={<>
          <span className="eyebrow">直属卫</span>
          <span className="scope-peer-count">{selectLabel(primary.length, "处")}</span>
        </>}>
        <ScopeUnitButtons units={primary.map(({ unit }) => unit)} onSelect={chooseUnit} />
      </Disclosure>

      {secondary.length > 0 && <Disclosure className="scope-section scope-collapsible"
        summaryClassName="section-heading" summary={<>
          <span className="eyebrow">二级单位</span>
          <span className="scope-peer-count">{selectLabel(secondary.length, "处")}</span>
        </>}>
        {secondaryParents.map((parent) => <div className="scope-unit-group" key={parent.unit.id}>
          <p className="scope-secondary">{parent.unit.name}</p>
          <ScopeUnitButtons
            units={secondary.filter(({ militaryParentId }) => militaryParentId === parent.unit.id)
              .map(({ unit }) => unit)}
            onSelect={chooseUnit}
          />
        </div>)}
      </Disclosure>}

      {peers.length > 0 && <Disclosure className="scope-section scope-collapsible"
        summaryClassName="section-heading" summary={<>
          <span className="eyebrow">同级都司</span>
          <span className="scope-peer-count">{selectLabel(peers.length, "处")}</span>
        </>}>
        <ScopeUnitButtons units={peers.map(({ unit }) => unit)} onSelect={chooseUnit} />
      </Disclosure>}

      <Disclosure className="scope-details" summary="数据与统计说明">
        <p>军数、屯田和屯粮按史料原文分项显示，不由下辖卫所合计或向都司反推；缺失项不以零代替。</p>
        {(unresolvedPrimary > 0 || unresolvedSecondary > 0) &&
          <p>本区域另有 {unresolvedPrimary} 个一级单位、{unresolvedSecondary} 个二级单位的都司隶属待考，未计入本系统规模。</p>}
        <p>系统规模只统计具有明确军事隶属关系的单位。</p>
        <small>资料记录：{sourceCount(systemRecords)} 种来源</small>
      </Disclosure>
    </Scrollbar>
  </aside>;
}
