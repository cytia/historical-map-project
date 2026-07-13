import { lazy, Suspense, useMemo } from "react";
import { getRegionSummary, getSources, regions, seats } from "./data";
import { useAppStore } from "./store";

const MapView = lazy(() =>
  import("./MapView").then((module) => ({ default: module.MapView })),
);

const levelLabel = {
  prefecture: "府",
  department: "直隶州",
};

export default function App() {
  const selectedUnitId = useAppStore((state) => state.selectedUnitId);
  const activeRegionId = useAppStore((state) => state.activeRegionId);
  const hoveredRegionId = useAppStore((state) => state.hoveredRegionId);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const detailsOpen = useAppStore((state) => state.detailsOpen);
  const seatsVisible = useAppStore((state) => state.seatsVisible);
  const modernReferenceVisible = useAppStore((state) => state.modernReferenceVisible);
  const selectUnit = useAppStore((state) => state.selectUnit);
  const setActiveRegion = useAppStore((state) => state.setActiveRegion);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const setDetailsOpen = useAppStore((state) => state.setDetailsOpen);
  const setSeatsVisible = useAppStore((state) => state.setSeatsVisible);
  const setModernReferenceVisible = useAppStore((state) => state.setModernReferenceVisible);

  const selected = seats.find((record) => record.unit.id === selectedUnitId);
  const displayedRegionId = hoveredRegionId ?? activeRegionId;
  const activeRegion = regions.find((region) => region.id === displayedRegionId);
  const summary = getRegionSummary(displayedRegionId);
  const results = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return [];
    return seats
      .filter(({ unit, name, region }) =>
        unit.name.includes(query) ||
        name.includes(query) ||
        region.name.includes(query) ||
        region.formalName?.includes(query),
      )
      .slice(0, 6);
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
            placeholder="搜索府、州或治所"
          />
          {results.length > 0 && (
            <div className="search-results">
              {results.map((record) => (
                <button
                  key={record.unit.id}
                  onClick={() => {
                    setActiveRegion(record.region.id);
                    selectUnit(record.unit.id);
                    setSearchQuery("");
                  }}
                >
                  <span>{record.unit.name}</span>
                  <small>{record.name}</small>
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
        <h2 className="region-title">{activeRegion?.formalName ?? activeRegion?.name ?? "两京十三布政使司"}</h2>
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

      {selected && (
        <aside className={`detail-panel ${detailsOpen ? "is-open" : ""}`}>
          <button className="panel-close" onClick={() => setDetailsOpen(false)} aria-label="关闭地点详情">×</button>
          <p className="eyebrow">{levelLabel[selected.unit.level as keyof typeof levelLabel]}</p>
          <h2>{selected.unit.name}</h2>
          <p className="seat-line">治所 · {selected.name}</p>
          <dl className="facts">
            <div><dt>所属</dt><dd>{selected.region.formalName ?? selected.region.name}</dd></div>
            <div><dt>时间</dt><dd>公元 1600 年</dd></div>
            <div><dt>定位</dt><dd><span className="confidence-dot" />约略位置</dd></div>
            <div><dt>坐标</dt><dd>{selected.place.longitude?.toFixed(5)}, {selected.place.latitude?.toFixed(5)}</dd></div>
          </dl>
          <div className="method-note">
            <p className="eyebrow">定位说明</p>
            <p>{selected.place.locationMethod}</p>
          </div>
          <details>
            <summary>资料来源与许可</summary>
            {getSources(selected).map((source) => (
              <article className="source" key={source.id}>
                <h3>{source.title}</h3>
                <p>{source.citation}</p>
                <small>{source.license}</small>
              </article>
            ))}
          </details>
        </aside>
      )}

      <footer className="timeline">
        <span>1368</span>
        <div className="timeline-track"><i /><strong>1600</strong></div>
        <span>1644</span>
      </footer>

      <div className="map-note">历史示意图 · 非现代行政地图</div>
    </main>
  );
}
