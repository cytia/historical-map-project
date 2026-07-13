import { useAppStore } from "./store";

export function LayerPanel() {
  const seatsVisible = useAppStore((state) => state.seatsVisible);
  const modernReferenceVisible = useAppStore((state) => state.modernReferenceVisible);
  const setSeatsVisible = useAppStore((state) => state.setSeatsVisible);
  const setModernReferenceVisible = useAppStore((state) => state.setModernReferenceVisible);
  return <aside className="layer-panel">
    <p className="eyebrow">地图图层</p>
    <label className="layer-toggle">
      <input type="checkbox" checked={seatsVisible}
        onChange={(event) => setSeatsVisible(event.target.checked)} />
      <span title="府州治所">州府</span><i />
    </label>
    <label className="layer-toggle is-disabled">
      <input type="checkbox" disabled /><span title="行政边界">边界</span><i />
    </label>
    <label className="layer-toggle">
      <input type="checkbox" checked={modernReferenceVisible}
        onChange={(event) => setModernReferenceVisible(event.target.checked)} />
      <span title="山川地貌">地貌</span><i />
    </label>
  </aside>;
}
