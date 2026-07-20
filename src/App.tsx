import { lazy, Suspense, useMemo } from "react";
import { AdministrativeDetailPanel } from "./AdministrativeDetailPanel";
import { MilitaryDetailPanel } from "./MilitaryDetailPanel";
import { HierarchyToolbar } from "./AdministrativeScopeToolbar";
import { counties, regions, seats } from "./data";
import { publishedMilitaryRecords } from "./militaryData";
import { LayerBar } from "./LayerBar";
import { ScopePanel } from "./ScopePanel";
import { useAppStore } from "./store";

const MapView = lazy(() =>
  import("./MapView").then((module) => ({ default: module.MapView })),
);

export default function App() {
  const selectedUnitId = useAppStore((state) => state.selectedUnitId);
  const selectedCountyId = useAppStore((state) => state.selectedCountyId);
  const selectedMilitaryUnitId = useAppStore((state) => state.selectedMilitaryUnitId);
  const activeRegionId = useAppStore((state) => state.activeRegionId);
  const hoveredRegionId = useAppStore((state) => state.hoveredRegionId);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const selectCounty = useAppStore((state) => state.selectCounty);
  const selectMilitaryUnit = useAppStore((state) => state.selectMilitaryUnit);
  const setActiveRegion = useAppStore((state) => state.setActiveRegion);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  const selected = seats.find((record) => record.unit.id === selectedUnitId);
  const selectedCounty = counties.find((record) => record.unit.id === selectedCountyId);
  const selectedMilitary = publishedMilitaryRecords.find((record) => record.unit.id === selectedMilitaryUnitId);
  const panelRegion = regions.find(
    (region) => region.id === (hoveredRegionId ?? activeRegionId),
  );
  const results = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return [];
    const seatResults = seats.filter(({ unit, name, region }) =>
        unit.name.includes(query) ||
        name.includes(query) ||
        region.name.includes(query) ||
        region.formalName?.includes(query),
      ).map((record) => ({ kind: "seat" as const, record }));
    const countyResults = counties.filter(({ unit, name, parent, region }) =>
      unit.name.includes(query) || name.includes(query) ||
      parent.name.includes(query) || region.name.includes(query),
    ).map((record) => ({ kind: "county" as const, record }));
    const militaryResults = publishedMilitaryRecords.filter(({ unit, name }) =>
      unit.name.includes(query) || name.includes(query),
    ).map((record) => ({ kind: "military" as const, record }));
    return [...seatResults, ...countyResults, ...militaryResults].slice(0, 6);
  }, [searchQuery]);

  return (
    <main className="app-shell">
      <Suspense fallback={<div className="map map-loading" role="status">舆图载入中…</div>}>
        <MapView />
      </Suspense>

      <header className="topbar">
        <div className="brand">
          <span className="seal" aria-hidden="true">明</span>
          <div>
            <h1>明代历史地图</h1>
            <p>公元 1600 年 · 万历二十八年前后</p>
          </div>
        </div>

        <div className="search-wrap">
          <label className="sr-only" htmlFor="place-search">搜索历史地名</label>
          <input
            id="place-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索府、州、县、都司或卫所"
          />
          {results.length > 0 && (
            <div className="search-results">
              {results.map(({ kind, record }) => (
                <button
                  key={record.unit.id}
                  onClick={() => {
                    if (kind === "military") {
                      selectMilitaryUnit(record.unit.id, record.administrativeRegionId);
                    } else if (kind === "county") {
                      selectCounty(record.unit.id, record.parent.id, record.region.id);
                    } else {
                      setActiveRegion(record.region.id);
                      selectUnit(record.unit.id);
                    }
                    setSearchQuery("");
                  }}
                >
                  <span>{record.unit.name}</span>
                  <small>{kind === "military" ? `军事 · ${record.name}` :
                    kind === "county" ? `${record.parent.name} · ${record.name}` : record.name}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        <LayerBar />

        <button className="mobile-control" onClick={() => setSidebarOpen(true)}>
          全国与省级资料
        </button>
      </header>

      <ScopePanel region={panelRegion} />
      <HierarchyToolbar />

      <AdministrativeDetailPanel seat={selected} county={selectedCounty} />
      <MilitaryDetailPanel record={selectedMilitary} />

      <footer className="timeline" aria-label="代表性时间节点">
        <div className="timeline-track">
          <span className="timeline-node timeline-node-start">
            <i aria-hidden="true" />
            <strong>洪武二十六年</strong>
            <small>公元 1393 年</small>
          </span>
          <span className="timeline-node timeline-node-middle-start">
            <i aria-hidden="true" />
            <strong>弘治十五年</strong>
            <small>公元 1502 年</small>
          </span>
          <span className="timeline-node timeline-node-current" aria-current="true">
            <i aria-hidden="true" />
            <strong>万历二十八年</strong>
            <small>公元 1600 年</small>
          </span>
          <span className="timeline-node timeline-node-end">
            <i aria-hidden="true" />
            <strong>崇祯十七年</strong>
            <small>公元 1644 年</small>
          </span>
        </div>
      </footer>

      <div className="map-note">历史示意图 · 非现代行政地图</div>
    </main>
  );
}
