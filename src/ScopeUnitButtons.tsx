interface ScopeUnit {
  id: string;
  name: string;
}

export function ScopeUnitButtons<T extends ScopeUnit>({ units, onSelect }: {
  units: T[];
  onSelect: (unit: T) => void;
}) {
  return <div className="scope-unit-list">{units.map((unit) =>
    <button key={unit.id} onClick={() => onSelect(unit)}>{unit.name}</button>)}</div>;
}
