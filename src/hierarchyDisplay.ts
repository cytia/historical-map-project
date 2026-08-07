import type { HierarchyScope } from "./types";

export interface HierarchyDisplayState {
  hasSelection: boolean;
  showDescendants: boolean;
  showRelations: boolean;
  animateRelations: boolean;
}

export function getHierarchyDisplayState(
  scope: HierarchyScope,
  hasSelection: boolean,
): HierarchyDisplayState {
  const showDescendants = hasSelection && scope !== "overview";
  return {
    hasSelection,
    showDescendants,
    showRelations: hasSelection,
    animateRelations: hasSelection,
  };
}

export interface HierarchyRecordAccess<T> {
  getId: (record: T) => string;
  getParentId: (record: T) => string | null;
  getRootId: (record: T) => string;
  isRoot?: (record: T) => boolean;
}

export interface HierarchySelection<T> {
  records: T[];
  state: HierarchyDisplayState;
  selected: T | undefined;
  expandedRoot: T | undefined;
}

export function selectHierarchyRecords<T>(
  records: T[],
  selectedId: string | null,
  scope: HierarchyScope,
  access: HierarchyRecordAccess<T>,
): HierarchySelection<T> {
  const byId = new Map(records.map((record) => [access.getId(record), record]));
  const selected = selectedId ? byId.get(selectedId) : undefined;
  const roots = records.filter((record) => access.isRoot?.(record) ??
    access.getParentId(record) === null);
  const state = getHierarchyDisplayState(scope, Boolean(selected));
  if (!state.showDescendants || !selected) {
    return { records: roots, state, selected, expandedRoot: undefined };
  }

  const expandedRoot = byId.get(access.getRootId(selected)) ?? selected;
  const expandedRootId = access.getId(expandedRoot);
  if (scope === "domain") {
    return {
      records: [...new Map([
        ...roots,
        ...records.filter((record) => access.getRootId(record) === expandedRootId),
      ].map((record) => [access.getId(record), record])).values()],
      state,
      selected,
      expandedRoot,
    };
  }

  const visible = new Map(roots.map((record) => [access.getId(record), record]));
  const add = (record: T | undefined) => {
    if (record) visible.set(access.getId(record), record);
  };
  add(expandedRoot);
  records.filter((record) => access.getParentId(record) === expandedRootId)
    .forEach(add);
  return { records: [...visible.values()], state, selected, expandedRoot };
}
