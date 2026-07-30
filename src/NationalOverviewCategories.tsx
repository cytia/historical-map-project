import { AdministrativeStatistics } from "./AdministrativeStatistics";
import { Disclosure } from "./components/Disclosure";
import { regions } from "./data";
import { militaryById, publishedMilitaryRecords } from "./militaryData";
import { ScopeUnitButtons } from "./ScopeUnitButtons";
import { useAppStore } from "./store";
import type { MilitaryRecord, MilitaryUnitKind, StatisticFields } from "./types";

const commandKinds = new Set<MilitaryUnitKind>(["dusi", "xing-dusi", "liushou-si"]);
const fiveArmyDescriptors: {
  id: NonNullable<MilitaryRecord["fiveArmyId"]>;
  label: string;
}[] = [
  { id: "central", label: "中军都督府" },
  { id: "left", label: "左军都督府" },
  { id: "right", label: "右军都督府" },
  { id: "front", label: "前军都督府" },
  { id: "rear", label: "后军都督府" },
];

const fiveArmyGroups = fiveArmyDescriptors.map((descriptor) => ({
  ...descriptor,
  records: publishedMilitaryRecords.filter(({ fiveArmyId, unit }) =>
    fiveArmyId === descriptor.id && commandKinds.has(unit.militaryKind)),
}));

function CategorySummary({ title }: { title: string }) {
  return <>
    <h1 className="region-title">{title}</h1>
    <span className="scope-peer-count" aria-hidden="true" />
  </>;
}

export function NationalOverviewCategories({ records, administrativeCount }: {
  records: StatisticFields[];
  administrativeCount: {
    prefectures: number;
    departments: number;
    counties: number;
  };
}) {
  const setActiveRegion = useAppStore((state) => state.setActiveRegion);
  const selectMilitaryUnit = useAppStore((state) => state.selectMilitaryUnit);
  const selectCommand = (unit: { id: string }) => {
    const record = militaryById.get(unit.id);
    if (record) selectMilitaryUnit(record.unit.id, record.administrativeRegionId);
  };

  return <>
    <Disclosure open className="scope-section scope-collapsible overview-category"
      summaryClassName="section-heading" summary={<CategorySummary title="两京十三布政司" />}>
      <p className="muted">总录入 {administrativeCount.prefectures} 府，
        {administrativeCount.departments} 州，{administrativeCount.counties} 县</p>
      <AdministrativeStatistics records={records} />
      <Disclosure className="scope-section scope-collapsible" summaryClassName="section-heading"
        summary={<>
          <span className="eyebrow">下辖单位</span>
          <span className="scope-peer-count">{regions.length} 处</span>
        </>}>
        <ScopeUnitButtons units={regions} onSelect={(unit) => setActiveRegion(unit.id)} />
      </Disclosure>
    </Disclosure>

    <Disclosure className="scope-section scope-collapsible overview-category"
      summaryClassName="section-heading" summary={<CategorySummary title="五军都督府" />}>
      {fiveArmyGroups.map((group) => (
        <Disclosure className="scope-section scope-collapsible" summaryClassName="section-heading"
          key={group.id} summary={<>
            <span className="eyebrow">{group.label}</span>
            <span className="scope-peer-count">{group.records.length} 处</span>
          </>}>
          <ScopeUnitButtons units={group.records.map(({ unit }) => unit)} onSelect={selectCommand} />
        </Disclosure>
      ))}
    </Disclosure>
  </>;
}
