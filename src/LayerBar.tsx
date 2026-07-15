import { useAppStore } from "./store";
import { Tooltip } from "./Tooltip";

export function LayerBar() {
  const seatsVisible = useAppStore((state) => state.seatsVisible);
  const modernReferenceVisible = useAppStore((state) => state.modernReferenceVisible);
  const setSeatsVisible = useAppStore((state) => state.setSeatsVisible);
  const setModernReferenceVisible = useAppStore((state) => state.setModernReferenceVisible);

  return (
    <nav className="layer-bar" aria-label="地图图层">
      <span className="layer-bar-label" aria-hidden="true">图层</span>
      <Tooltip content="府州治所">
        <button
          type="button"
          className="layer-button"
          aria-label="府州治所"
          aria-pressed={seatsVisible}
          onClick={() => setSeatsVisible(!seatsVisible)}
        >
          州府
        </button>
      </Tooltip>
      <Tooltip content="行政边界数据尚未接入">
        <button
          type="button"
          className="layer-button"
          aria-label="行政边界"
          disabled
        >
          边界
        </button>
      </Tooltip>
      <Tooltip content="山川地貌">
        <button
          type="button"
          className="layer-button"
          aria-label="山川地貌"
          aria-pressed={modernReferenceVisible}
          onClick={() => setModernReferenceVisible(!modernReferenceVisible)}
        >
          地貌
        </button>
      </Tooltip>
    </nav>
  );
}
