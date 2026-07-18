import { mapDisplayModes, militaryColorModes } from "./mapDisplay";
import { useAppStore } from "./store";
import { Tooltip } from "./Tooltip";

export function LayerBar() {
  const seatsVisible = useAppStore((state) => state.seatsVisible);
  const militaryVisible = useAppStore((state) => state.militaryVisible);
  const modernReferenceVisible = useAppStore((state) => state.modernReferenceVisible);
  const mapDisplayMode = useAppStore((state) => state.mapDisplayMode);
  const militaryColorMode = useAppStore((state) => state.militaryColorMode);
  const setSeatsVisible = useAppStore((state) => state.setSeatsVisible);
  const setMilitaryVisible = useAppStore((state) => state.setMilitaryVisible);
  const setModernReferenceVisible = useAppStore((state) => state.setModernReferenceVisible);
  const setMapDisplayMode = useAppStore((state) => state.setMapDisplayMode);
  const setMilitaryColorMode = useAppStore((state) => state.setMilitaryColorMode);
  const chooseMapDisplayMode = (mode: (typeof mapDisplayModes)[number]["id"]) => {
    setMapDisplayMode(mode);
    if (mode === "administrative") setMilitaryColorMode("administrative");
  };

  return (
    <nav className="layer-bar" aria-label="地图视图与图层">
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
      <Tooltip content="都司、行都司、留守司及卫所">
        <button
          type="button"
          className="layer-button"
          aria-label="都司"
          aria-pressed={militaryVisible}
          onClick={() => setMilitaryVisible(!militaryVisible)}
        >
          都司
        </button>
      </Tooltip>
      <span className="layer-bar-divider" aria-hidden="true" />
      <span className="layer-bar-label layer-bar-label-secondary" aria-hidden="true">着色</span>
      {mapDisplayModes.map((mode) => (
        <Tooltip key={mode.id} content={mode.description}>
          <button
            type="button"
            className="layer-button"
            aria-label={`${mode.label}着色视图`}
            aria-pressed={mapDisplayMode === mode.id}
            disabled={!mode.available}
            onClick={() => chooseMapDisplayMode(mode.id)}
          >
            {mode.label}
          </button>
        </Tooltip>
      ))}
      <span className="layer-bar-divider" aria-hidden="true" />
      {militaryColorModes.map((mode) => (
        <Tooltip key={mode.id} content={mode.description}>
          <button
            type="button"
            className="layer-button"
            aria-label={`${mode.label}着色视图`}
            aria-pressed={militaryColorMode === mode.id}
            onClick={() => setMilitaryColorMode(mode.id)}
          >
            {mode.label}
          </button>
        </Tooltip>
      ))}
    </nav>
  );
}
