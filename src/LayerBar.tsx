import { useAppStore } from "./store";

export function LayerBar() {
  const seatsVisible = useAppStore((state) => state.seatsVisible);
  const modernReferenceVisible = useAppStore((state) => state.modernReferenceVisible);
  const setSeatsVisible = useAppStore((state) => state.setSeatsVisible);
  const setModernReferenceVisible = useAppStore((state) => state.setModernReferenceVisible);

  return (
    <nav className="layer-bar" aria-label="地图图层">
      <span className="layer-bar-label" aria-hidden="true">图层</span>
      <button
        type="button"
        className="layer-button"
        aria-label="府州治所"
        aria-pressed={seatsVisible}
        title="府州治所"
        onClick={() => setSeatsVisible(!seatsVisible)}
      >
        州府
      </button>
      <button
        type="button"
        className="layer-button"
        aria-label="行政边界"
        title="行政边界数据尚未接入"
        disabled
      >
        边界
      </button>
      <button
        type="button"
        className="layer-button"
        aria-label="山川地貌"
        aria-pressed={modernReferenceVisible}
        title="山川地貌"
        onClick={() => setModernReferenceVisible(!modernReferenceVisible)}
      >
        地貌
      </button>
    </nav>
  );
}
