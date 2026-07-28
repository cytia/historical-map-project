import { data } from "./data";
import type { MilitaryDisplayGroup } from "./types";

const beizhiliExcludedMemberIds = new Set([
  "tongguan-wei-beizhili",
  "puzhou-qianhusuo-beizhili",
]);

const beizhiliMemberIds = data.militaryUnits
  .filter(({ id }) => id.endsWith("-beizhili") && !beizhiliExcludedMemberIds.has(id))
  .map(({ id }) => id);

const beijingMemberIds = data.militaryUnits
  .filter(({ id }) => id.endsWith("-beijing"))
  .map(({ id }) => id);

const nanzhiliMemberIds = data.militaryUnits
  .filter(({ id }) => id.endsWith("-nanzhili"))
  .map(({ id }) => id);

const nanjingMemberIds = data.militaryUnits
  .filter(({ id }) => id.endsWith("-nanjing"))
  .map(({ id }) => id);

const shuntianDisplayAnchor = {
  id: "shuntian-display-anchor",
  label: "北直隶属卫 · 显示锚点",
  description: "借用顺天府治所附近的现有点位作为地图显示锚点；不表示历史治所或行政隶属。",
  longitude: 116.39139,
  latitude: 39.90619,
} as const;

const beijingDisplayAnchor = {
  id: "beijing-display-anchor",
  label: "北京属卫 · 显示锚点",
  description: "借用京师顺天府治所附近的现有点位作为地图显示锚点；不表示任何单一卫所治所或军事上级。",
  longitude: 116.39139,
  latitude: 39.90619,
} as const;

const nanjingDisplayAnchor = {
  id: "nanjing-display-anchor",
  label: "南直隶属卫 · 显示锚点",
  description: "借用南京城现有点位作为地图显示锚点；不表示历史军事机构治所或行政隶属。",
  longitude: 118.778888888889,
  latitude: 32.0608333333333,
} as const;

const nanjingGarrisonDisplayAnchor = {
  id: "nanjing-garrison-display-anchor",
  label: "南京属卫 · 显示锚点",
  description: "借用南京城现有点位作为地图显示锚点；不表示任何单一卫所治所或军事上级。",
  longitude: 118.778888888889,
  latitude: 32.0608333333333,
} as const;

export const militaryDisplayGroups: readonly MilitaryDisplayGroup[] = [
  {
    id: "beizhili-direct",
    name: "北直隶属卫",
    description: "后军都督府名下直隶外卫所的地图显示分组，不是另设的都司或卫司。选中组内单位后，使用顺天府治所附近的显示锚点绘制归类虚线。",
    fiveArmyId: "rear",
    memberIds: beizhiliMemberIds,
    anchor: shuntianDisplayAnchor,
  },
  {
    id: "beijing-direct",
    name: "北京属卫",
    description: "五军都督府在京属卫的地图显示分组，不是另设的军事上级。组内单位分别归属五军，选中组内单位后使用北京显示锚点绘制归类虚线。",
    memberIds: beijingMemberIds,
    anchor: beijingDisplayAnchor,
  },
  {
    id: "nanjing-direct",
    name: "南京属卫",
    description: "五军都督府在南京属卫所的地图显示分组，不是另设的军事上级。组内单位分别归属五军，选中组内单位后使用南京显示锚点绘制归类虚线。",
    administrativePath: "五军分属 · 南京在京卫所",
    memberIds: nanjingMemberIds,
    anchor: nanjingGarrisonDisplayAnchor,
  },
  {
    id: "nanzhili-direct",
    name: "南直隶属卫",
    description: "南直隶地理范围内直隶五军都督府的外卫所地图显示分组，不是另设的都司或卫司。组内单位分别归属中军或右军；选中组内单位后使用南京显示锚点绘制归类虚线。",
    administrativePath: "五军分属 · 南直隶外卫所",
    memberIds: nanzhiliMemberIds,
    anchor: nanjingDisplayAnchor,
  },
];

const displayGroupByMemberId = new Map(
  militaryDisplayGroups.flatMap((group) => group.memberIds.map((id) => [id, group] as const)),
);

export function getMilitaryDisplayGroup(unitId: string | null) {
  return unitId ? displayGroupByMemberId.get(unitId) : undefined;
}

export function getMilitaryDisplayGroupId(unitId: string | null) {
  return getMilitaryDisplayGroup(unitId)?.id;
}
