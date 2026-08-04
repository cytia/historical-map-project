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

export function selectHierarchyRecords<T>(
  records: T[],
  selectedId: string | null,
  scope: HierarchyScope,
  access: HierarchyRecordAccess<T>,
) {
  const byId = new Map(records.map((record) => [access.getId(record), record]));
  const selected = selectedId ? byId.get(selectedId) : undefined;
  const roots = records.filter((record) => access.isRoot?.(record) ??
    access.getParentId(record) === null);
  const state = getHierarchyDisplayState(scope, Boolean(selected));
  if (!state.showDescendants || !selected) return { records: roots, state };

  const root = byId.get(access.getRootId(selected)) ?? selected;
  const rootRecords = records.filter((record) => access.getRootId(record) === access.getId(root));
  if (scope === "domain") {
    return {
      records: [...new Map([...roots, ...rootRecords].map((record) => [access.getId(record), record])).values()],
      state,
    };
  }

  const visible = new Map(roots.map((record) => [access.getId(record), record]));
  const add = (record: T | undefined) => {
    if (record) visible.set(access.getId(record), record);
  };
  add(root);
  records.filter((record) => access.getParentId(record) === access.getId(root))
    .forEach(add);
  add(selected);
  records.filter((record) => access.getParentId(record) === access.getId(selected))
    .forEach(add);
  return { records: [...visible.values()], state };
}
