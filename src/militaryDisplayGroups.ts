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

export const militaryDisplayGroups: readonly MilitaryDisplayGroup[] = [
  {
    id: "beizhili-direct",
    name: "北直隶属卫",
    description: "后军都督府名下直隶外卫所的地图显示分组，不是另设的都司或卫司。",
    fiveArmyId: "rear",
    memberIds: beizhiliMemberIds,
  },
  {
    id: "beijing-direct",
    name: "北京属卫",
    description: "五军都督府在京属卫的地图显示分组，不是另设的军事上级。组内单位分别归属五军。",
    memberIds: beijingMemberIds,
  },
  {
    id: "nanjing-direct",
    name: "南京属卫",
    description: "五军都督府在南京属卫所的地图显示分组，不是另设的军事上级。组内单位分别归属五军。",
    administrativePath: "五军分属 · 南京在京卫所",
    memberIds: nanjingMemberIds,
  },
  {
    id: "nanzhili-direct",
    name: "南直隶属卫",
    description: "南直隶地理范围内直隶五军都督府的外卫所地图显示分组，不是另设的都司或卫司。组内单位分别归属中军或右军。",
    administrativePath: "五军分属 · 南直隶外卫所",
    memberIds: nanzhiliMemberIds,
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
