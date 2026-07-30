import { AdministrativeStatistics } from "./AdministrativeStatistics";
import { Disclosure } from "./components/Disclosure";
import { PanelCloseButton } from "./components/PanelCloseButton";
import { counties, data, getRegionSummary, regions, topLevelSeats } from "./data";
import { NationalOverviewCategories } from "./NationalOverviewCategories";
import { useAppStore } from "./store";
import { Scrollbar } from "./Scrollbar";
import { ScopeUnitButtons } from "./ScopeUnitButtons";
import type { AdministrativeUnit } from "./types";
import { useStatistics } from "./useHistoricalData";

export function ScopePanel({ region }: { region?: AdministrativeUnit }) {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const setActiveRegion = useAppStore((state) => state.setActiveRegion);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const { data: loadedStatistics } = useStatistics(region?.id ?? null);
  const records = region
    ? loadedStatistics.filter((record) =>
      "administrativeUnitId" in record && record.administrativeUnitId === region.id)
    : loadedStatistics;
  const summary = getRegionSummary(region?.id ?? null);
  const childSeats = region ? topLevelSeats.filter(({ region: parent }) => parent.id === region.id) : [];
  const countyCount = region
    ? counties.filter(({ region: parent }) => parent.id === region.id).length
    : counties.length;
  const prefectureCount = summary.prefectures;
  const departmentCount = summary.departments;
  const departmentLabel = "州";
  const formalName = region?.formalName?.replace(region.name, "");

  const selectRegion = (unit: AdministrativeUnit) => setActiveRegion(unit.id);
  const selectSeat = (unit: AdministrativeUnit) => {
    setActiveRegion(region!.id);
    selectUnit(unit.id);
  };

  return <aside className={`left-panel ${sidebarOpen ? "is-open" : ""}`}>
    <PanelCloseButton label="关闭资料面板" onClick={() => setSidebarOpen(false)} />
    <Scrollbar>
      <p className="eyebrow">{region ? (region.level === "capital-region" ? "直隶区资料" : "省级资料") : "全国总览"}</p>
      {region ? <>
        <div className="region-heading">
          <h2 className="region-title">{region.name}</h2>
          {formalName && <p className="region-formal-name">{formalName}</p>}
        </div>
        <p className="muted">总录入 {prefectureCount} 府，{departmentCount} {departmentLabel}，{countyCount} 县</p>
        <AdministrativeStatistics records={records} regionId={region.id} />
        <Disclosure className="scope-section scope-collapsible" summaryClassName="section-heading"
          summary={<>
            <span className="eyebrow">下辖单位</span>
            <span className="scope-peer-count">{childSeats.length} 处</span>
          </>}>
          <ScopeUnitButtons units={childSeats.map(({ unit }) => unit)} onSelect={selectSeat} />
        </Disclosure>
        <Disclosure className="scope-section scope-peer-regions scope-collapsible"
          summaryClassName="section-heading" summary={<>
            <span className="eyebrow">同级单位</span>
            <span className="scope-peer-count">{regions.length} 处</span>
          </>}>
          <ScopeUnitButtons units={regions} onSelect={selectRegion} />
        </Disclosure>
      </> : <NationalOverviewCategories records={records} administrativeCount={{
        prefectures: prefectureCount,
        departments: departmentCount,
        counties: countyCount,
      }} />}

      <Disclosure className="scope-details" summary="统计说明">
        <p>本项目以万历六年（1578）为人口、田产与赋税展示口径；南京直隶区的区域值按14府、4直隶州分项汇总，折色银等缺失项目明确标注。</p>
        <p>当前版本保留完整府州县行政层级；县级人口、赋税暂不继续扩展，江宁县记录作为现有示例保留。</p>
        <p>当前行政数量表示项目已录入数据，并不代替史籍总数校勘。</p>
        {!region && <p>军事总览只列五军都督府及所属都司级单位，不汇总军额、屯田和屯粮。</p>}
        <small>资料记录：{data.sourceCount} 种来源</small>
      </Disclosure>
    </Scrollbar>
  </aside>;
}
