import { useAppStore } from "./store";

export function CountyScopeToolbar() {
  const countyDisplayScope = useAppStore((state) => state.countyDisplayScope);
  const setCountyDisplayScope = useAppStore((state) => state.setCountyDisplayScope);

  return (
    <aside className="county-scope-toolbar" aria-label="州县显示范围">
      <span>州县范围</span>
      <div className="county-scope-options" role="group" aria-label="州县显示范围">
        <button
          type="button"
          className="layer-button"
          aria-label="当前州府"
          aria-pressed={countyDisplayScope === "prefecture"}
          onClick={() => setCountyDisplayScope("prefecture")}
        >
          本府
        </button>
        <button
          type="button"
          className="layer-button"
          aria-label="所属一级区域"
          aria-pressed={countyDisplayScope === "region"}
          onClick={() => setCountyDisplayScope("region")}
        >
          全区
        </button>
      </div>
    </aside>
  );
}
