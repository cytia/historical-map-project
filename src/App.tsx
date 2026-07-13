import { lazy, Suspense, useMemo } from "react";
import { AdministrativeDetailPanel } from "./AdministrativeDetailPanel";
import { counties, getRegionSummary, regions, seats } from "./data";
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
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const seatsVisible = useAppStore((state) => state.seatsVisible);
  const modernReferenceVisible = useAppStore((state) => state.modernReferenceVisible);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const selectCounty = useAppStore((state) => state.selectCounty);
  const setActiveRegion = useAppStore((state) => state.setActiveRegion);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const setSeatsVisible = useAppStore((state) => state.setSeatsVisible);
  const setModernReferenceVisible = useAppStore((state) => state.setModernReferenceVisible);

  const selected = seats.find((record) => record.unit.id === selectedUnitId);
  const selectedCounty = counties.find((record) => record.unit.id === selectedCountyId);
  const displayedRegionId = hoveredRegionId ?? activeRegionId;
  const activeRegion = regions.find((region) => region.id === displayedRegionId);
  const activeRegionSubtitle = activeRegion?.formalName?.replace(activeRegion.name, "");
  const summary = getRegionSummary(displayedRegionId);
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
          图层与时期
        </button>
      </header>

      <aside className={`left-panel ${sidebarOpen ? "is-open" : ""}`}>
        <button className="panel-close" onClick={() => setSidebarOpen(false)} aria-label="关闭控制面板">×</button>
        <p className="eyebrow">当前时间切片</p>
        <div className="year-display"><strong>1600</strong><span>公元</span></div>
        <div className="rule" />
        <p className="eyebrow">行政范围</p>
        <div className="region-heading">
          <h2 className="region-title">{activeRegion?.name ?? "两京十三司"}</h2>
          {activeRegionSubtitle && <p className="region-formal-name">{activeRegionSubtitle}</p>}
        </div>
        <p className="muted">{summary.prefectures} 府 · {summary.departments} 直隶州 · {summary.seats} 治所</p>
        <div className="notice">
          <span>边界资料整理中</span>
          <p>当前仅展示已校勘治所点，不以插值范围代替历史行政边界。</p>
        </div>
        <div className="rule" />
        <p className="eyebrow">图层</p>
        <label className="layer-toggle">
          <input
            type="checkbox"
            checked={seatsVisible}
            onChange={(event) => setSeatsVisible(event.target.checked)}
          />
          <span>府州治所</span><i />
        </label>
        <label className="layer-toggle is-disabled"><input type="checkbox" disabled /><span>行政边界</span><i /></label>
        <label className="layer-toggle">
          <input
            type="checkbox"
            checked={modernReferenceVisible}
            onChange={(event) => setModernReferenceVisible(event.target.checked)}
          />
          <span>山川地貌</span><i />
        </label>
        {modernReferenceVisible && (
          <p className="layer-note">现代自然地理参考，不代表公元 1600 年河道与地貌状态。</p>
        )}
      </aside>

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
