import { lazy, Suspense, useMemo } from "react";
import { AdministrativeDetailPanel } from "./AdministrativeDetailPanel";
import { counties, regions, seats } from "./data";
import { LayerPanel } from "./LayerPanel";
import { ScopePanel } from "./ScopePanel";
import { useAppStore } from "./store";

const MapView = lazy(() =>
  import("./MapView").then((module) => ({ default: module.MapView })),
);

export default function App() {
  const selectedUnitId = useAppStore((state) => state.selectedUnitId);
  const selectedCountyId = useAppStore((state) => state.selectedCountyId);
  const activeRegionId = useAppStore((state) => state.activeRegionId);
  const hoveredRegionId = useAppStore((state) => state.hoveredRegionId);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const selectCounty = useAppStore((state) => state.selectCounty);
  const setActiveRegion = useAppStore((state) => state.setActiveRegion);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  const selected = seats.find((record) => record.unit.id === selectedUnitId);
  const selectedCounty = counties.find((record) => record.unit.id === selectedCountyId);
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
    return [...seatResults, ...countyResults].slice(0, 6);
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
            placeholder="搜索府、州、县或治所"
          />
          {results.length > 0 && (
            <div className="search-results">
              {results.map(({ kind, record }) => (
                <button
                  key={record.unit.id}
                  onClick={() => {
                    if (kind === "county") {
                      selectCounty(record.unit.id, record.parent.id, record.region.id);
                    } else {
                      setActiveRegion(record.region.id);
                      selectUnit(record.unit.id);
                    }
                    setSearchQuery("");
                  }}
                >
                  <span>{record.unit.name}</span>
                  <small>{kind === "county" ? `${record.parent.name} · ${record.name}` : record.name}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="mobile-control" onClick={() => setSidebarOpen(true)}>
          全国与省级资料
        </button>
      </header>

      <ScopePanel region={panelRegion} />
      <LayerPanel />

      <AdministrativeDetailPanel seat={selected} county={selectedCounty} />

      <footer className="timeline">
        <span>1368</span>
        <div className="timeline-track"><i /><strong>1600</strong></div>
        <span>1644</span>
      </footer>

      <div className="map-note">历史示意图 · 非现代行政地图</div>
    </main>
  );
}
