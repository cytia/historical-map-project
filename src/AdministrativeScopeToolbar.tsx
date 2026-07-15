import { useAppStore } from "./store";
import { Tooltip } from "./Tooltip";

export function AdministrativeScopeToolbar() {
  const administrativeDisplayScope = useAppStore((state) => state.administrativeDisplayScope);
  const setAdministrativeDisplayScope = useAppStore((state) => state.setAdministrativeDisplayScope);

  return (
    <aside className="administrative-scope-toolbar" aria-label="行政层级">
      <span>行政层级</span>
      <div className="administrative-scope-options" role="group" aria-label="行政层级">
        <Tooltip content="仅显示一级行政区域与府州治所关系">
          <button
            type="button"
            className="layer-button"
            aria-label="府级关系"
            aria-pressed={administrativeDisplayScope === "seat"}
            onClick={() => setAdministrativeDisplayScope("seat")}
          >
            府级
          </button>
        </Tooltip>
        <Tooltip content="显示当前州府下辖州县">
          <button
            type="button"
            className="layer-button"
            aria-label="当前州府"
            aria-pressed={administrativeDisplayScope === "prefecture"}
            onClick={() => setAdministrativeDisplayScope("prefecture")}
          >
            本府
          </button>
        </Tooltip>
        <Tooltip content="显示所属一级行政区域内全部已录入州县">
          <button
            type="button"
            className="layer-button"
            aria-label="所属一级区域"
            aria-pressed={administrativeDisplayScope === "region"}
            onClick={() => setAdministrativeDisplayScope("region")}
          >
            全区
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
