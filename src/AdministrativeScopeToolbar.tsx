import { useAppStore } from "./store";
import { Tooltip } from "./Tooltip";

export function HierarchyToolbar() {
  const hierarchyScope = useAppStore((state) => state.hierarchyScope);
  const setHierarchyScope = useAppStore((state) => state.setHierarchyScope);

  return (
    <aside className="administrative-scope-toolbar" aria-label="层级">
      <span>层级</span>
      <div className="administrative-scope-options" role="group" aria-label="层级">
        <Tooltip content="显示当前体系的核心节点与关系，不展开下级单位">
          <button
            type="button"
            className="layer-button"
            aria-label="总览"
            aria-pressed={hierarchyScope === "overview"}
            onClick={() => setHierarchyScope("overview")}
          >
            总览
          </button>
        </Tooltip>
        <Tooltip content="显示当前选中单位及其直属下级">
          <button
            type="button"
            className="layer-button"
            aria-label="本级"
            aria-pressed={hierarchyScope === "unit"}
            onClick={() => setHierarchyScope("unit")}
          >
            本级
          </button>
        </Tooltip>
        <Tooltip content="显示当前范围内该体系全部已录入单位">
          <button
            type="button"
            className="layer-button"
            aria-label="全域"
            aria-pressed={hierarchyScope === "domain"}
            onClick={() => setHierarchyScope("domain")}
          >
            全域
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}

export const AdministrativeScopeToolbar = HierarchyToolbar;
